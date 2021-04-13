<template>
    <div class="webglBuffergeometryConstructedFromGeometry-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry constructed from geometry<br/>
			by <a target="_blank" href="http://callum.com">Callum Prentice</a>
		</div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            stats: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            var container = document.getElementsByClassName('webglBuffergeometryConstructedFromGeometry-container')[0]
            container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(45.0, this.$webglInnerWidth / window.innerHeight, 100, 1500.0)
            this.camera.position.z = 480.0
            this.scene.add(this.camera)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 100.0
            this.controls.maxDistance = 800.0
            this.controls.dynamicDampingFactor = 0.1
            this.scene.add(new this.$THREE.AmbientLight(0xffffff, 0.2))
            var light = new this.$THREE.PointLight(0xffffff, 0.7)
            this.camera.add(light)
            this.createScene()
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        createScene() {
            var bufferGeometry = new this.$THREE.BufferGeometry()
            var radius = 125
            var count = 80
            var positions = []
            var normals = []
            var colors = []
            var vector = new this.$THREE.Vector3()
            var color = new this.$THREE.Color(0xffffff)
            var heartGeometry = this.createGeometry()
            var geometry = new this.$THREE.Geometry()
            for (var i = 1, l = count; i <= l; i ++) {
                var phi = Math.acos(- 1 + (2 * i) / l)
                var theta = Math.sqrt(l * Math.PI) * phi
                vector.setFromSphericalCoords(radius, phi, theta)
                geometry.copy(heartGeometry)
                geometry.lookAt(vector)
                geometry.translate(vector.x, vector.y, vector.z)
                color.setHSL((i / l), 1.0, 0.7)
                geometry.faces.forEach((face) => {
                    positions.push(geometry.vertices[ face.a ].x)
                    positions.push(geometry.vertices[ face.a ].y)
                    positions.push(geometry.vertices[ face.a ].z)
                    positions.push(geometry.vertices[ face.b ].x)
                    positions.push(geometry.vertices[ face.b ].y)
                    positions.push(geometry.vertices[ face.b ].z)
                    positions.push(geometry.vertices[ face.c ].x)
                    positions.push(geometry.vertices[ face.c ].y)
                    positions.push(geometry.vertices[ face.c ].z)
                    normals.push(face.normal.x)
                    normals.push(face.normal.y)
                    normals.push(face.normal.z)
                    normals.push(face.normal.x)
                    normals.push(face.normal.y)
                    normals.push(face.normal.z)
                    normals.push(face.normal.x)
                    normals.push(face.normal.y)
                    normals.push(face.normal.z)
                    colors.push(color.r)
                    colors.push(color.g)
                    colors.push(color.b)
                    colors.push(color.r)
                    colors.push(color.g)
                    colors.push(color.b)
                    colors.push(color.r)
                    colors.push(color.g)
                    colors.push(color.b)
                })
            }
            bufferGeometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            bufferGeometry.setAttribute('normal', new this.$THREE.Float32BufferAttribute(normals, 3))
            bufferGeometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            var material = new this.$THREE.MeshPhongMaterial({ shininess: 80, vertexColors: true })
            var mesh = new this.$THREE.Mesh(bufferGeometry, material)
            this.scene.add(mesh)
        },
        createGeometry() {
            var heartShape = new this.$THREE.Shape() // From http://blog.burlock.org/html5/130-paths
            var x = 0, y = 0
            heartShape.moveTo(x + 25, y + 25)
            heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y)
            heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35)
            heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95)
            heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35)
            heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y)
            heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25)
            var extrudeSettings = {
                depth: 16,
                bevelEnabled: true,
                bevelSegments: 1,
                steps: 2,
                bevelSize: 1,
                bevelThickness: 1
            }
            var geometry = new this.$THREE.ExtrudeGeometry(heartShape, extrudeSettings)
            geometry.rotateX(Math.PI)
            geometry.scale(0.4, 0.4, 0.4)
            return geometry
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.stats.update()
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryConstructedFromGeometry-container {
    position: relative;
    width: 100%;
}
</style>
