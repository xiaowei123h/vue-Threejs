export function onWindowResize(camera, renderer) {
    camera.aspect = (window.innerWidth - 281) / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth - 281, window.innerHeight )
}

export default { onWindowResize }