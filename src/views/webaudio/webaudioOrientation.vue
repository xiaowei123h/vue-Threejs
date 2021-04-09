<template>
    <div class="webaudioOrientation-container">
        <audio loop id="music" preload="auto" style="display: none">
            <source src="static/sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg" type="audio/ogg">
            <source src="static/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3" type="audio/mpeg">
        </audio>
        <div id="overlay">
            <el-button type="primary" size="mini" @click="init">Play</el-button>
        </div>
        <div id="container"></div>
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> webaudio - orientation<br/>
            music by <a href="http://www.newgrounds.com/audio/listen/376737" target="_blank" rel="noopener noreferrer">skullbeatz</a>
        </div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { PositionalAudioHelper } from '@/components/jsm/helpers/PositionalAudioHelper.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
		    startButton: null,
        }
    },
    mounted() {
        
    },
    methods: {
        init() {
			var overlay = document.getElementById('overlay')
			overlay.remove()
			var container = document.getElementById('container')
			//
			this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
			this.camera.position.set(3, 2, 3)
			var reflectionCube = new this.$THREE.CubeTextureLoader()
				.setPath('static/textures/cube/SwedishRoyalCastle/')
				.load([ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ])
			this.scene = new this.$THREE.Scene()
			this.scene.background = new this.$THREE.Color(0xa0a0a0)
			this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 2, 20)
			//
			var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
			hemiLight.position.set(0, 20, 0)
			this.scene.add(hemiLight)
			var dirLight = new this.$THREE.DirectionalLight(0xffffff)
			dirLight.position.set(5, 5, 0)
			dirLight.castShadow = true
			dirLight.shadow.camera.top = 1
			dirLight.shadow.camera.bottom = - 1
			dirLight.shadow.camera.left = - 1
			dirLight.shadow.camera.right = 1
			dirLight.shadow.camera.near = 0.1
			dirLight.shadow.camera.far = 20
			this.scene.add(dirLight)
			// this.scene.add(new this.$THREE.CameraHelper(dirLight.shadow.camera))
			//
			var mesh = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(50, 50), new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
			mesh.rotation.x = - Math.PI / 2
			mesh.receiveShadow = true
			this.scene.add(mesh)
			var grid = new this.$THREE.GridHelper(50, 50, 0x888888, 0x888888)
			this.scene.add(grid)
			//
			var listener = new this.$THREE.AudioListener()
			this.camera.add(listener)
			var audioElement = document.getElementById('music')
			audioElement.play()
			var positionalAudio = new this.$THREE.PositionalAudio(listener)
			positionalAudio.setMediaElementSource(audioElement)
			positionalAudio.setRefDistance(1)
			positionalAudio.setDirectionalCone(180, 230, 0.1)
			var helper = new PositionalAudioHelper(positionalAudio, 0.1)
			positionalAudio.add(helper)
			//
			var gltfLoader = new GLTFLoader()
			gltfLoader.load('static/models/gltf/BoomBox/glTF-Binary/BoomBox.glb', (gltf) => {
				var boomBox = gltf.scene
				boomBox.position.set(0, 0.2, 0)
				boomBox.scale.set(20, 20, 20)
				boomBox.traverse((object) => {
					if (object.isMesh) {
						object.material.envMap = reflectionCube
						object.geometry.rotateY(- Math.PI)
						object.castShadow = true
					}
				})
				boomBox.add(positionalAudio)
				this.scene.add(boomBox)
				this.animate()
			})
			// sound is damped behind this wall
			var wallGeometry = new this.$THREE.BoxBufferGeometry(2, 1, 0.1)
			var wallMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 })
			var wall = new this.$THREE.Mesh(wallGeometry, wallMaterial)
			wall.position.set(0, 0.5, - 0.5)
			this.scene.add(wall)
			//
			this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.outputEncoding = this.$THREE.sRGBEncoding
			this.renderer.shadowMap.enabled = true
			container.appendChild(this.renderer.domElement)
			//
			var controls = new OrbitControls(this.camera, this.renderer.domElement)
			controls.target.set(0, 0.1, 0)
			controls.update()
			controls.minDistance = 0.5
			controls.maxDistance = 10
			controls.maxPolarAngle = 0.5 * Math.PI
			//
			window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
			requestAnimationFrame(this.animate)
			this.renderer.render(this.scene, this.camera)
		}
    },
}
</script>

<style scoped>
.webaudioOrientation-container {
	position: relative;
    width: 100%;
}
#overlay {
    text-align: center;
    height: 100vh;
    line-height: 100vh;
}
</style>
