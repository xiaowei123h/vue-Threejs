export function View(canvas, rotateY, THREE, mouseX, mouseY, scene) {
    canvas.width = canvas.clientWidth * window.devicePixelRatio
    canvas.height = canvas.clientHeight * window.devicePixelRatio
    var context = canvas.getContext('2d')
    var camera = new THREE.PerspectiveCamera(20, canvas.clientWidth / canvas.clientHeight, 1, 20000)
    camera.rotation.y = rotateY
    // Think of the virtual camera as a post with 5 cameras on it (even though those cameras happen to live in difference scenes)
    // You need to move the post (ie, the virtualCamera) to move all 5 cameras together.
    var virtualCamera = new THREE.Camera()
    virtualCamera.add(camera)
    this.render = () => {
        virtualCamera.position.x = - mouseX * 4
        virtualCamera.position.y = - mouseY * 4
        virtualCamera.position.z = 1800
        virtualCamera.lookAt(scene.position)
        virtualCamera.updateMatrixWorld(true)
        renderer.render(scene, camera)
        context.drawImage(renderer.domElement, 0, 0)
    }
}

export default {
    View
}
