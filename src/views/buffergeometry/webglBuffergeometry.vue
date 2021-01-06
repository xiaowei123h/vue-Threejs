<template>
    <div class="webglBuffergeometry-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry</div>
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
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            //
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 3500)
            this.camera.position.z = 2750
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.scene.fog = new this.$THREE.Fog(0x050505, 2000, 3500)
            //
            this.scene.add(new this.$THREE.AmbientLight(0x444444))
            var light1 = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            light1.position.set(1, 1, 1)
            this.scene.add(light1)
            var light2 = new this.$THREE.DirectionalLight(0xffffff, 1.5)
            light2.position.set(0, - 1, 0)
            this.scene.add(light2)
            //
            var triangles = 160000
            var geometry = new this.$THREE.BufferGeometry()
            var positions = []
            var normals = []
            var colors = []
            var color = new this.$THREE.Color()
            var n = 800, n2 = n / 2	// triangles spread in the cube
            var d = 12, d2 = d / 2	// individual triangle size
            var pA = new this.$THREE.Vector3()
            var pB = new this.$THREE.Vector3()
            var pC = new this.$THREE.Vector3()
            var cb = new this.$THREE.Vector3()
            var ab = new this.$THREE.Vector3()
            for (var i = 0; i < triangles; i ++) {
                // positions
                var x = Math.random() * n - n2
                var y = Math.random() * n - n2
                var z = Math.random() * n - n2
                var ax = x + Math.random() * d - d2
                var ay = y + Math.random() * d - d2
                var az = z + Math.random() * d - d2
                var bx = x + Math.random() * d - d2
                var by = y + Math.random() * d - d2
                var bz = z + Math.random() * d - d2
                var cx = x + Math.random() * d - d2
                var cy = y + Math.random() * d - d2
                var cz = z + Math.random() * d - d2
                positions.push(ax, ay, az)
                positions.push(bx, by, bz)
                positions.push(cx, cy, cz)
                // flat face normals
                pA.set(ax, ay, az)
                pB.set(bx, by, bz)
                pC.set(cx, cy, cz)
                cb.subVectors(pC, pB)
                ab.subVectors(pA, pB)
                cb.cross(ab)
                cb.normalize()
                var nx = cb.x
                var ny = cb.y
                var nz = cb.z
                normals.push(nx, ny, nz)
                normals.push(nx, ny, nz)
                normals.push(nx, ny, nz)
                // colors
                var vx = (x / n) + 0.5
                var vy = (y / n) + 0.5
                var vz = (z / n) + 0.5
                color.setRGB(vx, vy, vz)
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
            }
            function disposeArray() {
                this.array = null
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3).onUpload(disposeArray))
            geometry.setAttribute('normal', new this.$THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray))
            geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3).onUpload(disposeArray))
            geometry.computeBoundingSphere()
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
                side: this.$THREE.DoubleSide, vertexColors: true
            })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.001
            this.mesh.rotation.x = time * 0.25
            this.mesh.rotation.y = time * 0.5
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometry-container {
    width: 100%;
}
</style>
