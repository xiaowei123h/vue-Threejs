<template>
    <div class="webglLoaderAssimp-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>
			<a href="https://github.com/Virtulous" target="_blank" rel="noopener">Assimp File format</a>
			<div>Assimp loader by <a href="https://virtulo.us" target="_blank" rel="noopener">Virtulous</a></div>
			<div>Octaminator model from <a href="http://opengameart.org/content/octaminator-engine-ready" target="_blank" rel="noopener">Teh_Bucket and raymoohawk</a></div>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { AssimpLoader } from '@/components/jsm/loaders/AssimpLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			animation: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$moduleTHREE.PerspectiveCamera(25, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set(600, 1150, 5)
            this.camera.up.set(0, 0, 1)
            this.camera.lookAt(- 100, 0, 0)
            this.scene = new this.$moduleTHREE.Scene()
            var ambient = new this.$moduleTHREE.HemisphereLight(0x8888fff, 0xff8888, 0.5)
            ambient.position.set(0, 1, 0)
            this.scene.add(ambient)
            var light = new this.$moduleTHREE.DirectionalLight(0xffffff, 1)
            light.position.set(0, 4, 4).normalize()
            this.scene.add(light)
            this.renderer = new this.$moduleTHREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 750
            controls.maxDistance = 2500
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            var loader = new AssimpLoader()
            loader.load('static/models/assimp/octaminator/Octaminator.assimp', (result) => {
                var object = result.object
                object.position.y = - 100
                object.rotation.x = Math.PI / 2
                this.scene.add(object)
                this.animation = result.animation
            })
            window.addEventListener('resize', this.onWindowResize, false)
            this.animate()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate, this.renderer.domElement)
            this.renderer.render(this.scene, this.camera)
            if (this.animation) this.animation.setTime(performance.now() / 1000)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglLoaderAssimp-container {
    position: relative;
    width: 100%;
}
</style>
