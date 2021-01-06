<template>
    <div class="webglBuffergeometryGlbufferattribute-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry - custom VBOs</div>
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
			particles: 300000,
			drawCount: 10000,
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
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: false })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 5, 3500)
            this.camera.position.z = 2750
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.scene.fog = new this.$THREE.Fog(0x050505, 2000, 3500)
            //
            var geometry = new this.$THREE.BufferGeometry()
            var positions = []
            var positions2 = []
            var colors = []
            var color = new this.$THREE.Color()
            var n = 1000, n2 = n / 2 // particles spread in the cube
            for (var i = 0; i < this.particles; i ++) {
                // positions
                var x = Math.random() * n - n2
                var y = Math.random() * n - n2
                var z = Math.random() * n - n2
                positions.push(x, y, z)
                positions2.push(z * 0.3, x * 0.3, y * 0.3)
                // colors
                var vx = (x / n) + 0.5
                var vy = (y / n) + 0.5
                var vz = (z / n) + 0.5
                color.setRGB(vx, vy, vz)
                colors.push(color.r, color.g, color.b)
            }
            var gl = this.renderer.getContext()
            var pos = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, pos)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
            var pos2 = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, pos2)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions2), gl.STATIC_DRAW)
            var rgb = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, rgb)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
            var posAttr1 = new this.$THREE.GLBufferAttribute(pos, gl.FLOAT, 3, 4, this.particles)
            var posAttr2 = new this.$THREE.GLBufferAttribute(pos2, gl.FLOAT, 3, 4, this.particles)
            geometry.setAttribute('position', posAttr1)
            setInterval(function () {
                var attr = geometry.getAttribute('position')
                geometry.setAttribute('position', (attr === posAttr1) ? posAttr2 : posAttr1)
            }, 2000)
            geometry.setAttribute('color', new this.$THREE.GLBufferAttribute(rgb, gl.FLOAT, 3, 4, this.particles))
            //
            var material = new this.$THREE.PointsMaterial({ size: 15, vertexColors: this.$THREE.VertexColors })
            this.points = new this.$THREE.Points(geometry, material)
            // Choose one:
            // geometry.boundingSphere = (new this.$THREE.Sphere()).set(new this.$THREE.Vector3(), Infinity)
            this.points.frustumCulled = false
            this.scene.add(this.points)
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
            this.drawCount = (Math.max(5000, this.drawCount) + Math.floor(500 * Math.random())) % this.particles
            this.points.geometry.setDrawRange(0, this.drawCount)
            const time = Date.now() * 0.001
            this.points.rotation.x = time * 0.1
            this.points.rotation.y = time * 0.2
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryGlbufferattribute-container {
    width: 100%;
}
</style>
