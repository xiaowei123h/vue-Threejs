<template>
    <div class="webglBuffergeometryPoints-container">
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
            //
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 5, 3500)
            this.camera.position.z = 2750
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.scene.fog = new this.$THREE.Fog(0x050505, 2000, 3500)
            //
            var particles = 500000
            var geometry = new this.$THREE.BufferGeometry()
            var positions = []
            var colors = []
            var color = new this.$THREE.Color()
            var n = 1000, n2 = n / 2 // particles spread in the cube
            for (let i = 0; i < particles; i ++) {
                // positions
                var x = Math.random() * n - n2
                var y = Math.random() * n - n2
                var z = Math.random() * n - n2
                positions.push(x, y, z)
                // colors
                var vx = (x / n) + 0.5
                var vy = (y / n) + 0.5
                var vz = (z / n) + 0.5
                color.setRGB(vx, vy, vz)
                colors.push(color.r, color.g, color.b)
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            geometry.computeBoundingSphere()
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
.webglBuffergeometryPoints-container {
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
