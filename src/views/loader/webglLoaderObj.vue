<template>
    <div class="webglLoaderObj-container">
        <div id="info">
		    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - OBJLoader test
		</div>
    </div>
</template>

<script>
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
			object: null,
        }
    },
    mounted() {
        this.windowHalfX = window.innerWidth / 2
        this.lwindowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderObj-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 250
            // scene
            this.scene = new this.$THREE.Scene()
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            this.scene.add(this.camera)
            // manager
            function loadModel() {
                this.object.traverse((child) => {
                    if (child.isMesh) child.material.map = texture
                })
                this.object.position.y = - 95
                this.scene.add(this.object)
            }
            var manager = new this.$THREE.LoadingManager(loadModel)
            manager.onProgress = (item, loaded, total) => {
                console.log(item, loaded, total)
            }
            // texture
            var textureLoader = new this.$THREE.TextureLoader(manager)
            var texture = textureLoader.load('static/textures/uv_grid_opengl.jpg')
            // model
            function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100
                    console.log('model ' + Math.round(percentComplete, 2) + '% downloaded')
                }
            }
            function onError() {}
            var loader = new OBJLoader(manager)
            loader.load('static/models/obj/male02/male02.obj', (obj) => {
                this.object = obj
            }, onProgress, onError)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) / 2
            this.mouseY = (event.clientY - this.windowHalfY) / 2
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderObj-container {
    width: 100%;
}
</style>
