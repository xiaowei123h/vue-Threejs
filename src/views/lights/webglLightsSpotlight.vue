<template>
    <div class="webglLightsSpotlight-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - spotlight by <a href="http://master-domain.com" target="_blank" rel="noopener">Master James</a><br />
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            spotLight: null,
            lightHelper: null,
            shadowCameraHelper: null,
			gui: null,
        }
    },
    mounted() {
        this.init()
        this.buildGui()
        this.render()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLightsSpotlight-container')[0].appendChild(this.renderer.domElement)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(160, 40, 10)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            controls.minDistance = 20
            controls.maxDistance = 500
            controls.enablePan = false
            var ambient = new this.$THREE.AmbientLight(0xffffff, 0.1)
            this.scene.add(ambient)
            this.spotLight = new this.$THREE.SpotLight(0xffffff, 1)
            this.spotLight.position.set(15, 40, 35)
            this.spotLight.angle = Math.PI / 4
            this.spotLight.penumbra = 0.1
            this.spotLight.decay = 2
            this.spotLight.distance = 200
            this.spotLight.castShadow = true
            this.spotLight.shadow.mapSize.width = 512
            this.spotLight.shadow.mapSize.height = 512
            this.spotLight.shadow.camera.near = 10
            this.spotLight.shadow.camera.far = 200
            this.spotLight.shadow.focus = 1
            this.scene.add(this.spotLight)
            this.lightHelper = new this.$THREE.SpotLightHelper(this.spotLight)
            this.scene.add(this.lightHelper)
            this.shadowCameraHelper = new this.$THREE.CameraHelper(this.spotLight.shadow.camera)
            this.scene.add(this.shadowCameraHelper)
            //
            var material = new this.$THREE.MeshPhongMaterial({ color: 0x808080, dithering: true })
            var geometry = new this.$THREE.PlaneBufferGeometry(2000, 2000)
            var mesh = new this.$THREE.Mesh(geometry, material)
            mesh.position.set(0, - 1, 0)
            mesh.rotation.x = - Math.PI * 0.5
            mesh.receiveShadow = true
            this.scene.add(mesh)
            //
            material = new this.$THREE.MeshPhongMaterial({ color: 0x4080ff, dithering: true })
            geometry = new this.$THREE.CylinderBufferGeometry(5, 5, 2, 32, 1, false)
            mesh = new this.$THREE.Mesh(geometry, material)
            mesh.position.set(0, 5, 0)
            mesh.castShadow = true
            this.scene.add(mesh)
            this.render()
            window.addEventListener('resize', this.onResize, false)
        },
        onResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        render() {
            this.lightHelper.update()
            this.shadowCameraHelper.update()
            this.renderer.render(this.scene, this.camera)
        },
        buildGui() {
            this.gui = new GUI()
            var params = {
                'light color': this.spotLight.color.getHex(),
                intensity: this.spotLight.intensity,
                distance: this.spotLight.distance,
                angle: this.spotLight.angle,
                penumbra: this.spotLight.penumbra,
                decay: this.spotLight.decay,
                focus: this.spotLight.shadow.focus
            }
            this.gui.addColor(params, 'light color').onChange((val) => {
                this.spotLight.color.setHex(val)
                this.render()
            })
            this.gui.add(params, 'intensity', 0, 2).onChange((val) => {
                this.spotLight.intensity = val
                this.render()
            })

            this.gui.add(params, 'distance', 50, 200).onChange((val) => {
                this.spotLight.distance = val
                this.render()
            })
            this.gui.add(params, 'angle', 0, Math.PI / 3).onChange((val) => {
                this.spotLight.angle = val
                this.render()
            })
            this.gui.add(params, 'penumbra', 0, 1).onChange((val) => {
                this.spotLight.penumbra = val
                this.render()
            })
            this.gui.add(params, 'decay', 1, 2).onChange((val) => {
                this.spotLight.decay = val
                this.render()
            })
            this.gui.add(params, 'focus', 0, 1).onChange((val) => {
                this.spotLight.shadow.focus = val
                this.render()
            })
            this.gui.open()
        }
    }
}
</script>

<style scoped>
.webglLightsSpotlight-container {
    width: 100%;
}
</style>
