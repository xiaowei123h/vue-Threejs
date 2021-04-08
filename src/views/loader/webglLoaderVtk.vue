<template>
    <div class="webglLoaderVtk-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
            vtk formats loader test<br />
            Legacy vtk model from <a href="http://www.cc.gatech.edu/projects/large_models/" target="_blank" rel="noopener">The GeorgiaTech Lagre Geometric Model Archive</a>
		</div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js';
import { VTKLoader } from '@/components/jsm/loaders/VTKLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.01, 1e10)
            this.camera.position.z = 0.2
            this.scene = new this.$THREE.Scene()
            this.scene.add(this.camera)
            // light
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x000000, 1)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            dirLight.position.set(2, 2, 2)
            this.scene.add(dirLight)
            var loader = new VTKLoader()
            loader.load("static/models/vtk/bunny.vtk", (geometry) => {
                geometry.center()
                geometry.computeVertexNormals()
                var material = new this.$THREE.MeshLambertMaterial({ color: 0xffffff })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(- 0.075, 0.005, 0)
                mesh.scale.multiplyScalar(0.2)
                this.scene.add(mesh)
            })
            var loader1 = new VTKLoader()
            loader1.load('static/models/vtk/cube_ascii.vtp', (geometry) => {
                geometry.computeVertexNormals()
                geometry.center()
                var material = new this.$THREE.MeshLambertMaterial({ color: 0x00ff00 })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(- 0.025, 0, 0)
                mesh.scale.multiplyScalar(0.01)
                this.scene.add(mesh)
            })
            var loader2 = new VTKLoader()
            loader2.load('static/models/vtk/cube_binary.vtp', (geometry) => {
                geometry.computeVertexNormals()
                geometry.center()
                var material = new this.$THREE.MeshLambertMaterial({ color: 0x0000ff })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(0.025, 0, 0)
                mesh.scale.multiplyScalar(0.01)
                this.scene.add(mesh)
            })
            var loader3 = new VTKLoader()
            loader3.load('static/models/vtk/cube_no_compression.vtp', (geometry) => {
                geometry.computeVertexNormals()
                geometry.center()
                var material = new this.$THREE.MeshLambertMaterial({ color: 0xff0000 })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(0.075, 0, 0)
                mesh.scale.multiplyScalar(0.01)
                this.scene.add(mesh)
            })
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderVtk-container')[0].appendChild(this.container)
            this.container.appendChild(this.renderer.domElement)
            // controls
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = .1
            this.controls.maxDistance = 0.5
            this.controls.rotateSpeed = 5.0
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.controls.handleResize()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglLoaderVtk-container {
    width: 100%;
}
</style>
