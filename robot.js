import * as THREE from "./libs/three.module.js";
import {makeCamera} from "./game.js";

//i-th value is the initial (x, z) position and angle of the i-th robot
const initialCoordinates = [
    [-1, 3, -Math.PI/2], [12, 15, Math.PI/8], [-17, -17, -0.75*Math.PI], [-4, 17, 0],
    [16.5, -11.5, Math.PI], [2, -9, Math.PI], [-17, 3.5, -Math.PI/2], [12.5, -18.5, Math.PI/2]
];

/*function createCharacter(boxWidth, boxHeight, boxNumber) {
    //Box physics
    const halfExtents = new CANNON.Vec3(boxWidth / 2, boxHeight / 2, boxWidth / 2);
    const boxShape = new CANNON.Box(halfExtents);
    const boxBody = new CANNON.Body({mass: 0});
    boxBody.addShape(boxShape);
    boxBody.position.set(initialX, initialY, initialZ);
}*/

//Robot sizes
//Torso
const torsoWidth = 0.6;
const torsoHeight = 1;
const torsoDepth = 0.45;
//Head
const headRadius = 0.35;
const headSegments = 15;
//Legs
const legWidth = 0.22;
const legHeight = 0.5;
const legDepth = 0.24;
//Arms
const armWidth = 0.18;
const armHeight = 0.45;
const armDepth = armWidth;
//Cannon
const cannonRadius = armWidth / 2 + 0.07;
const cannonSegments = 24;
const cannonHeight = armHeight;
//Spheres
const sphereRadius = 0.135;
const sphereSegments = 10;

class Robot {
    //This class contains: health, waist, torso, head,
    //leftLegPivot, leftUpperLeg, leftKnee, leftLowerLeg,
    //rightLegPivot, rightUpperLeg, rightKnee, rightLowerLeg,
    //leftShoulder, leftUpperArm, leftElbow, leftLowerArm,
    //rightShoulder, rightUpperArm, rightElbow, rightLowerArm,
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

        //Geometries that are reused
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereSegments, sphereSegments);
        const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
        const armGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);

        //Waist ("container" for the whole robot)
        this.waist = new THREE.Object3D();
        const initialX = initialCoordinates[robotNumber][0];
        let initialY = 2 * legHeight;
        if (robotNumber == 5) {
            initialY += 3;
        }
        const initialZ = initialCoordinates[robotNumber][1];
        this.waist.position.set(initialX, initialY, initialZ);
        this.waist.rotation.y = initialCoordinates[robotNumber][2];

        //Torso
        const torsoGeometry = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
        this.torso = new THREE.Mesh(torsoGeometry, material);
        this.torso.position.y = torsoHeight / 2;

        //Head
        const headGeometry = new THREE.SphereGeometry(headRadius, headSegments, headSegments);
        this.head = new THREE.Mesh(headGeometry, material);
        this.head.position.y = torsoHeight + headRadius - 0.08;

        //Left leg
        this.leftLegPivot = new THREE.Object3D();
        this.leftLegPivot.position.x = -torsoWidth / 2 + legWidth / 2;

        this.leftUpperLeg = new THREE.Mesh(legGeometry, material);
        this.leftUpperLeg.position.y = -legHeight / 2;

        this.leftKnee = new THREE.Mesh(sphereGeometry, material);
        this.leftKnee.position.y = -legHeight / 2;

        this.leftLowerLeg = new THREE.Mesh(legGeometry, material);
        this.leftLowerLeg.position.y = -legHeight / 2;

        //Right leg
        this.rightLegPivot = new THREE.Object3D();
        this.rightLegPivot.position.x = torsoWidth / 2 - legWidth / 2;

        this.rightUpperLeg = new THREE.Mesh(legGeometry, material);
        this.rightUpperLeg.position.y = -legHeight / 2;

        this.rightKnee = new THREE.Mesh(sphereGeometry, material);
        this.rightKnee.position.y = -legHeight / 2;

        this.rightLowerLeg = new THREE.Mesh(legGeometry, material);
        this.rightLowerLeg.position.y = -legHeight / 2;

        //Left arm
        this.leftShoulder = new THREE.Mesh(sphereGeometry, material);
        this.leftShoulder.position.x = -torsoWidth / 2 - sphereRadius + 0.05;
        this.leftShoulder.position.y = torsoHeight - 0.075;
        this.leftShoulder.rotation.z = -Math.PI / 20;

        this.leftUpperArm = new THREE.Mesh(armGeometry, material);
        this.leftUpperArm.position.y = -armHeight / 2;

        this.leftElbow = new THREE.Mesh(sphereGeometry, material);
        this.leftElbow.position.y = -armHeight / 2;
        this.leftElbow.rotation.x = Math.PI / 15;

        this.leftLowerArm = new THREE.Mesh(armGeometry, material);
        this.leftLowerArm.position.y = -armHeight / 2;

        //Right Arm
        this.rightShoulder = new THREE.Mesh(sphereGeometry, material);
        this.rightShoulder.position.x = torsoWidth / 2 + sphereRadius - 0.05;
        this.rightShoulder.position.y = torsoHeight - 0.075;
        this.rightShoulder.rotation.z = Math.PI / 20;

        this.rightUpperArm = new THREE.Mesh(armGeometry, material);
        this.rightUpperArm.position.y = -armHeight / 2;

        this.rightElbow = new THREE.Mesh(sphereGeometry, material);
        this.rightElbow.position.y = -armHeight / 2;
        this.rightElbow.rotation.x = Math.PI / 15;

        const rightLowerArmGeometry = new THREE.CylinderGeometry(cannonRadius, cannonRadius, cannonHeight, cannonSegments);
        this.rightLowerArm = new THREE.Mesh(rightLowerArmGeometry, material);
        this.rightLowerArm.position.y = -armHeight / 2;

        //Cameras
        this.thirdPersonCamera = makeCamera();
        this.thirdPersonCamera.position.set(0, 1.5, 5.5);
        this.thirdPersonCamera.lookAt(0, 0, -2.5);

        this.firstPersonCamera = makeCamera(0.3);
        this.firstPersonCamera.position.set(0, 0, 0);
        this.firstPersonCamera.lookAt(0, 0, -1);

        //Build hierarchical model
        this.waist.add(this.torso)
        this.waist.add(this.head);

        this.waist.add(this.leftLegPivot);
        this.leftLegPivot.add(this.leftUpperLeg);
        this.leftUpperLeg.add(this.leftKnee);
        this.leftKnee.add(this.leftLowerLeg);

        this.waist.add(this.rightLegPivot);
        this.rightLegPivot.add(this.rightUpperLeg);
        this.rightUpperLeg.add(this.rightKnee);
        this.rightKnee.add(this.rightLowerLeg);

        this.waist.add(this.leftShoulder);
        this.leftShoulder.add(this.leftUpperArm);
        this.leftUpperArm.add(this.leftElbow);
        this.leftElbow.add(this.leftLowerArm);

        this.waist.add(this.rightShoulder);
        this.rightShoulder.add(this.rightUpperArm);
        this.rightUpperArm.add(this.rightElbow);
        this.rightElbow.add(this.rightLowerArm);

        this.head.add(this.thirdPersonCamera);
        this.head.add(this.firstPersonCamera);

        scene.add(this.waist);
    }
}

export {Robot};