import * as THREE from "./libs/three.module.js";

//Creates new cameras
function makeCamera(near = 0.3, far = 90) {
    const fov = 50;
    const aspect = 2;       //Canvas default
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    //Check if canvas is not the size it is being displayed as
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);     //Adjust resolution (no pixelated stuff)
    }
    return needResize;
}

function resizeAspect(robot, canvas) {
    robot.thirdPersonCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    robot.firstPersonCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    robot.thirdPersonCamera.updateProjectionMatrix();
    robot.firstPersonCamera.updateProjectionMatrix();
}

export {makeCamera, resizeRendererToDisplaySize, resizeAspect};