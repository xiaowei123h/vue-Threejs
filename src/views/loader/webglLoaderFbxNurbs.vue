<template>
    <div class="webglLoaderFbxNurbs-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - FBXLoader - Nurbs
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { FBXLoader } from '@/components/jsm/loaders/FBXLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderFbxNurbs-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
            this.camera.position.set(2, 18, 28)
            this.scene = new this.$THREE.Scene()
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 1, 0)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff)
            dirLight.position.set(0, 1, 0)
            this.scene.add(dirLight)
            // grid
            var gridHelper = new this.$THREE.GridHelper(28, 28, 0x303030, 0x303030)
            this.scene.add(gridHelper)
            // stats
            this.stats = new this.$Stats()
            this.container.appendChild(this.stats.dom)
            // model
            var loader = new FBXLoader()
            loader.load('static/models/fbx/nurbs.fbx', (object) => {
                this.scene.add(object)
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 12, 0)
            controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglLoaderFbxNurbs-container {
    width: 100%;
}
</style>
