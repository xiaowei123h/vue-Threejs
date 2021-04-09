<template>
    <div class="webglShadersSky-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - sky + sun shader
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Sky } from '@/components/jsm/objects/Sky.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            sky: null,
            sun: null,
            gui: null,
        }
    },
    mounted() {
        this.init();
		this.render()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        initSky() {
            // Add Sky
            this.sky = new Sky()
            this.sky.scale.setScalar(450000)
            this.scene.add(this.sky)
            this.sun = new this.$THREE.Vector3()
            /// GUI
            var effectController = {
                turbidity: 10,
                rayleigh: 3,
                mieCoefficient: 0.005,
                mieDirectionalG: 0.7,
                inclination: 0.49, // elevation / inclination
                azimuth: 0.25, // Facing front,
                exposure: this.renderer.toneMappingExposure
            }
            var that = this
            function guiChanged() {
                var uniforms = that.sky.material.uniforms
                uniforms[ "turbidity" ].value = effectController.turbidity
                uniforms[ "rayleigh" ].value = effectController.rayleigh
                uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient
                uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG
                var theta = Math.PI * (effectController.inclination - 0.5)
                var phi = 2 * Math.PI * (effectController.azimuth - 0.5)
                that.sun.x = Math.cos(phi)
                that.sun.y = Math.sin(phi) * Math.sin(theta)
                that.sun.z = Math.sin(phi) * Math.cos(theta)
                uniforms[ "sunPosition" ].value.copy(that.sun)
                that.renderer.toneMappingExposure = effectController.exposure
                that.renderer.render(that.scene, that.camera)
            }
            this.gui = new GUI()
            this.gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged)
            this.gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged)
            this.gui.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged)
            this.gui.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged)
            this.gui.add(effectController, "inclination", 0, 1, 0.0001).onChange(guiChanged)
            this.gui.add(effectController, "azimuth", 0, 1, 0.0001).onChange(guiChanged)
            this.gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged)
            guiChanged()
        },
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 100, 2000000)
            this.camera.position.set(0, 100, 2000)
            this.scene = new this.$THREE.Scene()
            var helper = new this.$THREE.GridHelper(10000, 2, 0xffffff, 0xffffff)
            this.scene.add(helper)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 0.5
            document.getElementsByClassName('webglShadersSky-container')[0].appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            //controls.maxPolarAngle = Math.PI / 2
            controls.enableZoom = false
            controls.enablePan = false
            this.initSky()
            window.addEventListener('resize', this.onWindowResize, false)
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
.webglShadersSky-container {
    position: relative;
    width: 100%;
}
</style>
