<template>
    <div class="webglWater-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - water
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
            clock: null,
            renderer: null,
            water: null,
			torusKnot: null,
			params: {
				color: '#ffffff',
				scale: 4,
				flowX: 1,
				flowY: 1
            },
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
            this.camera.position.set(- 15, 7, 15)
            this.camera.lookAt(this.scene.position)
            // clock
            this.clock = new this.$THREE.Clock()
            // mesh
            var torusKnotGeometry = new this.$THREE.TorusKnotBufferGeometry(3, 1, 256, 32)
            var torusKnotMaterial = new this.$THREE.MeshNormalMaterial()
            this.torusKnot = new this.$THREE.Mesh(torusKnotGeometry, torusKnotMaterial)
            this.torusKnot.position.y = 4
            this.torusKnot.scale.set(0.5, 0.5, 0.5)
            this.scene.add(this.torusKnot)
            // ground
            var groundGeometry = new this.$THREE.PlaneBufferGeometry(20, 20)
            var groundMaterial = new this.$THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.4 })
            var ground = new this.$THREE.Mesh(groundGeometry, groundMaterial)
            ground.rotation.x = Math.PI * - 0.5
            this.scene.add(ground)
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load('static/textures/hardwood2_diffuse.jpg', (map) => {
                map.wrapS = this.$THREE.RepeatWrapping
                map.wrapT = this.$THREE.RepeatWrapping
                map.anisotropy = 16
                map.repeat.set(4, 4)
                groundMaterial.map = map
                groundMaterial.needsUpdate = true
            })
            // water
            var waterGeometry = new this.$THREE.PlaneBufferGeometry(20, 20)
            this.water = new Water(waterGeometry, {
                color: this.params.color,
                scale: this.params.scale,
                flowDirection: new this.$THREE.Vector2(this.params.flowX, this.params.flowY),
                textureWidth: 1024,
                textureHeight: 1024
            })
            this.water.position.y = 1
            this.water.rotation.x = Math.PI * - 0.5
            this.scene.add(this.water)
            // skybox
            var cubeTextureLoader = new this.$THREE.CubeTextureLoader()
            cubeTextureLoader.setPath('static/textures/cube/Park2/')
            var cubeTexture = cubeTextureLoader.load([
                "posx.jpg", "negx.jpg",
                "posy.jpg", "negy.jpg",
                "posz.jpg", "negz.jpg"
            ])
            this.scene.background = cubeTexture
            // light
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 0.6)
            directionalLight.position.set(- 1, 1, 1)
            this.scene.add(directionalLight)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            document.getElementsByClassName('webglWater-container')[0].appendChild(this.renderer.domElement)
            // dat.gui
            this.gui = new GUI()
            this.gui.addColor(this.params, 'color').onChange((value) => {
                this.water.material.uniforms[ 'color' ].value.set(value)
            })
            this.gui.add(this.params, 'scale', 1, 10).onChange((value) => {
                this.water.material.uniforms[ 'config' ].value.w = value
            })
            this.gui.add(this.params, 'flowX', - 1, 1).step(0.01).onChange((value) => {
                this.water.material.uniforms[ 'flowDirection' ].value.x = value
                this.water.material.uniforms[ 'flowDirection' ].value.normalize()
            })
            this.gui.add(this.params, 'flowY', - 1, 1).step(0.01).onChange((value) => {
                this.water.material.uniforms[ 'flowDirection' ].value.y = value
                this.water.material.uniforms[ 'flowDirection' ].value.normalize()
            })
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
            var delta = this.clock.getDelta()
            this.torusKnot.rotation.x += delta
            this.torusKnot.rotation.y += delta * 0.5
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglWater-container {
    width: 100%;
}
</style>
