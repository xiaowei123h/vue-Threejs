<template>
    <div class="webglRefraction-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - refraction
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Refractor } from '@/components/jsm/objects/Refractor.js'
import { WaterRefractionShader } from '@/components/jsm/shaders/WaterRefractionShader.js'
export default {
    data() {
        return {
            scene: null,
            camera: null,
            clock: null,
            renderer: null,
            refractor: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 200)
            this.camera.position.set(- 10, 0, 15)
            this.camera.lookAt(this.scene.position)
            // clock
            this.clock = new this.$THREE.Clock()
            // mesh
            var geometry = new this.$THREE.TorusKnotBufferGeometry(3, 1, 256, 32)
            var material = new this.$THREE.MeshStandardMaterial({ color: 0x6083c2 })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            // refractor
            var refractorGeometry = new this.$THREE.PlaneBufferGeometry(10, 10)
            this.refractor = new Refractor(refractorGeometry, {
                color: 0x999999,
                textureWidth: 1024,
                textureHeight: 1024,
                shader: WaterRefractionShader
            })
            this.refractor.position.set(0, 0, 5)
            this.scene.add(this.refractor)
            // load dudv map for distortion effect
            var dudvMap = new this.$THREE.TextureLoader().load('static/textures/waterdudv.jpg', () => {
                this.animate()
            })
            dudvMap.wrapS = dudvMap.wrapT = this.$THREE.RepeatWrapping
            this.refractor.material.uniforms[ "tDudv" ].value = dudvMap
            // light
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            this.scene.add(this.camera)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setClearColor(0x20252f)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            document.getElementsByClassName('webglRefraction-container')[0].appendChild(this.renderer.domElement)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 10
            controls.maxDistance = 100
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
            this.refractor.material.uniforms[ "time" ].value += this.clock.getDelta()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglRefraction-container {
    width: 100%;
}
</style>
