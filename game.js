import * as THREE from "./libs/three.module.js";    //r130
import {createMap} from "./map.js";
import {Robot} from "./robot.js";
import {resizeRendererToDisplaySize} from "./utils.js";

const numTeams = 2;
const robotsPerTeam = 4;
let numRobots = numTeams * robotsPerTeam;

const robots = [];
let currentRobotNumber = 0;
let currentRobot;

let bullets = [];
let bulletBodies = [];

//Creates new cameras
function makeCamera(near = 0.3, far = 75) {
    const fov = 50;
    const aspect = 2;       //Canvas default
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

//Set up and handle the scene graph (lights, cameras and objects) and physics
function main() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("skyblue");

    //World physics (gravity)
    const world = new CANNON.World();
    world.gravity.set(0, -9.81, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.friction = 0;

    //Create all lights and objects
    createMap(scene, world);

    //Create the robots and their cameras
    for (let i=0; i < numRobots; i++) {
        const robot = new Robot(i, scene, world);
        robots.push(robot);

        robot.idle();
    };

    //Detached camera looking from above
    const globalCamera = makeCamera(40, 55);
    globalCamera.position.y = 52;
    globalCamera.lookAt(0, 0, 0);

    //First robot
    currentRobot = robots[0];
    currentRobot.body.mass = 10;                      //The robot that acts must be affected by all physics (collides)
    currentRobot.body.type = CANNON.Body.DYNAMIC;
    currentRobot.body.updateMassProperties();

    let camera = currentRobot.thirdPersonCamera;      //Start from first robot's camera

    //Keyboard controls
    let moveForward = false;
    let moveBackward = false;
    let turnLeft = false;
    let turnRight = false;

    let aimUp = false;
    let aimDown = false;

    let global = false;                 //True = look from above
    let firstPerson = false;            //True = first person camera

    let charging = false;               //True = charging the shot
    let waitForCollision = false;       //True = shot fired -> don't act and wait for next turn

    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            //Move or shoot only if you haven't shot yet (!waitForCollision)
            case "KeyW":
                if (!waitForCollision) {
                    if (!firstPerson) {         //Move
                        moveForward = true;
                        currentRobot.idleToWalk();
                    }
                    else {                      //Aim
                        aimUp = true;
                    }
                }
                break;
            case "KeyS":
                if (!waitForCollision) {
                    if (!firstPerson) {         //Move
                        moveBackward = true;
                        currentRobot.idleToWalk();
                    }
                    else {                      //Aim
                        aimDown = true;
                    }
                }
                break;
            case "KeyA":
                if (!waitForCollision) {
                    turnLeft = true;            //Move or aim
                }
                break;
            case "KeyD":
                if (!waitForCollision) {
                    turnRight = true;           //Move or aim
                }
                break;
            case "Space":                       //Charge
                if (!waitForCollision && firstPerson) {
                    //Stop acting
                    waitForCollision = true;

                    //Reset all flags (stay still)
                    moveForward = false;
                    moveBackward = false;
                    turnLeft = false;
                    turnRight = false;
                    aimUp = false;
                    aimDown = false;

                    charging = true;
                    chargeShot();
                }
                break;
            //Camera handling
            case "KeyE":                //Global camera
                if (!global) {          //Switch to global camera
                    if (firstPerson) {      //If aiming, go back to idle
                        currentRobot.aimToIdle();
                    }
                    global = true;
                    firstPerson = false;
                    camera = globalCamera;
                }
                else {                  //Switch back to third person camera
                    global = false;
                    firstPerson = false;
                    camera = currentRobot.thirdPersonCamera;
                }
                break;
            case "KeyQ":                //First person camera
                if (!waitForCollision) {
                    if (!firstPerson) {     //Switch to first person camera
                        //Stop moving while aiming
                        moveForward = false;
                        moveBackward = false;
                        turnLeft = false;
                        turnRight = false;

                        currentRobot.toAim();
                        firstPerson = true;
                        global = false;
                        //Interrupted animations could have left the head looking somewhere else
                        currentRobot.head.rotation.x = 0;
                        camera = currentRobot.firstPersonCamera;
                    }
                    else {                  //Switch back to third person camera
                        //Reset all aiming flags
                        aimUp = false;
                        aimDown = false;
                        turnLeft = false;
                        turnRight = false;

                        currentRobot.aimToIdle();
                        firstPerson = false;
                        global = false;
                        camera = currentRobot.thirdPersonCamera;
                    }
                }
                break;
        }
    });

    document.addEventListener("keyup", (e) => {
        //Stop moving
        switch (e.code) {
            case "KeyW":
                if (!firstPerson) {         //Stop moving
                    moveForward = false;
                    currentRobot.walkToIdle();
                }
                else {                      //Stop aiming
                    aimUp = false;
                }
                break;
            case "KeyS":
                if (!firstPerson) {         //Stop moving
                    moveBackward = false;
                    currentRobot.walkToIdle();
                }
                else {                      //Stop aiming
                    aimDown = false;
                }
                break;
            case "KeyA":
                turnLeft = false;           //Stop moving or aiming
                break;
            case "KeyD":
                turnRight = false;          //Stop moving or aiming
                break;
            case "Space":
                charging = false;           //Stop charging
                break;
        }
    });

    //Charge up the shot and then shoot
    function chargeShot() {                     //Increase a counter
        let power = 0;

        let interval = setInterval(() => {
            power += 0.1;
            console.log(power);
            if (!charging || power >= 10) {     //Stopped charging or max charge
                camera = currentRobot.thirdPersonCamera;
                clearInterval(interval);        //Stop loop

                //Robot becomes static again
                currentRobot.body.mass = 0;
                currentRobot.body.type = CANNON.Body.STATIC;
                currentRobot.body.updateMassProperties();
                
                //Create new bullet and wait for next turn
                const bulletBody = bullet(power);
                bulletBody.addEventListener("collide", nextTurn);
                currentRobot.shoot();
            }
        }, 12.5);
    }

    //Shoot a new bullet
    function bullet(power) {
        //Bullet
        const bulletRadius = 0.2;
        const segments = 8;
        const bulletGeometry = new THREE.SphereGeometry(bulletRadius, segments, segments);
        const bulletMaterial = new THREE.MeshPhongMaterial({color: "gray"});
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

        //Bullet initial position
        let initialCoords = new THREE.Vector3();
        currentRobot.rightHand.getWorldPosition(initialCoords);     //Hand gives the bullet's initial coordinates
        bulletMesh.position.set(initialCoords.x, initialCoords.y, initialCoords.z);
        bulletMesh.castShadow = true;
        bulletMesh.receiveShadow = true;

        //Bullet physics
        const bulletShape = new CANNON.Sphere(bulletRadius);
        const bulletBody = new CANNON.Body({mass: 1});
        bulletBody.addShape(bulletShape);

        //Break the shot vector over the three axes
        const effectivePower = power * 2.5;             //Scale up the power (too weak)
        const horizontalAngle = currentRobot.waist.rotation.y;
        const verticalAngle = currentRobot.head.rotation.x;
        const powerY = effectivePower * Math.sin(verticalAngle);
        const projection = effectivePower * Math.cos(verticalAngle);     //Project the vector on the xz plane
        const powerX = projection * -Math.sin(horizontalAngle);
        const powerZ = projection * -Math.cos(horizontalAngle);
        bulletBody.position.set(initialCoords.x, initialCoords.y, initialCoords.z);
        bulletBody.velocity.set(powerX, powerY, powerZ);

        bullets.push(bulletMesh);
        scene.add(bulletMesh);
        bulletBodies.push(bulletBody);
        world.addBody(bulletBody);

        return bulletBody;          //Used for bullet listener to detect the first collision*/
    }

    //Go to next player's turn
    function nextTurn(e) {
        this.removeEventListener("collide", nextTurn);  //Remove listener from bullet (detect only one collision)
        for(var i=0; i < world.contacts.length; i++){   //Scan all contacts
            var c = world.contacts[i];
            robots.forEach(robot => {                 //Check if contact is between the bullet and a robot
                if ((c.bi === this && c.bj === robot.body) || (c.bi === robot.body && c.bj === this)) {
                    if (robot.decreaseHealth()) {       //Remove the dead robot
                        const index = robots.indexOf(robot);
                        robots.splice(index, 1);
                        numRobots--;
                    }
                }
            });
        }

        if (robots.every(robot => robot.team == 0)) {                       //Last player remaining is the winner
            gameOver();
            console.log("Red team wins");
        }
        if (robots.every(robot => robot.team == 1)) {
            gameOver();
            console.log("Blue team wins");
        }

        setTimeout(() => {                              //Change turn some time after the collision
            currentRobotNumber = (currentRobotNumber + 1) % numRobots;
            currentRobot = robots[currentRobotNumber];
            camera = currentRobot.thirdPersonCamera;    //Switch to next player's camera

            //The new robot becomes dynamic
            currentRobot.body.mass = 10;
            currentRobot.body.type = CANNON.Body.DYNAMIC;
            currentRobot.body.updateMassProperties();

            global = false;                             //Reset flags
            firstPerson = false;
            waitForCollision = false;
        }, 1500);
    }

    //Move the robot (applying forces in case)
    function move() {
        const speed = 3.3;
        //Speed over x and z and how much the robot rotates
        const speedX = Math.sin(currentRobot.waist.rotation.y) * speed;
        const speedZ = Math.cos(currentRobot.waist.rotation.y) * speed;
        const rotation = 0.02;

        //No if-else so that you can use them together

        if (!moveForward && !moveBackward) {
            currentRobot.body.velocity.set(0, 0, 0);
        }

        if (moveBackward) {
            currentRobot.body.velocity.set(speedX, 0, speedZ);                  //Move body
            currentRobot.waist.position.x = currentRobot.body.position.x;       //Move mesh accordingly
            currentRobot.waist.position.z = currentRobot.body.position.z;
        }
        if (moveForward) {
            currentRobot.body.velocity.set(-speedX, 0, -speedZ);                //Move body
            currentRobot.waist.position.x = currentRobot.body.position.x;       //Move mesh accordingly
            currentRobot.waist.position.z = currentRobot.body.position.z;
        }

        if (turnLeft && !firstPerson) {
            currentRobot.waist.rotation.y += rotation;
        }
        if (turnRight && !firstPerson) {
            currentRobot.waist.rotation.y += -rotation;
        }
    }

    //Aim when in first person
    function aim() {
        //How much the robot rotates
        const rotation = 0.005;

        //No if-else so that you can use them together
        if (aimUp && currentRobot.head.rotation.x < Math.PI / 3) {      //Max angle
            currentRobot.head.rotation.x += rotation;
            currentRobot.rightShoulder.rotation.x += rotation;
        }
        if (aimDown && currentRobot.head.rotation.x > -Math.PI / 8) {   //Min angle
            currentRobot.head.rotation.x += -rotation;
            currentRobot.rightShoulder.rotation.x += -rotation;
        }
        if (turnLeft && firstPerson) {
            currentRobot.waist.rotation.y += rotation;
        }
        if (turnRight && firstPerson) {
            currentRobot.waist.rotation.y += -rotation;
        }
    }

    function gameOver() {

    }

    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;
    
    //const cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);

    function render() {
        //Step the physics world
        world.step(1/60);
        //cannonDebugRenderer.update();

        //Move the robot
        move();
        aim();
        TWEEN.update();

        //We move the body but want the mesh's rotation
        currentRobot.body.quaternion.copy(currentRobot.waist.quaternion);

        //Copy coordinates from Cannon to Three for each bullet
        bullets.forEach((bullet, index) => {
            bullet.position.copy(bulletBodies[index].position);
            bullet.quaternion.copy(bulletBodies[index].quaternion);
        });
        //Don't iterate over bullets outside of map (remove them)
        bullets = bullets.filter(bullet => bullet.position.y >= -8);
        bulletBodies = bulletBodies.filter(body => body.position.y >= -8);

        //The aspect of the cameras matches the aspect of the canvas (no distortions)
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            robots.forEach(robot => {
                robot.thirdPersonCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                robot.firstPersonCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                robot.thirdPersonCamera.updateProjectionMatrix();
                robot.firstPersonCamera.updateProjectionMatrix();
            });
            globalCamera.aspect = canvas.clientWidth / canvas.clientHeight;
            globalCamera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();

export {makeCamera};