import * as THREE from "./libs/three.module.js";
import {makeCamera} from "./game.js";

//Create a new box and return it with its camera
function createCharacter(boxWidth, boxHeight, boxNumber, scene) {
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxWidth);
    const boxMaterial = new THREE.MeshPhongMaterial();
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

    //Even box = red team; odd box = blue team
    if (boxNumber % 2 == 0) {
        boxMesh.position.x = -10;
        boxMaterial.color.set("red");
    }
    else {
        boxMesh.position.x = 10;
        boxMaterial.color.set("blue");
    }
    boxMesh.position.y = boxHeight/2;

    scene.add(boxMesh);

    //Add the camera to the box
    const boxCamera = makeCamera();
    boxCamera.position.set(0, boxHeight/2 + 1.5, 3.5);      //Relative to the box
    boxCamera.lookAt(0, 0, -6.5);
    boxMesh.add(boxCamera);

    return [boxMesh, boxCamera];
}

export {createCharacter};