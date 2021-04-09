<template>
    <div class="webglMaterialsPhysicalTransmission-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">threejs</a> - Transmission with Premultiplied Alpha (right) and without (left)</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            params: {
				color: 0xffffff,
				transmission: 0.90,
				envMapIntensity: 1,
				lightIntensity: 1,
				exposure: 1
			},
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			hdrCubeRenderTarget: null,
            mesh1: null,
            mesh2: null,
            gui: null,
            hdrEquirect: null,
        }
    },
    mounted() {
        this.hdrEquirect = new RGBELoader()
            .setDataType(this.$THREE.UnsignedByteType)
            .setPath('static/textures/equirectangular/')
            .load('royal_esplanade_1k.hdr', () => {
                this.init()
                this.animate()
            })
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsPhysicalTransmission-container')[0].appendChild(this.container)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.container.appendChild(this.renderer.domElement)
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = this.params.exposure
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.scene = new this.$THREE.Scene()
            this.scene.background = this.hdrEquirect
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.set(0, 0, 120)
            //
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            this.hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(this.hdrEquirect)
            this.hdrEquirect.dispose()
            pmremGenerator.dispose()
            this.scene.background = this.hdrCubeRenderTarget.texture
            //
            var geometry = new this.$THREE.SphereBufferGeometry(20, 64, 32)
            var texture = new this.$THREE.CanvasTexture(this.generateTexture())
            texture.magFilter = this.$THREE.NearestFilter
            texture.wrapT = this.$THREE.RepeatWrapping
            texture.wrapS = this.$THREE.RepeatWrapping
            texture.repeat.set(1, 3.5)
            var material = new this.$THREE.MeshPhysicalMaterial({
                color: this.params.color,
                metalness: 0,
                roughness: 0,
                alphaMap: texture,
                alphaTest: 0.5,
                envMap: this.hdrCubeRenderTarget.texture,
                envMapIntensity: this.params.envMapIntensity,
                depthWrite: false,
                transmission: this.params.transmission, // use material.transmission for glass materials
                opacity: 1, // set material.opacity to 1 when material.transmission is non-zero
                transparent: true
            })
            var material1 = new this.$THREE.MeshPhysicalMaterial().copy(material)
            var material1b = new this.$THREE.MeshPhysicalMaterial().copy(material)
            material1b.side = this.$THREE.BackSide
            var material2 = new this.$THREE.MeshPhysicalMaterial().copy(material)
            material2.premultipliedAlpha = true
            var material2b = new this.$THREE.MeshPhysicalMaterial().copy(material)
            material2b.premultipliedAlpha = true
            material2b.side = this.$THREE.BackSide
            this.mesh1 = new this.$THREE.Mesh(geometry, material1)
            this.mesh1.position.x = - 30.0
            this.scene.add(this.mesh1)
            var mesh = new this.$THREE.Mesh(geometry, material1b)
            mesh.renderOrder = - 1
            this.mesh1.add(mesh)
            this.mesh2 = new this.$THREE.Mesh(geometry, material2)
            this.mesh2.position.x = 30.0
            this.scene.add(this.mesh2)
            mesh = new this.$THREE.Mesh(geometry, material2b)
            mesh.renderOrder = - 1
            this.mesh2.add(mesh)
            //
            var spotLight1 = new this.$THREE.SpotLight(0xffffff, this.params.lightIntensity)
            spotLight1.position.set(100, 200, 100)
            spotLight1.angle = Math.PI / 6
            this.scene.add(spotLight1)
            var spotLight2 = new this.$THREE.SpotLight(0xffffff, this.params.lightIntensity)
            spotLight2.position.set(- 100, - 200, - 100)
            spotLight2.angle = Math.PI / 6
            this.scene.add(spotLight2)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 10
            controls.maxDistance = 150
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.gui = new GUI()
            this.gui.addColor(this.params, 'color')
                .onChange(() => {
                    material1.color.set(this.params.color)
                    material2.color.set(this.params.color)
                    material1b.color.set(this.params.color)
                    material2b.color.set(this.params.color)
                })
            this.gui.add(this.params, 'transmission', 0, 1)
                .onChange(() => {
                    material1.transmission = material2.transmission = this.params.transmission
                    material1b.transmission = material2b.transmission = this.params.transmission
                })
            this.gui.add(this.params, 'envMapIntensity', 0, 1)
                .name('envMap intensity')
                .onChange(() => {
                    material1.envMapIntensity = material2.envMapIntensity = this.params.envMapIntensity
                    material1b.envMapIntensity = material2b.envMapIntensity = this.params.envMapIntensity
                })
            this.gui.add(this.params, 'lightIntensity', 0, 1)
                .name('light intensity')
                .onChange(() => {
                    spotLight1.intensity = spotLight2.intensity = this.params.lightIntensity
                })
            this.gui.add(this.params, 'exposure', 0, 1)
                .onChange(() => {
                    this.renderer.toneMappingExposure = this.params.exposure
                })
            this.gui.open()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        generateTexture() {
            var canvas = document.createElement('canvas')
            canvas.width = 2
            canvas.height = 2
            var context = canvas.getContext('2d')
            context.fillStyle = 'white'
            context.fillRect(0, 1, 2, 1)
            return canvas
        },
        animate() {
            requestAnimationFrame(this.animate)
            var t = performance.now()
            this.mesh1.rotation.x = this.mesh2.rotation.x = t * 0.0002
            this.mesh1.rotation.z = this.mesh2.rotation.z = - t * 0.0002
            this.stats.begin()
            this.renderer.render(this.scene, this.camera)
            this.stats.end()
        }
    },
}
</script>

<style scoped>
.webglMaterialsPhysicalTransmission-container {
    position: relative;
    width: 100%;
}
</style>
