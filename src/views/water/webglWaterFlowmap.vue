<template>
    <div class="webglWaterFlowmap-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - water flow map
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Water } from '@/components/jsm/objects/Water2.js'
export default {
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
            water: null,
            gui: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 200)
            this.camera.position.set(0, 25, 0)
            this.camera.lookAt(this.scene.position)
            // ground
            var groundGeometry = new this.$THREE.PlaneBufferGeometry(20, 20, 10, 10)
            var groundMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xcccccc })
            var ground = new this.$THREE.Mesh(groundGeometry, groundMaterial)
            ground.rotation.x = Math.PI * - 0.5
            this.scene.add(ground)
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load('static/textures/floors/FloorsCheckerboard_S_Diffuse.jpg', (map) => {
                map.wrapS = this.$THREE.RepeatWrapping
                map.wrapT = this.$THREE.RepeatWrapping
                map.anisotropy = 16
                map.repeat.set(4, 4)
                groundMaterial.map = map
                groundMaterial.needsUpdate = true
            })
            // water
            var waterGeometry = new this.$THREE.PlaneBufferGeometry(20, 20)
            var flowMap = textureLoader.load('static/textures/water/Water_1_M_Flow.jpg')
            this.water = new Water(waterGeometry, {
                scale: 2,
                textureWidth: 1024,
                textureHeight: 1024,
                flowMap: flowMap
            })
            this.water.position.y = 1
            this.water.rotation.x = Math.PI * - 0.5
            this.scene.add(this.water)
            // flow map helper
            var helperGeometry = new this.$THREE.PlaneBufferGeometry(20, 20)
            var helperMaterial = new this.$THREE.MeshBasicMaterial({ map: flowMap })
            var helper = new this.$THREE.Mesh(helperGeometry, helperMaterial)
            helper.position.y = 1.01
            helper.rotation.x = Math.PI * - 0.5
            helper.visible = false
            this.scene.add(helper)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            document.getElementsByClassName('webglWaterFlowmap-container')[0].appendChild(this.renderer.domElement)
            //
            this.gui = new GUI()
            this.gui.add(helper, 'visible').name('Show Flow Map')
            this.gui.open()
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 5
            controls.maxDistance = 50
            //
            window.addEventListener('resize', this.onResize, false)
        },
        onResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglWaterFlowmap-container {
    width: 100%;
}
</style>
