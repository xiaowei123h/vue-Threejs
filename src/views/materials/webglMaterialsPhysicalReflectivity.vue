<template>
    <div class="webglMaterialsPhysicalReflectivity-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">threejs</a> - Physical Material Reflectivity (reflectance at F0)<br/>
			example by <a href="http://clara.io/" target="_blank" rel="noopener">Ben Houston</a>.
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
			params: {
				projection: 'normal',
				autoRotate: true,
				reflectivity: 1.0,
				background: false,
				exposure: 1.0,
				gemColor: 'Green'
			},
            camera: null,
            scene: null,
            renderer: null,
            gemBackMaterial: null,
            gemFrontMaterial: null,
			hdrCubeRenderTarget: null,
            objects: [],
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
            document.getElementsByClassName('webglMaterialsPhysicalReflectivity-container')[0].appendChild(this.container)
            this.camera = new this.$moduleTHREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0.0, - 10, 20 * 3.5)
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0x000000)
            this.renderer = new this.$moduleTHREE.WebGLRenderer({ antialias: true })
            this.gemBackMaterial = new this.$moduleTHREE.MeshPhysicalMaterial({
                map: null,
                color: 0x0000ff,
                metalness: 1,
                roughness: 0,
                opacity: 0.5,
                side: this.$moduleTHREE.BackSide,
                transparent: true,
                envMapIntensity: 5,
                premultipliedAlpha: true
                // TODO: Add custom blend mode that modulates background color by this materials color.
            })
            this.gemFrontMaterial = new this.$moduleTHREE.MeshPhysicalMaterial({
                map: null,
                color: 0x0000ff,
                metalness: 0,
                roughness: 0,
                opacity: 0.25,
                side: this.$moduleTHREE.FrontSide,
                transparent: true,
                envMapIntensity: 10,
                premultipliedAlpha: true
            })
            var manager = new this.$moduleTHREE.LoadingManager()
            manager.onProgress = function (item, loaded, total) {
                console.log(item, loaded, total)
            }
            var loader = new OBJLoader(manager)
            loader.load('static/models/obj/emerald.obj', (object) => {
                object.traverse((child) => {
                    console.log(child instanceof this.$moduleTHREE.Mesh)
                    if (child instanceof this.$moduleTHREE.Mesh) {
                        child.material = this.gemBackMaterial
                        var second = child.clone()
                        second.material = this.gemFrontMaterial
                        var parent = new this.$moduleTHREE.Group()
                        parent.add(second)
                        parent.add(child)
                        console.log(parent)
                        this.scene.add(parent)
                        this.objects.push(parent)
                    }
                })
            })
            new RGBELoader()
                .setDataType(this.$moduleTHREE.UnsignedByteType)
                .setPath('static/textures/equirectangular/')
                .load('royal_esplanade_1k.hdr', (hdrEquirect) => {
                    this.hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect)
                    pmremGenerator.dispose()
                    this.gemFrontMaterial.envMap = this.gemBackMaterial.envMap = this.hdrCubeRenderTarget.texture
                    this.gemFrontMaterial.needsUpdate = this.gemBackMaterial.needsUpdate = true
                    hdrEquirect.dispose()
                })
            var pmremGenerator = new this.$moduleTHREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            // Lights
            this.scene.add(new this.$moduleTHREE.AmbientLight(0x222222))
            var pointLight1 = new this.$moduleTHREE.PointLight(0xffffff)
            pointLight1.position.set(150, 10, 0)
            pointLight1.castShadow = false
            this.scene.add(pointLight1)
            var pointLight2 = new this.$moduleTHREE.PointLight(0xffffff)
            pointLight2.position.set(- 150, 0, 0)
            this.scene.add(pointLight2)
            var pointLight3 = new this.$moduleTHREE.PointLight(0xffffff)
            pointLight3.position.set(0, - 10, - 150)
            this.scene.add(pointLight3)
            var pointLight4 = new this.$moduleTHREE.PointLight(0xffffff)
            pointLight4.position.set(0, 0, 150)
            this.scene.add(pointLight4)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$moduleTHREE.sRGBEncoding
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 20
            controls.maxDistance = 200
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI()
            this.gui.add(this.params, 'reflectivity', 0, 1)
            this.gui.add(this.params, 'exposure', 0.1, 2)
            this.gui.add(this.params, 'autoRotate')
            this.gui.add(this.params, 'gemColor', [ 'Blue', 'Green', 'Red', 'White', 'Black' ])
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
            if (this.gemBackMaterial !== undefined && this.gemFrontMaterial !== undefined) {
                this.gemFrontMaterial.reflectivity = this.gemBackMaterial.reflectivity = this.params.reflectivity
                let newColor = this.gemBackMaterial.color
                switch (this.params.gemColor) {
                    case 'Blue': newColor = new this.$moduleTHREE.Color(0x000088); break
                    case 'Red': newColor = new this.$moduleTHREE.Color(0x880000); break
                    case 'Green': newColor = new this.$moduleTHREE.Color(0x008800); break
                    case 'White': newColor = new this.$moduleTHREE.Color(0x888888); break
                    case 'Black': newColor = new this.$moduleTHREE.Color(0x0f0f0f); break
                }
                this.gemBackMaterial.color = this.gemFrontMaterial.color = newColor
            }
            this.renderer.toneMappingExposure = this.params.exposure
            this.camera.lookAt(this.scene.position)
            if (this.params.autoRotate) {
                for (var i = 0, l = this.objects.length; i < l; i ++) {
                    var object = this.objects[ i ]
                    object.rotation.y += 0.005
                }
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsPhysicalReflectivity-container {
    position: relative;
    width: 100%;
}
</style>
