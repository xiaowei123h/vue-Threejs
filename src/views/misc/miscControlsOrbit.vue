<template>
    <div class="miscControlsOrbit-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - orbit controls
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
        //render() // remove when using next line for animation loop (requestAnimationFrame)
        this.animate()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xcccccc)
            this.scene.fog = new this.$THREE.FogExp2(0xcccccc, 0.002)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('miscControlsOrbit-container')[0].appendChild(this.renderer.domElement)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(400, 200, 0)
            // controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            //this.controls.addEventListener('change', render) // call this only in static this.scenes (i.e., if there is no animation loop)
            this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
            this.controls.dampingFactor = 0.05
            this.controls.screenSpacePanning = false
            this.controls.minDistance = 100
            this.controls.maxDistance = 500
            this.controls.maxPolarAngle = Math.PI / 2
            // world
            var geometry = new this.$THREE.CylinderBufferGeometry(0, 10, 30, 4, 1)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
            for (var i = 0; i < 500; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 1600 - 800
                mesh.position.y = 0
                mesh.position.z = Math.random() * 1600 - 800
                mesh.updateMatrix()
                mesh.matrixAutoUpdate = false
                this.scene.add(mesh)
            }
            // lights
            var dirLight1 = new this.$THREE.DirectionalLight(0xffffff)
            dirLight1.position.set(1, 1, 1)
            this.scene.add(dirLight1)
            var dirLight2 = new this.$THREE.DirectionalLight(0x002288)
            dirLight2.position.set(- 1, - 1, - 1)
            this.scene.add(dirLight2)
            var ambientLight = new this.$THREE.AmbientLight(0x222222)
            this.scene.add(ambientLight)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update() // only required if controls.enableDamping = true, or if controls.autoRotate = true
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.miscControlsOrbit-container {
    width: 100%;
}
#info {
    background-color: #ccc;
    color: #000;
}
#info a {
    color: #f00;
}
</style>
