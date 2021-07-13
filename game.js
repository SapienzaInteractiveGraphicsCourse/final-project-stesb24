import * as THREE from "./libs/three.module.js";    //r130
import {createMap} from "./map.js";
import {createCharacter} from "./character.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const boxWidth = 1, boxHeight = 2;
const bulletRadius = 0.2;

const boxes = [];
const boxBodies = [];
const cameras = [];

const bullets = [];
const bulletBodies = [];

const players = 2;
let currentPlayer = 0;

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
    for (let i=0; i < players; i++) {
        const [boxMesh, boxCamera, boxBody] = createCharacter(boxWidth, boxHeight, i);

        boxes.push(boxMesh);
        boxBodies.push(boxBody);
        cameras.push(boxCamera);

        scene.add(boxMesh);
        world.add(boxBody);
    };

    //Global (detached) camera (in last position of cameras)
    cameras.push(makeCamera(45, 70));
    cameras[cameras.length - 1].position.set(0, 60, 0);
    cameras[cameras.length - 1].lookAt(0, 0, 0);

    let camera = cameras[0];        //Start from first player's camera

    //Keyboard controls
    let waitForCollision = false;
    document.addEventListener("keydown", commands);     //Normal keyboard handler (disabled after shooting)
    document.addEventListener("keydown", (e) => {       //You can always look from above (global camera)
        if (e.code == "KeyE") {
            camera = cameras[cameras.length - 1];
        }
    });
    document.addEventListener("keyup", (e) => {         //Stop looking from above
        console.log("up: " + e.code);
        if (e.code == "KeyE") {
            camera = cameras[currentPlayer];
        }
    });
    
    function commands(e) {
        if (!waitForCollision) {        //Move if you didn't shoot; otherwise wait for the bullet to collide
            const currentBox = boxes[currentPlayer];
            const currentBoxBody = boxBodies[currentPlayer];
            const boxSpeed = 0.4;
            //How much the box moves on x and z and how much it rotates
            const movementX = Math.sin(currentBox.rotation.y) * boxSpeed;
            const movementZ = Math.cos(currentBox.rotation.y) * boxSpeed;
            const boxRotation = 0.05;
            
            switch (e.code) {           //Update the physics body accordingly
                case "KeyW":            //Move forward        
                    currentBox.position.x += -movementX;
                    currentBox.position.z += -movementZ;
                    currentBoxBody.position.x += -movementX;
                    currentBoxBody.position.z += -movementZ;
                    break;
                case "KeyS":            //Move backwards
                    currentBox.position.x += movementX;
                    currentBox.position.z += movementZ;
                    currentBoxBody.position.x += movementX;
                    currentBoxBody.position.z += movementZ;
                    break;
                case "KeyA":            //Rotate left
                    currentBox.rotation.y += boxRotation;
                    currentBoxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), currentBox.rotation.y);
                    break;
                case "KeyD":            //Rotate right
                    currentBox.rotation.y += -boxRotation;
                    currentBoxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), currentBox.rotation.y);
                    break;
                case "Space":           //Shoot and go to next player's turn
                    waitForCollision = true;        //Can't move before the collision
                    const bulletBody = bullet();
                    bulletBody.addEventListener("collide", nextTurn);       //Detect bullet collision
                    break;
            }
        }
    }

    //Go to next player's turn
    function nextTurn(e) {
        this.removeEventListener("collide", nextTurn);  //Remove listener from bullet (detect only one collision)
        currentPlayer = (currentPlayer + 1) % players;
        camera = cameras[currentPlayer];                //Switch to next player's camera
        waitForCollision = false;
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
        const currentBox = boxes[currentPlayer];
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

        return bulletBody;          //Used for bullet listener to reveal the first collision
    }

    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({canvas});

    function render() {
        //Step the physics world
        world.step(1/60);

        //Copy coordinates from CANNON to THREE for each bullet
        bullets.forEach((bullet, index) => {
            bullet.position.copy(bulletBodies[index].position);
            bullet.quaternion.copy(bulletBodies[index].quaternion);
        });

        //The aspect of the cameras matches the aspect of the canvas (no distortions)
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            cameras.forEach(camera => {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            });
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();

export {makeCamera};