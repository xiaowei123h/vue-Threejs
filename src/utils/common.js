export function onWindowResize(camera, renderer) {
    var innerWidth
    if (window.innerWidth >= 640) {
        innerWidth = window.innerWidth - 281
    } else {
        innerWidth = window.innerWidth
    }
    camera.aspect = innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, window.innerHeight)
}

export function statsPosition(stats) {
    if (window.innerWidth < 640) {
        stats.dom.style.top = '48px'
        stats.dom.style.left = '0'
    } else {
        stats.dom.style.top = '0'
        stats.dom.style.left = '280px'
    }
}

export default { onWindowResize, statsPosition }