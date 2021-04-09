<template>
    <div class="webglInstancingPerformance-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - instancing - performance
        </div>
        <div id="container"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { BufferGeometryUtils } from '@/components/jsm/utils/BufferGeometryUtils.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            gui: null,
            guiStatsEl: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            material: null,
            // gui
            Method: null,
            api: null,
            gui: null
        }
    },
    mounted() {
        this.Method = {
			INSTANCED: 'INSTANCED',
			MERGED: 'MERGED',
			NAIVE: 'NAIVE'
		}
		this.api = {
			method: this.Method.INSTANCED,
			count: 1000
		}
		//
		this.init()
		this.initMesh()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        clean() {
			var meshes = []
			this.scene.traverse((object) => {
				if (object.isMesh) meshes.push(object)
			})
			for (var i = 0; i < meshes.length; i ++) {
				var mesh = meshes[ i ]
				mesh.material.dispose()
				mesh.geometry.dispose()
				this.scene.remove(mesh)
			}
        },
        randomizeMatrix() { 
			var position = new this.$THREE.Vector3()
			var rotation = new this.$THREE.Euler()
			var quaternion = new this.$THREE.Quaternion()
			var scale = new this.$THREE.Vector3()
			return (matrix) => {
				position.x = Math.random() * 40 - 20
				position.y = Math.random() * 40 - 20
				position.z = Math.random() * 40 - 20
				rotation.x = Math.random() * 2 * Math.PI
				rotation.y = Math.random() * 2 * Math.PI
				rotation.z = Math.random() * 2 * Math.PI
				quaternion.setFromEuler(rotation)
				scale.x = scale.y = scale.z = Math.random() * 1
				matrix.compose(position, quaternion, scale)
			}
        },
        initMesh() {
			this.clean()
			// make instances
			new this.$THREE.BufferGeometryLoader()
				.setPath('static/models/json/')
				.load('suzanne_buffergeometry.json', (geometry) => {
					this.material = new this.$THREE.MeshNormalMaterial()
					geometry.computeVertexNormals()
					console.time(this.api.method + ' (build)')
					switch (this.api.method) {
						case this.Method.INSTANCED:
							this.makeInstanced(geometry)
							break
						case this.Method.MERGED:
							this.makeMerged(geometry)
							break
						case this.Method.NAIVE:
							this.makeNaive(geometry)
							break
					}
					console.timeEnd(this.api.method + ' (build)')
				})
        },
        makeInstanced(geometry) {
			var matrix = new this.$THREE.Matrix4()
			var mesh = new this.$THREE.InstancedMesh(geometry, this.material, this.api.count)
			for (var i = 0; i < this.api.count; i ++) {
				this.randomizeMatrix(matrix)
				mesh.setMatrixAt(i, matrix)
			}
			this.scene.add(mesh)
			//
			var geometryByteLength = this.getGeometryByteLength(geometry)
			this.guiStatsEl.innerHTML = [

				'<i>GPU draw calls</i>: 1',
				'<i>GPU memory</i>: ' + this.formatBytes( this.api.count * 16 + geometryByteLength, 2 )

			].join( '<br/>' )
        },
        makeMerged(geometry) {
			var geometries = []
			var matrix = new this.$THREE.Matrix4()
			for (var i = 0; i < this.api.count; i ++) {
				this.randomizeMatrix(matrix)
				var instanceGeometry = geometry.clone()
				instanceGeometry.applyMatrix4(matrix)
				geometries.push(instanceGeometry)
			}
			var mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
			this.scene.add(new this.$THREE.Mesh(mergedGeometry, this.material))
			//
			this.guiStatsEl.innerHTML = [

				'<i>GPU draw calls</i>: 1',
				'<i>GPU memory</i>: ' + this.formatBytes( getGeometryByteLength( mergedGeometry ), 2 )

			].join( '<br/>' )
        },
        makeNaive(geometry) {
			var matrix = new this.$THREE.Matrix4()
			for (var i = 0; i < this.api.count; i ++) {
				this.randomizeMatrix(matrix)
				var mesh = new this.$THREE.Mesh(geometry, this.material)
				mesh.applyMatrix4(matrix)
				this.scene.add(mesh)
			}
			//
			var geometryByteLength = this.getGeometryByteLength(geometry)
			this.guiStatsEl.innerHTML = [

				'<i>GPU draw calls</i>: ' + this.api.count,
				'<i>GPU memory</i>: ' + this.formatBytes( this.api.count * 16 + geometryByteLength, 2 )

			].join( '<br/>' )
        },
        init() {
			var width = this.$webglInnerWidth
			var height = window.innerHeight
			// camera
			this.camera = new this.$THREE.PerspectiveCamera(70, width / height, 1, 100)
			this.camera.position.z = 30
			// renderer
			this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(width, height)
			this.renderer.outputEncoding = this.$THREE.sRGBEncoding
			this.container = document.getElementById('container')
			this.container.appendChild(this.renderer.domElement)
			// scene
			this.scene = new this.$THREE.Scene()
			this.scene.background = new this.$THREE.Color(0xffffff)
			// controls
			this.controls = new OrbitControls(this.camera, this.renderer.domElement)
			this.controls.autoRotate = true
			// stats
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
			this.container.appendChild(this.stats.dom)
			// gui
			this.gui = new GUI()
			this.gui.add(this.api, 'method', this.Method).onChange(this.initMesh)
			this.gui.add(this.api, 'count', 1, 10000).step(1).onChange(this.initMesh)
			var perfFolder = this.gui.addFolder('Performance')
			this.guiStatsEl = document.createElement('li')
			this.guiStatsEl.classList.add('gui-stats')
			perfFolder.__ul.appendChild(this.guiStatsEl)
			perfFolder.open()
			// listeners
			window.addEventListener('resize', this.onWindowResize, false)
			Object.assign(window, { scene: this.scene })
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
			this.$statsPosition(this.stats)
        },
        animate() {
			requestAnimationFrame(this.animate)
			this.controls.update()
			this.stats.update()
			this.render()
        },
        render() {
			this.renderer.render(this.scene, this.camera)
        },
        getGeometryByteLength(geometry) {
			var total = 0
			if (geometry.index) total += geometry.index.array.byteLength
			for (var name in geometry.attributes) {
				total += geometry.attributes[ name ].array.byteLength
			}
			return total
        },
        // Source: https://stackoverflow.com/a/18650828/1314762
        formatBytes(bytes, decimals) {
			if (bytes === 0) return '0 bytes'
			var k = 1024
			var dm = decimals < 0 ? 0 : decimals
			var sizes = [ 'bytes', 'KB', 'MB' ]
			var i = Math.floor(Math.log(bytes) / Math.log(k))
			return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[ i ]
		}
    }
}
</script>

<style scoped>
.webglInstancingPerformance-container {
	position: relative;
    width: 100%;
}
#info {
    background-color: rgba(0,0,0,0.75);
}

.dg .folder .gui-stats {
    height: auto;
}
</style>
