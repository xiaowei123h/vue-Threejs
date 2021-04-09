<template>
    <div class="webglMaterialsEnvmapsExr-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">threejs</a> - Example of an IBL (Image based lighting) pipeline based around<br> equirectangular EXR lightprobe data. Created by <a href="https://github.com/richardmonette" target="_blank" rel="noopener">Richard Monette</a></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { EXRLoader } from '@/components/jsm/loaders/EXRLoader.js'
export default {
    data() {
        return {
            params: {
				envMap: 'EXR',
				roughness: 0.0,
				metalness: 0.0,
				exposure: 1.0,
				debug: false,
			},
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            torusMesh: null,
            planeMesh: null,
            pngCubeRenderTarget: null,
            exrCubeRenderTarget: null,
            pngBackground: null,
            exrBackground: null,
            gui: null
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsEnvmapsExr-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 120)
            this.scene = new this.$THREE.Scene()
            this.renderer = new this.$THREE.WebGLRenderer()
            //
            var geometry = new this.$THREE.TorusKnotBufferGeometry(18, 8, 150, 20)
            var material = new this.$THREE.MeshStandardMaterial({
                metalness: this.params.roughness,
                roughness: this.params.metalness,
                envMapIntensity: 1.0
            })
            this.torusMesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.torusMesh)
            geometry = new this.$THREE.PlaneBufferGeometry(200, 200)
            material = new this.$THREE.MeshBasicMaterial()
            this.planeMesh = new this.$THREE.Mesh(geometry, material)
            this.planeMesh.position.y = - 50
            this.planeMesh.rotation.x = - Math.PI * 0.5
            this.scene.add(this.planeMesh)
            this.$THREE.DefaultLoadingManager.onLoad = () => {
                pmremGenerator.dispose()
            }
            new EXRLoader()
                .setDataType(this.$THREE.UnsignedByteType)
                .load('static/textures/piz_compressed.exr', (texture) => {
                    this.exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture)
                    this.exrBackground = this.exrCubeRenderTarget.texture
                    texture.dispose()
                })
            new this.$THREE.TextureLoader().load('static/textures/equirectangular.png', (texture) => {
                texture.encoding = this.$THREE.sRGBEncoding
                this.pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture)
                this.pngBackground = this.pngCubeRenderTarget.texture
                texture.dispose()
            })
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 50
            this.controls.maxDistance = 300
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI()
            this.gui.add(this.params, 'envMap', [ 'EXR', 'PNG' ])
            this.gui.add(this.params, 'roughness', 0, 1, 0.01)
            this.gui.add(this.params, 'metalness', 0, 1, 0.01)
            this.gui.add(this.params, 'exposure', 0, 2, 0.01)
            this.gui.add(this.params, 'debug', false)
            this.gui.open()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            this.torusMesh.material.roughness = this.params.roughness
            this.torusMesh.material.metalness = this.params.metalness
            var newEnvMap = this.torusMesh.material.envMap
            var background = this.scene.background
            switch (this.params.envMap) {
                case 'EXR':
                    newEnvMap = this.exrCubeRenderTarget ? this.exrCubeRenderTarget.texture : null
                    background = this.exrBackground
                    break
                case 'PNG':
                    newEnvMap = this.pngCubeRenderTarget ? this.pngCubeRenderTarget.texture : null
                    background = this.pngBackground
                    break
            }
            if (newEnvMap !== this.torusMesh.material.envMap) {
                this.torusMesh.material.envMap = newEnvMap
                this.torusMesh.material.needsUpdate = true
                this.planeMesh.material.map = newEnvMap
                this.planeMesh.material.needsUpdate = true
            }
            this.torusMesh.rotation.y += 0.005
            this.planeMesh.visible = this.params.debug
            this.scene.background = background
            this.renderer.toneMappingExposure = this.params.exposure
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsEnvmapsExr-container {
    position: relative;
    width: 100%;
}
</style>
