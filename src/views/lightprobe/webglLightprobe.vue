<template>
    <div class="webglLightprobe-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - light probe
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { LightProbeGenerator } from '@/components/jsm/lights/LightProbeGenerator.js'
export default {
    data() {
        return {
            mesh: null,
            renderer: null,
            scene: null,
            camera: null,
			gui: null,
			lightProbe: null,
			directionalLight: null,
			// linear color space
			API: null,
        }
    },
    mounted() {
        this.API = {
            lightProbeIntensity: 1.0,
            directionalLightIntensity: 0.2,
            envMapIntensity: 1
        };
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLightprobe-container')[0].appendChild(this.renderer.domElement)
            // tone mapping
            this.renderer.toneMapping = this.$THREE.NoToneMapping
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 30)
            // controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            controls.minDistance = 10
            controls.maxDistance = 50
            controls.enablePan = false
            // probe
            this.lightProbe = new this.$THREE.LightProbe()
            this.scene.add(this.lightProbe)
            // light
            this.directionalLight = new this.$THREE.DirectionalLight(0xffffff, this.API.directionalLightIntensity)
            this.directionalLight.position.set(10, 10, 10)
            this.scene.add(this.directionalLight)
            // envmap
            var genCubeUrls = (prefix, postfix) => {
                return [
                    prefix + 'px' + postfix, prefix + 'nx' + postfix,
                    prefix + 'py' + postfix, prefix + 'ny' + postfix,
                    prefix + 'pz' + postfix, prefix + 'nz' + postfix
                ]
            }
            var urls = genCubeUrls('static/textures/cube/pisa/', '.png')
            new this.$THREE.CubeTextureLoader().load(urls, (cubeTexture) => {
                cubeTexture.encoding = this.$THREE.sRGBEncoding
                this.scene.background = cubeTexture
                this.lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture))
                var geometry = new this.$THREE.SphereBufferGeometry(5, 64, 32)
                //var geometry = new TorusKnotBufferGeometry(4, 1.5, 256, 32, 2, 3)
                var material = new this.$THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0,
                    roughness: 0,
                    envMap: cubeTexture,
                    envMapIntensity: this.API.envMapIntensity,
                })
                // mesh
                this.mesh = new this.$THREE.Mesh(geometry, material)
                this.scene.add(this.mesh)
                this.render()
            })
            // gui
            this.gui = new GUI()
            this.gui.width = 300
            this.gui.domElement.style.userSelect = 'none'
            var fl = this.gui.addFolder('Intensity')
            fl.add(this.API, 'lightProbeIntensity', 0, 1, 0.02)
                .name('light probe')
                .onChange(() => {
                    this.lightProbe.intensity = this.API.lightProbeIntensity; this.render()
                })
            fl.add(this.API, 'directionalLightIntensity', 0, 1, 0.02)
                .name('directional light')
                .onChange(() => {
                    this.directionalLight.intensity = this.API.directionalLightIntensity; this.render()
                })
            fl.add(this.API, 'envMapIntensity', 0, 1, 0.02)
                .name('envMap')
                .onChange(() => {
                    this.mesh.material.envMapIntensity = this.API.envMapIntensity; this.render()
                })
            fl.open()
            // listener
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
.webglLightprobe-container {
    position: relative;
    width: 100%;
}
</style>
