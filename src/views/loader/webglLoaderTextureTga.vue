<template>
    <div class="webglLoaderTextureTga-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - TGA texture example by <a href="https://github.com/DaoshengMu/" target="_blank" rel="noopener">Daosheng Mu</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { TGALoader } from '@/components/jsm/loaders/TGALoader.js'
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
            document.getElementsByClassName('webglLoaderTextureTga-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 1000)
            this.camera.position.set(0, 50, 250)
            this.scene = new this.$THREE.Scene()
            //
            var loader = new TGALoader()
            var geometry = new this.$THREE.BoxBufferGeometry(50, 50, 50)
            // add box 1 - grey8 texture
            var texture1 = loader.load('static/textures/crate_grey8.tga')
            var material1 = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, map: texture1 })
            var mesh1 = new this.$THREE.Mesh(geometry, material1)
            mesh1.position.x = - 50
            this.scene.add(mesh1)
            // add box 2 - tga texture
            var texture2 = loader.load('static/textures/crate_color8.tga')
            var material2 = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, map: texture2 })
            var mesh2 = new this.$THREE.Mesh(geometry, material2)
            mesh2.position.x = 50
            this.scene.add(mesh2)
            //
            var ambientLight = new this.$THREE.AmbientLight(0xffffff, 0.4)
            this.scene.add(ambientLight)
            var light = new this.$THREE.DirectionalLight(0xffffff, 1)
            light.position.set(1, 1, 1)
            this.scene.add(light)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enableZoom = false
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
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
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglLoaderTextureTga-container {
    width: 100%;
}
</style>
