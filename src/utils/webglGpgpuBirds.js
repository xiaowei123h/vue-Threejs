export function BirdGeometry(THREE, BIRDS, This) {
    console.log('11111111')
    console.log(THREE)
    this.THREE = THREE
    var triangles = BIRDS * 3;
    var points = triangles * 3;
    // THREE.BufferGeometry.call(This);
    var vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    var birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    var references = new THREE.BufferAttribute(new Float32Array(points * 2), 2);
    var birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);
    This.setAttribute('position', vertices);
    This.setAttribute('birdColor', birdColors);
    This.setAttribute('reference', references);
    This.setAttribute('birdVertex', birdVertex);
    // this.setAttribute('normal', new Float32Array(points * 3), 3);
    var v = 0;
    function verts_push() {
        for (var i = 0; i < arguments.length; i ++) {
            vertices.array[ v ++ ] = arguments[ i ];
        }
    }
    var wingsSpan = 20;
    for (var f = 0; f < BIRDS; f ++) {
        // Body
        verts_push(
            0, - 0, - 20,
            0, 4, - 20,
            0, 0, 30
    );
        // Left Wing
        verts_push(
            0, 0, - 15,
            - wingsSpan, 0, 0,
            0, 0, 15
    );
        // Right Wing
        verts_push(
            0, 0, 15,
            wingsSpan, 0, 0,
            0, 0, - 15
    );
    }
    for (var v = 0; v < triangles * 3; v ++) {
        var i = ~ ~ (v / 3);
        var x = (i % WIDTH) / WIDTH;
        var y = ~ ~ (i / WIDTH) / WIDTH;
        var c = new THREE.Color(
            0x444444 +
            ~ ~ (v / 9) / BIRDS * 0x666666
    );
        birdColors.array[ v * 3 + 0 ] = c.r;
        birdColors.array[ v * 3 + 1 ] = c.g;
        birdColors.array[ v * 3 + 2 ] = c.b;
        references.array[ v * 2 ] = x;
        references.array[ v * 2 + 1 ] = y;
        birdVertex.array[ v ] = v % 9;
    }
    This.scale(0.2, 0.2, 0.2);
}

// BirdGeometry.prototype = Object.create(this.THREE.BufferGeometry.prototype)

export default {
    BirdGeometry
}