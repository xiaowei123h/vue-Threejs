<template>
    <div class="webglBuffergeometryInstancingInterleaved-container">
        <div id="container"></div>
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - indexed instancing (single box): null,
            interleaved buffers
            <div id="notSupported" style="display:none">Sorry your graphics card + browser does not support hardware instancing</div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
            instances: 5000,
            moveQ: null,
            tmpQ: null,
            tmpM: null,
            currentM: null,
            lastTime: 0
        }
    },
    mounted() {
        this.moveQ = new this.$THREE.Quaternion(0.5, 0.5, 0.5, 0.0).normalize()
        this.tmpQ = new this.$THREE.Quaternion()
        this.tmpM = new this.$THREE.Matrix4()
        this.currentM = new this.$THREE.Matrix4()
        this.init()
        this.animate()
    },
    methods: {
        init() {
			this.container = document.getElementById('container')
			this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 1000)
			this.scene = new this.$THREE.Scene()
			this.scene.background = new this.$THREE.Color(0x101010)
			// geometry
			var geometry = new this.$THREE.InstancedBufferGeometry()
			// per mesh data x,y,z,w,u,v,s,t for 4-element alignment
			// only use x,y,z and u,v; but x, y, z, nx, ny, nz, u, v would be a good layout
			var vertexBuffer = new this.$THREE.InterleavedBuffer(new Float32Array([
				// Front
				- 1, 1, 1, 0, 0, 0, 0, 0,
				1, 1, 1, 0, 1, 0, 0, 0,
				- 1, - 1, 1, 0, 0, 1, 0, 0,
				1, - 1, 1, 0, 1, 1, 0, 0,
				// Back
				1, 1, - 1, 0, 1, 0, 0, 0,
				- 1, 1, - 1, 0, 0, 0, 0, 0,
				1, - 1, - 1, 0, 1, 1, 0, 0,
				- 1, - 1, - 1, 0, 0, 1, 0, 0,
				// Left
				- 1, 1, - 1, 0, 1, 1, 0, 0,
				- 1, 1, 1, 0, 1, 0, 0, 0,
				- 1, - 1, - 1, 0, 0, 1, 0, 0,
				- 1, - 1, 1, 0, 0, 0, 0, 0,
				// Right
				1, 1, 1, 0, 1, 0, 0, 0,
				1, 1, - 1, 0, 1, 1, 0, 0,
				1, - 1, 1, 0, 0, 0, 0, 0,
				1, - 1, - 1, 0, 0, 1, 0, 0,
				// Top
				- 1, 1, 1, 0, 0, 0, 0, 0,
				1, 1, 1, 0, 1, 0, 0, 0,
				- 1, 1, - 1, 0, 0, 1, 0, 0,
				1, 1, - 1, 0, 1, 1, 0, 0,
				// Bottom
				1, - 1, 1, 0, 1, 0, 0, 0,
				- 1, - 1, 1, 0, 0, 0, 0, 0,
				1, - 1, - 1, 0, 1, 1, 0, 0,
				- 1, - 1, - 1, 0, 0, 1, 0, 0
			]), 8);
			// Use vertexBuffer, starting at offset 0, 3 items in position attribute
			var positions = new this.$THREE.InterleavedBufferAttribute(vertexBuffer, 3, 0)
			geometry.setAttribute('position', positions)
			// Use vertexBuffer, starting at offset 4, 2 items in uv attribute
			var uvs = new this.$THREE.InterleavedBufferAttribute(vertexBuffer, 2, 4)
			geometry.setAttribute('uv', uvs)
			var indices = new Uint16Array([
				0, 2, 1,
				2, 3, 1,
				4, 6, 5,
				6, 7, 5,
				8, 10, 9,
				10, 11, 9,
				12, 14, 13,
				14, 15, 13,
				16, 17, 18,
				18, 17, 19,
				20, 21, 22,
				22, 21, 23
			])
			geometry.setIndex(new this.$THREE.BufferAttribute(indices, 1))
			// material
			var material = new this.$THREE.MeshBasicMaterial()
			material.map = new this.$THREE.TextureLoader().load('textures/crate.gif')
			material.map.flipY = false
			// per instance data
			var matrix = new this.$THREE.Matrix4()
			var offset = new this.$THREE.Vector3()
			var orientation = new this.$THREE.Quaternion()
			var scale = new this.$THREE.Vector3(1, 1, 1)
			var x, y, z, w
			this.mesh = new this.$THREE.InstancedMesh(geometry, material, this.instances)
			for (var i = 0; i < this.instances; i ++) {
				// offsets
				x = Math.random() * 100 - 50
				y = Math.random() * 100 - 50
				z = Math.random() * 100 - 50
				offset.set(x, y, z).normalize()
				offset.multiplyScalar(5) // move out at least 5 units from center in current direction
				offset.set(x + offset.x, y + offset.y, z + offset.z)
				// orientations
				x = Math.random() * 2 - 1
				y = Math.random() * 2 - 1
				z = Math.random() * 2 - 1
				w = Math.random() * 2 - 1
				orientation.set(x, y, z, w).normalize()
				matrix.compose(offset, orientation, scale)
				this.mesh.setMatrixAt(i, matrix)
			}
			this.scene.add(this.mesh)
			this.renderer = new this.$THREE.WebGLRenderer()
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.container.appendChild(this.renderer.domElement)
			if (this.renderer.capabilities.isWebGL2 === false && this.renderer.extensions.has('ANGLE_instanced_arrays') === false) {
				document.getElementById('notSupported').style.display = ''
				return
			}
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
			this.container.appendChild(this.stats.dom)
			window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
			this.$statsPosition(this.stats)
        },
        animate() {
			requestAnimationFrame(this.animate)
			this.render()
			this.stats.update()
        },
        render() {
			var time = performance.now()
			this.mesh.rotation.y = time * 0.00005
			var delta = (time - this.lastTime) / 5000
			this.tmpQ.set(this.moveQ.x * delta, this.moveQ.y * delta, this.moveQ.z * delta, 1).normalize()
			this.tmpM.makeRotationFromQuaternion(this.tmpQ)
			for (var i = 0, il = this.instances; i < il; i ++) {
				this.mesh.getMatrixAt(i, this.currentM)
				this.currentM.multiply(this.tmpM)
				this.mesh.setMatrixAt(i, this.currentM)
			}
			this.mesh.instanceMatrix.needsUpdate = true
			this.lastTime = time
			this.renderer.render(this.scene, this.camera)
		}
    }
}
</script>

<style scoped>
.webglBuffergeometryInstancingInterleaved-container {
	position: relative;
    width: 100%;
}
</style>
