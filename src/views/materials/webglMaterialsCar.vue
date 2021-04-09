<template>
    <div class="webglMaterialsCar-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> car materials<br/>
			Ferrari 458 Italia model by <a href="https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6" target="_blank" rel="noopener">vicent091036</a>
			<br><br>
			<span class="colorPicker"><input id="body-color" type="color" value="#ff0000"></input><br/>Body</span>
			<span class="colorPicker"><input id="details-color" type="color" value="#ffffff"></input><br/>Details</span>
			<span class="colorPicker"><input id="glass-color" type="color" value="#ffffff"></input><br/>Glass</span>
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from '@/components/jsm/environments/RoomEnvironment.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from '@/components/jsm/loaders/DRACOLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			stats: null,
			grid: null,
			controls: null,
			wheels: []
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setAnimationLoop(this.render)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 0.85
            container.appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(4.25, 1.4, - 4.5)
            this.controls = new OrbitControls(this.camera, container)
            this.controls.target.set(0, 0.5, 0)
            this.controls.update()
            var environment = new RoomEnvironment()
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xeeeeee)
            this.scene.environment = pmremGenerator.fromScene(environment).texture
            this.scene.fog = new this.$THREE.Fog(0xeeeeee, 10, 50)
            this.grid = new this.$THREE.GridHelper(100, 40, 0x000000, 0x000000)
            this.grid.material.opacity = 0.1
            this.grid.material.depthWrite = false
            this.grid.material.transparent = true
            this.scene.add(this.grid)
            // materials
            var bodyMaterial = new this.$THREE.MeshPhysicalMaterial({
                color: 0xff0000, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
            })
            var detailsMaterial = new this.$THREE.MeshStandardMaterial({
                color: 0xffffff, metalness: 1.0, roughness: 0.5
            })
            var glassMaterial = new this.$THREE.MeshPhysicalMaterial({
                color: 0xffffff, metalness: 0, roughness: 0.1, transmission: 0.9, transparent: true
            })
            var bodyColorInput = document.getElementById('body-color')
            bodyColorInput.addEventListener('input', function () {
                bodyMaterial.color.set(this.value)
            })
            var detailsColorInput = document.getElementById('details-color')
            detailsColorInput.addEventListener('input', function () {
                detailsMaterial.color.set(this.value)
            })
            var glassColorInput = document.getElementById('glass-color')
            glassColorInput.addEventListener('input', function () {
                glassMaterial.color.set(this.value)
            })
            // Car
            var shadow = new this.$THREE.TextureLoader().load('static/models/gltf/ferrari_ao.png')
            var dracoLoader = new DRACOLoader()
            dracoLoader.setDecoderPath('static/js/libs/draco/gltf/')
            var loader = new GLTFLoader()
            loader.setDRACOLoader(dracoLoader)
            loader.load('static/models/gltf/ferrari.glb', (gltf) => {
                var carModel = gltf.scene.children[ 0 ]
                carModel.getObjectByName('body').material = bodyMaterial
                carModel.getObjectByName('rim_fl').material = detailsMaterial
                carModel.getObjectByName('rim_fr').material = detailsMaterial
                carModel.getObjectByName('rim_rr').material = detailsMaterial
                carModel.getObjectByName('rim_rl').material = detailsMaterial
                carModel.getObjectByName('trim').material = detailsMaterial
                carModel.getObjectByName('glass').material = glassMaterial
                this.wheels.push(
                    carModel.getObjectByName('wheel_fl'),
                    carModel.getObjectByName('wheel_fr'),
                    carModel.getObjectByName('wheel_rl'),
                    carModel.getObjectByName('wheel_rr')
                )
                // shadow
                var mesh = new this.$THREE.Mesh(
                    new this.$THREE.PlaneBufferGeometry(0.655 * 4, 1.3 * 4),
                    new this.$THREE.MeshBasicMaterial({
                        map: shadow, blending: this.$THREE.MultiplyBlending, toneMapped: false, transparent: true
                    })
                )
                mesh.rotation.x = - Math.PI / 2
                mesh.renderOrder = 2
                carModel.add(mesh)
                this.scene.add(carModel)
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        render() {
            var time = - performance.now() / 1000
            for (var i = 0; i < this.wheels.length; i ++) {
                this.wheels[ i ].rotation.x = time * Math.PI
            }
            this.grid.position.z = - (time) % 5
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglMaterialsCar-container {
    position: relative;
    width: 100%;
}
#info {
    color: #444;
    background: #eee;
}
#info a {
    color: #08f;
}
.colorPicker {
    display: inline-block;
    margin: 0 10px
}
</style>
