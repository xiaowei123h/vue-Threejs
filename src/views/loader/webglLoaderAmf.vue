<template>
    <div class="webglLoaderAmf-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>
			<a href="http://amf.wikispaces.com" target="_blank" rel="noopener">AMF File format</a>
			<div>AMF loader test by <a href="https://github.com/tamarintech" target="_blank" rel="noopener">tamarintech</a></div>
			<div>Rook manufacturing file from <a href="http://amf.wikispaces.com/AMF+test+files" target="_blank" rel="noopener">AMF test files</a></div>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { AMFLoader } from '@/components/jsm/loaders/AMFLoader.js'
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
            this.scene.background = new this.$THREE.Color(0x999999)
            this.scene.add(new this.$THREE.AmbientLight(0x999999))
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 500)
            // Z is up for objects intended to be 3D printed.
            this.camera.up.set(0, 0, 1)
            this.camera.position.set(0, - 9, 6)
            this.camera.add(new this.$THREE.PointLight(0xffffff, 0.8))
            this.scene.add(this.camera)
            var grid = new this.$THREE.GridHelper(50, 50, 0xffffff, 0x555555)
            grid.rotateOnAxis(new this.$THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180))
            this.scene.add(grid)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderAmf-container')[0].appendChild(this.renderer.domElement)
            var loader = new AMFLoader()
            loader.load('static/models/amf/rook.amf', (amfobject) => {
                this.scene.add(amfobject)
                this.render()
            })
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            controls.target.set(0, 1.2, 2)
            controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
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
.webglLoaderAmf-container {
    width: 100%;
    background-color: #999;
}
</style>
