import * as THREE from "./libs/three.module.js";
import {OBJLoader} from "./libs/OBJLoader.js";

//Create all the objects in the scene and their physics
function createMap(scene, world) {
    createLights(scene);
    createGround(scene, world);
    createBunker(scene, world);
    createBarrels(scene, world);
    createTrees(scene, world);
    createCollisionPlane(world);
}

function createLights(scene) {
    //Directional light (sun)
    const lightColor = "white";
    const intensityDir = 0.8;
    const directionalLight = new THREE.DirectionalLight(lightColor, intensityDir);
    directionalLight.position.set(-6, 4, -5);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    //Ambient light
    const intensityAmb = 0.45;
    const ambientLight = new THREE.AmbientLight(lightColor, intensityAmb);
    scene.add(ambientLight);
}

function createGround(scene, world) {
    //Ground texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/grass.png");
    texture.wrapS = THREE.RepeatWrapping;       //Horizontal wrapping
    texture.wrapT = THREE.RepeatWrapping;       //Vertical wrapping
    const timesToRepeatHorizontally = 8;
    const timesToRepeatVertically = 8;
    texture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    const groundMaterial = new THREE.MeshPhongMaterial({map: texture});
    groundMaterial.side = THREE.DoubleSide;

    //Ground
    const groundWidth = 50;
    const groundHeight = 50;
    const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundHeight);    
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;           //Horizontal
    scene.add(groundMesh);

    //Ground physics
    //Instead of using an infinite plane, I place a thin box right below
    //the surface, so that objects can fall off the ground
    const below = 0.1;
    const halfExtents = new CANNON.Vec3(groundWidth / 2, below, groundHeight / 2);
    const groundShape = new CANNON.Box(halfExtents);
    const groundBody = new CANNON.Body({mass: 0});          //Static body
    groundBody.addShape(groundShape);
    groundBody.position.set(0, -below, 0);
    world.add(groundBody);
}

function createBunker(scene, world) {
    //Define all parameters that are useful to define the building
    const verticalAxis = 15;        //Where to place the bunker on the x axis
    const horizontalAxis = -12;     //Where to place the bunker on the z axis
    const bunkerWidth = 11;
    const bunkerDepth = 18;
    const bunkerHeight = 4;
    const wallThickness = 0.5;
    const entranceWidth = 2.5;

    //I use the parameters above to set the dimensions of the walls and their positions
    //one with respect to the other - pass also horizontal repetitions of textures

    //East wall
    createWall(bunkerDepth, bunkerHeight, wallThickness, 3,
        verticalAxis+bunkerWidth/2+wallThickness/2, bunkerHeight/2, horizontalAxis,
        scene, world);
    //West wall
    createWall(bunkerDepth, bunkerHeight, wallThickness, 3,
        verticalAxis-bunkerWidth/2-wallThickness/2, bunkerHeight/2, horizontalAxis,
        scene, world);
    //North wall    
    createWall(bunkerWidth, bunkerHeight, wallThickness, 2,
        verticalAxis, bunkerHeight/2, horizontalAxis-bunkerDepth/2+wallThickness/2,
        scene, world);
    //South wall (left)
    createWall((bunkerWidth-entranceWidth)/2, bunkerHeight, wallThickness, 0.75,
        verticalAxis-entranceWidth/4-bunkerWidth/4, bunkerHeight/2, horizontalAxis+bunkerDepth/2-wallThickness/2,
        scene, world);
    //South wall (right)
    createWall((bunkerWidth-entranceWidth)/2, bunkerHeight, wallThickness, 0.75,
        verticalAxis+entranceWidth/4+bunkerWidth/4, bunkerHeight/2, horizontalAxis+bunkerDepth/2-wallThickness/2,
        scene, world);
}

//Input params: dimensions - texture horizontal repetitions - coordinates - scene and world
//Take the dimensions of the wall and its coordinates and create it;
//timesToRepeatHorizontally also determines the orientation (angle) of the wall:
// - 3 repetitions for east and west walls (-> 90°)
// - 2 repetitions for north wall (-> 0°)
// - 0.75 repetitions for south walls (-> 0°)
function createWall(width, height, depth, timesToRepeatHorizontally, x, y, z, scene, world) {
    const loader = new THREE.TextureLoader();

    //Color texture (one texture for each face)
    const textureRight = loader.load("./textures/wall_color_side.png");
    const textureLeft = loader.load("./textures/wall_color_side.png");
    const textureTop = loader.load("./textures/wall_color_top.png");
    const textureBottom = loader.load("./textures/wall_color_top.png");
    const textureFront = loader.load("./textures/wall_color.png");
    const textureBack = loader.load("./textures/wall_color.png");

    //Repetitions are needed only horizontally - right and left faces need no repetitions
    textureTop.wrapS = THREE.RepeatWrapping;
    textureBottom.wrapS = THREE.RepeatWrapping;
    textureFront.wrapS = THREE.RepeatWrapping;
    textureBack.wrapS = THREE.RepeatWrapping;
    const timesToRepeatVertically = 1;
    textureTop.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    textureBottom.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    textureFront.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    textureBack.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

    //Normal map (do the same things as before)
    const normalRight = loader.load("./textures/wall_norm_side.png");
    const normalLeft = loader.load("./textures/wall_norm_side.png");
    const normalTop = loader.load("./textures/wall_norm_top.png");
    const normalBottom = loader.load("./textures/wall_norm_top.png");
    const normalFront = loader.load("./textures/wall_norm.png");
    const normalBack = loader.load("./textures/wall_norm.png");

    normalTop.wrapS = THREE.RepeatWrapping;
    normalBottom.wrapS = THREE.RepeatWrapping;
    normalFront.wrapS = THREE.RepeatWrapping;
    normalBack.wrapS = THREE.RepeatWrapping;
    normalTop.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    normalBottom.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    normalFront.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    normalBack.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

    //Box
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterials = [                  //Color + texture + normal map for each face
        new THREE.MeshPhongMaterial({
            color: "chocolate",
            map: textureRight,
            normalMap: normalRight
        }),
        new THREE.MeshPhongMaterial({
            color: "chocolate",
            map: textureLeft,
            normalMap: normalLeft
        }),
        new THREE.MeshPhongMaterial({
            color: "chocolate",
            map: textureTop,
            normalMap: normalTop
        }),
        new THREE.MeshPhongMaterial({
            color: "chocolate",
            map: textureBottom,
            normalMap: normalBottom
        }),
        new THREE.MeshPhongMaterial({
            color: "chocolate",
            map: textureFront,
            normalMap: normalFront
        }),
        new THREE.MeshPhongMaterial({
            color: "chocolate",
            map: textureBack,
            normalMap: normalBack
        })
    ];
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterials);
    wallMesh.position.set(x, y, z);
    if (timesToRepeatHorizontally == 3) {       //East and west faces
        wallMesh.rotation.y = Math.PI / 2;
    }
    scene.add(wallMesh);

    //Box physics
    const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
    const wallShape = new CANNON.Box(halfExtents);
    const wallBody = new CANNON.Body({mass: 0});
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    if (timesToRepeatHorizontally == 3) {       //East and west faces
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    }
    world.add(wallBody);
}

function createBarrels(scene, world) {
    importBarrel(19.5, -5.5, 0, scene, world);
    importBarrel(-16, 4, 0, scene, world);
    importBarrel(-15, 2.8, 1, scene, world);
    importBarrel(-14, 7, 0, scene, world);
}

//Import the barrel model, apply its texture and place it in the scene;
//then take the barrel's sizes and use them to create its physics
//type = 0 -> closed barrel; type = 1 -> barrel with water
function importBarrel(x, z, type, scene, world) {
    //Load barrel texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("./textures/barrel_" + type + ".png");
    const material = new THREE.MeshPhongMaterial({map: texture});

    //Load barrel and apply texture
    const objLoader = new OBJLoader();
    objLoader.load("./models/barrel.obj", (object) => {
        object.traverse((node) => {       //Need to traverse the object (it's a simple one in this case)
            if (node.isMesh) {
                node.material = material;
            }
        });

        object.scale.set(0.03, 0.03, 0.03);     //Scale to appropriate size
        object.position.set(x, 0, z);
        scene.add(object);

        //Get barrel dimensions and coordinates to create its body for physics
        const boundingBox = new THREE.Box3().setFromObject(object);     //Model's bounding box
        const boxSize = boundingBox.getSize(new THREE.Vector3());       //Bounding box dimensions
        const width = boxSize.x;
        const height = boxSize.y;
        const depth = boxSize.z;
        const y = boundingBox.getCenter(new THREE.Vector3()).y;         //Bouding box y coordinate

        //Barrel physics
        const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({mass: 0});
        boxBody.addShape(boxShape);
        boxBody.position.set(x, y, z);
        world.add(boxBody);
    });
}

function createTrees(scene) {
    createTree(-9, -18, scene);
    createTree(-13, -15, scene);
    createTree(2.5, -3, scene);
    createTree(7, 15, scene);
}

//Place the tree in the given coordinates
function createTree(x, z, scene) {
    //Trunk
    const trunkRadius = 0.4;
    const trunkHeight = 1.5;
    const trunkRadialSegments = 8;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, trunkRadialSegments);
    const trunkMaterial = new THREE.MeshPhongMaterial({color: "saddleBrown"});
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.position.set(x, trunkHeight / 2, z);

    //Foliage
    const foliageRadius = 2.2;
    const foliageHeight = 6;
    const foliageRadialSegments = 16;
    const foliageGeometry = new THREE.ConeGeometry(foliageRadius, foliageHeight, foliageRadialSegments);
    const foliageMaterial = new THREE.MeshPhongMaterial({color: "green"});
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.position.set(x, trunkHeight + foliageHeight / 2, z);

    scene.add(trunkMesh);
    scene.add(foliageMesh);
}

//Invisible plane placed at negative y, used to change turn (bullet collision)
//when the bullet misses and goes outside of the map
function createCollisionPlane(world) {
    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({mass: 0});
    planeBody.addShape(planeShape);
    planeBody.position.set(0, -20, 0);
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.add(planeBody);
}

export {createMap};