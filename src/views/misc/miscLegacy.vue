<template>
    <div class="miscLegacy-container">
        
    </div>
</template>

<script>
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
            this.renderer = new THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = THREE.sRGBEncoding
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping
            document.getElementsByClassName('miscLegacy-container')[0].appendChild(this.renderer.domElement)
            this.scene = new THREE.Scene()
            this.camera = new THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 20)
            this.camera.position.set(1.5, 0.2, 1.5)
            this.controls = new THREE.OrbitControls(this.camera, document.getElementsByClassName('miscLegacy-container')[0])
            this.controls.autoRotate = true
            this.controls.autoRotateSpeed = - 1.0
            var pmremGenerator = new THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            new THREE.RGBELoader()
                .setDataType(THREE.UnsignedByteType)
                .load('static/textures/equirectangular/venice_sunset_1k.hdr', (texture) => {
                    var envMap = pmremGenerator.fromEquirectangular(texture).texture
                    this.scene.background = envMap
                    this.scene.environment = envMap
                })
            var url = 'static/models/gltf/BoomBox/glTF-Binary/BoomBox.glb'
            var loader = new THREE.GLTFLoader()
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
    position: relative;
    width: 100%;
}
</style>
