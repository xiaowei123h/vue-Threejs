<template>
    <div class="webglBuffergeometryMorphtargets-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - buffergeometry - morph targets<br/>
			by <a href="https://discoverthreejs.com/" target="_blank" rel="noopener">Discover three.js</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
            gui: null
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x8FBCD4)
            this.scene.add(new this.$THREE.AmbientLight(0x8FBCD4, 0.4))
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 20)
            this.camera.position.z = 10
            this.scene.add(this.camera)
            var pointLight = new this.$THREE.PointLight(0xffffff, 1)
            this.camera.add(pointLight)
            var geometry = this.createGeometry()
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xff0000,
                flatShading: true,
                morphTargets: true
            })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            this.initGUI()
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setAnimationLoop(() => {
                this.renderer.render(this.scene, this.camera)
            })
            this.container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enableZoom = false
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        initGUI() {
            // Set up dat.GUI to control targets
            var params = {
                Spherify: 0,
                Twist: 0,
            };
            this.gui = new GUI()
            var folder = this.gui.addFolder('Morph Targets')
            folder.add(params, 'Spherify', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[0] = value
            })
            folder.add(params, 'Twist', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[1] = value
            })
            folder.open()
        },
        createGeometry() {
            var geometry = new this.$THREE.BoxBufferGeometry(2, 2, 2, 32, 32, 32)
            // create an empty array to  hold targets for the attribute we want to morph
            // morphing positions and normals is supported
            geometry.morphAttributes.position = []
            // the original positions of the cube's vertices
            var positions = geometry.attributes.position.array
            // for the first morph target we'll move the cube's vertices onto the surface of a sphere
            var spherePositions = []
            // for the second morph target, we'll twist the cubes vertices
            var twistPositions = []
            var direction = new this.$THREE.Vector3(1, 0, 0).normalize()
            var vertex = new this.$THREE.Vector3()
            for (let i = 0; i < positions.length; i += 3) {
                var x = positions[ i ]
                var y = positions[ i + 1 ]
                var z = positions[ i + 2 ]
                spherePositions.push(
                    x * Math.sqrt(1 - (y * y / 2) - (z * z / 2) + (y * y * z * z / 3)),
                    y * Math.sqrt(1 - (z * z / 2) - (x * x / 2) + (z * z * x * x / 3)),
                    z * Math.sqrt(1 - (x * x / 2) - (y * y / 2) + (x * x * y * y / 3))
            )
                // stretch along the x-axis so we can see the twist better
                vertex.set(x * 2, y, z)
                vertex.applyAxisAngle(direction, Math.PI * x / 2).toArray(twistPositions, twistPositions.length)
            }
            // add the spherical positions as the first morph target
            geometry.morphAttributes.position[ 0 ] = new this.$THREE.Float32BufferAttribute(spherePositions, 3)
            // add the twisted positions as the second morph target
            geometry.morphAttributes.position[ 1 ] = new this.$THREE.Float32BufferAttribute(twistPositions, 3)
            return geometry
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryMorphtargets-container {
    width: 100%;
}
</style>