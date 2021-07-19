import * as THREE from "./libs/three.module.js";
import {makeCamera} from "./game.js";

//i-th value is the initial (x, z) position of the i-th box
const initialCoordinates = [
    [-14, -20], [15, -10], [13, 10], [-5, 0]
];

//Create a new robot and return it with its cameras
function createCharacter(boxWidth, boxHeight, boxNumber) {
    /*//Box
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
    
    const initialX = initialCoordinates[boxNumber][0];
    const initialY = boxHeight / 2;
    const initialZ = initialCoordinates[boxNumber][1];
    boxMesh.position.set(initialX, initialY, initialZ);

    //Add third person and first person cameras to the box
    const thirdPersonCamera = makeCamera();
    thirdPersonCamera.position.set(0, boxHeight/2 + 1.5, 3.5);      //Relative to the box
    thirdPersonCamera.lookAt(0, 0, -6.5);
    boxMesh.add(thirdPersonCamera);

    const firstPersonCamera = makeCamera();
    firstPersonCamera.position.set(0, boxHeight * 0.25, 0);         //Relative to the box
    firstPersonCamera.lookAt(0, boxHeight * 0.25, -1);
    boxMesh.add(firstPersonCamera);

    //Box physics
    const halfExtents = new CANNON.Vec3(boxWidth / 2, boxHeight / 2, boxWidth / 2);
    const boxShape = new CANNON.Box(halfExtents);
    const boxBody = new CANNON.Body({mass: 0});
    boxBody.addShape(boxShape);
    boxBody.position.set(initialX, initialY, initialZ);

    return [boxMesh, boxBody, thirdPersonCamera, firstPersonCamera];*/
}
function createCharacter2(robotNumber, scene) {
    const material = new THREE.MeshPhongMaterial();
    if (robotNumber % 2 == 0) {           //Even robot = red team; odd robot = blue team
        material.color.set("red");
    }
    else {
        material.color.set("blue");
    }

    //Robot sizes
    //Torso
    const torsoWidth = 0.6;
    const torsoHeight = 1;
    const torsoDepth = 0.4;
    //Head
    const headWidth = 0.5;
    const headHeight = headWidth;
    const headDepth = headWidth;
    //Legs
    const legWidth = 0.25;
    const legHeight = 0.5;
    const legDepth = legWidth;
    //Arms
    const armWidth = 0.2;
    const armHeight = 0.45;
    const armDepth = armWidth;
    //Cannon
    const cannonRadius = armWidth / 2 + 0.075;
    const cannonHeight = armHeight;
    const radialSegments = 14;

    //Robot (waist)
    const robot = new THREE.Object3D();
    const initialX = initialCoordinates[robotNumber][0];
    const initialY = 2 * legHeight;
    const initialZ = initialCoordinates[robotNumber][1];
    robot.position.set(initialX, initialY, initialZ);

    //Torso
    const torsoGeometry = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
    const torsoMesh = new THREE.Mesh(torsoGeometry, material);
    torsoMesh.position.y = torsoHeight / 2;

    //Head
    const headGeometry = new THREE.BoxGeometry(headWidth, headHeight, headDepth);
    const headMesh = new THREE.Mesh(headGeometry, material);
    headMesh.position.y = torsoHeight + headHeight / 2;

    //Left leg
    const leftUpperLegPivot = new THREE.Object3D();
    leftUpperLegPivot.position.x = -torsoWidth / 2 + legWidth / 2;

    const leftUpperLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
    const leftUpperLegMesh = new THREE.Mesh(leftUpperLegGeometry, material);
    leftUpperLegMesh.position.y = -legHeight / 2;

    const leftLowerLegPivot = new THREE.Object3D();
    leftLowerLegPivot.position.y = -legHeight / 2;

    const leftLowerLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
    const leftLowerLegMesh = new THREE.Mesh(leftLowerLegGeometry, material);
    leftLowerLegMesh.position.y = -legHeight / 2;

    //Right leg
    const rightUpperLegPivot = new THREE.Object3D();
    rightUpperLegPivot.position.x = torsoWidth / 2 - legWidth / 2;

    const rightUpperLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
    const rightUpperLegMesh = new THREE.Mesh(rightUpperLegGeometry, material);
    rightUpperLegMesh.position.y = -legHeight / 2;

    const rightLowerLegPivot = new THREE.Object3D();
    rightLowerLegPivot.position.y = -legHeight / 2;

    const rightLowerLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
    const rightLowerLegMesh = new THREE.Mesh(rightLowerLegGeometry, material);
    rightLowerLegMesh.position.y = -legHeight / 2;

    //Left arm
    const leftUpperArmPivot = new THREE.Object3D();
    leftUpperArmPivot.position.x = -torsoWidth / 2 - armWidth / 2;
    leftUpperArmPivot.position.y = torsoHeight;

    const leftUpperArmGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    const leftUpperArmMesh = new THREE.Mesh(leftUpperArmGeometry, material);
    leftUpperArmMesh.position.y = -armHeight / 2;

    const leftLowerArmPivot = new THREE.Object3D();
    leftLowerArmPivot.position.y = -armHeight / 2;

    const leftLowerArmGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    const leftLowerArmMesh = new THREE.Mesh(leftLowerArmGeometry, material);
    leftLowerArmMesh.position.y = -armHeight / 2;

    //Right Arm
    const rightUpperArmPivot = new THREE.Object3D();
    rightUpperArmPivot.position.x = torsoWidth / 2 + armWidth / 2;
    rightUpperArmPivot.position.y = torsoHeight - 0.1;
    rightUpperArmPivot.rotation.x = Math.PI / 2;

    const rightUpperArmGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    const rightUpperArmMesh = new THREE.Mesh(rightUpperArmGeometry, material);
    rightUpperArmMesh.position.y = -armHeight / 2;

    const rightLowerArmPivot = new THREE.Object3D();
    rightLowerArmPivot.position.y = -armHeight / 2;

    const rightLowerArmGeometry = new THREE.CylinderGeometry(cannonRadius, cannonRadius, cannonHeight, radialSegments);
    const rightLowerArmMesh = new THREE.Mesh(rightLowerArmGeometry, material);
    rightLowerArmMesh.position.y = -armHeight / 2;

    //Cameras
    const thirdPersonCamera = makeCamera();
    thirdPersonCamera.position.set(0, 1.5, 5.5);
    thirdPersonCamera.lookAt(0, 0, -2.5);

    const firstPersonCamera = makeCamera();
    firstPersonCamera.position.set(0, 0, 0);
    firstPersonCamera.lookAt(0, 0, -1);

    //Hierarchical model
    scene.add(robot);
    robot.add(torsoMesh)
    robot.add(headMesh);

    robot.add(leftUpperLegPivot);
    leftUpperLegPivot.add(leftUpperLegMesh);
    leftUpperLegMesh.add(leftLowerLegPivot);
    leftLowerLegPivot.add(leftLowerLegMesh);

    robot.add(rightUpperLegPivot);
    rightUpperLegPivot.add(rightUpperLegMesh);
    rightUpperLegMesh.add(rightLowerLegPivot);
    rightLowerLegPivot.add(rightLowerLegMesh);

    robot.add(leftUpperArmPivot);
    leftUpperArmPivot.add(leftUpperArmMesh);
    leftUpperArmMesh.add(leftLowerArmPivot);
    leftLowerArmPivot.add(leftLowerArmMesh);

    robot.add(rightUpperArmPivot);
    rightUpperArmPivot.add(rightUpperArmMesh);
    rightUpperArmMesh.add(rightLowerArmPivot);
    rightLowerArmPivot.add(rightLowerArmMesh);

    headMesh.add(thirdPersonCamera);
    headMesh.add(firstPersonCamera);

    return [robot, thirdPersonCamera, firstPersonCamera];
}

export {createCharacter, createCharacter2};