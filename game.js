import * as THREE from "./libs/threejs/build/three.module.js";
import {createCharacter} from "./character.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const groundWidth = 16, groundHeight = 16;
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
    function makeCamera() {
        const fov = 50;
        const aspect = 2;       //Canvas default
        const near = 1;
        const far = 40;
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

    //Ground
    const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundHeight);
    const groundMaterial = new THREE.MeshPhongMaterial({color: "green"});
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;           //Horizontal
    scene.add(groundMesh);

    //Ground physics
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
        mass: 0,            //Static body
        shape: groundShape
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); //Horizontal
    world.add(groundBody);

    //Create the boxes and their cameras
    for (let i=0; i < players; i++) {
        //Add the box to the scene
        const boxMesh = createCharacter(boxWidth, boxHeight, i);
        scene.add(boxMesh);

        //Add the camera to the box
        const boxCamera = makeCamera();
        boxCamera.position.set(0, boxHeight/2 + 1.5, 3.5);      //Relative to the box
        boxCamera.lookAt(0, 0, -6.5);
        boxMesh.add(boxCamera);

        boxes.push(boxMesh);
        cameras.push(boxCamera);
    };

    //Global (detached) camera (in last position of cameras)
    cameras.push(makeCamera());
    cameras[cameras.length - 1].position.set(0, 20, 0);
    cameras[cameras.length - 1].lookAt(0, 0, 0);

    let camera = cameras[0];        //Start from first player's camera

    //Keyboard controls
    document.addEventListener("keydown", (e) => {
        console.log("down: " + e.code);
        const currentBox = boxes[currentPlayer];
        const boxSpeed = 0.4;
        const boxAngle = 0.05;
        
        switch (e.code) {
            case "KeyW":            //Move orward
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
        const initialPosition = [currentBox.position.x, boxHeight/2, currentBox.position.z];
        bulletMesh.position.set(initialPosition);
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
        const bulletBody = new CANNON.Body({
            mass: 1,
            shape: bulletShape
        });
        bulletBody.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
        const horizontalSpeed = 12;
        const verticalSpeed = 4;
        bulletBody.velocity.set(-Math.sin(bulletData.rotation) * horizontalSpeed,
            verticalSpeed, -Math.cos(bulletData.rotation) * horizontalSpeed);

        world.addBody(bulletBody);
        bulletBodies.push(bulletBody);
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