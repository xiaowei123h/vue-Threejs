<template>
    <div class="webglAnimationKeyframes-container">
        <div id="container"></div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - animation - keyframes<br/>
			Model: <a href="https://www.artstation.com/artwork/1AGwX" target="_blank" rel="noopener">Littlest Tokyo</a> by
			<a href="https://www.artstation.com/glenatron" target="_blank" rel="noopener">Glen Fox</a>, CC Attribution.
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from '@/components/jsm/loaders/DRACOLoader.js'
export default {
    data() {
        return {
            mixer: null,
            clock: null,
            container: null,
            stats: null,
            renderer: null,
            scene: null,
            camera: null,
            dirLight: null
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.init()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.stats = new this.$Stats()
            this.container.appendChild(this.stats.dom)
            this.renderer = new this.$THREE.WebGLRenderer({antialias: true})
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xbfe3dd)
            this.camera = new this.$THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100)
            this.camera.position.set(5, 2, 8)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.target.set(0, 0.5, 0)
            this.controls.update()
            this.controls.enablePan = false
            this.controls.enableDamping = true
            this.scene.add(new this.$THREE.HemisphereLight(0xffffff, 0x000000, 0.4))
            this.dirLight = new this.$THREE.DirectionalLight(0xffffff, 1)
            this.dirLight.position.set(5, 2, 8)
            this.scene.add(this.dirLight)
            // envmap
			var path = 'static/textures/cube/Park2/'
			var format = '.jpg'
			const envMap = new this.$THREE.CubeTextureLoader().load([
				path + 'posx' + format, path + 'negx' + format,
				path + 'posy' + format, path + 'negy' + format,
				path + 'posz' + format, path + 'negz' + format
            ])
			var dracoLoader = new DRACOLoader()
            dracoLoader.setDecoderPath('static/js/libs/draco/gltf/')
            var loader = new GLTFLoader()
            loader.setDRACOLoader(dracoLoader)
			loader.load('static/models/gltf/LittlestTokyo.glb', (gltf) => {
				var model = gltf.scene
				model.position.set(1, 1, 0)
				model.scale.set(0.01, 0.01, 0.01)
				model.traverse(function (child) {
					if (child.isMesh) child.material.envMap = envMap
                })
                var that = this
				that.scene.add(model)
				that.mixer = new that.$THREE.AnimationMixer(model)
				that.mixer.clipAction(gltf.animations[0]).play()
				that.animate()
			}, undefined, function(e) {
				console.error(e)
			})
        },
        onresize() {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            this.mixer.update(delta)
            this.controls.update()
            this.stats.update()
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglAnimationKeyframes-container {
    background-color: #bfe3dd;
	color: #000;
}
a {
    color: #2983ff;
}
</style>
