import * as THREE from "./libs/three.module.js";
import {OBJLoader} from "./libs/OBJLoader.js";

//Create all the objects in the scene and their physics
function createMap(scene, world) {
    createLights(scene);
    createGround(scene, world);
    createBunker(scene, world);
    createWhiteWall(scene, world);
    createTurret(scene, world);
    createBarrels(scene, world);
    createTrees(scene, world);
    createBottomPlanes(scene, world);
}

function createLights(scene) {
    //Directional light (sun)
    const lightColor = "white";
    const intensityDir = 1.1;
    const directionalLight = new THREE.DirectionalLight(lightColor, intensityDir);
    directionalLight.position.set(-20, 30, -1.5);
    directionalLight.target.position.set(0, 0, 0);

    //Shadow camera
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 12;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.left = -27;
    directionalLight.shadow.camera.right = 27;
    directionalLight.shadow.mapSize.width = 5120;
    directionalLight.shadow.mapSize.width = 5120;

    //Ambient light
    const intensityAmb = 0.45;
    const ambientLight = new THREE.AmbientLight(lightColor, intensityAmb);

    scene.add(directionalLight);
    scene.add(directionalLight.target);
    scene.add(ambientLight);
}

function createGround(scene, world) {
    //Ground texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/grass.png");
    texture.wrapS = THREE.RepeatWrapping;       //Horizontal wrapping
    texture.wrapT = THREE.RepeatWrapping;       //Vertical wrapping
    const timesToRepeat = 8;
    texture.repeat.set(timesToRepeat, timesToRepeat);
    const groundMaterial = new THREE.MeshPhongMaterial({map: texture});

    //Ground
    const groundWidth = 45;
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
    world.add(groundBody);
}

function createBunker(scene, world) {
    //Define all parameters that are useful to define the building
    const verticalAxis = 13;        //Where to place the bunker on the x axis
    const horizontalAxis = -8.5;     //Where to place the bunker on the z axis
    const bunkerWidth = 11;         //Width of north and south walls
    const bunkerDepth = 18;         //Width of east and west walls
    const bunkerHeight = 4;
    const wallThickness = 0.5;
    const entranceWidth = 2.5;

    //I use the parameters above to set the dimensions of the walls and their positions
    //one with respect to the other - pass also horizontal repetitions of textures

    //East wall
    createBunkerWall(bunkerDepth, bunkerHeight, wallThickness, 3,
        verticalAxis+bunkerWidth/2+wallThickness/2, bunkerHeight/2, horizontalAxis,
        scene, world);
    //West wall
    createBunkerWall(bunkerDepth, bunkerHeight, wallThickness, 3,
        verticalAxis-bunkerWidth/2-wallThickness/2, bunkerHeight/2, horizontalAxis,
        scene, world);
    //North wall    
    createBunkerWall(bunkerWidth, bunkerHeight, wallThickness, 2,
        verticalAxis, bunkerHeight/2, horizontalAxis-bunkerDepth/2+wallThickness/2,
        scene, world);
    //South wall (west)
    createBunkerWall((bunkerWidth-entranceWidth)/2, bunkerHeight, wallThickness, 0.75,
        verticalAxis-entranceWidth/4-bunkerWidth/4, bunkerHeight/2, horizontalAxis+bunkerDepth/2-wallThickness/2,
        scene, world);
    //South wall (east)
    createBunkerWall((bunkerWidth-entranceWidth)/2, bunkerHeight, wallThickness, 0.75,
        verticalAxis+entranceWidth/4+bunkerWidth/4, bunkerHeight/2, horizontalAxis+bunkerDepth/2-wallThickness/2,
        scene, world);
}

//Input params: dimensions - texture horizontal repetitions - coordinates - scene and world
//Take the dimensions of the wall and its coordinates and create it;
//timesToRepeatHorizontally also determines the orientation (angle) of the wall:
// - 3 repetitions for east and west walls (-> 90°)
// - 2 repetitions for north wall (-> 0°)
// - 0.75 repetitions for south walls (-> 0°)
function createBunkerWall(width, height, depth, timesToRepeatHorizontally, x, y, z, scene, world) {
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
    const rotation = Math.PI / 2;
    if (timesToRepeatHorizontally == 3) {       //East and west faces
        wallMesh.rotation.y = rotation;
    }
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    //Box physics
    const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
    const wallShape = new CANNON.Box(halfExtents);
    const wallBody = new CANNON.Body({mass: 0});
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    if (timesToRepeatHorizontally == 3) {       //East and west faces
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation);
    }

    scene.add(wallMesh);
    world.add(wallBody);
}

//Similar to the function above
function createWhiteWall(scene, world) {
    const loader = new THREE.TextureLoader();

    //Color texture (one texture for each face)
    const textureRight = loader.load("./textures/wall_color_side.png");
    const textureLeft = loader.load("./textures/wall_color_side.png");
    const textureTop = loader.load("./textures/wall_color_top.png");
    const textureBottom = loader.load("./textures/wall_color_top.png");
    const textureFront = loader.load("./textures/wall_color.png");
    const textureBack = loader.load("./textures/wall_color.png");

    //Repetitions (only part of the texture is needed vertically)
    textureTop.wrapS = THREE.RepeatWrapping;
    textureBottom.wrapS = THREE.RepeatWrapping;
    textureFront.wrapS = THREE.RepeatWrapping;
    textureBack.wrapS = THREE.RepeatWrapping;
    const timesToRepeatHorizontally = 2;
    const timesToRepeatVertically = 0.58;
    textureRight.repeat.set(1, timesToRepeatVertically);
    textureLeft.repeat.set(1, timesToRepeatVertically);
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
    textureRight.repeat.set(1, timesToRepeatVertically);
    textureLeft.repeat.set(1, timesToRepeatVertically);
    normalTop.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    normalBottom.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    normalFront.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    normalBack.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

    //Box
    const width = 15;
    const height = 2;
    const depth = 0.45;
    const x = -5;
    const y = height / 2;
    const z = 15;
    const angle = -Math.PI / 14;

    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterials = [                  //Texture + normal map for each face
        new THREE.MeshPhongMaterial({
            map: textureRight,
            normalMap: normalRight
        }),
        new THREE.MeshPhongMaterial({
            map: textureLeft,
            normalMap: normalLeft
        }),
        new THREE.MeshPhongMaterial({
            map: textureTop,
            normalMap: normalTop
        }),
        new THREE.MeshPhongMaterial({
            map: textureBottom,
            normalMap: normalBottom
        }),
        new THREE.MeshPhongMaterial({
            map: textureFront,
            normalMap: normalFront
        }),
        new THREE.MeshPhongMaterial({
            map: textureBack,
            normalMap: normalBack
        })
    ];
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterials);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = angle;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    //Box physics
    const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
    const wallShape = new CANNON.Box(halfExtents);
    const wallBody = new CANNON.Body({mass: 0});
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);

    scene.add(wallMesh);
    world.add(wallBody);
}

function createTurret(scene, world) {
    //Color, normal and roughness maps
    const loader = new THREE.TextureLoader();
    const colorTexture = loader.load("./textures/stone_wall_color.png");
    const normalTexture = loader.load("./textures/stone_wall_normal.png");
    const roughnessTexture = loader.load("./textures/stone_wall_roughness.png");

    //Repetitions
    colorTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapS = THREE.RepeatWrapping;
    roughnessTexture.wrapS = THREE.RepeatWrapping;
    const timesToRepeatHorizontally = 2;
    const timesToRepeatVertically = 1;
    colorTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    normalTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
    roughnessTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

    const turretMaterials = [
        new THREE.MeshStandardMaterial({
            map: colorTexture,
            normalMap: normalTexture,
            roughnessMap: roughnessTexture
        }),
        new THREE.MeshPhongMaterial({color: "#737373"}),
        new THREE.MeshPhongMaterial({color: "#737373"})
    ];

    //Cylinder
    const turretRadius = 1.5;
    const turretHeight = 3;
    const turretRadialSegments = 20;
    const x = 2;
    const y = turretHeight / 2;
    const z = -9;

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
    world.add(turretBody);
}

function createBarrels(scene, world) {
    importBarrel(17, -7, 0, 0, scene, world);
    importBarrel(-18.3, 4.8, -Math.PI/2, 0, scene, world);
    importBarrel(-16.5, 2, Math.PI, 0, scene, world);
    importBarrel(-15, 2.8, 0, 1, scene, world);
    importBarrel(-14, 7, Math.PI/3, 0, scene, world);
}

//Import the barrel model, apply its texture and place it in the scene;
//then take the barrel's sizes and use them to create its physics
//type = 0 -> closed barrel; type = 1 -> barrel with water
function importBarrel(x, z, rotation, type, scene, world) {
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

        object.rotation.y = rotation;
        scene.add(object);
        world.add(boxBody)
    });
}

function createTrees(scene, world) {
    createTree(-9, -15, scene, world);
    createTree(-15, -12, scene, world);
    createTree(-2, 2, scene, world);
    createTree(9, 12, scene, world);
}

//Place the tree in the given coordinates
function createTree(x, z, scene, world) {
    //Trunk
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/trunk.png");
    const trunkMaterial = new THREE.MeshPhongMaterial({map: texture});

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
    const detail = 5;
    const foliageGeometry = new THREE.TetrahedronGeometry(foliageRadius, detail);
    const foliageMaterial = new THREE.MeshPhongMaterial({color: "green"});
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.position.set(x, trunkHeight + foliageRadius - 2, z);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;
    
    scene.add(trunkMesh);
    scene.add(foliageMesh);
    world.add(trunkBody);
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
    world.add(planeBody);
}

export {createMap};