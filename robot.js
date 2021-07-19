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

//Robot sizes
//Torso
const torsoWidth = 0.6;
const torsoHeight = 1;
const torsoDepth = 0.5;
//Head
const headWidth = 0.55;
const headHeight = headWidth;
const headDepth = headWidth;
//Legs
const legWidth = 0.25;
const legHeight = 0.5;
const legDepth = 0.3;
//Arms
const armWidth = 0.2;
const armHeight = 0.45;
const armDepth = armWidth;
//Cannon
const cannonRadius = armWidth / 2 + 0.07;
const cannonHeight = armHeight;
const radialSegments = 14;

class Robot {
    //This class contains: health, waist, torsoMesh, headMesh,
    //leftUpperLegPivot, leftUpperLegMesh, leftLowerLegPivot, leftLowerLegMesh,
    //rightUpperLegPivot, rightUpperLegMesh, rightLowerLegPivot, rightLowerLegMesh,
    //leftUpperArmPivot, leftUpperArmMesh, leftLowerArmPivot, leftLowerArmMesh,
    //rightUpperArmPivot, rightUpperArmMesh, rightLowerArmPivot, leftLowerArmMesh,
    //thirdPersonCamera, firstPersonCamera

    constructor(robotNumber, scene) {
        this.health = 100;

        const material = new THREE.MeshPhongMaterial();
        if (robotNumber % 2 == 0) {           //Even robot = red team; odd robot = blue team
            material.color.set("red");
        }
        else {
            material.color.set("blue");
        }

        //Waist (container for the whole robot)
        this.waist = new THREE.Object3D();
        const initialX = initialCoordinates[robotNumber][0];
        const initialY = 2 * legHeight;
        const initialZ = initialCoordinates[robotNumber][1];
        this.waist.position.set(initialX, initialY, initialZ);

        //Torso
        const torsoGeometry = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
        this.torsoMesh = new THREE.Mesh(torsoGeometry, material);
        this.torsoMesh.position.y = torsoHeight / 2;

        //Head
        const headGeometry = new THREE.BoxGeometry(headWidth, headHeight, headDepth);
        this.headMesh = new THREE.Mesh(headGeometry, material);
        this.headMesh.position.y = torsoHeight + headHeight / 2;

        //Left leg
        this.leftUpperLegPivot = new THREE.Object3D();
        this.leftUpperLegPivot.position.x = -torsoWidth / 2 + legWidth / 2;

        const leftUpperLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
        this.leftUpperLegMesh = new THREE.Mesh(leftUpperLegGeometry, material);
        this.leftUpperLegMesh.position.y = -legHeight / 2;

        this.leftLowerLegPivot = new THREE.Object3D();
        this.leftLowerLegPivot.position.y = -legHeight / 2;

        const leftLowerLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
        this.leftLowerLegMesh = new THREE.Mesh(leftLowerLegGeometry, material);
        this.leftLowerLegMesh.position.y = -legHeight / 2;

        //Right leg
        this.rightUpperLegPivot = new THREE.Object3D();
        this.rightUpperLegPivot.position.x = torsoWidth / 2 - legWidth / 2;

        const rightUpperLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
        this.rightUpperLegMesh = new THREE.Mesh(rightUpperLegGeometry, material);
        this.rightUpperLegMesh.position.y = -legHeight / 2;

        this.rightLowerLegPivot = new THREE.Object3D();
        this.rightLowerLegPivot.position.y = -legHeight / 2;

        const rightLowerLegGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
        this.rightLowerLegMesh = new THREE.Mesh(rightLowerLegGeometry, material);
        this.rightLowerLegMesh.position.y = -legHeight / 2;

        //Left arm
        this.leftUpperArmPivot = new THREE.Object3D();
        this.leftUpperArmPivot.position.x = -torsoWidth / 2 - armWidth / 2;
        this.leftUpperArmPivot.position.y = torsoHeight;

        const leftUpperArmGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
        this.leftUpperArmMesh = new THREE.Mesh(leftUpperArmGeometry, material);
        this.leftUpperArmMesh.position.y = -armHeight / 2;

        this.leftLowerArmPivot = new THREE.Object3D();
        this.leftLowerArmPivot.position.y = -armHeight / 2;

        const leftLowerArmGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
        this.leftLowerArmMesh = new THREE.Mesh(leftLowerArmGeometry, material);
        this.leftLowerArmMesh.position.y = -armHeight / 2;

        //Right Arm
        this.rightUpperArmPivot = new THREE.Object3D();
        this.rightUpperArmPivot.position.x = torsoWidth / 2 + armWidth / 2;
        this.rightUpperArmPivot.position.y = torsoHeight - 0.1;
        this.rightUpperArmPivot.rotation.x = Math.PI / 1.8;
        this.rightUpperArmPivot.rotation.z = -Math.PI / 13;

        const rightUpperArmGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
        this.rightUpperArmMesh = new THREE.Mesh(rightUpperArmGeometry, material);
        this.rightUpperArmMesh.position.y = -armHeight / 2;

        this.rightLowerArmPivot = new THREE.Object3D();
        this.rightLowerArmPivot.position.y = -armHeight / 2;

        const rightLowerArmGeometry = new THREE.CylinderGeometry(cannonRadius, cannonRadius, cannonHeight, radialSegments);
        this.rightLowerArmMesh = new THREE.Mesh(rightLowerArmGeometry, material);
        this.rightLowerArmMesh.position.y = -armHeight / 2;

        //Cameras
        this.thirdPersonCamera = makeCamera();
        this.thirdPersonCamera.position.set(0, 1.5, 5.5);
        this.thirdPersonCamera.lookAt(0, 0, -2.5);

        this.firstPersonCamera = makeCamera(0.3, 80);
        this.firstPersonCamera.position.set(0, 0, 0);
        this.firstPersonCamera.lookAt(0, 0, -1);

        //Build hierarchical model
        this.waist.add(this.torsoMesh)
        this.waist.add(this.headMesh);

        this.waist.add(this.leftUpperLegPivot);
        this.leftUpperLegPivot.add(this.leftUpperLegMesh);
        this.leftUpperLegMesh.add(this.leftLowerLegPivot);
        this.leftLowerLegPivot.add(this.leftLowerLegMesh);

        this.waist.add(this.rightUpperLegPivot);
        this.rightUpperLegPivot.add(this.rightUpperLegMesh);
        this.rightUpperLegMesh.add(this.rightLowerLegPivot);
        this.rightLowerLegPivot.add(this.rightLowerLegMesh);

        this.waist.add(this.leftUpperArmPivot);
        this.leftUpperArmPivot.add(this.leftUpperArmMesh);
        this.leftUpperArmMesh.add(this.leftLowerArmPivot);
        this.leftLowerArmPivot.add(this.leftLowerArmMesh);

        this.waist.add(this.rightUpperArmPivot);
        this.rightUpperArmPivot.add(this.rightUpperArmMesh);
        this.rightUpperArmMesh.add(this.rightLowerArmPivot);
        this.rightLowerArmPivot.add(this.rightLowerArmMesh);

        this.headMesh.add(this.thirdPersonCamera);
        this.headMesh.add(this.firstPersonCamera);

        scene.add(this.waist);
    }
}

export {createCharacter, Robot};