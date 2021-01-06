<template>
    <div class="webglBuffergeometryPointsInterleaved-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry - particles</div>
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
			points: null,
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 5, 3500)
            this.camera.position.z = 2750
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.scene.fog = new this.$THREE.Fog(0x050505, 2000, 3500)
            //
            var particles = 500000
            var geometry = new this.$THREE.BufferGeometry()
            // create a generic buffer of binary data (a single particle has 16 bytes of data)
            var arrayBuffer = new ArrayBuffer(particles * 16)
            // the following typed arrays share the same buffer
            var interleavedFloat32Buffer = new Float32Array(arrayBuffer)
            var interleavedUint8Buffer = new Uint8Array(arrayBuffer)
            //
            var color = new this.$THREE.Color()
            var n = 1000, n2 = n / 2 // particles spread in the cube
            for (var i = 0; i < interleavedFloat32Buffer.length; i += 4) {
                // position (first 12 bytes)
                var x = Math.random() * n - n2
                var y = Math.random() * n - n2
                var z = Math.random() * n - n2
                interleavedFloat32Buffer[i + 0] = x
                interleavedFloat32Buffer[i + 1] = y
                interleavedFloat32Buffer[i + 2] = z
                // color (last 4 bytes)
                var vx = (x / n) + 0.5
                var vy = (y / n) + 0.5
                var vz = (z / n) + 0.5
                color.setRGB(vx, vy, vz)
                var j = (i + 3) * 4
                interleavedUint8Buffer[j + 0] = color.r * 255
                interleavedUint8Buffer[j + 1] = color.g * 255
                interleavedUint8Buffer[j + 2] = color.b * 255
                interleavedUint8Buffer[j + 3] = 0 // not needed
            }
            var interleavedBuffer32 = new this.$THREE.InterleavedBuffer(interleavedFloat32Buffer, 4)
            var interleavedBuffer8 = new this.$THREE.InterleavedBuffer(interleavedUint8Buffer, 16)
            geometry.setAttribute('position', new this.$THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 0, false))
            geometry.setAttribute('color', new this.$THREE.InterleavedBufferAttribute(interleavedBuffer8, 3, 12, true))
            //
            var material = new this.$THREE.PointsMaterial({ size: 15, vertexColors: true })
            this.points = new this.$THREE.Points(geometry, material)
            this.scene.add(this.points)
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
            this.points.rotation.x = time * 0.25
            this.points.rotation.y = time * 0.5
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryPointsInterleaved-container {
    width: 100%;
}
</style>