<template>
    <div class="webglSkinningSimple-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - simple skinning -
			<a href="https://github.com/mrdoob/three.js/blob/master/examples/models/skinned/simple/simple.blend" target="_blank" rel="noopener">Blender File</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            stats: null,
            mixer: null,
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglSkinningSimple-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(18, 6, 18)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xa0a0a0)
            this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 70, 100)
            this.clock = new this.$THREE.Clock()
            // ground
            var geometry = new this.$THREE.PlaneBufferGeometry(500, 500)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
            var ground = new this.$THREE.Mesh(geometry, material)
            ground.position.set(0, - 5, 0)
            ground.rotation.x = - Math.PI / 2
            ground.receiveShadow = true
            this.scene.add(ground)
            var grid = new this.$THREE.GridHelper(500, 100, 0x000000, 0x000000)
            grid.position.y = - 5
            grid.material.opacity = 0.2
            grid.material.transparent = true
            this.scene.add(grid)
            // lights
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
            hemiLight.position.set(0, 200, 0)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.8)
            dirLight.position.set(0, 20, 10)
            dirLight.castShadow = true
            dirLight.shadow.camera.top = 18
            dirLight.shadow.camera.bottom = - 10
            dirLight.shadow.camera.left = - 12
            dirLight.shadow.camera.right = 12
            this.scene.add(dirLight)
            //
            var loader = new GLTFLoader()
            loader.load('static/models/gltf/SimpleSkinning.gltf', (gltf) => {
                console.log(gltf.scene)
                console.log(this.scene)
                this.scene.add(gltf.scene)
                // gltf.scene.traverse((child) => {
                //     if (child.isSkinnedMesh) child.castShadow = true
                // })
                // this.mixer = new this.$THREE.AnimationMixer(gltf.scene)
                // this.mixer.clipAction(gltf.animations[ 0 ]).play()
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enablePan = false
            controls.minDistance = 5
            controls.maxDistance = 50
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.mixer) this.mixer.update(this.clock.getDelta())
            this.render()
            this.stats.update()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglSkinningSimple-container {
    width: 100%;
}
</style>
