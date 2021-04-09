<template>
    <div class="webglLightsPhysical-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Physically accurate incandescent bulb by <a href="http://clara.io" target="_blank" rel="noopener">Ben Houston</a><br />
			Real world scale: Brick cube is 50 cm in size. Globe is 50 cm in diameter.<br/>
			Reinhard inline tonemapping with real-world light falloff (decay = 2).
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            bulbLight: null,
            bulbMat: null,
            hemiLight: null,
            stats: null,
            ballMat: null,
            cubeMat: null,
            floorMat: null,
            previousShadowMap: false,
            bulbLuminousPowers: null,
            hemiLuminousIrradiances: null,
            params: null,
            gui: null
        }
    },
    mounted() {
        // ref for lumens: http://www.power-sure.com/lumens.htm
        this.bulbLuminousPowers = {
            "110000 lm (1000W)": 110000,
            "3500 lm (300W)": 3500,
            "1700 lm (100W)": 1700,
            "800 lm (60W)": 800,
            "400 lm (40W)": 400,
            "180 lm (25W)": 180,
            "20 lm (4W)": 20,
            "Off": 0
        }
        // ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
        this.hemiLuminousIrradiances = {
            "0.0001 lx (Moonless Night)": 0.0001,
            "0.002 lx (Night Airglow)": 0.002,
            "0.5 lx (Full Moon)": 0.5,
            "3.4 lx (City Twilight)": 3.4,
            "50 lx (Living Room)": 50,
            "100 lx (Very Overcast)": 100,
            "350 lx (Office Room)": 350,
            "400 lx (Sunrise/Sunset)": 400,
            "1000 lx (Overcast)": 1000,
            "18000 lx (Daylight)": 18000,
            "50000 lx (Direct Sun)": 50000
        }
        this.params = {
            shadows: true,
            exposure: 0.68,
            bulbPower: Object.keys(this.bulbLuminousPowers)[4],
            hemiIrradiance: Object.keys(this.hemiLuminousIrradiances)[0]
        }
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.x = - 4
            this.camera.position.z = 4
            this.camera.position.y = 2
            this.scene = new this.$THREE.Scene()
            var bulbGeometry = new this.$THREE.SphereBufferGeometry(0.02, 16, 8)
            this.bulbLight = new this.$THREE.PointLight(0xffee88, 1, 100, 2)
            this.bulbMat = new this.$THREE.MeshStandardMaterial({
                emissive: 0xffffee,
                emissiveIntensity: 1,
                color: 0x000000
            })
            this.bulbLight.add(new this.$THREE.Mesh(this.bulbGeometry, this.bulbMat))
            this.bulbLight.position.set(0, 2, 0)
            this.bulbLight.castShadow = true
            this.scene.add(this.bulbLight)
            this.hemiLight = new this.$THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02)
            this.scene.add(this.hemiLight)
            this.floorMat = new this.$THREE.MeshStandardMaterial({
                roughness: 0.8,
                color: 0xffffff,
                metalness: 0.2,
                bumpScale: 0.0005
            })
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load("static/textures/hardwood2_diffuse.jpg", (map) => {
                map.wrapS = this.$THREE.RepeatWrapping
                map.wrapT = this.$THREE.RepeatWrapping
                map.anisotropy = 4
                map.repeat.set(10, 24)
                map.encoding = this.$THREE.sRGBEncoding
                this.floorMat.map = map
                this.floorMat.needsUpdate = true
            })
            textureLoader.load("static/textures/hardwood2_bump.jpg", (map) => {
                map.wrapS = this.$THREE.RepeatWrapping
                map.wrapT = this.$THREE.RepeatWrapping
                map.anisotropy = 4
                map.repeat.set(10, 24)
                this.floorMat.bumpMap = map
                this.floorMat.needsUpdate = true
            })
            textureLoader.load("static/textures/hardwood2_roughness.jpg", (map) => {
                map.wrapS = this.$THREE.RepeatWrapping
                map.wrapT = this.$THREE.RepeatWrapping
                map.anisotropy = 4
                map.repeat.set(10, 24)
                this.floorMat.roughnessMap = map
                this.floorMat.needsUpdate = true
            })
            this.cubeMat = new this.$THREE.MeshStandardMaterial({
                roughness: 0.7,
                color: 0xffffff,
                bumpScale: 0.002,
                metalness: 0.2
            })
            textureLoader.load("static/textures/brick_diffuse.jpg", (map) => {
                map.wrapS = this.$THREE.RepeatWrapping
                map.wrapT = this.$THREE.RepeatWrapping
                map.anisotropy = 4
                map.repeat.set(1, 1)
                map.encoding = this.$THREE.sRGBEncoding
                this.cubeMat.map = map
                this.cubeMat.needsUpdate = true
            })
            textureLoader.load("static/textures/brick_bump.jpg", (map) => {
                map.wrapS = this.$THREE.RepeatWrapping
                map.wrapT = this.$THREE.RepeatWrapping
                map.anisotropy = 4
                map.repeat.set(1, 1)
                this.cubeMat.bumpMap = map
                this.cubeMat.needsUpdate = true
            })
            this.ballMat = new this.$THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.5,
                metalness: 1.0
            })
            textureLoader.load("static/textures/planets/earth_atmos_2048.jpg", (map) => {
                map.anisotropy = 4
                map.encoding = this.$THREE.sRGBEncoding
                this.ballMat.map = map
                this.ballMat.needsUpdate = true
            })
            textureLoader.load("static/textures/planets/earth_specular_2048.jpg", (map) => {
                map.anisotropy = 4
                map.encoding = this.$THREE.sRGBEncoding
                this.ballMat.metalnessMap = map
                this.ballMat.needsUpdate = true
            })
            var floorGeometry = new this.$THREE.PlaneBufferGeometry(20, 20)
            var floorMesh = new this.$THREE.Mesh(floorGeometry, this.floorMat)
            floorMesh.receiveShadow = true
            floorMesh.rotation.x = - Math.PI / 2.0
            this.scene.add(floorMesh)
            var ballGeometry = new this.$THREE.SphereBufferGeometry(0.25, 32, 32)
            var ballMesh = new this.$THREE.Mesh(ballGeometry, this.ballMat)
            ballMesh.position.set(1, 0.25, 1)
            ballMesh.rotation.y = Math.PI
            ballMesh.castShadow = true
            this.scene.add(ballMesh)
            var boxGeometry = new this.$THREE.BoxBufferGeometry(0.5, 0.5, 0.5)
            var boxMesh = new this.$THREE.Mesh(boxGeometry, this.cubeMat)
            boxMesh.position.set(- 0.5, 0.25, - 1)
            boxMesh.castShadow = true
            this.scene.add(boxMesh)
            var boxMesh2 = new this.$THREE.Mesh(boxGeometry, this.cubeMat)
            boxMesh2.position.set(0, 0.25, - 5)
            boxMesh2.castShadow = true
            this.scene.add(boxMesh2)
            var boxMesh3 = new this.$THREE.Mesh(boxGeometry, this.cubeMat)
            boxMesh3.position.set(7, 0.25, 0)
            boxMesh3.castShadow = true
            this.scene.add(boxMesh3)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.physicallyCorrectLights = true
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.renderer.toneMapping = this.$THREE.ReinhardToneMapping
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 1
            controls.maxDistance = 20
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI()
            this.gui.add(this.params, 'hemiIrradiance', Object.keys(this.hemiLuminousIrradiances))
            this.gui.add(this.params, 'bulbPower', Object.keys(this.bulbLuminousPowers))
            this.gui.add(this.params, 'exposure', 0, 1)
            this.gui.add(this.params, 'shadows')
            this.gui.open()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.renderer.toneMappingExposure = Math.pow(this.params.exposure, 5.0) // to allow for very bright this.scenes.
            this.renderer.shadowMap.enabled = this.params.shadows
            this.bulbLight.castShadow = this.params.shadows
            if (this.params.shadows !== this.previousShadowMap) {
                this.ballMat.needsUpdate = true
                this.cubeMat.needsUpdate = true
                this.floorMat.needsUpdate = true
                this.previousShadowMap = this.params.shadows
            }
            this.bulbLight.power = this.bulbLuminousPowers[this.params.bulbPower]
            this.bulbMat.emissiveIntensity = this.bulbLight.intensity / Math.pow(0.02, 2.0) // convert from intensity to irradiance at bulb surface
            this.hemiLight.intensity = this.hemiLuminousIrradiances[this.params.hemiIrradiance]
            var time = Date.now() * 0.0005
            this.bulbLight.position.y = Math.cos(time) * 0.75 + 1.25
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglLightsPhysical-container {
    position: relative;
    width: 100%;
}
</style>
