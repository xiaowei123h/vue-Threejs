<template>
    <div class="webglPerformanceNodes-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank">three.js</a><span class="white"> - NodeMaterial Performance</span><br />
			<br>
			<b>Node Material System</b>
			<br>
			<div>
				Standard<b>Node</b>Material |
				<span id="node" class="white">None</span>
			</div>
			<div>
				MeshStandard<b>Node</b>Material |
				<span id="nodeBased" class="white">None</span>
			</div>
			<br>
			<b>Current Material System</b>
			<br>
			<div>
				MeshStandardMaterial |
				<span id="default" class="white">None</span>
			</div>
			<br>
			<a id="startButton" href="javascript:void(0);">Click to benchmark</a>
		</div>
    </div>
</template>

<script>
import {
    StandardNodeMaterial,
    MeshStandardNodeMaterial
} from '@/components/jsm/nodes/Nodes.js'
export default {
    data() {
        return {
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			geometry: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
			meshes: [],
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        this.init()
        this.animate()
        document.getElementById('startButton').addEventListener('click', () => {
            if (this.geometry) {
                this.benchmark()
            }
        })
    },
    methods: {
        createScene(MaterialClass, count) {
            count = count !== undefined ? count : 70
            var i = 0
            for (i = 0; i < this.meshes.length; i ++) {
                this.meshes[ i ].material.dispose()
                this.scene.remove(this.meshes[ i ])
            }
            this.meshes.length = 0
            for (i = 0; i < count; i ++) {
                var material = new MaterialClass(),
                    color = 0xFFFFFF * Math.random()
                if (material.color.isNode) material.color.value.setHex(color)
                else material.color.setHex(color)
                // prevent share code
                material.defines.UUID = material.uuid
                var mesh = new this.$THREE.Mesh(this.geometry, material)
                mesh.position.x = Math.random() * 1000 - 500
                mesh.position.y = Math.random() * 1000 - 500
                mesh.position.z = Math.random() * 1000 - 500
                mesh.rotation.x = Math.random() * 2 * Math.PI
                mesh.rotation.y = Math.random() * 2 * Math.PI
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50 + 100
                mesh.matrixAutoUpdate = false
                mesh.updateMatrix()
                this.scene.add(mesh)
                this.meshes.push(mesh)
            }
        },
        benchmark() {
            var time, benchmarkTime
            // Stabilizes CPU
            this.createScene(this.$THREE.MeshStandardMaterial, 10)
            this.render()
            // Standard *Node* Material
            time = performance.now()
            this.createScene(StandardNodeMaterial)
            this.render()
            benchmarkTime = (performance.now() - time) / 1000
            document.getElementById('node').textContent = benchmarkTime.toFixed(3) + " seconds"
            // Mesh Standard *Node* Material
            time = performance.now()
            this.createScene(MeshStandardNodeMaterial)
            this.render()
            benchmarkTime = (performance.now() - time) / 1000
            document.getElementById('nodeBased').textContent = benchmarkTime.toFixed(3) + " seconds"
            // Mesh Standard Material
            time = performance.now()
            this.createScene(this.$THREE.MeshStandardMaterial)
            this.render()
            benchmarkTime = (performance.now() - time) / 1000
            document.getElementById('default').textContent = benchmarkTime.toFixed(3) + " seconds"
        },
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglPerformanceNodes-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 1800
            this.scene = new this.$THREE.Scene()
            this.scene.add(new this.$THREE.PointLight(0xFFFFFF))
            //this.scene.background = new this.$THREE.Color(0xffffff)
            var loader = new this.$THREE.BufferGeometryLoader()
            loader.load('static/models/json/suzanne_buffergeometry.json', (geo) => {
                geo.computeVertexNormals()
                this.geometry = geo
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) * 10
            this.mouseY = (event.clientY - this.windowHalfY) * 10
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglPerformanceNodes-container {
    position: relative;
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
