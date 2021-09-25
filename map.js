import * as THREE from "./libs/three.module.js";
import {OBJLoader} from "./libs/OBJLoader.js";
import {main} from "./game.js";

//Materials created when loading textures
let groundMaterial;
let wallMaterialsEast, wallMaterialsNorth, wallMaterialsSouth;
let delimitationWallMaterials;
let whiteWallMaterials;
let turretMaterials;
let barrelMaterial, waterBarrelMaterial;
let trunkMaterial;

const groundWidth = 60;
const delimitationWallDepth = 0.5;

function load() {
    document.body.innerHTML = "";
    const title = document.createElement("t");
    title.innerText = "Loading...";
    document.body.appendChild(title);

    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    //Ground
    const grassTexture = loader.load("./textures/grass.png");
    grassTexture.wrapS = THREE.RepeatWrapping;                  //Horizontal wrapping
    grassTexture.wrapT = THREE.RepeatWrapping;                  //Vertical wrapping
    grassTexture.repeat.set(10, 10);
    groundMaterial = new THREE.MeshPhongMaterial({map: grassTexture});

    //Building walls
    wallMaterialsEast = setUpWallMaterials(3, 1, loader);        //East and west walls
    wallMaterialsNorth = setUpWallMaterials(2, 1, loader);       //North wall
    wallMaterialsSouth = setUpWallMaterials(0.75, 1, loader);    //South walls

    //Delimitation wall
    delimitationWallMaterials = setUpDelimitationWallMaterials(9, 0.58, loader);

    //White wall
    whiteWallMaterials = setUpWhiteWallMaterials(3, 0.58, loader);

    //Turret
    turretMaterials = setUpTurretMaterials(3, 4, loader);

    //Barrel
    const barrelTexture = loader.load("./textures/barrel_0.png");
    const waterBarrelTexture = loader.load("./textures/barrel_1.png");
    barrelMaterial = new THREE.MeshPhongMaterial({map: barrelTexture});
    waterBarrelMaterial = new THREE.MeshPhongMaterial({map: waterBarrelTexture});

    //Trunk
    const trunkTexture = loader.load("./textures/trunk.png");
    trunkTexture.wrapT = THREE.RepeatWrapping;
    trunkTexture.repeat.set(1, 2);
    trunkMaterial = new THREE.MeshPhongMaterial({map: trunkTexture});

    loadManager.onLoad = () => main();
}

//Loads textures and handles wrapping for each face of a single wall
function setUpWallMaterials(timesToRepeatHorizontally, timesToRepeatVertically, loader) {
    const wallMaterials = [
        new THREE.MeshPhongMaterial({       //Right face
            color: "chocolate",
            map: loader.load("./textures/wall_color_side.png"),
            normalMap: loader.load("./textures/wall_norm_side.png")
        }),
        new THREE.MeshPhongMaterial({       //Left face
            color: "chocolate",
            map: loader.load("./textures/wall_color_side.png"),
            normalMap: loader.load("./textures/wall_norm_side.png")
        }),
        new THREE.MeshPhongMaterial({       //Top face
            color: "chocolate",
            map: loader.load("./textures/wall_color_top.png"),
            normalMap: loader.load("./textures/wall_norm_top.png")
        }),
        new THREE.MeshPhongMaterial({       //Bottom face
            color: "chocolate",
            map: loader.load("./textures/wall_color_top.png"),
            normalMap: loader.load("./textures/wall_norm_top.png")
        }),
        new THREE.MeshPhongMaterial({       //Front face
            color: "chocolate",
            map: loader.load("./textures/wall_color.png"),
            normalMap: loader.load("./textures/wall_norm.png")
        }),
        new THREE.MeshPhongMaterial({       //Back face
            color: "chocolate",
            map: loader.load("./textures/wall_color.png"),
            normalMap: loader.load("./textures/wall_norm.png")
        })
    ];

    for (let i=2; i < 6; i++) {             //Side faces need no repetitions
        //Repetitions only horizontally
        wallMaterials[i].map.wrapS = THREE.RepeatWrapping;
        wallMaterials[i].normalMap.wrapS = THREE.RepeatWrapping;

        wallMaterials[i].map.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
        wallMaterials[i].normalMap.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    }
    return wallMaterials;
}

function setUpDelimitationWallMaterials(timesToRepeatHorizontally, timesToRepeatVertically, loader) {
    const wallMaterials = [
        new THREE.MeshPhongMaterial({       //Right face
            color: "gray",
            map: loader.load("./textures/wall_color_side.png"),
            normalMap: loader.load("./textures/wall_norm_side.png")
        }),
        new THREE.MeshPhongMaterial({       //Left face
            color: "gray",
            map: loader.load("./textures/wall_color_side.png"),
            normalMap: loader.load("./textures/wall_norm_side.png")
        }),
        new THREE.MeshPhongMaterial({       //Top face
            color: "gray",
            map: loader.load("./textures/wall_color_top.png"),
            normalMap: loader.load("./textures/wall_norm_top.png")
        }),
        new THREE.MeshPhongMaterial({       //Bottom face
            color: "gray",
            map: loader.load("./textures/wall_color_top.png"),
            normalMap: loader.load("./textures/wall_norm_top.png")
        }),
        new THREE.MeshPhongMaterial({       //Front face
            color: "gray",
            map: loader.load("./textures/wall_color.png"),
            normalMap: loader.load("./textures/wall_norm.png")
        }),
        new THREE.MeshPhongMaterial({       //Back face
            color: "gray",
            map: loader.load("./textures/wall_color.png"),
            normalMap: loader.load("./textures/wall_norm.png")
        })
    ];

    for (let i=0; i < 2; i++) {             //Side faces
        wallMaterials[i].map.repeat.set(1, timesToRepeatVertically);
        wallMaterials[i].normalMap.repeat.set(1, timesToRepeatVertically);
    }
    for (let i=2; i < 6; i++) {
        //Repetitions only horizontally
        wallMaterials[i].map.wrapS = THREE.RepeatWrapping;
        wallMaterials[i].normalMap.wrapS = THREE.RepeatWrapping;

        wallMaterials[i].map.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
        wallMaterials[i].normalMap.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    }
    return wallMaterials;
}

function setUpWhiteWallMaterials(timesToRepeatHorizontally, timesToRepeatVertically, loader) {
    const wallMaterials = [
        new THREE.MeshPhongMaterial({       //Right face
            map: loader.load("./textures/wall_color_side.png"),
            normalMap: loader.load("./textures/wall_norm_side.png")
        }),
        new THREE.MeshPhongMaterial({       //Left face
            map: loader.load("./textures/wall_color_side.png"),
            normalMap: loader.load("./textures/wall_norm_side.png")
        }),
        new THREE.MeshPhongMaterial({       //Top face
            map: loader.load("./textures/wall_color_top.png"),
            normalMap: loader.load("./textures/wall_norm_top.png")
        }),
        new THREE.MeshPhongMaterial({       //Bottom face
            map: loader.load("./textures/wall_color_top.png"),
            normalMap: loader.load("./textures/wall_norm_top.png")
        }),
        new THREE.MeshPhongMaterial({       //Front face
            map: loader.load("./textures/wall_color.png"),
            normalMap: loader.load("./textures/wall_norm.png")
        }),
        new THREE.MeshPhongMaterial({       //Back face
            map: loader.load("./textures/wall_color.png"),
            normalMap: loader.load("./textures/wall_norm.png")
        })
    ];

    for (let i=0; i < 2; i++) {             //Side faces
        wallMaterials[i].map.repeat.set(1, timesToRepeatVertically);
        wallMaterials[i].normalMap.repeat.set(1, timesToRepeatVertically);
    }
    for (let i=2; i < 6; i++) {
        //Repetitions only horizontally
        wallMaterials[i].map.wrapS = THREE.RepeatWrapping;
        wallMaterials[i].normalMap.wrapS = THREE.RepeatWrapping;

        wallMaterials[i].map.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
        wallMaterials[i].normalMap.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    }
    return wallMaterials;
}

function setUpTurretMaterials(timesToRepeatHorizontally, timesToRepeatVertically, loader) {
    const turretMaterials = [
        new THREE.MeshStandardMaterial({
            map: loader.load("./textures/stone_wall_color.png"),
            normalMap: loader.load("./textures/stone_wall_normal.png"),
            roughnessMap: loader.load("./textures/stone_wall_roughness.png")
        }),
        new THREE.MeshStandardMaterial({color: "#504c4c"}),
        new THREE.MeshStandardMaterial({color: "#504c4c"})
    ];

    turretMaterials[0].map.wrapS = THREE.RepeatWrapping;
    turretMaterials[0].map.wrapT = THREE.RepeatWrapping;
    turretMaterials[0].normalMap.wrapS = THREE.RepeatWrapping;
    turretMaterials[0].normalMap.wrapT = THREE.RepeatWrapping;
    turretMaterials[0].roughnessMap.wrapS = THREE.RepeatWrapping;
    turretMaterials[0].roughnessMap.wrapT = THREE.RepeatWrapping;

    turretMaterials[0].map.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    turretMaterials[0].normalMap.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    turretMaterials[0].roughnessMap.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    return turretMaterials;
}

//Create all the objects in the scene and their physics
function createMap(scene, world) {
    createLights(scene);
    createGround(scene, world);
    createBuilding(scene, world);
    createDelimitationWalls(scene, world);
    createWhiteWalls(scene, world);
    createTurrets(scene, world);
    createBarrels(scene, world);
    createTrees(scene, world);
    createBottomPlanes(scene, world);
}

function createLights(scene) {
    //Directional light (sun)
    const lightColor = "white";
    const intensityDir = 0.85;
    const directionalLight = new THREE.DirectionalLight(lightColor, intensityDir);
    directionalLight.position.set(-20, 30, -5);
    directionalLight.target.position.set(0, 0, 0);

    //Shadow camera
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 14;
    directionalLight.shadow.camera.far = 57;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.camera.top = 31;
    directionalLight.shadow.camera.left = -37;
    directionalLight.shadow.camera.right = 37;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;

    //Ambient light
    const intensityAmb = 0.6;
    const ambientLight = new THREE.AmbientLight(lightColor, intensityAmb);

    scene.add(directionalLight);
    scene.add(directionalLight.target);
    scene.add(ambientLight);
}

function createGround(scene, world) {
    //Ground
    const groundHeight = 0.1
    const y = -groundHeight / 2;

    const groundGeometry = new THREE.BoxGeometry(groundWidth, groundHeight, groundWidth);
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.y = y;
    groundMesh.receiveShadow = true;

    //Ground physics
    const halfExtents = new CANNON.Vec3(groundWidth / 2, groundHeight / 2, groundWidth / 2);
    const groundShape = new CANNON.Box(halfExtents);
    const groundBody = new CANNON.Body({mass: 0});          //Static body
    groundBody.addShape(groundShape);
    groundBody.position.y = y;

    scene.add(groundMesh);
    world.addBody(groundBody);
}

function createBuilding(scene, world) {
    //Define all parameters that are useful to define the building
    const verticalAxis = 18.5;      //Where to place the building on the x axis
    const horizontalAxis = -8.5;    //Where to place the building on the z axis
    const buildingWidth = 11;       //Width of north and south walls
    const buildingDepth = 18;       //Width of east and west walls
    const buildingHeight = 4;
    const wallThickness = 0.5;
    const entranceWidth = 2.5;

    //I use the parameters above to set the dimensions of the walls and their positions

    //East wall
    createBuildingWall(buildingDepth, buildingHeight, wallThickness, Math.PI/2,
        verticalAxis+buildingWidth/2+wallThickness/2, buildingHeight/2, horizontalAxis,
        wallMaterialsEast, scene, world);
    //West wall
    createBuildingWall(buildingDepth, buildingHeight, wallThickness, Math.PI/2,
        verticalAxis-buildingWidth/2-wallThickness/2, buildingHeight/2, horizontalAxis,
        wallMaterialsEast, scene, world);
    //North wall    
    createBuildingWall(buildingWidth, buildingHeight, wallThickness, 0,
        verticalAxis, buildingHeight/2, horizontalAxis-buildingDepth/2+wallThickness/2,
        wallMaterialsNorth, scene, world);
    //South wall (west)
    createBuildingWall((buildingWidth-entranceWidth)/2, buildingHeight, wallThickness, 0,
        verticalAxis-entranceWidth/4-buildingWidth/4, buildingHeight/2, horizontalAxis+buildingDepth/2-wallThickness/2,
        wallMaterialsSouth, scene, world);
    //South wall (east)
    createBuildingWall((buildingWidth-entranceWidth)/2, buildingHeight, wallThickness, 0,
        verticalAxis+entranceWidth/4+buildingWidth/4, buildingHeight/2, horizontalAxis+buildingDepth/2-wallThickness/2,
        wallMaterialsSouth, scene, world);
}

//Input params: wall dimensions - rotation - coordinates - material with texture - scene and world
function createBuildingWall(width, height, depth, rotation, x, y, z, materials, scene, world) {
    //Box
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMesh = new THREE.Mesh(wallGeometry, materials);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotation;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    //Box physics
    const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
    const wallShape = new CANNON.Box(halfExtents);
    const wallBody = new CANNON.Body({mass: 0});
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation);

    scene.add(wallMesh);
    world.addBody(wallBody);
}

//Similar to above, just use position and rotation
function createDelimitationWalls(scene, world) {
    createDelimitationWall(0, (groundWidth - delimitationWallDepth) / 2, 0, scene, world);              //North
    createDelimitationWall(0, (-groundWidth + delimitationWallDepth) / 2, 0, scene, world);             //South
    createDelimitationWall((groundWidth - delimitationWallDepth) / 2, 0, Math.PI / 2, scene, world);    //East
    createDelimitationWall((-groundWidth + delimitationWallDepth) / 2, 0, Math.PI / 2, scene, world);   //West
}

function createDelimitationWall(x, z, rotation, scene, world) {
    //Box
    let width;
    const height = 2;
    const y = height / 2;
    if (rotation == 0) {           //North and south walls are wider
        width = groundWidth;
    }
    else {
        width = groundWidth - 1;
    }

    const wallGeometry = new THREE.BoxGeometry(width, height, delimitationWallDepth);
    const wallMesh = new THREE.Mesh(wallGeometry, delimitationWallMaterials);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotation;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    //Box physics
    const halfExtents = new CANNON.Vec3(width / 2, height / 2, delimitationWallDepth / 2);
    const wallShape = new CANNON.Box(halfExtents);
    const wallBody = new CANNON.Body({mass: 0});
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation);

    scene.add(wallMesh);
    world.addBody(wallBody);
}

function createWhiteWalls(scene, world) {
    createWhiteWall(-20, 18, Math.PI / 2, scene, world);
    createWhiteWall(-2, 22, Math.PI / 14, scene, world);
    createWhiteWall(2, -11, Math.PI / 4, scene, world);
}

function createWhiteWall(x, z, rotation, scene, world) {
    //Box
    const width = 18;
    const height = 2;
    const depth = 0.45;
    const y = height / 2;

    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMesh = new THREE.Mesh(wallGeometry, whiteWallMaterials);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotation;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    //Box physics
    const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
    const wallShape = new CANNON.Box(halfExtents);
    const wallBody = new CANNON.Body({mass: 0});
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation);

    scene.add(wallMesh);
    world.addBody(wallBody);
}

function createTurrets(scene, world) {
    createTurret(-10, 11, scene, world);
    createTurret(2, -0.5, scene, world);
    createTurret(8.5, 3.5, scene, world);
    createTurret(16, -25, scene, world);
}

function createTurret(x, z, scene, world) {
    //Cylinder
    const turretRadius = 1.8;
    const turretHeight = 10;
    const turretRadialSegments = 30;
    const y = turretHeight / 2;

    const turretGeometry = new THREE.CylinderGeometry(turretRadius, turretRadius, turretHeight, turretRadialSegments);
    const turretMesh = new THREE.Mesh(turretGeometry, turretMaterials);
    turretMesh.position.set(x, y, z);
    turretMesh.castShadow = true;
    turretMesh.receiveShadow = true;

    //Turret physics
    const turretShape = new CANNON.Cylinder(turretRadius, turretRadius, turretHeight, turretRadialSegments);
    const turretBody = new CANNON.Body({mass: 0});
    turretBody.addShape(turretShape);
    turretBody.position.set(x, y, z);
    turretBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

    scene.add(turretMesh);
    world.addBody(turretBody);
}

function createBarrels(scene, world) {
    importBarrel(-21.3, -4.2, -Math.PI/2, false, scene, world);
    importBarrel(-20.5, -2, 0, false, scene, world);
    importBarrel(-19.5, -7, Math.PI, false, scene, world);
    importBarrel(-18.8, -1.5, -Math.PI/4, false, scene, world);
    importBarrel(-16.5, -5.8, 0, true, scene, world);
    importBarrel(-15.5, -4, Math.PI/3, false, scene, world);
    importBarrel(15, -16, Math.PI/2, true, scene, world);
    importBarrel(16.8, -16, -Math.PI/3, false, scene, world);
    importBarrel(20, 17.2, 0, false, scene, world);
    importBarrel(20, 19, 0, false, scene, world);
    importBarrel(23, -7, 0, false, scene, world);
}

//Import the barrel model, apply its texture and place it in the scene;
//then take the barrel's sizes and use them to create its physics.
//waterBarrel selects the material
function importBarrel(x, z, rotation, waterBarrel, scene, world) {
    //Load barrel and apply texture
    const objLoader = new OBJLoader();
    objLoader.load("./models/barrel.obj", (object) => {
        object.traverse((node) => {       //Need to traverse the object (it's a simple one in this case)
            if (node.isMesh) {
                if (waterBarrel) {
                    node.material = waterBarrelMaterial;
                }
                else {
                    node.material = barrelMaterial;
                }
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        object.scale.set(0.034, 0.034, 0.034);     //Scale to appropriate size
        object.position.set(x, 0, z);

        //Get barrel dimensions and coordinates to create its body for physics
        const boundingBox = new THREE.Box3().setFromObject(object);     //Model's bounding box
        const boxSize = boundingBox.getSize(new THREE.Vector3());       //Bounding box dimensions
        const radius = boxSize.x / 2;
        const height = boxSize.y;
        const y = boundingBox.getCenter(new THREE.Vector3()).y;         //Bouding box y coordinate
        const radialSegments = 12;

        //Barrel physics (cylindric body)
        const boxShape = new CANNON.Cylinder(radius, radius, height, radialSegments);
        const boxBody = new CANNON.Body({mass: 0});
        boxBody.addShape(boxShape);
        boxBody.position.set(x, y, z);
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

        object.rotation.y = rotation;           //Do it only now otherwise bounding boxes are all different
        scene.add(object);
        world.addBody(boxBody);
    });
}

function createTrees(scene, world) {
    createTree(-22, -21, scene, world);
    createTree(-17.5, -24, scene, world);
    createTree(-16, -18.8, scene, world);
    createTree(-11.5, -21.5, scene, world);
    createTree(-5.5, 2, scene, world);
    createTree(13, 20, scene, world);
    createTree(20, 12, scene, world);
    createTree(26.5, -8, scene, world);
}

//Place the tree in the given coordinates
function createTree(x, z, scene, world) {
    //Trunk
    const trunkRadius = 0.45;
    const trunkHeight = 5.5;
    const trunkRadialSegments = 10;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, trunkRadialSegments);
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    const y = trunkHeight / 2;
    trunkMesh.position.set(x, y, z);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;

    //Trunk physics
    const trunkShape = new CANNON.Cylinder(trunkRadius, trunkRadius, trunkHeight, trunkRadialSegments);
    const trunkBody = new CANNON.Body({mass: 0});
    trunkBody.addShape(trunkShape);
    trunkBody.position.set(x, y, z);
    trunkBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

    //Foliage (no physics: only the trunk is "solid")
    const foliageRadius = 2.7;
    const detail = 6;
    const foliageGeometry = new THREE.TetrahedronGeometry(foliageRadius, detail);
    const foliageMaterial = new THREE.MeshPhongMaterial({color: "green"});
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.position.set(x, trunkHeight + foliageRadius - 2, z);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;
    
    scene.add(trunkMesh);
    scene.add(foliageMesh);
    world.addBody(trunkBody);
}

//Invisible planes placed at negative y for bullets
//that miss and go outside of the map
function createBottomPlanes(scene, world) {
    //Plane that hides the bullets falling off the map
    const planeWidth = 200;
    const y = -8;
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeWidth);
    const planeMaterial = new THREE.MeshBasicMaterial({color: "skyblue"});    
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.y = y;
    planeMesh.rotation.x = -Math.PI / 2;           //Horizontal
    scene.add(planeMesh);

    //CANNON plane to detect collisions for bullets which didn't hit anything on the map
    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({mass: 0});
    planeBody.addShape(planeShape);
    planeBody.position.y = y - 2;
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(planeBody);
}

export {load, createMap};