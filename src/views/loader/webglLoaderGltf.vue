<template>
    <div class="webglLoaderGltf-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - GLTFLoader<br />
			Battle Damaged Sci-fi Helmet by
			<a href="https://sketchfab.com/theblueturtle_" target="_blank" rel="noopener">theblueturtle_</a><br />
			<a href="https://hdrihaven.com/hdri/?h=royal_esplanade" target="_blank" rel="noopener">Royal Esplanade</a> by <a href="https://hdrihaven.com/" target="_blank" rel="noopener">HDRI Haven</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
import { RoughnessMipmapper } from '@/components/jsm/utils/RoughnessMipmapper.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
		this.render()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderGltf-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.25, 20)
            this.camera.position.set(- 1.8, 0.6, 2.7)
            this.scene = new this.$THREE.Scene()
            new RGBELoader()
                .setDataType(this.$THREE.UnsignedByteType)
                .setPath('static/textures/equirectangular/')
                .load('royal_esplanade_1k.hdr', (texture) => {
                    var envMap = pmremGenerator.fromEquirectangular(texture).texture
                    this.scene.background = envMap
                    this.scene.environment = envMap
                    texture.dispose()
                    pmremGenerator.dispose()
                    this.render()
                    // model
                    // use of RoughnessMipmapper is optional
                    var roughnessMipmapper = new RoughnessMipmapper(this.renderer)
                    var loader = new GLTFLoader().setPath('static/models/gltf/DamagedHelmet/glTF/')
                    loader.load('DamagedHelmet.gltf', (gltf) => {
                        gltf.scene.traverse((child) => {
                            if (child.isMesh) {
                                // TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
                                // roughnessMipmapper.generateMipmaps(child.material)
                            }
                        })
                        this.scene.add(gltf.scene)
                        roughnessMipmapper.dispose()
                        this.render()
                    })
                })
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 1
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            container.appendChild(this.renderer.domElement)
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render) // use if there is no animation loop
            controls.minDistance = 2
            controls.maxDistance = 10
            controls.target.set(0, 0, - 0.2)
            controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderGltf-container {
    position: relative;
    width: 100%;
}
</style>
