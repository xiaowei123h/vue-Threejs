<template>
    <div class="webglLoaderCollada-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> collada loader<br/>
			Elf Girl by <a href="https://sketchfab.com/yellow09" target="_blank" rel="noopener">halloween</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC Attribution</a>
		</div>
    </div>
</template>

<script>
import { ColladaLoader } from '@/components/jsm/loaders/ColladaLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            clock: null,
            camera: null,
            scene: null,
            renderer: null,
            elf: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 2000)
            this.camera.position.set(8, 10, 8)
            this.camera.lookAt(0, 3, 0)
            this.scene = new this.$THREE.Scene()
            this.clock = new this.$THREE.Clock()
            // loading manager
            var loadingManager = new this.$THREE.LoadingManager(() => {
                this.scene.add(this.elf)
            })
            // collada
            var loader = new ColladaLoader(loadingManager)
            loader.load('static/models/collada/elf/elf.dae', (collada) => {
                this.elf = collada.scene
            })
            //
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 0.8)
            directionalLight.position.set(1, 1, 0).normalize()
            this.scene.add(directionalLight)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
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
            var delta = this.clock.getDelta()
            if (this.elf !== null) {
                this.elf.rotation.z += delta * 0.5
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderCollada-container {
    width: 100%;
}
#info {
    margin-left: 30px;
}
</style>
