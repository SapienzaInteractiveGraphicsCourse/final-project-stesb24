import * as THREE from "./libs/three.module.js";    //r130
import {createMap} from "./map.js";
import {createCharacter} from "./character.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const boxWidth = 1, boxHeight = 2;
const bulletRadius = 0.2;

const boxes = [];
const cameras = [];

const players = 2;
let currentPlayer = 0;

//Set up and handle the scene graph (lights, cameras and objects) and physics
function main() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("skyblue");

    //World physics (gravity)
    const world = new CANNON.World();
    world.gravity.set(0, -9.81, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 5;

    //Creates new cameras
    function makeCamera(near = 1, far = 80) {
        const fov = 50;
        const aspect = 2;       //Canvas default
        return new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    //Directional light (sun)
    const lightColor = "white";
    const intensityDir = 1.5;
    const directionalLight = new THREE.DirectionalLight(lightColor, intensityDir);
    directionalLight.position.set(-6, 4, 2);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    //Ambient light
    const intensityAmb = 0.6;
    const ambientLight = new THREE.AmbientLight(lightColor, intensityAmb);
    scene.add(ambientLight);

    createMap(scene, world);

    //Create the boxes and their cameras
    for (let i=0; i < players; i++) {
        //Add the box to the scene
        const boxMesh = createCharacter(boxWidth, boxHeight, i, scene);

        //Add the camera to the box
        const boxCamera = makeCamera();
        boxCamera.position.set(0, boxHeight/2 + 1.5, 3.5);      //Relative to the box
        boxCamera.lookAt(0, 0, -6.5);
        boxMesh.add(boxCamera);

        boxes.push(boxMesh);
        cameras.push(boxCamera);
    };

    //Global (detached) camera (in last position of cameras)
    cameras.push(makeCamera(40, 62));
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

    const bullets = [];
    const bulletBodies = [];

    //Shoot a new bullet
    function bullet() {
        const widthSegments = 10;
        const heightSegments = 10;
        const bulletGeometry = new THREE.SphereGeometry(bulletRadius, widthSegments, heightSegments);
        const bulletMaterial = new THREE.MeshPhongMaterial({color: "gray"});
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

        const currentBox = boxes[currentPlayer];
        const initialX = currentBox.position.x;
        const initialY = boxHeight/2;
        const initialZ = currentBox.position.z;
        bulletMesh.position.set(initialX, initialY, initialZ);

        scene.add(bulletMesh);

        //Every bullet has associated the angle of the box, to compute the speed
        //components over x and z
        const bulletData = {
            bullet: bulletMesh,
            rotation: currentBox.rotation.y
        };
        bullets.push(bulletData);

        //Bullet physics
        const bulletShape = new CANNON.Sphere(bulletRadius);
        const bulletBody = new CANNON.Body( {mass: 1} );
        bulletBody.addShape(bulletShape);

        bulletBody.position.set(initialX, initialY, initialZ);
        const horizontalSpeed = 20;
        const verticalSpeed = 5;
        bulletBody.velocity.set(-Math.sin(bulletData.rotation) * horizontalSpeed,
            verticalSpeed, -Math.cos(bulletData.rotation) * horizontalSpeed);

        bulletBodies.push(bulletBody);
        world.addBody(bulletBody);
    }

    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({canvas});

    function render() {
        //Step the physics world
        world.step(1/60);

        //Copy coordinates from CANNON to THREE for each bullet
        bullets.forEach((bulletData, index) => {
            bulletData.bullet.position.copy(bulletBodies[index].position);
            bulletData.bullet.quaternion.copy(bulletBodies[index].quaternion);
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