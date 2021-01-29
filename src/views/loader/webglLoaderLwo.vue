<template>
    <div class="webglLoaderLwo-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - LWOLoader
			<P>Lightwave Object loader by <a href="https://discoverthreejs.com/" target="_blank" rel="noopener">Discover three.js</a></P>
			Models by <a href="https://onthez.com/" target="_blank" rel="noopener">on the z</a> - Environment images by <a href="https://hdrihaven.com/" target="_blank" rel="noopener">HDRI Haven</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { LWOLoader } from '@/components/jsm/loaders/LWOLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderLwo-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 200)
            this.camera.position.set(- 0.7, 14.6, 43.2)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xa0a0a0)
            var ambientLight = new this.$THREE.AmbientLight(0xaaaaaa, 1.75)
            this.scene.add(ambientLight)
            var light1 = new this.$THREE.DirectionalLight(0xffffff, 1)
            light1.position.set(0, 200, 100)
            light1.castShadow = true
            light1.shadow.camera.top = 180
            light1.shadow.camera.bottom = - 100
            light1.shadow.camera.left = - 120
            light1.shadow.camera.right = 120
            this.scene.add(light1)
            var light2 = new this.$THREE.DirectionalLight(0xffffff, 0.7)
            light2.position.set(- 100, 200, - 100)
            this.scene.add(light2)
            var light3 = new this.$THREE.DirectionalLight(0xffffff, 0.4)
            light3.position.set(100, - 200, 100)
            this.scene.add(light3)
            var light4 = new this.$THREE.DirectionalLight(0xffffff, 1)
            light4.position.set(- 100, - 100, 100)
            this.scene.add(light4)
            var grid = new this.$THREE.GridHelper(200, 20, 0x000000, 0x000000)
            grid.material.opacity = 0.3
            grid.material.transparent = true
            this.scene.add(grid)
            var loader = new LWOLoader()
            loader.load('static/models/lwo/Objects/LWO3/Demo.lwo', (object) => {
                var phong = object.meshes[ 0 ]
                phong.position.set(- 2, 12, 0)
                var standard = object.meshes[ 1 ]
                standard.position.set(2, 12, 0)
                var rocket = object.meshes[ 2 ]
                rocket.position.set(0, 10.5, - 1)
                this.scene.add(phong, standard, rocket)
            })
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.physicallyCorrectLights = true
            this.renderer.gammaFactor = 1.18
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(1.33, 10, - 6.7)
            controls.update()
            this.renderer.setAnimationLoop(() => {
                this.renderer.render(this.scene, this.camera)
            })
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        }
    }
}
</script>

<style scoped>
.webglLoaderLwo-container {
    width: 100%;
}
</style>
