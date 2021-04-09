<template>
    <div class="webglLoaderFbx-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - FBXLoader<br />
			Character and animation from <a href="https://www.mixamo.com/" target="_blank" rel="noopener">Mixamo</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { FBXLoader } from '@/components/jsm/loaders/FBXLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
			clock: null,
			mixer: null,
        }
    },
    mounted() {
        this.clock = new this.$moduleTHREE.Clock()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderFbx-container')[0].appendChild(container)
            this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.set(100, 200, 300)
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0xa0a0a0)
            this.scene.fog = new this.$moduleTHREE.Fog(0xa0a0a0, 200, 1000)
            var hemiLight = new this.$moduleTHREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 200, 0)
            this.scene.add(hemiLight)
            var dirLight = new this.$moduleTHREE.DirectionalLight(0xffffff)
            dirLight.position.set(0, 200, 100)
            dirLight.castShadow = true
            dirLight.shadow.camera.top = 180
            dirLight.shadow.camera.bottom = - 100
            dirLight.shadow.camera.left = - 120
            dirLight.shadow.camera.right = 120
            this.scene.add(dirLight)
            // this.scene.add(new this.$moduleTHREE.CameraHelper(dirLight.shadow.camera))
            // ground
            var mesh = new this.$moduleTHREE.Mesh(new this.$moduleTHREE.PlaneBufferGeometry(2000, 2000), new this.$moduleTHREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
            mesh.rotation.x = - Math.PI / 2
            mesh.receiveShadow = true
            this.scene.add(mesh)
            var grid = new this.$moduleTHREE.GridHelper(2000, 20, 0x000000, 0x000000)
            grid.material.opacity = 0.2
            grid.material.transparent = true
            this.scene.add(grid)
            // model
            var loader = new FBXLoader()
            loader.load('static/models/fbx/Samba Dancing.fbx', (object) => {
                this.mixer = new this.$moduleTHREE.AnimationMixer(object)
                var action = this.mixer.clipAction(object.animations[ 0 ])
                action.play()
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                this.scene.add(object)
            })
            this.renderer = new this.$moduleTHREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 100, 0)
            controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
            // stats
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            if (this.mixer) this.mixer.update(delta)
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglLoaderFbx-container {
    position: relative;
    width: 100%;
}
</style>
