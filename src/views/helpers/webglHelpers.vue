<template>
    <div class="webglHelpers-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - helpers
		</div>
    </div>
</template>

<script>
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { VertexNormalsHelper } from '@/components/jsm/helpers/VertexNormalsHelper.js'
import { VertexTangentsHelper } from '@/components/jsm/helpers/VertexTangentsHelper.js'
import { BufferGeometryUtils } from '@/components/jsm/utils/BufferGeometryUtils.js'
export default {
    data() {
        return {
            scene: null,
            renderer: null,
            camera: null,
            light: null,
			vnh: null,
			vth: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglHelpers-container')[0].appendChild(this.renderer.domElement)
            //
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 400
            this.scene = new this.$THREE.Scene()
            this.light = new this.$THREE.PointLight()
            this.light.position.set(200, 100, 150)
            this.scene.add(this.light)
            this.scene.add(new this.$THREE.PointLightHelper(this.light, 15))
            var gridHelper = new this.$THREE.GridHelper(400, 40, 0x0000ff, 0x808080)
            gridHelper.position.y = - 150
            gridHelper.position.x = - 150
            this.scene.add(gridHelper)
            var polarGridHelper = new this.$THREE.PolarGridHelper(200, 16, 8, 64, 0x0000ff, 0x808080)
            polarGridHelper.position.y = - 150
            polarGridHelper.position.x = 200
            this.scene.add(polarGridHelper)
            var loader = new GLTFLoader()
            loader.load('static/models/gltf/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                BufferGeometryUtils.computeTangents(mesh.geometry) // generates bad data due to degenerate UVs
                var group = new this.$THREE.Group()
                group.scale.multiplyScalar(50)
                this.scene.add(group)
                // To make sure that the matrixWorld is up to date for the boxhelpers
                group.updateMatrixWorld(true)
                group.add(mesh)
                this.vnh = new VertexNormalsHelper(mesh, 5)
                this.scene.add(this.vnh)
                this.vth = new VertexTangentsHelper(mesh, 5)
                this.scene.add(this.vth)
                this.scene.add(new this.$THREE.BoxHelper(mesh))
                var wireframe = new this.$THREE.WireframeGeometry(mesh.geometry)
                var line = new this.$THREE.LineSegments(wireframe)
                line.material.depthTest = false
                line.material.opacity = 0.25
                line.material.transparent = true
                line.position.x = 4
                group.add(line)
                this.scene.add(new this.$THREE.BoxHelper(line))
                var edges = new this.$THREE.EdgesGeometry(mesh.geometry)
                line = new this.$THREE.LineSegments(edges)
                line.material.depthTest = false
                line.material.opacity = 0.25
                line.material.transparent = true
                line.position.x = - 4
                group.add(line)
                this.scene.add(new this.$THREE.BoxHelper(line))
                this.scene.add(new this.$THREE.BoxHelper(group))
                this.scene.add(new this.$THREE.BoxHelper(this.scene))
            })
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var time = - performance.now() * 0.0003
            this.camera.position.x = 400 * Math.cos(time)
            this.camera.position.z = 400 * Math.sin(time)
            this.camera.lookAt(this.scene.position)
            this.light.position.x = Math.sin(time * 1.7) * 300
            this.light.position.y = Math.cos(time * 1.5) * 400
            this.light.position.z = Math.cos(time * 1.3) * 300
            if (this.vnh) this.vnh.update()
            if (this.vth) this.vth.update()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglHelpers-container {
    position: relative;
    width: 100%;
}
</style>
