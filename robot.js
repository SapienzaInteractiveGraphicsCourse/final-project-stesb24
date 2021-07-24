import * as THREE from "./libs/three.module.js";
import {makeCamera} from "./game.js";

//i-th value is the initial (x, z) position and angle of the i-th robot
const initialCoordinates = [
    [0, 3, -Math.PI/2], [12, 15, Math.PI/12], [-17, -17, -0.75*Math.PI], [-4, 17, 0],
    [16.5, -11.5, Math.PI], [2, -9, Math.PI], [-17, 3.5, -Math.PI/2], [12.5, -18.5, Math.PI/2]
];

//Robot sizes
//Torso
const torsoWidth = 0.6;
const torsoHeight = 1;
const torsoDepth = 0.45;
//Head
const headRadius = 0.35;
const headSegments = 15;
//Legs
const legWidth = 0.25;
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
    //This class contains: currentTween, still,
    //health, body, waist, torso, head,
    //leftLegPivot, leftUpperLeg, leftKnee, leftLowerLeg,
    //rightLegPivot, rightUpperLeg, rightKnee, rightLowerLeg,
    //leftShoulder, leftUpperArm, leftElbow, leftLowerArm,
    //rightShoulder, rightUpperArm, rightElbow, rightLowerArm, rightHand,
    //thirdPersonCamera, firstPersonCamera

    constructor(robotNumber, scene, world) {
        this.health = 3;

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
        const initialY = 2 * legHeight;
        const initialZ = initialCoordinates[robotNumber][1];
        const initialAngle = initialCoordinates[robotNumber][2];
        this.waist.position.set(initialX, initialY, initialZ);
        this.waist.rotation.y = initialAngle;

        //Torso (waist's child)
        const torsoGeometry = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
        this.torso = new THREE.Mesh(torsoGeometry, material);
        this.torso.position.y = torsoHeight / 2;

        //Left leg (waist's child)
        this.leftLegPivot = new THREE.Object3D();
        this.leftLegPivot.position.x = -torsoWidth / 2 + legWidth / 2;

        this.leftUpperLeg = new THREE.Mesh(legGeometry, material);
        this.leftUpperLeg.position.y = -legHeight / 2;

        this.leftKnee = new THREE.Mesh(sphereGeometry, material);
        this.leftKnee.position.y = -legHeight / 2;

        this.leftLowerLeg = new THREE.Mesh(legGeometry, material);
        this.leftLowerLeg.position.y = -legHeight / 2;

        //Right leg (waist's child)
        this.rightLegPivot = new THREE.Object3D();
        this.rightLegPivot.position.x = torsoWidth / 2 - legWidth / 2;

        this.rightUpperLeg = new THREE.Mesh(legGeometry, material);
        this.rightUpperLeg.position.y = -legHeight / 2;

        this.rightKnee = new THREE.Mesh(sphereGeometry, material);
        this.rightKnee.position.y = -legHeight / 2;

        this.rightLowerLeg = new THREE.Mesh(legGeometry, material);
        this.rightLowerLeg.position.y = -legHeight / 2;

        //Left arm (torso's child)
        this.leftShoulder = new THREE.Mesh(sphereGeometry, material);
        this.leftShoulder.position.x = -torsoWidth / 2 - sphereRadius + 0.05;
        this.leftShoulder.position.y = torsoHeight / 2 - 0.075;
        this.leftShoulder.rotation.z = -Math.PI / 20;

        this.leftUpperArm = new THREE.Mesh(armGeometry, material);
        this.leftUpperArm.position.y = -armHeight / 2;

        this.leftElbow = new THREE.Mesh(sphereGeometry, material);
        this.leftElbow.position.y = -armHeight / 2;
        this.leftElbow.rotation.x = Math.PI / 15;

        this.leftLowerArm = new THREE.Mesh(armGeometry, material);
        this.leftLowerArm.position.y = -armHeight / 2;

        //Right Arm (torso's child)
        this.rightShoulder = new THREE.Mesh(sphereGeometry, material);
        this.rightShoulder.position.x = torsoWidth / 2 + sphereRadius - 0.05;
        this.rightShoulder.position.y = torsoHeight / 2 - 0.075;
        this.rightShoulder.rotation.z = Math.PI / 20;

        this.rightUpperArm = new THREE.Mesh(armGeometry, material);
        this.rightUpperArm.position.y = -armHeight / 2;

        this.rightElbow = new THREE.Mesh(sphereGeometry, material);
        this.rightElbow.position.y = -armHeight / 2;
        this.rightElbow.rotation.x = Math.PI / 15;

        const rightLowerArmGeometry = new THREE.CylinderGeometry(cannonRadius, cannonRadius, cannonHeight, cannonSegments);
        this.rightLowerArm = new THREE.Mesh(rightLowerArmGeometry, material);
        this.rightLowerArm.position.y = -armHeight / 2;

        this.rightHand = new THREE.Object3D()           //This is used to know where the bullet is shot from
        this.rightHand.position.y = -armHeight / 2 - 0.22;

        //Head (waist's child)
        const headGeometry = new THREE.SphereGeometry(headRadius, headSegments, headSegments);
        this.head = new THREE.Mesh(headGeometry, material);
        this.head.position.y = torsoHeight + headRadius - 0.1;

        //Cameras
        this.thirdPersonCamera = makeCamera();          //Waist's child
        this.thirdPersonCamera.position.set(0, 2.8, 5.5);
        this.thirdPersonCamera.lookAt(0, 0, -9);

        this.firstPersonCamera = makeCamera(0.12);      //Head's child
        this.firstPersonCamera.position.set(0, 0, 0);
        this.firstPersonCamera.lookAt(0, 0, -1);

        //Build hierarchical model
        this.waist.add(this.leftLegPivot);
        this.leftLegPivot.add(this.leftUpperLeg);
        this.leftUpperLeg.add(this.leftKnee);
        this.leftKnee.add(this.leftLowerLeg);

        this.waist.add(this.rightLegPivot);
        this.rightLegPivot.add(this.rightUpperLeg);
        this.rightUpperLeg.add(this.rightKnee);
        this.rightKnee.add(this.rightLowerLeg);

        this.waist.add(this.thirdPersonCamera);

        this.waist.add(this.torso);

        this.torso.add(this.leftShoulder);
        this.leftShoulder.add(this.leftUpperArm);
        this.leftUpperArm.add(this.leftElbow);
        this.leftElbow.add(this.leftLowerArm);

        this.torso.add(this.rightShoulder);
        this.rightShoulder.add(this.rightUpperArm);
        this.rightUpperArm.add(this.rightElbow);
        this.rightElbow.add(this.rightLowerArm);
        this.rightLowerArm.add(this.rightHand);

        this.waist.add(this.head);

        this.head.add(this.firstPersonCamera);

        //Shadows
        this.waist.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        const halfExtents = new CANNON.Vec3(torsoWidth / 2, torsoHeight, torsoDepth / 2);
        const boxShape = new CANNON.Box(halfExtents);
        this.body = new CANNON.Body({mass: 0});
        this.body.addShape(boxShape);
        this.body.position.set(initialX, initialY, initialZ);
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), initialAngle);

        scene.add(this.waist);
        world.add(this.body);

        this.currentTween;          //Current animation
        this.still = true;          //Robot is not moving
    }

    //Animations
    idleToWalk() {                  //Start walking (right leg goes forward) then walk()
        if (this.still) {
            this.stopTween();
            this.still = false;

            this.currentTween = new TWEEN.Tween([         //Right forward, left backward
                    this.rightLegPivot.rotation,
                    this.rightKnee.rotation,
                    this.leftLegPivot.rotation,
                    this.leftKnee.rotation,
                    this.rightShoulder.rotation,
                    this.leftShoulder.rotation])
                .to([{x: Math.PI/6}, {x: -Math.PI/6}, {x: -Math.PI/12}, {x: -Math.PI/6},
                    {x: -Math.PI/8, z: Math.PI/20}, {x: Math.PI/8}], 180)
                .easing(TWEEN.Easing.Linear.None).start();

            this.currentTween.onComplete(() => {
                this.walk();
            });
        }
    }

    walk() {                        //Alternate left leg and right leg
        this.stopTween();

        this.currentTween = new TWEEN.Tween([         //Right straight, left bent
                this.rightLegPivot.rotation,
                this.rightKnee.rotation,
                this.leftLegPivot.rotation,
                this.leftKnee.rotation,
                this.rightShoulder.rotation,
                this.leftShoulder.rotation])
            .to([{x: 0}, {x: 0}, {x: Math.PI/6}, {x: -Math.PI/3},
                {x: 0}, {x: 0}], 180)
            .easing(TWEEN.Easing.Quadratic.In);
        const keyFrame1 = new TWEEN.Tween([           //Right backward, left forward
                this.rightLegPivot.rotation,
                this.rightKnee.rotation,
                this.leftLegPivot.rotation,
                this.leftKnee.rotation,
                this.rightShoulder.rotation,
                this.leftShoulder.rotation])
            .to([{x: -Math.PI/12}, {x: -Math.PI/6}, {x: Math.PI/6}, {x: -Math.PI/6},
                {x: Math.PI/8}, {x: -Math.PI/8}], 180)
            .easing(TWEEN.Easing.Linear.None);
        
        const keyFrame2 = new TWEEN.Tween([           //Right bent, left straight
                this.rightLegPivot.rotation,
                this.rightKnee.rotation,
                this.leftLegPivot.rotation,
                this.leftKnee.rotation,
                this.rightShoulder.rotation,
                this.leftShoulder.rotation])
            .to([{x: Math.PI/6}, {x: -Math.PI/3}, {x: 0}, {x: 0},
                {x: 0}, {x: 0}], 180)
            .easing(TWEEN.Easing.Quadratic.In);
        const keyFrame3 = new TWEEN.Tween([           //Right forward, left backward
                this.rightLegPivot.rotation,
                this.rightKnee.rotation,
                this.leftLegPivot.rotation,
                this.leftKnee.rotation,
                this.rightShoulder.rotation,
                this.leftShoulder.rotation])
            .to([{x: Math.PI/6}, {x: -Math.PI/6}, {x: -Math.PI/12}, {x: -Math.PI/6},
                {x: -Math.PI/8}, {x: Math.PI/8}], 180)
            .easing(TWEEN.Easing.Linear.None);

        this.currentTween.chain(keyFrame1);
        keyFrame1.chain(keyFrame2);
        keyFrame2.chain(keyFrame3);
        keyFrame3.chain(this.currentTween);

        this.currentTween.start();
    }

    walkToIdle() {                  //Stop walking (go back to initial position)
        this.stopTween();

        this.currentTween = new TWEEN.Tween([
                this.rightLegPivot.rotation,
                this.rightKnee.rotation,
                this.leftLegPivot.rotation,
                this.leftKnee.rotation,
                this.rightShoulder.rotation,
                this.leftShoulder.rotation])
            .to([{x: 0}, {x: 0}, {x: 0}, {x: 0}, {x: 0}, {x: 0}], 300)
            .easing(TWEEN.Easing.Linear.None).start();

        this.still = true;
        this.currentTween.onComplete(() => {
            this.idle();
        })
    }

    toAim() {
        this.stopTween();
        this.still = true;

        this.currentTween = new TWEEN.Tween([
                this.rightLegPivot.rotation,
                this.rightKnee.rotation,
                this.leftLegPivot.rotation,
                this.leftKnee.rotation,
                this.torso.rotation,
                this.rightShoulder.rotation,
                this.rightElbow.rotation,
                this.leftShoulder.rotation])
            .to([{x: 0}, {x: 0}, {x: 0}, {x: 0},
                {y: 0}, {x: Math.PI/1.9, z: -Math.PI/10}, {x: Math.PI/15}, {x: 0}], 150)
            .easing(TWEEN.Easing.Quadratic.InOut).start();
    }

    aimToIdle(time = 400, delay = 0) {
        this.stopTween();

        this.currentTween = new TWEEN.Tween([
                this.torso.rotation,
                this.rightShoulder.rotation,
                this.rightElbow.rotation,
                this.head.rotation])
            .to([{y: 0}, {x: 0, z: Math.PI/20}, {x: Math.PI/15}, {x: 0}], time)
            .easing(TWEEN.Easing.Quadratic.Out).delay(delay).start();
        
        this.currentTween.onComplete(() => {
            this.idle();
        })
    }

    shoot() {
        this.stopTween();

        const shootTween = new TWEEN.Tween([
                this.torso.rotation,
                this.rightShoulder.rotation,
                this.rightElbow.rotation])
            .to([{y: -Math.PI/12}, {z: Math.PI/8}, {x: Math.PI/2}], 150)
            .easing(TWEEN.Easing.Exponential.Out).start();

        shootTween.onComplete(() => this.aimToIdle(540, 150))
    }

    idle() {                        //Up and down with torso
        if (this.still) {
            this.currentTween = new TWEEN.Tween([
                    this.torso.position,
                    this.leftLegPivot.rotation,
                    this.leftKnee.rotation,
                    this.rightLegPivot.rotation,
                    this.rightKnee.rotation])
                .to([{y: 0.48}, {x: Math.PI/20}, {x: -Math.PI/10}, {x: Math.PI/20}, {x: -Math.PI/10}], 1200)
                .easing(TWEEN.Easing.Linear.None);
            const originalPosition = new TWEEN.Tween([
                    this.torso.position,
                    this.leftLegPivot.rotation,
                    this.leftKnee.rotation,
                    this.rightLegPivot.rotation,
                    this.rightKnee.rotation])
                .to([{y: 0.5}, {x: 0}, {x: 0}, {x: 0}, {x: 0}], 1200)
                .easing(TWEEN.Easing.Linear.None);
            
            this.currentTween.chain(originalPosition);
            originalPosition.chain(this.currentTween);

            this.currentTween.start();
        }
    }

    stopTween() {
        if (this.currentTween) {
            this.currentTween.stop();
        }
    }

    hit() {
        this.health--;
        console.log(this.health);
    }
}

export {Robot};