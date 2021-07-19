import * as THREE from "./libs/three.module.js";    //r130
import {createMap} from "./map.js";
import {createCharacter, Robot} from "./robot.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const robotWidth = 1, robotHeight = 2;
const bulletRadius = 0.2;

const numTeams = 2;
const robotsPerTeam = 2;
const numRobots = numTeams * robotsPerTeam;

let currentRobotNumber = 0;
let currentRobot;

const robots = [];
const robotBodies = [];

const bullets = [];
const bulletBodies = [];

let globalCamera;

//Creates new cameras
function makeCamera(near = 1, far = 80) {
    const fov = 50;
    const aspect = 2;       //Canvas default
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

//Set up and handle the scene graph (lights, cameras and objects) and physics
function main() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("skyblue");

    //World physics (gravity)
    const world = new CANNON.World();
    world.gravity.set(0, -9.81, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 5;

    //Create all lights and objects
    createMap(scene, world);

    //Create the robots and their cameras
    for (let i=0; i < numRobots; i++) {
        /*const [boxMesh, boxBody, thirdPersonCamera, firstPersonCamera] = createCharacter(boxWidth, boxHeight, i);

        boxes.push(boxMesh);
        boxBodies.push(boxBody);
        thirdPersonCameras.push(thirdPersonCamera);
        firstPersonCameras.push(firstPersonCamera);

        scene.add(boxMesh);
        world.add(boxBody);*/
        //const [robot, thirdPersonCamera, firstPersonCamera] = createCharacter2(i, scene);
        robots.push(new Robot(i, scene));
    };

    //Detached camera looking from above
    globalCamera = makeCamera(45, 70);
    globalCamera.position.y = 60;
    globalCamera.lookAt(0, 0, 0);

    currentRobot = robots[0];
    let camera = currentRobot.thirdPersonCamera;        //Start from first character's camera

    //Keyboard controls
    let moveForward = false;
    let moveBackward = false;
    let turnLeft = false;
    let turnRight = false;
    let global = false;                 //True = look from above
    let firstPerson = false;            //True = first person camera
    let waitForCollision = false;       //True = shot fired -> don't act and wait for next turn

    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            //Move or shoot only if you haven't shot yet
            case "KeyW":                //Move forward
                if (!waitForCollision) {
                    moveForward = true;
                }
                break;
            case "KeyS":                //Move backward
                if (!waitForCollision) {
                    moveBackward = true;
                }
                break;
            case "KeyA":                //Turn left
                if (!waitForCollision) {
                    turnLeft = true;
                }
                break;
            case "KeyD":                //Turn right
                if (!waitForCollision) {
                    turnRight = true;
                }
                break;
            case "Space":               //Shoot
                if (!waitForCollision) {
                    waitForCollision = true;        //Stop acting
                    moveForward = false;
                    moveBackward = false;
                    turnLeft = false;
                    turnRight = false;
                    const bulletBody = bullet();
                    bulletBody.addEventListener("collide", nextTurn);
                }
                break;
            //Camera handling
            case "KeyE":                //Global camera
                if (!global) {          //Switch to global camera
                    global = true;
                    firstPerson = false;
                    camera = globalCamera;
                }
                else {                  //Switch back to third person camera
                    global = false;
                    firstPerson = false;
                    camera = currentRobot.thirdPersonCamera;
                }
                break;
            case "KeyQ":                //First person camera
                if (!firstPerson) {     //Switch to first person camera
                    firstPerson = true;
                    global = false;
                    camera = currentRobot.firstPersonCamera;
                }
                else {                  //Switch back to third person camera
                    firstPerson = false;
                    global = false;
                    camera = currentRobot.thirdPersonCamera;
                }
                break;
            
        }
    });
    document.addEventListener("keyup", (e) => {
        //Stop moving
        switch (e.code) {
            case "KeyW":
                moveForward = false;
                break;
            case "KeyS":
                moveBackward = false;
                break;
            case "KeyA":
                turnLeft = false;
                break;
            case "KeyD":
                turnRight = false;
                break;
        }
    });

    //Go to next player's turn
    function nextTurn(e) {
        this.removeEventListener("collide", nextTurn);  //Remove listener from bullet (detect only one collision)
        setTimeout(() => {                              //Change turn some time after the collision
            currentRobotNumber = (currentRobotNumber + 1) % numRobots;
            currentRobot = robots[currentRobotNumber];
            camera = currentRobot.thirdPersonCamera;    //Switch to next player's camera
            global = false;                             //Reset everything
            firstPerson = false;
            waitForCollision = false;
        }, 1500);
    }

    //Move the robot and copy the coordinates to its physics body (called at every render)
    function move() {
        //const currentRobotBody = robotBodies[currentRobotNumber];
        const speed = 0.2;
        //How much the robot moves on x and z and how much it rotates
        const movementX = Math.sin(currentRobot.waist.rotation.y) * speed;
        const movementZ = Math.cos(currentRobot.waist.rotation.y) * speed;
        const rotation = 0.03;

        //No if-else so that you can use them together
        if (moveForward) {
            currentRobot.waist.position.x += -movementX;
            currentRobot.waist.position.z += -movementZ;
            //currentRobotBody.position.x += -movementX;
            //currentRobotBody.position.z += -movementZ;
        }
        if (moveBackward) {
            currentRobot.waist.position.x += movementX;
            currentRobot.waist.position.z += movementZ;
            //currentRobotBody.position.x += movementX;
            //currentRobotBody.position.z += movementZ;
        }
        if (turnLeft) {
            currentRobot.waist.rotation.y += rotation;
            //currentRobotBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), currentRobot.rotation.y);
        }
        if (turnRight) {
            currentRobot.waist.rotation.y += -rotation;
            //currentRobotBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), currentRobot.rotation.y);
        }
    }

    //Shoot a new bullet
    function bullet() {
        //Bullet
        const segments = 10;
        const bulletGeometry = new THREE.SphereGeometry(bulletRadius, segments, segments);
        const bulletMaterial = new THREE.MeshPhongMaterial({color: "gray"});
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

        //Bullet initial position
        const angle = currentRobot.waist.rotation.y;
        const initialX = currentRobot.waist.position.x - Math.sin(angle) * 0.75;  //Bullet spawns a bit distant from the robot
        const initialY = robotHeight/2;
        const initialZ = currentRobot.waist.position.z - Math.cos(angle) * 0.75;
        bulletMesh.position.set(initialX, initialY, initialZ);

        bullets.push(bulletMesh);
        scene.add(bulletMesh);

        //Bullet physics
        const bulletShape = new CANNON.Sphere(bulletRadius);
        const bulletBody = new CANNON.Body({mass: 1});
        bulletBody.addShape(bulletShape);

        bulletBody.position.set(initialX, initialY, initialZ);
        const horizontalSpeed = 20;
        const verticalSpeed = 5;
        bulletBody.velocity.set(-Math.sin(angle) * horizontalSpeed,
            verticalSpeed, -Math.cos(angle) * horizontalSpeed);

        bulletBodies.push(bulletBody);
        world.addBody(bulletBody);

        return bulletBody;          //Used for bullet listener to detect the first collision
    }

    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({canvas});

    function render() {
        //Step the physics world
        world.step(1/60);

        //Move the robot
        move();

        //Copy coordinates from CANNON to THREE for each bullet
        bullets.forEach((bullet, index) => {
            bullet.position.copy(bulletBodies[index].position);
            bullet.quaternion.copy(bulletBodies[index].quaternion);
        });

        //The aspect of the cameras matches the aspect of the canvas (no distortions)
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            robots.forEach(robot => {
                robot.thirdPersonCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                robot.firstPersonCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                robot.thirdPersonCamera.updateProjectionMatrix();
                robot.firstPersonCamera.updateProjectionMatrix();
            });
            globalCamera.aspect = canvas.clientWidth / canvas.clientHeight;
            globalCamera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();

export {makeCamera};