<template>
    <div class="webglPostprocessingUnrealBloom-container">
        <div id="container"></div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Bloom pass by <a href="http://eduperiment.com" target="_blank" rel="noopener">Prashant Sharma</a> and <a href="https://clara.io" target="_blank" rel="noopener">Ben Houston</a>
			<br/>
			Model: <a href="https://blog.sketchfab.com/art-spotlight-primary-ion-drive/" target="_blank" rel="noopener">Primary Ion Drive</a> by
			<a href="http://mjmurdock.com/" target="_blank" rel="noopener">Mike Murdock</a>, CC Attribution.
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '@/components/jsm/postprocessing/UnrealBloomPass.js'
export default {
    data() {
        return {
            camera: null,
            stats: null,
            composer: null,
            renderer: null,
            mixer: null,
            clock: null,
			params: {
				exposure: 1,
				bloomStrength: 1.5,
				bloomThreshold: 0,
				bloomRadius: 0
            },
            gui: null,
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            this.clock = new this.$THREE.Clock()
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.toneMapping = this.$THREE.ReinhardToneMapping
            container.appendChild(this.renderer.domElement)
            var scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 100)
            this.camera.position.set(- 5, 2.5, - 3.5)
            scene.add(this.camera)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.maxPolarAngle = Math.PI * 0.5
            controls.minDistance = 1
            controls.maxDistance = 10
            scene.add(new this.$THREE.AmbientLight(0x404040))
            var pointLight = new this.$THREE.PointLight(0xffffff, 1)
            this.camera.add(pointLight)
            var renderScene = new RenderPass(scene, this.camera)
            var bloomPass = new UnrealBloomPass(new this.$THREE.Vector2(this.$webglInnerWidth, window.innerHeight), 1.5, 0.4, 0.85)
            bloomPass.threshold = this.params.bloomThreshold
            bloomPass.strength = this.params.bloomStrength
            bloomPass.radius = this.params.bloomRadius
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(renderScene)
            this.composer.addPass(bloomPass)
            new GLTFLoader().load('static/models/gltf/PrimaryIonDrive.glb', (gltf) => {
                var model = gltf.scene
                scene.add(model)
                this.mixer = new this.$THREE.AnimationMixer(model)
                var clip = gltf.animations[ 0 ]
                this.mixer.clipAction(clip.optimize()).play()
                this.animate()
            })
            this.gui = new GUI()
            this.gui.add(this.params, 'exposure', 0.1, 2).onChange((value) => {
                this.renderer.toneMappingExposure = Math.pow(value, 4.0)
            })
            this.gui.add(this.params, 'bloomThreshold', 0.0, 1.0).onChange((value) => {
                bloomPass.threshold = Number(value)
            })
            this.gui.add(this.params, 'bloomStrength', 0.0, 3.0).onChange((value) => {
                bloomPass.strength = Number(value)
            })
            this.gui.add(this.params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange((value) => {
                bloomPass.radius = Number(value)
            })
            window.addEventListener('resize', this.onWindowResize)
        },
        onWindowResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(width, height)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            this.mixer.update(delta)
            this.stats.update()
            this.composer.render()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingUnrealBloom-container {
    width: 100%;
}
#info {
    max-width: 650px;
    margin-left: auto;
    margin-right: auto;
}
</style>
