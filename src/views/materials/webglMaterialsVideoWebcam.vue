<template>
    <div class="webglMaterialsVideoWebcam-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - video webcam input
		</div>

		<video id="video" style="display:none" autoplay playsinline></video>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            video: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.z = 0.01
            this.scene = new this.$THREE.Scene()
            this.video = document.getElementById('video')
            var texture = new this.$THREE.VideoTexture(this.video)
            var geometry = new this.$THREE.PlaneBufferGeometry(16, 9)
            geometry.scale(0.5, 0.5, 0.5)
            var material = new this.$THREE.MeshBasicMaterial({ map: texture })
            var count = 128
            var radius = 32
            for (var i = 1, l = count; i <= l; i ++) {
                var phi = Math.acos(- 1 + (2 * i) / l)
                var theta = Math.sqrt(l * Math.PI) * phi
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.setFromSphericalCoords(radius, phi, theta)
                mesh.lookAt(this.camera.position)
                this.scene.add(mesh)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsVideoWebcam-container')[0].appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enableZoom = false
            controls.enablePan = false
            window.addEventListener('resize', this.onWindowResize, false)
            //
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                var varraints = { video: { width: 1280, height: 720, facingMode: 'user' } }
                navigator.mediaDevices.getUserMedia(varraints).then((stream) => {
                    // apply the stream to the video element used in the texture
                    this.video.srcObject = stream
                    this.video.play()
                }).catch((error) => {
                    console.error('Unable to access the camera/webcam.', error)
                })
            } else {
                console.error('MediaDevices interface not available.')
            }
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
.webglMaterialsVideoWebcam-container {
    position: relative;
    width: 100%;
}
</style>
