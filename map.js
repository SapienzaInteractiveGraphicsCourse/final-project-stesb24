import * as THREE from "./libs/three.module.js";

//Create all the objects in the scene and their physics
function createMap(scene, world) {
    createGround(scene, world);
    createBunker(scene, world);
}

function createGround(scene, world) {
    //Ground
    const groundWidth = 50;
    const groundHeight = 50;
    const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundHeight);
    const groundMaterial = new THREE.MeshPhongMaterial({color: "green"});
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;           //Horizontal
    scene.add(groundMesh);

    //Ground physics
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body( {mass: 0} );          //Static body
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); //Horizontal
    world.add(groundBody);
}

function createBunker(scene, world) {
    //Define all parameters that are useful to define the building
    const verticalAxis = 15;        //Where to place the bunker on the x axis
    const horizontalAxis = -12;     //Where to place the bunker on the z axis
    const houseWidth = 12;
    const houseDepth = 18;
    const houseHeight = 4;
    const wallThickness = 0.5;
    const entranceWidth = 2.5;

    //I use the parameters above to set the dimensions of the walls and their position
    //one with respect to the other
    
    //East wall
    createWall(wallThickness, houseHeight, houseDepth,
        verticalAxis+houseWidth/2, houseHeight/2, horizontalAxis,
        scene, world);
    //West wall
    createWall(wallThickness, houseHeight, houseDepth,
        verticalAxis-houseWidth/2, houseHeight/2, horizontalAxis,
        scene, world);
    //North wall    
    createWall(houseWidth+wallThickness, houseHeight, wallThickness,
        verticalAxis, houseHeight/2, horizontalAxis-houseDepth/2,
        scene, world);
    //South wall (left)
    createWall((houseWidth-entranceWidth)/2, houseHeight, wallThickness,
        verticalAxis-entranceWidth/4-houseWidth/4-wallThickness/2, houseHeight/2, horizontalAxis+houseDepth/2,
        scene, world);
    //South wall (right)
    createWall((houseWidth-entranceWidth)/2, houseHeight, wallThickness,
        verticalAxis+entranceWidth/4+houseWidth/4+wallThickness/2, houseHeight/2, horizontalAxis+houseDepth/2,
        scene, world);
    //Ceiling
    createWall(houseWidth+wallThickness, wallThickness, houseDepth+wallThickness,
        verticalAxis, houseHeight, horizontalAxis,
        scene, world);
}

//Take the dimensions of the wall and its coordinates and create it
function createWall(width, height, depth, x, y, z, scene, world) {
    //Box
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const boxMaterial = new THREE.MeshPhongMaterial({color: "saddlebrown"});
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(x, y, z);
    scene.add(boxMesh);

    //Box physics
    const halfExtents = new CANNON.Vec3(width/2, height/2, depth/2);
    const boxShape = new CANNON.Box(halfExtents);
    const boxBody = new CANNON.Body( {mass: 0} );
    boxBody.addShape(boxShape);
    boxBody.position.set(x, y, z);
    world.add(boxBody);
}

export {createMap};
