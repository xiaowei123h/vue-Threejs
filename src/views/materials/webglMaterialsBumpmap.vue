<template>
    <div class="webglMaterialsBumpmap-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - bump mapping without tangents<br/>
			<a href="http://graphics.cs.williams.edu/data/meshes.xml#14" target="_blank" rel="noopener">Lee Perry-Smith</a> head
		</div>
    </div>
</template>

<script>
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            statsEnabled: true,
            container: null,
            stats: null,
            loader: null,
            camera: null,
            scene: null,
            renderer: null,
			mesh: null,
			spotLight: null,
			mouseX: 0,
			mouseY: 0,
			targetX: 0,
			targetY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsBumpmap-container')[0].appendChild(this.container)
            //
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 1200
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x060708)
            // LIGHTS
            this.scene.add(new this.$THREE.HemisphereLight(0x443333, 0x111122))
            this.spotLight = new this.$THREE.SpotLight(0xffffbb, 2)
            this.spotLight.position.set(0.5, 0, 1)
            this.spotLight.position.multiplyScalar(700)
            this.scene.add(this.spotLight)
            this.spotLight.castShadow = true
            this.spotLight.shadow.mapSize.width = 2048
            this.spotLight.shadow.mapSize.height = 2048
            this.spotLight.shadow.camera.near = 200
            this.spotLight.shadow.camera.far = 1500
            this.spotLight.shadow.camera.fov = 40
            this.spotLight.shadow.bias = - 0.005
            //
            var mapHeight = new this.$THREE.TextureLoader().load("static/models/gltf/LeePerrySmith/Infinite-Level_02_Disp_NoSmoothUV-4096.jpg")
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0x552811,
                specular: 0x222222,
                shininess: 25,
                bumpMap: mapHeight,
                bumpScale: 12
            })
            this.loader = new GLTFLoader()
            this.loader.load("static/models/gltf/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
                this.createScene(gltf.scene.children[ 0 ].geometry, 100, material)
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.shadowMap.enabled = true
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            //
            if (this.statsEnabled) {
                this.stats = new this.$Stats()
                this.$statsPosition(this.stats)
                this.container.appendChild(this.stats.dom)
            }
            // EVENTS
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        createScene(geometry, scale, material) {
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.mesh.position.y = - 50
            this.mesh.scale.set(scale, scale, scale)
            this.mesh.castShadow = true
            this.mesh.receiveShadow = true
            this.scene.add(this.mesh)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onDocumentMouseMove(event) {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.mouseX = (event.clientX - x - this.windowHalfX)
            this.mouseY = (event.clientY - this.windowHalfY)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            if (this.statsEnabled) this.stats.update()
        },
        render() {
            this.targetX = this.mouseX * .001
            this.targetY = this.mouseY * .001
            if (this.mesh) {
                this.mesh.rotation.y += 0.05 * (this.targetX - this.mesh.rotation.y)
                this.mesh.rotation.x += 0.05 * (this.targetY - this.mesh.rotation.x)
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsBumpmap-container {
    position: relative;
    width: 100%;
}
</style>
