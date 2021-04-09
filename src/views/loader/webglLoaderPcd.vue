<template>
    <div class="webglLoaderPcd-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>
			<a href="http://pointclouds.org/documentation/tutorials/pcd_file_format.php#pcd-file-format" target="_blank" rel="noopener">PCD File format</a>
			<div>PCD loader test by <a href="http://filipecaixeta.com.br" target="_blank" rel="noopener">Filipe Caixeta</a></div>
			<div>+/-: Increase/Decrease point size</div>
			<div>c: Change color</div>
		</div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { PCDLoader } from '@/components/jsm/loaders/PCDLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x000000)
            this.camera = new this.$THREE.PerspectiveCamera(15, this.$webglInnerWidth / window.innerHeight, 0.01, 40)
            this.camera.position.x = 0.4
            this.camera.position.z = - 2
            this.camera.up.set(0, 0, 1)
            this.scene.add(this.camera)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderPcd-container')[0].appendChild(this.renderer.domElement)
            var loader = new PCDLoader()
            loader.load('static/models/pcd/binary/Zaghetto.pcd', (points) => {
                this.scene.add(points)
                var center = points.geometry.boundingSphere.center
                this.controls.target.set(center.x, center.y, center.z)
                this.controls.update()
            })
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderPcd-container')[0].appendChild(this.container)
            this.container.appendChild(this.renderer.domElement)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.rotateSpeed = 2.0
            this.controls.zoomSpeed = 0.3
            this.controls.panSpeed = 0.2
            this.controls.staticMoving = true
            this.controls.minDistance = 0.3
            this.controls.maxDistance = 0.3 * 100
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('keypress', this.keyboard)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.controls.handleResize()
        },
        keyboard(ev) {
            var points = this.scene.getObjectByName('Zaghetto.pcd')
            switch (ev.key || String.fromCharCode(ev.keyCode || ev.charCode)) {
                case '+':
                    points.material.size *= 1.2
                    points.material.needsUpdate = true
                    break
                case '-':
                    points.material.size /= 1.2
                    points.material.needsUpdate = true
                    break
                case 'c':
                    points.material.color.setHex(Math.random() * 0xffffff)
                    points.material.needsUpdate = true
                    break
            }
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglLoaderPcd-container {
    position: relative;
    width: 100%;
}
</style>
