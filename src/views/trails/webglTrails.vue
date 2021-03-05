<template>
    <div class="webglTrails-container">
        
    </div>
</template>

<script>
export default {
    data() {
        return {
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
        }
    },
    mounted() {
        this.init();
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglTrails-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.set(0, 0, 1)
            this.clock = new this.$THREE.Clock()
            this.scene = new this.$THREE.Scene()
            var colorArray = [ new this.$THREE.Color(0xff0080), new this.$THREE.Color(0xffffff), new this.$THREE.Color(0x8000ff) ]
            var positions = []
            var colors = []
            for (var i = 0; i < 100; i ++) {
                positions.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
                var clr = colorArray[ Math.floor(Math.random() * colorArray.length) ]
                colors.push(clr.r, clr.g, clr.b)
            }
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            var material = new this.$THREE.PointsMaterial({ size: 4, vertexColors: true, depthTest: false, sizeAttenuation: false })
            var mesh = new this.$THREE.Points(geometry, material)
            this.scene.add(mesh)
            this.renderer = new this.$THREE.WebGLRenderer({ preserveDrawingBuffer: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClearColor = false
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
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
            var elapsedTime = this.clock.getElapsedTime()
            this.scene.rotation.y = elapsedTime * 0.5
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglTrails-container {
    width: 100%;
}
</style>
