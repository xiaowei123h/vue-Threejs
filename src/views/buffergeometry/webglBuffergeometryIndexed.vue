<template>
    <div class="webglBuffergeometryIndexed-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry - indexed</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            mesh: null,
            gui: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            //
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 3500)
            this.camera.position.z = 64
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            //
            var light = new this.$THREE.HemisphereLight()
            this.scene.add(light)
            //
            var geometry = new this.$THREE.BufferGeometry()
            var indices = []
            var vertices = []
            var normals = []
            var colors = []
            var size = 20
            var segments = 10
            var halfSize = size / 2
            var segmentSize = size / segments
            // generate vertices, normals and color data for a simple grid geometry
            for (var i = 0; i <= segments; i ++) {
                var y = (i * segmentSize) - halfSize
                for (var j = 0; j <= segments; j ++) {
                    var x = (j * segmentSize) - halfSize
                    vertices.push(x, - y, 0)
                    normals.push(0, 0, 1)
                    var r = (x / size) + 0.5
                    var g = (y / size) + 0.5
                    colors.push(r, g, 1)
                }
            }
            // generate indices (data for element array buffer)
            for (var i = 0; i < segments; i ++) {
                for (var j = 0; j < segments; j ++) {
                    var a = i * (segments + 1) + (j + 1)
                    var b = i * (segments + 1) + j
                    var c = (i + 1) * (segments + 1) + j
                    var d = (i + 1) * (segments + 1) + (j + 1)
                    // generate two faces (triangles) per iteration
                    indices.push(a, b, d) // face one
                    indices.push(b, c, d) // face two
                }
            }
            //
            geometry.setIndex(indices)
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3))
            geometry.setAttribute('normal', new this.$THREE.Float32BufferAttribute(normals, 3))
            geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            var material = new this.$THREE.MeshPhongMaterial({
                side: this.$THREE.DoubleSide,
                vertexColors: true
            })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            var container = document.getElementsByClassName('webglBuffergeometryIndexed-container')[0]
            container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            this.gui = new GUI()
            this.gui.add(material, 'wireframe')
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.001
            this.mesh.rotation.x = time * 0.25
            this.mesh.rotation.y = time * 0.5
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryIndexed-container {
    position: relative;
    width: 100%;
}
</style>
