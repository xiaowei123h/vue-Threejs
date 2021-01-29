<template>
    <div class="webglLoaderKmz-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
			<a href="https://developers.google.com/kml/documentation/kmzarchives" target="_blank" rel="noopener">KMZ</a> loader
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { KMZLoader } from '@/components/jsm/loaders/KMZLoader.js'
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
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x999999)
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0.5, 1.0, 0.5).normalize()
            this.scene.add(light)
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 500)
            this.camera.position.y = 5
            this.camera.position.z = 10
            this.scene.add(this.camera)
            var grid = new this.$THREE.GridHelper(50, 50, 0xffffff, 0x555555)
            this.scene.add(grid)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderKmz-container')[0].appendChild(this.renderer.domElement)
            var loader = new KMZLoader()
            loader.load('static/models/kmz/Box.kmz', (kmz) => {
                kmz.scene.position.y = 0.5
                this.scene.add(kmz.scene)
                this.render()
            })
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderKmz-container {
    width: 100%;
}
</style>
