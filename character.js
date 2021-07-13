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

    //Add the camera to the box
    const boxCamera = makeCamera();
    boxCamera.position.set(0, boxHeight/2 + 1.5, 3.5);      //Relative to the box
    boxCamera.lookAt(0, 0, -6.5);
    boxMesh.add(boxCamera);

    //Box physics
    const halfExtents = new CANNON.Vec3(boxWidth / 2, boxHeight / 2, boxWidth / 2);
    const boxShape = new CANNON.Box(halfExtents);
    const boxBody = new CANNON.Body({mass: 0});
    boxBody.addShape(boxShape);
    boxBody.position.set(initialX, initialY, 0);

    return [boxMesh, boxCamera, boxBody];
}

export {createCharacter};