<template>
    <div class="webglLoaderGcode-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - GCode loader
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { GCodeLoader } from '@/components/jsm/loaders/GCodeLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init();
		this.render();
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderGcode-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 70)
            this.scene = new this.$THREE.Scene()
            var loader = new GCodeLoader()
            loader.load('static/models/gcode/benchy.gcode', (object) => {
                object.position.set(- 100, - 20, 100)
                this.scene.add(object)
                this.render()
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render) // use if there is no animation loop
            controls.minDistance = 10
            controls.maxDistance = 100
            window.addEventListener('resize', this.resize, false)
        },
        resize() {
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
.webglLoaderGcode-container {
    width: 100%;
}
</style>
