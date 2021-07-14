import * as THREE from "./libs/three.module.js";
import {makeCamera} from "./game.js";

//i-th value is the initial x coordinate of the i-th box
const initialPositions = [
    -10, 10
];

//Create a new box and return it with its camera
function createCharacter(boxWidth, boxHeight, boxNumber) {
    //Box
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxWidth);
    const boxMaterial = new THREE.MeshPhongMaterial();
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

    //Even box = red team; odd box = blue team
    if (boxNumber % 2 == 0) {
        boxMaterial.color.set("red");
    }
    else {
        boxMaterial.color.set("blue");
    }
    
    const initialX = initialPositions[boxNumber];
    const initialY = boxHeight / 2;
    boxMesh.position.set(initialX, initialY, 0);

    //Add third person and first person cameras to the box
    const thirdPersonCamera = makeCamera();
    thirdPersonCamera.position.set(0, boxHeight/2 + 1.5, 3.5);      //Relative to the box
    thirdPersonCamera.lookAt(0, 0, -6.5);
    boxMesh.add(thirdPersonCamera);

    const firstPersonCamera = makeCamera();
    firstPersonCamera.position.set(0, boxHeight * 0.25, 0);       //Relative to the box
    firstPersonCamera.lookAt(0, boxHeight * 0.25, -1);
    boxMesh.add(firstPersonCamera);

    //Box physics
    const halfExtents = new CANNON.Vec3(boxWidth / 2, boxHeight / 2, boxWidth / 2);
    const boxShape = new CANNON.Box(halfExtents);
    const boxBody = new CANNON.Body({mass: 0});
    boxBody.addShape(boxShape);
    boxBody.position.set(initialX, initialY, 0);

    return [boxMesh, boxBody, thirdPersonCamera, firstPersonCamera];
}

export {createCharacter};