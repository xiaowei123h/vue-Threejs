<template>
    <div class="webglMaterialsEnvmapsPmremNodes-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">threejs</a> - High dynamic range (RGBE) Image-based Lighting (IBL)<br />using run-time generated pre-filtered roughness mipmaps (PMREM)<br/>
			Created by Prashant Sharma and <a href="http://clara.io/" target="_blank" rel="noopener">Ben Houston</a>.</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { HDRCubeTextureLoader } from '@/components/jsm/loaders/HDRCubeTextureLoader.js'
import {
    StandardNodeMaterial,
    FloatNode,
    OperatorNode,
    TextureNode,
    TextureCubeNode
} from '@/components/jsm/nodes/Nodes.js'
export default {
    data() {
        return {
            params: {
				roughness: 0.0,
				metalness: 0.0,
				exposure: 1.0,
				intensity: 1.0,
				animate: true,
				debug: false
			},
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            nodeMaterial: null,
            nodeTexture: null,
            nodeTextureIntensity: null,
            torusMesh: null,
            planeMesh: null,
			hdrCubeRenderTarget: null,
            hdrCubeMap: null,
            gui: null,
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
            document.getElementsByClassName('webglMaterialsEnvmapsPmremNodes-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 120)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x000000)
            this.renderer = new this.$THREE.WebGLRenderer()
            //
            var geometry = new this.$THREE.TorusKnotBufferGeometry(18, 8, 150, 20)
            this.nodeMaterial = new StandardNodeMaterial()
            this.nodeMaterial.color.value = new this.$THREE.Color(0xffffff)
            this.nodeMaterial.roughness.value = this.params.metalness
            this.nodeMaterial.metalness.value = this.params.roguhness
            this.nodeMaterial.visible = false
            this.nodeTexture = new TextureNode()
            this.nodeTextureIntensity = new FloatNode(1)
            this.nodeMaterial.environment = new OperatorNode(new TextureCubeNode(this.nodeTexture), this.nodeTextureIntensity, OperatorNode.MUL)
            this.torusMesh = new this.$THREE.Mesh(geometry, this.nodeMaterial)
            this.scene.add(this.torusMesh)
            this.planeMesh = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(200, 200), new this.$THREE.MeshBasicMaterial())
            this.planeMesh.position.y = - 50
            this.planeMesh.rotation.x = - Math.PI * 0.5
            this.scene.add(this.planeMesh)
            var hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ]
            this.hdrCubeMap = new HDRCubeTextureLoader()
                .setPath('static/textures/cube/pisaHDR/')
                .setDataType(this.$THREE.UnsignedByteType)
                .load(hdrUrls, () => {
                    this.hdrCubeRenderTarget = pmremGenerator.fromCubemap(this.hdrCubeMap)
                    pmremGenerator.dispose()
                    this.nodeTexture.value = this.hdrCubeRenderTarget.texture
                    this.hdrCubeMap.magFilter = this.$THREE.LinearFilter
                    this.hdrCubeMap.needsUpdate = true
                    this.planeMesh.material.map = this.hdrCubeRenderTarget.texture
                    this.planeMesh.material.needsUpdate = true
                    this.nodeMaterial.visible = true
                })
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileCubemapShader()
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
            this.gui.add(this.params, 'roughness', 0, 1, 0.01)
            this.gui.add(this.params, 'metalness', 0, 1, 0.01)
            this.gui.add(this.params, 'exposure', 0, 2, 0.01)
            this.gui.add(this.params, 'intensity', 0, 2, 0.01)
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
            this.torusMesh.material.roughness.value = this.params.roughness
            this.torusMesh.material.metalness.value = this.params.metalness
            this.nodeTextureIntensity.value = this.params.intensity
            if (this.params.animate) {
                this.torusMesh.rotation.y += 0.005
            }
            this.planeMesh.visible = this.params.debug
            this.scene.background = this.hdrCubeMap
            this.renderer.toneMappingExposure = this.params.exposure
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsEnvmapsPmremNodes-container {
    position: relative;
    width: 100%;
    color: #fff;
    font-family:Monospace;
    font-size:13px;
    text-align:center;

    background-color: #000;

    margin: 0px;
    overflow: hidden;
}
#info a { color: #00f }

#info {
    position: absolute;
    top: 0px; width: 100%;
    left: 281px;
    padding: 5px;
}
</style>
