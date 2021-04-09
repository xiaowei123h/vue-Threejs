<template>
    <div class="webglShadowmapViewer-container">
        <div id="info">
		    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - ShadowMapViewer example by <a href="https://github.com/arya-s">arya-s</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ShadowMapViewer } from '@/components/jsm/utils/ShadowMapViewer.js'
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
            cube: null,
            dirLightShadowMapViewer: null,
            spotLightShadowMapViewer: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.initScene()
            this.initShadowMapViewers()
            this.initMisc()
            document.getElementsByClassName('webglShadowmapViewer-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        initScene() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 15, 35)
            this.scene = new this.$THREE.Scene()
            // Lights
            this.scene.add(new this.$THREE.AmbientLight(0x404040))
            this.spotLight = new this.$THREE.SpotLight(0xffffff)
            this.spotLight.name = 'Spot Light'
            this.spotLight.angle = Math.PI / 5
            this.spotLight.penumbra = 0.3
            this.spotLight.position.set(10, 10, 5)
            this.spotLight.castShadow = true
            this.spotLight.shadow.camera.near = 8
            this.spotLight.shadow.camera.far = 30
            this.spotLight.shadow.mapSize.width = 1024
            this.spotLight.shadow.mapSize.height = 1024
            this.scene.add(this.spotLight)
            this.scene.add(new this.$THREE.CameraHelper(this.spotLight.shadow.camera))
            this.dirLight = new this.$THREE.DirectionalLight(0xffffff, 1)
            this.dirLight.name = 'Dir. Light'
            this.dirLight.position.set(0, 10, 0)
            this.dirLight.castShadow = true
            this.dirLight.shadow.camera.near = 1
            this.dirLight.shadow.camera.far = 10
            this.dirLight.shadow.camera.right = 15
            this.dirLight.shadow.camera.left = - 15
            this.dirLight.shadow.camera.top	= 15
            this.dirLight.shadow.camera.bottom = - 15
            this.dirLight.shadow.mapSize.width = 1024
            this.dirLight.shadow.mapSize.height = 1024
            this.scene.add(this.dirLight)
            this.scene.add(new this.$THREE.CameraHelper(this.dirLight.shadow.camera))
            // Geometry
            var geometry = new this.$THREE.TorusKnotBufferGeometry(25, 8, 75, 20)
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xff0000,
                shininess: 150,
                specular: 0x222222
            })
            this.torusKnot = new this.$THREE.Mesh(geometry, material)
            this.torusKnot.scale.multiplyScalar(1 / 18)
            this.torusKnot.position.y = 3
            this.torusKnot.castShadow = true
            this.torusKnot.receiveShadow = true
            this.scene.add(this.torusKnot)
            geometry = new this.$THREE.BoxBufferGeometry(3, 3, 3)
            this.cube = new this.$THREE.Mesh(geometry, material)
            this.cube.position.set(8, 3, 8)
            this.cube.castShadow = true
            this.cube.receiveShadow = true
            this.scene.add(this.cube)
            geometry = new this.$THREE.BoxBufferGeometry(10, 0.15, 10)
            material = new this.$THREE.MeshPhongMaterial({
                color: 0xa0adaf,
                shininess: 150,
                specular: 0x111111
            })
            var ground = new this.$THREE.Mesh(geometry, material)
            ground.scale.multiplyScalar(3)
            ground.castShadow = false
            ground.receiveShadow = true
            this.scene.add(ground)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.resizeShadowMapViewers()
            this.dirLightShadowMapViewer.updateForWindowResize()
            this.spotLightShadowMapViewer.updateForWindowResize()
        },
        initShadowMapViewers() {
            this.dirLightShadowMapViewer = new ShadowMapViewer(this.dirLight)
            this.spotLightShadowMapViewer = new ShadowMapViewer(this.spotLight)
            this.resizeShadowMapViewers()
        },
        initMisc() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.BasicShadowMap
            // Mouse control
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 2, 0)
            controls.update()
            this.clock = new this.$THREE.Clock()
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglShadowmapViewer-container')[0].appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$statsPosition(this.stats)
        },
        resizeShadowMapViewers() {
            var size = this.$webglInnerWidth * 0.15
            this.dirLightShadowMapViewer.position.x = 10
            this.dirLightShadowMapViewer.position.y = 10
            this.dirLightShadowMapViewer.size.width = size
            this.dirLightShadowMapViewer.size.height = size
            this.dirLightShadowMapViewer.update() //Required when setting position or size directly
            this.spotLightShadowMapViewer.size.set(size, size)
            this.spotLightShadowMapViewer.position.set(size + 20, 10)
            // this.spotLightShadowMapViewer.update()	//NOT required because .set updates automatically
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        renderScene() {
            this.renderer.render(this.scene, this.camera)
        },
        renderShadowMapViewers() {
            this.dirLightShadowMapViewer.render(this.renderer)
            this.spotLightShadowMapViewer.render(this.renderer)
        },
        render() {
            var delta = this.clock.getDelta()
            this.renderScene()
            this.renderShadowMapViewers()
            this.torusKnot.rotation.x += 0.25 * delta
            this.torusKnot.rotation.y += 2 * delta
            this.torusKnot.rotation.z += 1 * delta
            this.cube.rotation.x += 0.25 * delta
            this.cube.rotation.y += 2 * delta
            this.cube.rotation.z += 1 * delta
        }
    },
}
</script>

<style scoped>
.webglShadowmapViewer-container {
    position: relative;
    width: 100%;
}
</style>
