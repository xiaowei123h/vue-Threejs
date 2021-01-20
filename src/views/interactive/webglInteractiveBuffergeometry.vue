<template>
    <div class="webglInteractiveBuffergeometry-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive - buffergeometry</div>
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
            raycaster: null,
            mouse: null,
            mesh: null,
            line: null,
        }
    },
    mounted() {
        this.init();
		this.animate();
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
            var triangles = 5000
            var geometry = new this.$THREE.BufferGeometry()
            var positions = new Float32Array(triangles * 3 * 3)
            var normals = new Float32Array(triangles * 3 * 3)
            var colors = new Float32Array(triangles * 3 * 3)
            var color = new this.$THREE.Color()
            var n = 800, n2 = n / 2	// triangles spread in the cube
            var d = 120, d2 = d / 2	// individual triangle size
            var pA = new this.$THREE.Vector3()
            var pB = new this.$THREE.Vector3()
            var pC = new this.$THREE.Vector3()
            var cb = new this.$THREE.Vector3()
            var ab = new this.$THREE.Vector3()
            for (var i = 0; i < positions.length; i += 9) {
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
                positions[ i ] = ax
                positions[ i + 1 ] = ay
                positions[ i + 2 ] = az
                positions[ i + 3 ] = bx
                positions[ i + 4 ] = by
                positions[ i + 5 ] = bz
                positions[ i + 6 ] = cx
                positions[ i + 7 ] = cy
                positions[ i + 8 ] = cz
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
                normals[ i ] = nx
                normals[ i + 1 ] = ny
                normals[ i + 2 ] = nz
                normals[ i + 3 ] = nx
                normals[ i + 4 ] = ny
                normals[ i + 5 ] = nz
                normals[ i + 6 ] = nx
                normals[ i + 7 ] = ny
                normals[ i + 8 ] = nz
                // colors
                var vx = (x / n) + 0.5
                var vy = (y / n) + 0.5
                var vz = (z / n) + 0.5
                color.setRGB(vx, vy, vz)
                colors[ i ] = color.r
                colors[ i + 1 ] = color.g
                colors[ i + 2 ] = color.b
                colors[ i + 3 ] = color.r
                colors[ i + 4 ] = color.g
                colors[ i + 5 ] = color.b
                colors[ i + 6 ] = color.r
                colors[ i + 7 ] = color.g
                colors[ i + 8 ] = color.b
            }
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('normal', new this.$THREE.BufferAttribute(normals, 3))
            geometry.setAttribute('color', new this.$THREE.BufferAttribute(colors, 3))
            geometry.computeBoundingSphere()
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
                side: this.$THREE.DoubleSide, vertexColors: true
            })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            //
            this.raycaster = new this.$THREE.Raycaster()
            this.mouse = new this.$THREE.Vector2()
            geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(new Float32Array(4 * 3), 3))
            material = new this.$THREE.LineBasicMaterial({ color: 0xffffff, transparent: true })
            this.line = new this.$THREE.Line(geometry, material)
            this.scene.add(this.line)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            event.preventDefault()
            this.mouse.x = (event.clientX / this.$webglInnerWidth) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.001
            this.mesh.rotation.x = time * 0.15
            this.mesh.rotation.y = time * 0.25
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObject(this.mesh)
            if (intersects.length > 0) {
                var intersect = intersects[ 0 ]
                var face = intersect.face
                var linePosition = this.line.geometry.attributes.position
                var meshPosition = this.mesh.geometry.attributes.position
                linePosition.copyAt(0, meshPosition, face.a)
                linePosition.copyAt(1, meshPosition, face.b)
                linePosition.copyAt(2, meshPosition, face.c)
                linePosition.copyAt(3, meshPosition, face.a)
                this.mesh.updateMatrix()
                this.line.geometry.applyMatrix4(this.mesh.matrix)
                this.line.visible = true
            } else {
                this.line.visible = false
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInteractiveBuffergeometry-container {
    width: 100%;
}
</style>
