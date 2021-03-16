<template>
    <div class="webaudioTiming-container">
        <div id="overlay">
            <el-button type="primary" size="mini" @click="init">Play</el-button>
        </div>
        <div id="container"></div>
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> webaudio - timing<br/>
            sound effect by <a href="https://freesound.org/people/michorvath/sounds/269718/" target="_blank" rel="noopener noreferrer">michorvath</a>
        </div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
            clock: null,
            objects: [],
            speed: 2.5,
            height: 3,
            offset: 0.5,
        }
    },
    mounted() {
        
    },
    methods: {
        init() {
			var overlay = document.getElementById('overlay')
			overlay.remove()
			var container = document.getElementById('container')
			this.scene = new this.$THREE.Scene()
			this.clock = new this.$THREE.Clock()
			//
			this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
			this.camera.position.set(7, 3, 7)
			// lights
			var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
			this.scene.add(ambientLight)
			var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 0.7)
			directionalLight.position.set(0, 5, 5)
			this.scene.add(directionalLight)
			var d = 5
			directionalLight.castShadow = true
			directionalLight.shadow.camera.left = - d
			directionalLight.shadow.camera.right = d
			directionalLight.shadow.camera.top = d
			directionalLight.shadow.camera.bottom = - d
			directionalLight.shadow.camera.near = 1
			directionalLight.shadow.camera.far = 20
			directionalLight.shadow.mapSize.x = 1024
			directionalLight.shadow.mapSize.y = 1024
			// audio
			var audioLoader = new this.$THREE.AudioLoader()
			var listener = new this.$THREE.AudioListener()
			this.camera.add(listener)
			// floor
			var floorGeometry = new this.$THREE.PlaneBufferGeometry(10, 10)
			var floorMaterial = new this.$THREE.MeshLambertMaterial({ color: 0x4676b6 })
			var floor = new this.$THREE.Mesh(floorGeometry, floorMaterial)
			floor.rotation.x = Math.PI * - 0.5
			floor.receiveShadow = true
			this.scene.add(floor)
			// objects
			var count = 5
			var radius = 3
			var ballGeometry = new this.$THREE.SphereBufferGeometry(0.3, 32, 16)
			ballGeometry.translate(0, 0.3, 0)
			var ballMaterial = new this.$THREE.MeshLambertMaterial({ color: 0xcccccc })
			// create objects when audio buffer is loaded
			audioLoader.load('static/sounds/ping_pong.mp3', (buffer) => {
				for (var i = 0; i < count; i ++) {
					var s = i / count * Math.PI * 2
					var ball = new this.$THREE.Mesh(ballGeometry, ballMaterial)
					ball.castShadow = true
					ball.userData.down = false
					ball.position.x = radius * Math.cos(s)
					ball.position.z = radius * Math.sin(s)
					var audio = new this.$THREE.PositionalAudio(listener)
					audio.setBuffer(buffer)
					ball.add(audio)
					this.scene.add(ball)
					this.objects.push(ball)
				}
				this.animate()
			})
			//
			this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
			this.renderer.shadowMap.enabled = true
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.renderer.setClearColor(0x000000)
			this.renderer.setPixelRatio(window.devicePixelRatio)
			container.appendChild(this.renderer.domElement)
			//
			var controls = new OrbitControls(this.camera, this.renderer.domElement)
			controls.minDistance = 1
			controls.maxDistance = 25
			//
			window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
			requestAnimationFrame(this.animate)
			this.render()
        },
        render() {
			var time = this.clock.getElapsedTime()
			for (var i = 0; i < this.objects.length; i ++) {
				var ball = this.objects[ i ]
				var previousHeight = ball.position.y
				ball.position.y = Math.abs(Math.sin(i * this.offset + (time * this.speed)) * this.height)
				if (ball.position.y < previousHeight) {
					ball.userData.down = true
				} else {
					if (ball.userData.down === true) {
						// ball changed direction from down to up
						var audio = ball.children[ 0 ]
						audio.play() // play audio with perfect timing when ball hits the surface
						ball.userData.down = false
					}
				}
			}
			this.renderer.render(this.scene, this.camera)
		}
    },
}
</script>

<style scoped>
.webaudioTiming-container {
    width: 100%;
}
#overlay {
    text-align: center;
    height: 100vh;
    line-height: 100vh;
}
</style>
