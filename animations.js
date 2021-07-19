function idleToAim(robot) {
    new TWEEN.Tween(robot.rightShoulder.rotation).to({x: Math.PI / 2, z: -Math.PI / 10}, 150)
        .easing(TWEEN.Easing.Quadratic.Out).start();
}

function aimToIdle(robot) {
    new TWEEN.Tween(robot.rightShoulder.rotation).to({x: 0, z: Math.PI / 20}, 700)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
}

//idleToWalk walk walkToIdle idle shoot
export {idleToAim, aimToIdle};