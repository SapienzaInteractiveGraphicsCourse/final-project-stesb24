import * as THREE from "./libs/three.module.js";    //r130
import {createMap} from "./map.js";
import {createCharacter} from "./character.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const boxWidth = 1, boxHeight = 2;
const bulletRadius = 0.2;

const boxes = [];
const cameras = [];
const bullets = [];
const bulletBodies = [];

const players = 1;
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
        const [boxMesh, boxCamera] = createCharacter(boxWidth, boxHeight, i);

        boxes.push(boxMesh);
        cameras.push(boxCamera);

        scene.add(boxMesh);
    };

    //Global (detached) camera (in last position of cameras)
    cameras.push(makeCamera(45, 70));
    cameras[cameras.length - 1].position.set(0, 60, 0);
    cameras[cameras.length - 1].lookAt(0, 0, 0);

    let camera = cameras[0];        //Start from first player's camera

    //Keyboard controls
    document.addEventListener("keydown", (e) => {
        console.log("down: " + e.code);
        const currentBox = boxes[currentPlayer];
        const boxSpeed = 0.4;
        const boxAngle = 0.05;
        
        switch (e.code) {
            case "KeyW":            //Move forward
                currentBox.position.x += -Math.sin(currentBox.rotation.y) * boxSpeed;
                currentBox.position.z += -Math.cos(currentBox.rotation.y) * boxSpeed;
                break;
            case "KeyS":            //Move backwards
                currentBox.position.x += Math.sin(currentBox.rotation.y) * boxSpeed;
                currentBox.position.z += Math.cos(currentBox.rotation.y) * boxSpeed;
                break;
            case "KeyA":            //Rotate left
                currentBox.rotation.y += boxAngle;
                break;
            case "KeyD":            //Rotate right
                currentBox.rotation.y += -boxAngle;
                break;
            case "KeyE":            //Look from above (global camera)
                camera = cameras[cameras.length - 1];
                break;
            case "Space":           //Shoot and next player's turn
                bullet();
                currentPlayer = (currentPlayer + 1) % players;
                camera = cameras[currentPlayer];
                break;
        }
    }, false);

    document.addEventListener("keyup", (e) => {
        console.log("up: " + e.code);       //Stop looking from above
        if (e.code == "KeyE") {
            camera = cameras[currentPlayer];
        }
    }, false);

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
        const initialX = currentBox.position.x;
        const initialY = boxHeight/2;
        const initialZ = currentBox.position.z;
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
        const angle = currentBox.rotation.y;
        bulletBody.velocity.set(-Math.sin(angle) * horizontalSpeed,
            verticalSpeed, -Math.cos(angle) * horizontalSpeed);

        bulletBodies.push(bulletBody);
        world.addBody(bulletBody);
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