<template>
    <div class="webglLoaderObjMtl-container">
        <div id="info">
		    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - OBJLoader + MTLLoader
		</div>
    </div>
</template>

<script>
import { DDSLoader } from '@/components/jsm/loaders/DDSLoader.js'
import { MTLLoader } from '@/components/jsm/loaders/MTLLoader.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
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
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderObjMtl-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 250
            // scene
            this.scene = new this.$THREE.Scene()
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            this.scene.add(this.camera)
            // model
            var onProgress = (xhr) => {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100
                    console.log(Math.round(percentComplete, 2) + '% downloaded')
                }
            }
            var onError = () => { }
            var manager = new this.$THREE.LoadingManager()
            manager.addHandler(/\.dds$/i, new DDSLoader())
            // comment in the following line and import TGALoader if your asset uses TGA textures
            // manager.addHandler(/\.tga$/i, new TGALoader())
            new MTLLoader(manager)
                .setPath('static/models/obj/male02/')
                .load('male02_dds.mtl', (materials) => {
                    materials.preload()
                    new OBJLoader(manager)
                        .setMaterials(materials)
                        .setPath('static/models/obj/male02/')
                        .load('male02.obj', (object) => {
                            object.position.y = - 95
                            this.scene.add(object)
                        }, onProgress, onError)
                })
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
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
.webglLoaderObjMtl-container {
    width: 100%;
}
</style>
