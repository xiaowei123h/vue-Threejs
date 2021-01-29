<template>
    <div class="webglLightsSpotlights-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - SpotLights<br/>
			by <a href="http://master-domain.com" target="_blank" rel="noopener">Master James</a>
		</div>
    </div>
</template>

<script>
import { TWEEN } from '@/components/jsm/libs/tween.module.min.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            renderer: null,
			camera: null,
			controls: null,
			scene: null,
			matFloor: null,
			matBox: null,
			geoFloor: null,
			geoBox: null,
			mshFloor: null,
			mshBox: null,
			ambient: null,
			spotLight1: null,
			spotLight2: null,
			spotLight3: null,
            lightHelper1: null,
            lightHelper2: null,
            lightHelper3: null,
        }
    },
    mounted() {
        this.renderer = new this.$THREE.WebGLRenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 2000)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.scene = new this.$THREE.Scene()
        this.matFloor = new this.$THREE.MeshPhongMaterial()
        this.matBox = new this.$THREE.MeshPhongMaterial({ color: 0xaaaaaa })
        this.geoFloor = new this.$THREE.PlaneBufferGeometry(2000, 2000)
        this.geoBox = new this.$THREE.BoxBufferGeometry(3, 1, 2)
        this.mshFloor = new this.$THREE.Mesh(this.geoFloor, this.matFloor)
        this.mshFloor.rotation.x = - Math.PI * 0.5
        this.mshBox = new this.$THREE.Mesh(this.geoBox, this.matBox)
        this.ambient = new this.$THREE.AmbientLight(0x111111)
        this.spotLight1 = this.createSpotlight(0xFF7F00)
        this.spotLight2 = this.createSpotlight(0x00FF7F)
        this.spotLight3 = this.createSpotlight(0x7F00FF)
        this.init()
        this.render()
        this.animate()
    },
    methods: {
        init() {
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.camera.position.set(46, 22, - 21)
            this.spotLight1.position.set(15, 40, 45)
            this.spotLight2.position.set(0, 40, 35)
            this.spotLight3.position.set(- 15, 40, 45)
            this.lightHelper1 = new this.$THREE.SpotLightHelper(this.spotLight1)
            this.lightHelper2 = new this.$THREE.SpotLightHelper(this.spotLight2)
            this.lightHelper3 = new this.$THREE.SpotLightHelper(this.spotLight3)
            this.matFloor.color.set(0x808080)
            this.mshFloor.receiveShadow = true
            this.mshFloor.position.set(0, - 0.05, 0)
            this.mshBox.castShadow = true
            this.mshBox.receiveShadow = true
            this.mshBox.position.set(0, 5, 0)
            this.scene.add(this.mshFloor)
            this.scene.add(this.mshBox)
            this.scene.add(this.ambient)
            this.scene.add(this.spotLight1, this.spotLight2, this.spotLight3)
            this.scene.add(this.lightHelper1, this.lightHelper2, this.lightHelper3)
            document.getElementsByClassName('webglLightsSpotlights-container')[0].appendChild(this.renderer.domElement)
            this.onResize()
            window.addEventListener('resize', this.onResize, false)
            this.controls.target.set(0, 7, 0)
            this.controls.maxPolarAngle = Math.PI / 2
            this.controls.update()
        },
        createSpotlight(color) {
            var newObj = new this.$THREE.SpotLight(color, 2)
            newObj.castShadow = true
            newObj.angle = 0.3
            newObj.penumbra = 0.2
            newObj.decay = 2
            newObj.distance = 50
            return newObj
        },
        onResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        tween(light) {
            new TWEEN.Tween(light).to({
                angle: (Math.random() * 0.7) + 0.1,
                penumbra: Math.random() + 1
            }, Math.random() * 3000 + 2000)
                .easing(TWEEN.Easing.Quadratic.Out).start()
            new TWEEN.Tween(light.position).to({
                x: (Math.random() * 30) - 15,
                y: (Math.random() * 10) + 15,
                z: (Math.random() * 30) - 15
            }, Math.random() * 3000 + 2000)
                .easing(TWEEN.Easing.Quadratic.Out).start()
        },
        animate() {
            this.tween(this.spotLight1)
            this.tween(this.spotLight2)
            this.tween(this.spotLight3)
            setTimeout(this.animate, 5000)
        },
        render() {
            TWEEN.update()
            if (this.lightHelper1) this.lightHelper1.update()
            if (this.lightHelper2) this.lightHelper2.update()
            if (this.lightHelper3) this.lightHelper3.update()
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.render)
        }
    }
}
</script>

<style scoped>
.webglLightsSpotlights-container {
    width: 100%;
}
</style>
