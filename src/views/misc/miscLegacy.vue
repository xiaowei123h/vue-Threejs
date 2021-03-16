<template>
    <div class="miscLegacy-container">
        
    </div>
</template>

<script>
// import 'https://polyfill.io/v3/polyfill.min.js?features=Object.values%2CPromise'
import '@/components/build/three.js'
import '@/components/js/controls/OrbitControls.js'
import '@/components/js/loaders/GLTFLoader.js'
import '@/components/js/loaders/RGBELoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			controls: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            document.getElementsByClassName('miscLegacy-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 20)
            this.camera.position.set(1.5, 0.2, 1.5)
            this.controls = new this.$THREE.OrbitControls(this.camera, document.getElementsByClassName('miscLegacy-container')[0])
            this.controls.autoRotate = true
            this.controls.autoRotateSpeed = - 1.0
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            new this.$THREE.RGBELoader()
                .setDataType(this.$THREE.UnsignedByteType)
                .load('static/textures/equirectangular/venice_sunset_1k.hdr', (texture) => {
                    var envMap = pmremGenerator.fromEquirectangular(texture).texture
                    this.scene.background = envMap
                    this.scene.environment = envMap
                })
            var url = 'static/models/gltf/BoomBox/glTF-Binary/BoomBox.glb'
            var loader = new this.$THREE.GLTFLoader()
            loader.load(url, (gltf) => {
                var model = gltf.scene
                model.rotation.y = Math.PI
                model.scale.setScalar(50)
                this.scene.add(model)
            })
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.miscLegacy-container {
    width: 100%;
}
</style>
