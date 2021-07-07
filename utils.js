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

export {resizeRendererToDisplaySize};