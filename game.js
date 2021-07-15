import * as THREE from "./libs/three.module.js";    //r130
import {createMap} from "./map.js";
import {createCharacter} from "./character.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const boxWidth = 1, boxHeight = 2;
const bulletRadius = 0.2;

const boxes = [];
const boxBodies = [];

const thirdPersonCameras = [];
const firstPersonCameras = [];
let globalCamera;

const bullets = [];
const bulletBodies = [];

const numTeams = 2;
const boxesPerTeam = 2;
const numBoxes = numTeams * boxesPerTeam;
let currentBoxNumber = 0;

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

    //Create the boxes and their cameras
    for (let i=0; i < numBoxes; i++) {
        const [boxMesh, boxBody, thirdPersonCamera, firstPersonCamera] = createCharacter(boxWidth, boxHeight, i);

        boxes.push(boxMesh);
        boxBodies.push(boxBody);
        thirdPersonCameras.push(thirdPersonCamera);
        firstPersonCameras.push(firstPersonCamera);

        scene.add(boxMesh);
        world.add(boxBody);
    };

    //Detached camera from above
    globalCamera = makeCamera(45, 70);
    globalCamera.position.set(0, 60, 0);
    globalCamera.lookAt(0, 0, 0);

    let camera = thirdPersonCameras[0];        //Start from first character's camera

    //Keyboard controls
    let moveForward = false;
    let moveBackward = false;
    let turnLeft = false;
    let turnRight = false;
    let global = false;                 //True = looking from above
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
                    camera = thirdPersonCameras[currentBoxNumber];
                }
                break;
            case "KeyQ":                //First person camera
                if (!firstPerson) {     //Switch to first person camera
                    firstPerson = true;
                    global = false;
                    camera = firstPersonCameras[currentBoxNumber];
                }
                else {                  //Switch back to third person camera
                    firstPerson = false;
                    global = false;
                    camera = thirdPersonCameras[currentBoxNumber];
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
            currentBoxNumber = (currentBoxNumber + 1) % numBoxes;
            camera = thirdPersonCameras[currentBoxNumber];       //Switch to next player's camera
            global = false;                             //Reset everything
            firstPerson = false;
            waitForCollision = false;
        }, 1500);
    }

    //Move the box and copy the coordinates to its physics body (called at every render)
    function move() {
        const currentBox = boxes[currentBoxNumber];
        const currentBoxBody = boxBodies[currentBoxNumber];
        const boxSpeed = 0.1;
        //How much the box moves on x and z and how much it rotates
        const movementX = Math.sin(currentBox.rotation.y) * boxSpeed;
        const movementZ = Math.cos(currentBox.rotation.y) * boxSpeed;
        const boxRotation = 0.015;

        //No if-else so that you can use them together
        if (moveForward) {
            currentBox.position.x += -movementX;
            currentBox.position.z += -movementZ;
            currentBoxBody.position.x += -movementX;
            currentBoxBody.position.z += -movementZ;
        }
        if (moveBackward) {
            currentBox.position.x += movementX;
            currentBox.position.z += movementZ;
            currentBoxBody.position.x += movementX;
            currentBoxBody.position.z += movementZ;
        }
        if (turnLeft) {
            currentBox.rotation.y += boxRotation;
            currentBoxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), currentBox.rotation.y);
        }
        if (turnRight) {
            currentBox.rotation.y += -boxRotation;
            currentBoxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), currentBox.rotation.y);
        }
    }

    //Shoot a new bullet
    function bullet() {
        //Bullet
        const widthSegments = 10;
        const heightSegments = 10;
        const bulletGeometry = new THREE.SphereGeometry(bulletRadius, widthSegments, heightSegments);
        const bulletMaterial = new THREE.MeshPhongMaterial({color: "gray"});
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

        //Bullet initial position
        const currentBox = boxes[currentBoxNumber];
        const angle = currentBox.rotation.y;
        const initialX = currentBox.position.x - Math.sin(angle) * 0.75;    //Bullet spawns a bit distant from the box
        const initialY = boxHeight/2;
        const initialZ = currentBox.position.z - Math.cos(angle) * 0.75;
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

        //Move the box
        move();

        //Copy coordinates from CANNON to THREE for each bullet
        bullets.forEach((bullet, index) => {
            bullet.position.copy(bulletBodies[index].position);
            bullet.quaternion.copy(bulletBodies[index].quaternion);
        });

        //The aspect of the cameras matches the aspect of the canvas (no distortions)
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            thirdPersonCameras.forEach(camera => {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            });
            firstPersonCameras.forEach(camera => {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
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