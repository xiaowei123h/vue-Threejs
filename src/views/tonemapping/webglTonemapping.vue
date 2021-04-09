<template>
    <div class="webglTonemapping-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Tone Mapping<br />
			Battle Damaged Sci-fi Helmet by
			<a href="https://sketchfab.com/theblueturtle_" target="_blank" rel="noopener">theblueturtle_</a><br />
			<a href="https://hdrihaven.com/hdri/?h=royal_esplanade" target="_blank" rel="noopener">Royal Esplanade</a> by <a href="https://hdrihaven.com/" target="_blank" rel="noopener">HDRI Haven</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            mesh: null,
            renderer: null,
            scene: null,
            camera: null,
            controls: null,
            gui: null,
            guiExposure: null,
			params: {
				exposure: 1.0,
				toneMapping: 'ACESFilmic'
			},
			toneMappingOptions: null,
        }
    },
    mounted() {
        this.toneMappingOptions = {
            None: this.$THREE.NoToneMapping,
            Linear: this.$THREE.LinearToneMapping,
            Reinhard: this.$THREE.ReinhardToneMapping,
            Cineon: this.$THREE.CineonToneMapping,
            ACESFilmic: this.$THREE.ACESFilmicToneMapping,
            Custom: this.$THREE.CustomToneMapping
        }
        this.init().catch((err) => {
            console.error(err)
        })
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        async init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglTonemapping-container')[0].appendChild(this.renderer.domElement)
            this.renderer.toneMapping = this.toneMappingOptions[ this.params.toneMapping ]
            this.renderer.toneMappingExposure = this.params.exposure
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            // Set CustomToneMapping to Uncharted2
            // source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
            this.$THREE.ShaderChunk.tonemapping_pars_fragment = this.$THREE.ShaderChunk.tonemapping_pars_fragment.replace(
                'vec3 CustomToneMapping(vec3 color) { return color; }',
                `#define Uncharted2Helper(x) max(((x * (0.15 * x + 0.10 * 0.50) + 0.20 * 0.02) / (x * (0.15 * x + 0.50) + 0.20 * 0.30)) - 0.02 / 0.30, vec3(0.0))
                float toneMappingWhitePoint = 1.0;
                vec3 CustomToneMapping(vec3 color) {
                    color *= toneMappingExposure;
                    return saturate(Uncharted2Helper(color) / Uncharted2Helper(vec3(toneMappingWhitePoint)));
                }`
            );
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.25, 20)
            this.camera.position.set(- 1.8, 0.6, 2.7)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.addEventListener('change', this.render) // use if there is no animation loop
            this.controls.enableZoom = false
            this.controls.enablePan = false
            this.controls.target.set(0, 0, - 0.2)
            this.controls.update()
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            var rgbeLoader = new RGBELoader()
                .setDataType(this.$THREE.UnsignedByteType)
                .setPath('static/textures/equirectangular/')
            var gltfLoader = new GLTFLoader().setPath('static/models/gltf/DamagedHelmet/glTF/')
            var [ texture, gltf ] = await Promise.all([
                rgbeLoader.loadAsync('venice_sunset_1k.hdr'),
                gltfLoader.loadAsync('DamagedHelmet.gltf'),
            ])
            // environment
            var envMap = pmremGenerator.fromEquirectangular(texture).texture
            this.scene.background = envMap
            this.scene.environment = envMap
            texture.dispose()
            pmremGenerator.dispose()
            // model
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    this.mesh = child
                    this.scene.add(this.mesh)
                }
            })
            this.render()
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI()
            this.gui.add(this.params, 'toneMapping', Object.keys(this.toneMappingOptions))
                .onChange(() => {
                    this.updateGUI()
                    this.renderer.toneMapping = this.toneMappingOptions[ this.params.toneMapping ]
                    this.mesh.material.needsUpdate = true
                    this.render()
                })
            this.updateGUI()
            this.gui.open()
        },
        updateGUI() {
            if (this.guiExposure !== null) {
                this.gui.remove(this.guiExposure)
                this.guiExposure = null
            }
            if (this.params.toneMapping !== 'None') {
                this.guiExposure = this.gui.add(this.params, 'exposure', 0, 2)
                    .onChange(() => {
                        this.renderer.toneMappingExposure = this.params.exposure
                        this.render()
                    })
            }
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglTonemapping-container {
    position: relative;
    width: 100%;
}
</style>
