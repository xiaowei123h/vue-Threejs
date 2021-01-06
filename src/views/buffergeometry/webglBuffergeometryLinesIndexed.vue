<template>
    <div class="webglBuffergeometryLinesIndexed-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry - lines - indexed</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            parent_node: null,
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 9000
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.BufferGeometry()
            var material = new this.$THREE.LineBasicMaterial({ vertexColors: true })
            var indices = []
            var positions = []
            var colors = []
            var next_positions_index = 0
            //
            var iteration_count = 4
            var rangle = 60 * Math.PI / 180.0
            function add_vertex(v) {
                if (next_positions_index == 0xffff) console.error('Too many points.')
                positions.push(v.x, v.y, v.z)
                colors.push(Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1)
                return next_positions_index ++
            }
            // simple Koch curve
            function snowflake_iteration(p0, p4, depth) {
                if (-- depth < 0) {
                    var i = next_positions_index - 1 // p0 already there
                    add_vertex(p4)
                    indices.push(i, i + 1)
                    return
                }
                var v = p4.clone().sub(p0)
                var v_tier = v.clone().multiplyScalar(1 / 3)
                var p1 = p0.clone().add(v_tier)
                var angle = Math.atan2(v.y, v.x) + rangle
                var length = v_tier.length()
                var p2 = p1.clone()
                p2.x += Math.cos(angle) * length
                p2.y += Math.sin(angle) * length
                var p3 = p0.clone().add(v_tier).add(v_tier)
                snowflake_iteration(p0, p1, depth)
                snowflake_iteration(p1, p2, depth)
                snowflake_iteration(p2, p3, depth)
                snowflake_iteration(p3, p4, depth)
            }
            function snowflake(points, loop, x_offset) {
                for (var iteration = 0; iteration != iteration_count; iteration ++) {
                    add_vertex(points[ 0 ])
                    for (var p_index = 0, p_count = points.length - 1; p_index != p_count; p_index ++) {
                        snowflake_iteration(points[ p_index ], points[ p_index + 1 ], iteration)
                    }
                    if (loop) snowflake_iteration(points[ points.length - 1 ], points[ 0 ], iteration)
                    // translate input curve for next iteration
                    for (var p_index = 0, p_count = points.length; p_index != p_count; p_index ++) {
                        points[ p_index ].x += x_offset;
                    }
                }
            }
            var y = 0
            snowflake(
                [
                    new this.$THREE.Vector3(0, y, 0),
                    new this.$THREE.Vector3(500, y, 0)
                ],
                false, 600
            )
            y += 600
            snowflake(
                [
                    new this.$THREE.Vector3(0, y, 0),
                    new this.$THREE.Vector3(250, y + 400, 0),
                    new this.$THREE.Vector3(500, y, 0)
                ],
                true, 600
            )
            y += 600
            snowflake(
                [
                    new this.$THREE.Vector3(0, y, 0),
                    new this.$THREE.Vector3(500, y, 0),
                    new this.$THREE.Vector3(500, y + 500, 0),
                    new this.$THREE.Vector3(0, y + 500, 0)
                ],
                true, 600
            )
            y += 1000
            snowflake(
                [
                    new this.$THREE.Vector3(250, y, 0),
                    new this.$THREE.Vector3(500, y, 0),
                    new this.$THREE.Vector3(250, y, 0),
                    new this.$THREE.Vector3(250, y + 250, 0),
                    new this.$THREE.Vector3(250, y, 0),
                    new this.$THREE.Vector3(0, y, 0),
                    new this.$THREE.Vector3(250, y, 0),
                    new this.$THREE.Vector3(250, y - 250, 0),
                    new this.$THREE.Vector3(250, y, 0)
                ],
                false, 600
            )
            //
            geometry.setIndex(indices)
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            geometry.computeBoundingSphere()
            var lineSegments = new this.$THREE.LineSegments(geometry, material)
            lineSegments.position.x -= 1200
            lineSegments.position.y -= 1200
            this.parent_node = new this.$THREE.Object3D()
            this.parent_node.add(lineSegments)
            this.scene.add(this.parent_node)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.001
            this.parent_node.rotation.z = time * 0.5
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryLinesIndexed-container {
    width: 100%;
}
</style>
