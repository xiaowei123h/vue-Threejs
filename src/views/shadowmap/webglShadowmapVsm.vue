<template>
    <div class="webglShadowmapVsm-container">
        <div id="info">
		    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - VSM Shadows example by <a href="https://github.com/supereggbert">Paul Brunt</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
            stats: null,
            dirLight: null,
            spotLight: null,
            torusKnot: null,
            dirGroup: null,
            gui: null,
        }
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.initScene()
            this.initMisc()
            // Init gui
            this.gui = new GUI()
            var config = {
                'Spotlight Radius': 4,
                'Directional light Radius': 4,
            }
            this.gui.add(config, 'Spotlight Radius').min(2).max(8).onChange((value) => {
                this.spotLight.shadow.radius = value
            })
            this.gui.add(config, 'Directional light Radius').min(2).max(8).onChange((value) => {
                this.dirLight.shadow.radius = value
            })
            document.getElementsByClassName('webglShadowmapVsm-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        initScene() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 10, 30)
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.Fog(0xCCCCCC, 50, 100)
            // Lights
            this.scene.add(new this.$THREE.AmbientLight(0x444444))
            this.spotLight = new this.$THREE.SpotLight(0x888888)
            this.spotLight.name = 'Spot Light'
            this.spotLight.angle = Math.PI / 5
            this.spotLight.penumbra = 0.3
            this.spotLight.position.set(8, 10, 5)
            this.spotLight.castShadow = true
            this.spotLight.shadow.camera.near = 8
            this.spotLight.shadow.camera.far = 200
            this.spotLight.shadow.mapSize.width = 256
            this.spotLight.shadow.mapSize.height = 256
            this.spotLight.shadow.bias = - 0.002
            this.spotLight.shadow.radius = 4
            this.scene.add(this.spotLight)
            this.dirLight = new this.$THREE.DirectionalLight(0xFFFFFF, 1)
            this.dirLight.name = 'Dir. Light'
            this.dirLight.position.set(3, 12, 17)
            this.dirLight.castShadow = true
            this.dirLight.shadow.camera.near = 0.1
            this.dirLight.shadow.camera.far = 500
            this.dirLight.shadow.camera.right = 17
            this.dirLight.shadow.camera.left = - 17
            this.dirLight.shadow.camera.top	= 17
            this.dirLight.shadow.camera.bottom = - 17
            this.dirLight.shadow.mapSize.width = 512
            this.dirLight.shadow.mapSize.height = 512
            this.dirLight.shadow.radius = 4
            this.dirLight.shadow.bias = - 0.0005
            this.scene.add(this.dirLight)
            this.dirGroup = new this.$THREE.Group()
            this.dirGroup.add(this.dirLight)
            this.scene.add(this.dirGroup)
            // Geometry
            var geometry = new this.$THREE.TorusKnotBufferGeometry(25, 8, 75, 20)
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0x999999,
                shininess: 0,
                specular: 0x222222
            })
            this.torusKnot = new this.$THREE.Mesh(geometry, material)
            this.torusKnot.scale.multiplyScalar(1 / 18)
            this.torusKnot.position.y = 3
            this.torusKnot.castShadow = true
            this.torusKnot.receiveShadow = true
            this.scene.add(this.torusKnot)
            var cylinderGeometry = new this.$THREE.CylinderBufferGeometry(0.75, 0.75, 7, 32)
            var pillar1 = new this.$THREE.Mesh(cylinderGeometry, material)
            pillar1.position.set(10, 3.5, 10)
            pillar1.castShadow = true
            pillar1.receiveShadow = true
            var pillar2 = pillar1.clone()
            pillar2.position.set(10, 3.5, - 10)
            var pillar3 = pillar1.clone()
            pillar3.position.set(- 10, 3.5, 10)
            var pillar4 = pillar1.clone()
            pillar4.position.set(- 10, 3.5, - 10)
            this.scene.add(pillar1)
            this.scene.add(pillar2)
            this.scene.add(pillar3)
            this.scene.add(pillar4)
            var planeGeometry = new this.$THREE.PlaneBufferGeometry(200, 200)
            var planeMaterial = new this.$THREE.MeshPhongMaterial({
                color: 0x999999,
                shininess: 0,
                specular: 0x111111
            })
            var ground = new this.$THREE.Mesh(planeGeometry, planeMaterial)
            ground.rotation.x = - Math.PI / 2
            ground.scale.multiplyScalar(3)
            ground.castShadow = true
            ground.receiveShadow = true
            this.scene.add(ground)
        },
        initMisc() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.VSMShadowMap
            this.renderer.setClearColor(0xCCCCCC, 1)
            // Mouse control
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 2, 0)
            controls.update()
            this.clock = new this.$THREE.Clock()
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglShadowmapVsm-container')[0].appendChild(this.stats.dom)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        renderScene() {
            this.renderer.render(this.scene, this.camera)
        },
        render() {
            var delta = this.clock.getDelta()
            var time = this.clock.elapsedTime
            this.renderScene()
            this.torusKnot.rotation.x += 0.25 * delta
            this.torusKnot.rotation.y += 2 * delta
            this.torusKnot.rotation.z += 1 * delta
            this.dirGroup.rotation.y += 0.7 * delta
            this.dirLight.position.z = 17 + Math.sin(time * 0.001) * 5
        }
    },
}
</script>

<style scoped>
.webglShadowmapVsm-container {
    position: relative;
    width: 100%;
}
</style>
