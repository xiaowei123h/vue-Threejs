<template>
    <div class="webglLightsRectarealight-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - this.$THREE.RectAreaLight<br/>
			by <a href="http://github.com/abelnation" target="_blank" rel="noopener">abelnation</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from '@/components/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from '@/components/jsm/lights/RectAreaLightUniformsLib.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
			origin: null,
            rectLight: null,
            rectLightHelper: null,
			param: {},
            stats: null,
            gui: null
        }
    },
    mounted() {
        this.origin = new this.$THREE.Vector3()
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            document.getElementsByClassName('webglLightsRectarealight-container')[0].appendChild(this.renderer.domElement)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 20, 35)
            this.scene = new this.$THREE.Scene()
            var ambient = new this.$THREE.AmbientLight(0xffffff, 0.1)
            this.scene.add(ambient)
            RectAreaLightUniformsLib.init()
            this.rectLight = new this.$THREE.RectAreaLight(0xffffff, 1, 10, 10)
            this.rectLight.position.set(5, 5, 0)
            this.scene.add(this.rectLight)
            this.rectLightHelper = new RectAreaLightHelper(this.rectLight)
            this.rectLight.add(this.rectLightHelper)
            var geoFloor = new this.$THREE.BoxBufferGeometry(2000, 0.1, 2000)
            var matStdFloor = new this.$THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0, metalness: 0 })
            var mshStdFloor = new this.$THREE.Mesh(geoFloor, matStdFloor)
            this.scene.add(mshStdFloor)
            var matStdObjects = new this.$THREE.MeshStandardMaterial({ color: 0xA00000, roughness: 0, metalness: 0 })
            var geoBox = new this.$THREE.BoxBufferGeometry(Math.PI, Math.sqrt(2), Math.E)
            var mshStdBox = new this.$THREE.Mesh(geoBox, matStdObjects)
            mshStdBox.position.set(0, 5, 0)
            mshStdBox.rotation.set(0, Math.PI / 2.0, 0)
            mshStdBox.castShadow = true
            mshStdBox.receiveShadow = true
            this.scene.add(mshStdBox)
            var geoSphere = new this.$THREE.SphereBufferGeometry(1.5, 32, 32)
            var mshStdSphere = new this.$THREE.Mesh(geoSphere, matStdObjects)
            mshStdSphere.position.set(- 5, 5, 0)
            mshStdSphere.castShadow = true
            mshStdSphere.receiveShadow = true
            this.scene.add(mshStdSphere)
            var geoKnot = new this.$THREE.TorusKnotBufferGeometry(1.5, 0.5, 100, 16)
            var mshStdKnot = new this.$THREE.Mesh(geoKnot, matStdObjects)
            mshStdKnot.position.set(5, 5, 0)
            mshStdKnot.castShadow = true
            mshStdKnot.receiveShadow = true
            this.scene.add(mshStdKnot)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.copy(mshStdBox.position)
            controls.update()
            // GUI
            this.gui = new GUI({ width: 300 })
            this.gui.open()
            this.param = {
                motion: true,
                width: this.rectLight.width,
                height: this.rectLight.height,
                color: this.rectLight.color.getHex(),
                intensity: this.rectLight.intensity,
                'ambient': ambient.intensity,
                'floor color': matStdFloor.color.getHex(),
                'object color': matStdObjects.color.getHex(),
                'roughness': matStdFloor.roughness,
                'metalness': matStdFloor.metalness
            }
            this.gui.add(this.param, 'motion')
            var lightFolder = this.gui.addFolder('Light')
            lightFolder.add(this.param, 'width', 1, 20).step(0.1).onChange((val) => {
                this.rectLight.width = val
            })
            lightFolder.add(this.param, 'height', 1, 20).step(0.1).onChange((val) => {
                this.rectLight.height = val
            })
            lightFolder.addColor(this.param, 'color').onChange((val) => {
                this.rectLight.color.setHex(val)
            })
            lightFolder.add(this.param, 'intensity', 0.0, 4.0).step(0.01).onChange((val) => {
                this.rectLight.intensity = val
            })
            lightFolder.add(this.param, 'ambient', 0.0, 0.2).step(0.01).onChange((val) => {
                ambient.intensity = val
            })
            lightFolder.open()
            var standardFolder = this.gui.addFolder('Standard Material')
            standardFolder.addColor(this.param, 'floor color').onChange((val) => {
                matStdFloor.color.setHex(val)
            })
            standardFolder.addColor(this.param, 'object color').onChange((val) => {
                matStdObjects.color.setHex(val)
            })
            standardFolder.add(this.param, 'roughness', 0.0, 1.0).step(0.01).onChange((val) => {
                matStdObjects.roughness = val
                matStdFloor.roughness = val
            })
            // TODO (abelnation): use env map to reflect metal property
            standardFolder.add(this.param, 'metalness', 0.0, 1.0).step(0.01).onChange((val) => {
                matStdObjects.metalness = val
                matStdFloor.metalness = val
            })
            standardFolder.open()
            // TODO: rect area light distance
            // TODO: rect area light decay
            //
            window.addEventListener('resize', this.onResize, false)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglLightsRectarealight-container')[0].appendChild(this.stats.dom)
        },
        onResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.param.motion) {
                var t = (Date.now() / 2000)
                // move light in circle around center
                // change light height with sine curve
                var r = 15.0
                var lx = r * Math.cos(t)
                var lz = r * Math.sin(t)
                var ly = 5.0 + 5.0 * Math.sin(t / 3.0)
                this.rectLight.position.set(lx, ly, lz)
                this.rectLight.lookAt(this.origin)
            }
            this.rectLightHelper.update()
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglLightsRectarealight-container {
    width: 100%;
}
</style>
