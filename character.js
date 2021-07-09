import * as THREE from "./libs/three.module.js";

//Create a new box
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

    return boxMesh;
}

export {createCharacter};