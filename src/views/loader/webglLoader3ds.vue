<template>
    <div class="webglLoader3ds-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - 3DS loader
		</div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js';
import { TDSLoader } from '@/components/jsm/loaders/TDSLoader.js'
export default {
    data() {
        return {
            container: null,
            controls: null,
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoader3ds-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.z = 2
            this.scene = new this.$THREE.Scene()
            this.scene.add(new this.$THREE.HemisphereLight())
            var directionalLight = new this.$THREE.DirectionalLight(0xffeedd)
            directionalLight.position.set(0, 0, 2)
            this.scene.add(directionalLight)
            //3ds files dont store normal maps
            var normal = new this.$THREE.TextureLoader().load('models/3ds/portalgun/textures/normal.jpg')
            var loader = new TDSLoader()
            loader.setResourcePath('static/models/3ds/portalgun/textures/')
            loader.load('static/models/3ds/portalgun/portalgun.3ds', (object) => {
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material.specular.setScalar(0.1)
                        child.material.normalMap = normal
                    }
                })
                this.scene.add(object)
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            window.addEventListener('resize', this.resize, false)
        },
        resize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        }
    }
}
</script>

<style scoped>
.webglLoader3ds-container {
    position: relative;
    width: 100%;
}
</style>
