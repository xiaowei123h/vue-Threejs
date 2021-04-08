<template>
    <div class="webglLoaderTextureLottie-container">
        <div id="info">
			<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - lottie<br/></br>
			<input id="scrubber" type="range" value="0" style="width: 300px">
		</div>
    </div>
</template>

<script>
import { RoomEnvironment } from '@/components/jsm/environments/RoomEnvironment.js';
import { RoundedBoxBufferGeometry } from '@/components/jsm/geometries/RoundedBoxBufferGeometry.js';
import { LottieLoader } from '@/components/jsm/loaders/LottieLoader.js';
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
			mesh: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.z = 2.5
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x111111)
            var loader = new LottieLoader()
            loader.setQuality(2)
            loader.load('static/textures/lottie/24017-lottie-logo-animation.json', (texture) => {
                this.setupControls(texture.animation)
                // texture = new this.$THREE.TextureLoader().load('textures/uv_grid_directx.jpg')
                var geometry = new RoundedBoxBufferGeometry(1, 1, 1, 7, 0.2)
                var material = new this.$THREE.MeshStandardMaterial({ roughness: 0.1, map: texture })
                this.mesh = new this.$THREE.Mesh(geometry, material)
                this.scene.add(this.mesh)
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderTextureLottie-container')[0].appendChild(this.renderer.domElement)
            var environment = new RoomEnvironment()
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            this.scene.environment = pmremGenerator.fromScene(environment).texture
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        setupControls(animation) {
            // Lottie animation API
            // https://airbnb.io/lottie/#/web
            // There are a few undocumented properties:
            // console.log(animation)
            var scrubber = document.getElementById('scrubber')
            scrubber.max = animation.totalFrames
            scrubber.addEventListener('pointerdown', () => {
                animation.pause()
            })
            scrubber.addEventListener('pointerup', () => {
                animation.play()
            })
            scrubber.addEventListener('input', () => {
                animation.goToAndStop(parseFloat(scrubber.value), true)
            })
            animation.addEventListener('enterFrame', () => {
                scrubber.value = animation.currentFrame
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.mesh) {
                this.mesh.rotation.y -= 0.001
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderTextureLottie-container {
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
