export function SimpleGI(renderer, scene, THREE) {
    var SIZE = 32, SIZE2 = SIZE * SIZE;
    var camera = new THREE.PerspectiveCamera(90, 1, 0.01, 100);
    scene.updateMatrixWorld(true);
    let clone = scene.clone();
    clone.autoUpdate = false;
    var rt = new THREE.WebGLRenderTarget(SIZE, SIZE, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        depthBuffer: true
    });
    var normalMatrix = new THREE.Matrix3();
    var position = new THREE.Vector3();
    var normal = new THREE.Vector3();
    var bounces = 0;
    var currentVertex = 0;
    var color = new Float32Array(3);
    var buffer = new Uint8Array(SIZE2 * 4);
    function compute() {
        if (bounces === 3) return;
        var object = scene.children[ 0 ];
        var geometry = object.geometry;
        var attributes = geometry.attributes;
        var positions = attributes.position.array;
        var normals = attributes.normal.array;
        if (attributes.color === undefined) {
            var colors = new Float32Array(positions.length);
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
        }
        var colors = attributes.color.array;
        var startVertex = currentVertex;
        var totalVertex = positions.length / 3;
        for (var i = 0; i < 32; i ++) {
            if (currentVertex >= totalVertex) break;
            position.fromArray(positions, currentVertex * 3);
            position.applyMatrix4(object.matrixWorld);
            normal.fromArray(normals, currentVertex * 3);
            normal.applyMatrix3(normalMatrix.getNormalMatrix(object.matrixWorld)).normalize();
            camera.position.copy(position);
            camera.lookAt(position.add(normal));
            renderer.setRenderTarget(rt);
            renderer.render(clone, camera);
            renderer.readRenderTargetPixels(rt, 0, 0, SIZE, SIZE, buffer);
            color[ 0 ] = 0;
            color[ 1 ] = 0;
            color[ 2 ] = 0;
            for (var k = 0, kl = buffer.length; k < kl; k += 4) {
                color[ 0 ] += buffer[ k + 0 ];
                color[ 1 ] += buffer[ k + 1 ];
                color[ 2 ] += buffer[ k + 2 ];
            }
            colors[ currentVertex * 3 + 0 ] = color[ 0 ] / (SIZE2 * 255);
            colors[ currentVertex * 3 + 1 ] = color[ 1 ] / (SIZE2 * 255);
            colors[ currentVertex * 3 + 2 ] = color[ 2 ] / (SIZE2 * 255);
            currentVertex ++;
        }
        attributes.color.updateRange.offset = startVertex * 3;
        attributes.color.updateRange.count = (currentVertex - startVertex) * 3;
        attributes.color.needsUpdate = true;
        if (currentVertex >= totalVertex) {
            clone = scene.clone();
            clone.autoUpdate = false;
            bounces ++;
            currentVertex = 0;
        }
        requestAnimationFrame(compute);
    }
    requestAnimationFrame(compute);
}

export default { SimpleGI }
