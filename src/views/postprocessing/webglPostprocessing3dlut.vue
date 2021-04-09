<template>
    <div class="webglPostprocessing3dlut-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - 3D LUTs<br />
			Battle Damaged Sci-fi Helmet by
			<a href="https://sketchfab.com/theblueturtle_" target="_blank" rel="noopener">theblueturtle_</a><br />
			<a href="https://hdrihaven.com/hdri/?h=royal_esplanade" target="_blank" rel="noopener">Royal Esplanade</a> by <a href="https://hdrihaven.com/" target="_blank" rel="noopener">HDRI Haven</a><br />
			LUTs from <a href="https://www.rocketstock.com/free-after-effects-templates/35-free-luts-for-color-grading-videos/">RocketStock</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { LUTPass } from '@/components/jsm/postprocessing/LUTPass.js'
import { LUTCubeLoader } from '@/components/jsm/loaders/LUTCubeLoader.js'
import { GammaCorrectionShader } from '@/components/jsm/shaders/GammaCorrectionShader.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            params: {
				enabled: true,
				lut: 'Bourbon 64.CUBE',
				intensity: 1,
				use2dLut: false,
			},
			lutMap: {
				'Bourbon 64.CUBE': null,
				'Chemical 168.CUBE': null,
				'Clayton 33.CUBE': null,
				'Cubicle 99.CUBE': null,
				'Remy 24.CUBE': null,
			},
			gui: null,
            camera: null,
            scene: null,
            renderer: null,
            composer: null,
            lutPass: null,
        }
    },
    mounted() {
        this.init()
		this.render()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglPostprocessing3dlut-container')[0].appendChild(container)
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
                    // model
                    var loader = new GLTFLoader().setPath('static/models/gltf/DamagedHelmet/glTF/')
                    loader.load('DamagedHelmet.gltf', (gltf) => {
                        this.scene.add(gltf.scene)
                    })
                })
            Object.keys(this.lutMap).forEach(name => {
                new LUTCubeLoader()
                    .load('static/luts/' + name, (result) => {
                        this.lutMap[ name ] = result
                    })
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 1
            container.appendChild(this.renderer.domElement)
            var target = new this.$THREE.WebGLRenderTarget({
                minFilter: this.$THREE.LinearFilter,
                magFilter: this.$THREE.LinearFilter,
                format: this.$THREE.RGBAFormat,
                encoding: this.$THREE.sRGBEncoding
            })
            this.composer = new EffectComposer(this.renderer, target)
            this.composer.setPixelRatio(window.devicePixelRatio)
            this.composer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.composer.addPass(new RenderPass(this.scene, this.camera))
            this.composer.addPass(new ShaderPass(GammaCorrectionShader))
            this.lutPass = new LUTPass()
            this.composer.addPass(this.lutPass)
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 2
            controls.maxDistance = 10
            controls.target.set(0, 0, - 0.2)
            controls.update()
            this.gui = new GUI()
            this.gui.width = 350
            this.gui.add(this.params, 'enabled')
            this.gui.add(this.params, 'lut', Object.keys(this.lutMap))
            this.gui.add(this.params, 'intensity').min(0).max(1)
            if (this.renderer.capabilities.isWebGL2) {
                this.gui.add(this.params, 'use2dLut')
            } else {
                this.params.use2DLut = true
            }
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(window.innerWidth - 281, window.innerHeight)
            this.render()
        },
        render() {
            requestAnimationFrame(this.render)
            this.lutPass.enabled = this.params.enabled && Boolean(this.lutMap[ this.params.lut ])
            this.lutPass.intensity = this.params.intensity
            if (this.lutMap[ this.params.lut ]) {
                var lut = this.lutMap[ this.params.lut ]
                this.lutPass.lut = this.params.use2DLut ? lut.texture : lut.texture3D
            }
            this.composer.render()
        }
    },
}
</script>

<style scoped>
.webglPostprocessing3dlut-container {
    position: relative;
    width: 100%;
}
</style>
