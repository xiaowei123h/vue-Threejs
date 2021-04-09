<template>
    <div class="webglLoader3mfMaterials-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
			<a href="http://3mf.io" target="_blank" rel="noopener">3MF</a> file with materials
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { ThreeMFLoader } from '@/components/jsm/loaders/3MFLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xa0a0a0)
            this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 10, 500)
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 500)
            this.camera.position.set(- 50, 40, 50)
            this.scene.add(this.camera)
            //
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 100, 0)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff)
            dirLight.position.set(- 0, 40, 50)
            dirLight.castShadow = true
            dirLight.shadow.camera.top = 50
            dirLight.shadow.camera.bottom = - 25
            dirLight.shadow.camera.left = - 25
            dirLight.shadow.camera.right = 25
            dirLight.shadow.camera.near = 0.1
            dirLight.shadow.camera.far = 200
            dirLight.shadow.mapSize.set(1024, 1024)
            this.scene.add(dirLight)
            // this.scene.add(new this.$THREE.CameraHelper(dirLight.shadow.camera))
            //
            var manager = new this.$THREE.LoadingManager()
            var loader = new ThreeMFLoader(manager)
            loader.load('static/models/3mf/truck.3mf', (object) => {
                object.quaternion.setFromEuler(new this.$THREE.Euler(- Math.PI / 2, 0, 0)) 	// z-up conversion
                object.traverse((child) => {
                    child.castShadow = true
                })
                this.scene.add(object)
            })
            //
            manager.onLoad = () => {
                this.render()
            }
            //
            var ground = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(1000, 1000), new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
            ground.rotation.x = - Math.PI / 2
            ground.position.y = 11
            ground.receiveShadow = true
            this.scene.add(ground)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
            document.getElementsByClassName('webglLoader3mfMaterials-container')[0].appendChild(this.renderer.domElement)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            controls.minDistance = 50
            controls.maxDistance = 200
            controls.enablePan = false
            controls.target.set(0, 20, 0)
            controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
            this.render()
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
.webglLoader3mfMaterials-container {
    position: relative;
    width: 100%;
    background-color: #a0a0a0;
}
</style>
