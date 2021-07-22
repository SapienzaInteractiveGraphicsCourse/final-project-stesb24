import * as THREE from "./libs/three.module.js";    //r130
import {createMap} from "./map.js";
import {Robot} from "./robot.js";
import {idleToAim, aimToIdle, shoot, idle} from "./animations.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const numTeams = 2;
const robotsPerTeam = 4;
const numRobots = numTeams * robotsPerTeam;

let currentRobotNumber = 0;
let currentRobot;

const robots = [];
const robotBodies = [];

const bullets = [];
const bulletBodies = [];

//Creates new cameras
function makeCamera(near = 1, far = 75) {
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
    world.solver.iterations = 10;

    //Create all lights and objects
    createMap(scene, world);

    //Create the robots and their cameras
    for (let i=0; i < numRobots; i++) {
        const robot = new Robot(i, scene);
        robots.push(robot);

        idle(robot);
    };

    //Detached camera looking from above
    const globalCamera = makeCamera(40, 55);
    globalCamera.position.y = 50;
    globalCamera.lookAt(0, 0, 0);

    //First robot
    currentRobot = robots[0];
    let camera = currentRobot.thirdPersonCamera;        //Start from first robot's camera

    //Keyboard controls
    let moveForward = false;
    let moveBackward = false;
    let turnLeft = false;
    let turnRight = false;

    let aimUp = false;
    let aimDown = false;

    let global = false;                 //True = look from above
    let firstPerson = false;            //True = first person camera
    let waitForCollision = false;       //True = shot fired -> don't act and wait for next turn

    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            //Move or shoot only if you haven't shot yet
            case "KeyW":
                if (!waitForCollision) {
                    if (!firstPerson) {
                        moveForward = true;
                    }
                    else {
                        aimUp = true;
                    }
                }
                break;
            case "KeyS":
                if (!waitForCollision) {
                    if (!firstPerson) {
                        moveBackward = true;
                    }
                    else {
                        aimDown = true;
                    }
                }
                break;
            case "KeyA":
                if (!waitForCollision) {
                    turnLeft = true;
                }
                break;
            case "KeyD":
                if (!waitForCollision) {
                    turnRight = true;
                }
                break;
            case "Space":
                if (!waitForCollision && firstPerson) {
                    //Stop acting
                    waitForCollision = true;

                    //Reset all flags (stay still)
                    moveForward = false;
                    moveBackward = false;
                    turnLeft = false;
                    turnRight = false;
                    aimUp = false;
                    aimDown = false;

                    const bulletBody = bullet();
                    bulletBody.addEventListener("collide", nextTurn);
                    shoot(currentRobot)
                }
                break;
            //Camera handling
            case "KeyE":                //Global camera
                if (!global) {          //Switch to global camera
                    if (firstPerson) {      //If aiming, go back to idle
                        aimToIdle(currentRobot);
                    }
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
                    //Stop moving while aiming
                    moveForward = false;
                    moveBackward = false;
                    turnLeft = false;
                    turnRight = false;

                    idleToAim(currentRobot);
                    firstPerson = true;
                    global = false;
                    //Interrupted animations could have left the head looking somewhere else
                    currentRobot.head.rotation.x = 0;
                    camera = currentRobot.firstPersonCamera;
                }
                else {                  //Switch back to third person camera
                    //Reset all flags
                    aimUp = false;
                    aimDown = false;
                    turnLeft = false;
                    turnRight = false;

                    aimToIdle(currentRobot);
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
                if (!firstPerson) {
                    moveForward = false;
                }
                else {
                    aimUp = false;
                }
                break;
            case "KeyS":
                if (!firstPerson) {
                    moveBackward = false;
                }
                else {
                    aimDown = false;
                }
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
            aimToIdle(currentRobot);                    //Back to idle when turn ends
            currentRobotNumber = (currentRobotNumber + 1) % numRobots;
            currentRobot = robots[currentRobotNumber];
            camera = currentRobot.thirdPersonCamera;    //Switch to next player's camera

            global = false;                             //Reset
            firstPerson = false;
            waitForCollision = false;
        }, 1500);
    }

    //Move the robot and copy the coordinates to its physics body
    function move() {
        //const currentRobotBody = robotBodies[currentRobotNumber];
        const speed = 0.085;
        //How much the robot moves on x and z and how much it rotates
        const movementX = Math.sin(currentRobot.waist.rotation.y) * speed;
        const movementZ = Math.cos(currentRobot.waist.rotation.y) * speed;
        const rotation = 0.02;

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

    //Aim when in first person
    function aim() {
        const rotation = 0.007;

        if (aimUp) {
            currentRobot.head.rotation.x += rotation;
            currentRobot.rightShoulder.rotation.x += rotation;
        }
        if (aimDown) {
            currentRobot.head.rotation.x += -rotation;
            currentRobot.rightShoulder.rotation.x += -rotation;
        }
        if (turnLeft) {
            currentRobot.waist.rotation.y += rotation;
        }
        if (turnRight) {
            currentRobot.waist.rotation.y += -rotation;
        }
    }

    //Shoot a new bullet
    function bullet() {
        //Bullet
        const bulletRadius = 0.2;
        const segments = 8;
        const bulletGeometry = new THREE.SphereGeometry(bulletRadius, segments, segments);
        const bulletMaterial = new THREE.MeshPhongMaterial({color: "gray"});
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

        //Bullet initial position
        const angle = currentRobot.waist.rotation.y;
        const initialX = currentRobot.waist.position.x - Math.sin(angle) * 0.75;  //Bullet spawns a bit distant from the robot
        const initialZ = currentRobot.waist.position.z - Math.cos(angle) * 0.75;
        let shoulderCoords = new THREE.Vector3();
        currentRobot.rightShoulder.getWorldPosition(shoulderCoords);
        const initialY = shoulderCoords.y;
        bulletMesh.position.set(initialX, initialY, initialZ);
        bulletMesh.castShadow = true;
        bulletMesh.receiveShadow = true;

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
    renderer.shadowMap.enabled = true;
    
    //const cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);

    function render() {
        //Step the physics world
        world.step(1/60);
        //cannonDebugRenderer.update();

        //Move the robot
        if (!firstPerson) {
            move();
        }
        else {
            aim();
        }
        TWEEN.update();

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