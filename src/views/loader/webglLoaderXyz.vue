<template>
    <div class="webglLoaderXyz-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - XYZ loader<br/>
            asset from <a href="https://people.math.sc.edu/Burkardt/data/xyz/xyz.html" target="_blank" rel="noopener">people.math.sc.edu</a> via GNU LGPL
		</div>
    </div>
</template>

<script>
import { XYZLoader } from '@/components/jsm/loaders/XYZLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
			points: null, 
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(10, 7, 10)
            this.scene = new this.$THREE.Scene()
            this.scene.add(this.camera)
            this.camera.lookAt(this.scene.position)
            this.clock = new this.$THREE.Clock()
            var loader = new XYZLoader()
            loader.load('static/models/xyz/helix_201.xyz', (geometry) => {
                geometry.center()
                var material = new this.$THREE.PointsMaterial({ size: 0.1 })
                this.points = new this.$THREE.Points(geometry, material)
                this.scene.add(this.points)
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderXyz-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            if (this.points) {
                this.points.rotation.x += delta * 0.2
                this.points.rotation.y += delta * 0.5
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglLoaderXyz-container {
    width: 100%;
}
</style>
