<template>
    <div class="miscControlsDeviceorientation-container">
        <div id="overlay">
            <el-button type="primary" size="mini" @click="handleStartBtn">Start Demo</el-button>
		</div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - equirectangular panorama demo with DeviceOrientation controls.<br/>
			photo by <a href="http://www.flickr.com/photos/jonragnarsson/2294472375/" target="_blank" rel="noopener">Jón Ragnarsson</a>.
		</div>
    </div>
</template>

<script>
import { DeviceOrientationControls } from '@/components/jsm/controls/DeviceOrientationControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
			startButton: null,
        }
    },
    mounted() {
    },
    methods: {
        handleStartBtn() {
            this.init()
            this.animate()
        },
        init() {
            var overlay = document.getElementById('overlay')
            overlay.remove()
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 1100)
            this.controls = new DeviceOrientationControls(this.camera)
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.SphereBufferGeometry(500, 60, 40)
            // invert the geometry on the x-axis so that all of the faces point inward
            geometry.scale(- 1, 1, 1)
            var material = new this.$THREE.MeshBasicMaterial({
                map: new this.$THREE.TextureLoader().load('static/textures/2294472375_24a3b8ef46_o.jpg')
            })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            var helperGeometry = new this.$THREE.BoxBufferGeometry(100, 100, 100, 4, 4, 4)
            var helperMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
            var helper = new this.$THREE.Mesh(helperGeometry, helperMaterial)
            this.scene.add(helper)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('miscControlsDeviceorientation-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        animate() {
            window.requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        }
    },
}
</script>

<style scoped>
.miscControlsDeviceorientation-container {
    width: 100%;
    height: 100vh;
}
#overlay {
    text-align: center;
    line-height: 100vh;
}
</style>
