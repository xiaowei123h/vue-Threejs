<template>
    <div class="webglMaterialsStandard-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl physically based material<br/>
			<a href="http://www.polycount.com/forum/showthread.php?t=130641" target="_blank" rel="noopener">Cerberus(FFVII Gun) model</a> by Andrew Maximov.
		</div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            statsEnabled: true,
            container: null,
            stats: null,
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
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsStandard-container')[0].appendChild(this.container)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.toneMapping = this.$THREE.ReinhardToneMapping
            this.renderer.toneMappingExposure = 3
            //
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.01, 1000)
            this.camera.position.z = 2
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            //
            this.scene.add(new this.$THREE.HemisphereLight(0x443333, 0x222233, 4))
            //
            var material = new this.$THREE.MeshStandardMaterial()
            new OBJLoader()
                .setPath('static/models/obj/cerberus/')
                .load('Cerberus.obj', (group) => {
                    var loader = new this.$THREE.TextureLoader()
                        .setPath('models/obj/cerberus/')
                    material.roughness = 1 // attenuates roughnessMap
                    material.metalness = 1 // attenuates metalnessMap
                    var diffuseMap = loader.load('Cerberus_A.jpg')
                    diffuseMap.encoding = this.$THREE.sRGBEncoding
                    material.map = diffuseMap
                    // roughness is in G channel, metalness is in B channel
                    material.metalnessMap = material.roughnessMap = loader.load('Cerberus_RM.jpg')
                    material.normalMap = loader.load('Cerberus_N.jpg')
                    material.map.wrapS = this.$THREE.RepeatWrapping
                    material.roughnessMap.wrapS = this.$THREE.RepeatWrapping
                    material.metalnessMap.wrapS = this.$THREE.RepeatWrapping
                    material.normalMap.wrapS = this.$THREE.RepeatWrapping
                    group.traverse((child) => {
                        if (child.isMesh) {
                            child.material = material
                        }
                    })
                    group.position.x = - 0.45
                    group.rotation.y = - Math.PI / 2
                    this.scene.add(group)
                })
            new RGBELoader()
                .setDataType(this.$THREE.UnsignedByteType)
                .setPath('static/textures/equirectangular/')
                .load('venice_sunset_1k.hdr', (hdrEquirect) => {
                    var hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect)
                    hdrEquirect.dispose()
                    pmremGenerator.dispose()
                    this.scene.background = hdrCubeRenderTarget.texture
                    this.scene.environment = hdrCubeRenderTarget.texture
                })
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            //
            if (this.statsEnabled) {
                this.stats = new this.$Stats()
                this.$statsPosition(this.stats)
                this.container.appendChild(this.stats.dom)
            }
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            if (this.statsEnabled) this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglMaterialsStandard-container {
    position: relative;
    width: 100%;
}
</style>
