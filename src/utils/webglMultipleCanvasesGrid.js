export function View(canvas, fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight, THREE, scene, renderer) {
    canvas.width = viewWidth * window.devicePixelRatio
    canvas.height = viewHeight * window.devicePixelRatio
    var context = canvas.getContext('2d')
    var camera = new THREE.PerspectiveCamera(20, viewWidth / viewHeight, 1, 10000)
    camera.setViewOffset(fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight)
    camera.position.z = 1800
    this.render = (mouseX, mouseY) => {
        camera.position.x += (mouseX - camera.position.x) * 0.05
        camera.position.y += (- mouseY - camera.position.y) * 0.05
        camera.lookAt(scene.position)
        renderer.render(scene, camera)
        context.drawImage(renderer.domElement, 0, 0)
    }
}

export default { View }
