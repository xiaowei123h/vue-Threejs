<template>
    <div class="webglMaterialsEnvmapsHdrNodes-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">threejs</a> - High dynamic range (RGBE) Image-based Lighting (IBL)<br />using run-time generated pre-filtered roughness mipmaps (PMREM)<br/>
			Created by Prashant Sharma and <a href="http://clara.io/" target="_blank" rel="noopener">Ben Houston</a>.
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { HDRCubeTextureLoader } from '@/components/jsm/loaders/HDRCubeTextureLoader.js'
import { MeshStandardNodeMaterial } from '@/components/jsm/nodes/Nodes.js'
export default {
    data() {
        return {
            params: {
				envMap: 'HDR',
				roughness: 0.0,
				metalness: 0.0,
				exposure: 1.0,
				nodes: true,
				animate: true,
				debug: false
			},
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            torusMesh: null,
            torusMeshNode: null,
            planeMesh: null,
            generatedCubeRenderTarget: null,
            ldrCubeRenderTarget: null,
            hdrCubeRenderTarget: null,
            rgbmCubeRenderTarget: null,
            ldrCubeMap: null,
            hdrCubeMap: null,
            rgbmCubeMap: null,
            gui: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        getEnvScene() {
            var envScene = new this.$THREE.Scene()
            var geometry = new this.$THREE.BoxBufferGeometry()
            geometry.deleteAttribute('uv')
            var roomMaterial = new this.$THREE.MeshStandardMaterial({ metalness: 0, side: this.$THREE.BackSide })
            var room = new this.$THREE.Mesh(geometry, roomMaterial)
            room.scale.setScalar(10)
            envScene.add(room)
            var mainLight = new this.$THREE.PointLight(0xffffff, 50, 0, 2)
            envScene.add(mainLight)
            var lightMaterial = new this.$THREE.MeshLambertMaterial({ color: 0x000000, emissive: 0xffffff, emissiveIntensity: 10 })
            var light1 = new this.$THREE.Mesh(geometry, lightMaterial)
            light1.position.set(- 5, 2, 0)
            light1.scale.set(0.1, 1, 1)
            envScene.add(light1)
            var light2 = new this.$THREE.Mesh(geometry, lightMaterial)
            light2.position.set(0, 5, 0)
            light2.scale.set(1, 0.1, 1)
            envScene.add(light2)
            var light3 = new this.$THREE.Mesh(geometry, lightMaterial)
            light3.position.set(2, 1, 5)
            light3.scale.set(1.5, 2, 0.1)
            envScene.add(light3)
            return envScene
        },
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsEnvmapsHdrNodes-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 120)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x000000)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.physicallyCorrectLights = true
            //
            var geometry = new this.$THREE.TorusKnotBufferGeometry(18, 8, 150, 20)
            var material = new this.$THREE.MeshStandardMaterial()
            material.color = new this.$THREE.Color(0xffffff)
            material.roughness = this.params.metalness
            material.metalness = this.params.roguhness
            this.torusMesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.torusMesh)
            material = new MeshStandardNodeMaterial()
            material.color = new this.$THREE.Color(0xffffff)
            material.roughness = this.params.metalness
            material.metalness = this.params.roguhness
            this.torusMeshNode = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.torusMeshNode)
            geometry = new this.$THREE.PlaneBufferGeometry(200, 200)
            material = new this.$THREE.MeshBasicMaterial()
            this.planeMesh = new this.$THREE.Mesh(geometry, material)
            this.planeMesh.position.y = - 50
            this.planeMesh.rotation.x = - Math.PI * 0.5
            this.scene.add(this.planeMesh)
            this.$THREE.DefaultLoadingManager.onLoad = () => {
                pmremGenerator.dispose()
            }
            var hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ]
            this.hdrCubeMap = new HDRCubeTextureLoader()
                .setPath('static/textures/cube/pisaHDR/')
                .setDataType(this.$THREE.UnsignedByteType)
                .load(hdrUrls, () => {
                    this.hdrCubeRenderTarget = pmremGenerator.fromCubemap(this.hdrCubeMap)
                    this.hdrCubeMap.magFilter = this.$THREE.LinearFilter
                    this.hdrCubeMap.needsUpdate = true
                })
            var ldrUrls = [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ]
            this.ldrCubeMap = new this.$THREE.CubeTextureLoader()
                .setPath('static/textures/cube/pisa/')
                .load(ldrUrls, () => {
                    this.ldrCubeMap.encoding = this.$THREE.sRGBEncoding
                    this.ldrCubeRenderTarget = pmremGenerator.fromCubemap(this.ldrCubeMap)
                })
            var rgbmUrls = [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ]
            this.rgbmCubeMap = new this.$THREE.CubeTextureLoader()
                .setPath('static/textures/cube/pisaRGBM16/')
                .load(rgbmUrls, () => {
                    this.rgbmCubeMap.encoding = this.$THREE.RGBM16Encoding
                    this.rgbmCubeMap.format = this.$THREE.RGBAFormat
                    this.rgbmCubeRenderTarget = pmremGenerator.fromCubemap(this.rgbmCubeMap)
                    this.rgbmCubeMap.magFilter = this.$THREE.LinearFilter
                    this.rgbmCubeMap.needsUpdate = true
                })
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileCubemapShader()
            var envScene = this.getEnvScene()
            this.generatedCubeRenderTarget = pmremGenerator.fromScene(envScene, 0.04)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 50
            this.controls.maxDistance = 300
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI()
            this.gui.add(this.params, 'envMap', [ 'Generated', 'LDR', 'HDR', 'RGBM16' ])
            this.gui.add(this.params, 'roughness', 0, 1, 0.01)
            this.gui.add(this.params, 'metalness', 0, 1, 0.01)
            this.gui.add(this.params, 'exposure', 0, 2, 0.01)
            this.gui.add(this.params, 'nodes', true)
            this.gui.add(this.params, 'animate', true)
            this.gui.add(this.params, 'debug', false)
            this.gui.open()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            this.torusMesh.visible = ! this.params.nodes
            this.torusMeshNode.visible = this.params.nodes
            this.torusMesh.material.roughness = this.params.roughness
            this.torusMesh.material.metalness = this.params.metalness
            this.torusMeshNode.material.roughness = this.params.roughness
            this.torusMeshNode.material.metalness = this.params.metalness
            var renderTarget, cubeMap
            switch (this.params.envMap) {
                case 'Generated':
                    renderTarget = this.generatedCubeRenderTarget
                    cubeMap = this.generatedCubeRenderTarget.texture
                    break
                case 'LDR':
                    renderTarget = this.ldrCubeRenderTarget
                    cubeMap = this.ldrCubeMap
                    break
                case 'HDR':
                    renderTarget = this.hdrCubeRenderTarget
                    cubeMap = this.hdrCubeMap
                    break
                case 'RGBM16':
                    renderTarget = this.rgbmCubeRenderTarget
                    cubeMap = this.rgbmCubeMap
                    break
            }
            var newEnvMap = renderTarget ? renderTarget.texture : null
            if (newEnvMap && newEnvMap !== this.torusMesh.material.envMap) {
                this.torusMesh.material.envMap = newEnvMap
                this.torusMesh.material.needsUpdate = true
                this.torusMeshNode.material.envMap = newEnvMap
                this.torusMeshNode.material.needsUpdate = true
                this.planeMesh.material.map = newEnvMap
                this.planeMesh.material.needsUpdate = true
            }
            if (this.params.animate) {
                this.torusMesh.rotation.y += 0.005
                this.torusMeshNode.rotation.y = this.torusMesh.rotation.y
            }
            this.planeMesh.visible = this.params.debug
            this.scene.background = cubeMap
            this.renderer.toneMappingExposure = this.params.exposure
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsEnvmapsHdrNodes-container {
    width: 100%;
}
</style>