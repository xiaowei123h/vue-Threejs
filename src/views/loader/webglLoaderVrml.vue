<template>
    <div class="webglLoaderVrml-container">
        <div id="info">
		    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - VRML loader
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { VRMLLoader } from '@/components/jsm/loaders/VRMLLoader.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            gui: null,
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            controls: null,
            loader: null,
			params: {
				asset: 'house'
			},
			assets: [
				'creaseAngle',
				'crystal',
				'house',
				'elevationGrid1',
				'elevationGrid2',
				'extrusion1',
				'extrusion2',
				'extrusion3',
				'lines',
				'meshWithLines',
				'meshWithTexture',
				'pixelTexture',
				'points',
			],
			vrmlScene: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 1e10)
            this.camera.position.set(- 10, 5, 10)
            this.scene = new this.$THREE.Scene()
            this.scene.add(this.camera)
            // light
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x000000, 1)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            dirLight.position.set(200, 200, 200)
            this.scene.add(dirLight)
            this.loader = new VRMLLoader()
            this.loadAsset(this.params.asset)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderVrml-container')[0].appendChild(this.renderer.domElement)
            // controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 1
            this.controls.maxDistance = 200
            this.controls.enableDamping = true
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglLoaderVrml-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.gui = new GUI({ width: 300 })
            this.gui.add(this.params, 'asset', this.assets).onChange((value) => {
                if (this.vrmlScene) {
                    this.vrmlScene.traverse((object) => {
                        if (object.material) object.material.dispose()
                        if (object.material && object.material.map) object.material.map.dispose()
                        if (object.geometry) object.geometry.dispose()
                    })
                    this.scene.remove(this.vrmlScene)
                }
                this.loadAsset(value)
            })
        },
        loadAsset(asset) {
            this.loader.load('static/models/vrml/' + asset + '.wrl', (object) => {
                this.vrmlScene = object
                this.scene.add(object)
                this.controls.reset()
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update() // to support damping
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglLoaderVrml-container {
    width: 100%;
}
</style>
