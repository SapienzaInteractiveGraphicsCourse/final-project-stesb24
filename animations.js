let currentTween;           //Animation currently being executed

function stopTween() {      //Stop the current animation, if there is one
    if (currentTween) {
        currentTween.stop();
    }
}

function idleToAim(robot) {
    stopTween();
    currentTween = new TWEEN.Tween([
            robot.torso.rotation,
            robot.rightShoulder.rotation,
            robot.rightElbow.rotation])
        .to([{y: 0}, {x: Math.PI/2, z: -Math.PI/10}, {x: Math.PI/15}], 150)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
}

function aimToIdle(robot) {
    stopTween();
    currentTween = new TWEEN.Tween([
            robot.torso.rotation,
            robot.rightShoulder.rotation,
            robot.rightElbow.rotation,
            robot.head.rotation])
        .to([{y: 0}, {x: 0, z: Math.PI/20}, {x: Math.PI/15}, {x: 0}], 400)
        .easing(TWEEN.Easing.Quadratic.Out).start();
}

function shoot(robot) {
    const aimToShoot = new TWEEN.Tween([
            robot.torso.rotation,
            robot.rightShoulder.rotation,
            robot.rightElbow.rotation])
        .to([{y: -Math.PI/12}, {z: Math.PI/8}, {x: Math.PI/2}], 150)
        .easing(TWEEN.Easing.Exponential.Out);
    const shootToAim = new TWEEN.Tween([
            robot.torso.rotation,
            robot.rightShoulder.rotation,
            robot.rightElbow.rotation,
            robot.head.rotation])
        .to([{y: 0}, {x: Math.PI/2, z: -Math.PI/10}, {x: Math.PI/15}, {x: 0}], 300)
        .easing(TWEEN.Easing.Linear.None)
        .delay(100);

    aimToShoot.chain(shootToAim);
    aimToShoot.start();
    currentTween = aimToShoot;
}

function idle(robot) {
    new TWEEN.Tween([
        robot.torso.position,
        robot.leftLegPivot.rotation,
        robot.rightLegPivot.rotation,
        robot.leftKnee.rotation,
        robot.rightKnee.rotation])
    .to([{y: 0.48}, {x: Math.PI/20}, {x: Math.PI/20}, {x: -Math.PI/10}, {x: -Math.PI/10}], 1200)
    .easing(TWEEN.Easing.Linear.None).repeat(Infinity).yoyo(true).start();
}

//idleToWalk walk walkToIdle
export {idleToAim, aimToIdle, shoot, idle};