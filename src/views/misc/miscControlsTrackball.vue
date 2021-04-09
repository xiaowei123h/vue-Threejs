<template>
    <div class="miscControlsTrackball-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - trackball controls<br />
			MOVE mouse &amp; press LEFT/A: rotate, MIDDLE/S: zoom, RIGHT/D: pan
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
export default {
    data() {
        return {
            perspectiveCamera: null,
            orthographicCamera: null,
            controls: null,
            scene: null,
            renderer: null,
            stats: null,
			params: {
				orthographicCamera: false
			},
            frustumSize: 400,
            gui: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var aspect = this.$webglInnerWidth / window.innerHeight
            this.perspectiveCamera = new this.$THREE.PerspectiveCamera(60, aspect, 1, 1000)
            this.perspectiveCamera.position.z = 500
            this.orthographicCamera = new this.$THREE.OrthographicCamera(this.frustumSize * aspect / - 2, this.frustumSize * aspect / 2, this.frustumSize / 2, this.frustumSize / - 2, 1, 1000)
            this.orthographicCamera.position.z = 500
            // world
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xcccccc)
            this.scene.fog = new this.$THREE.FogExp2(0xcccccc, 0.002)
            var geometry = new this.$THREE.CylinderBufferGeometry(0, 10, 30, 4, 1)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
            for (var i = 0; i < 500; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = (Math.random() - 0.5) * 1000
                mesh.position.y = (Math.random() - 0.5) * 1000
                mesh.position.z = (Math.random() - 0.5) * 1000
                mesh.updateMatrix()
                mesh.matrixAutoUpdate = false
                this.scene.add(mesh)
            }
            // lights
            var dirLight1 = new this.$THREE.DirectionalLight(0xffffff)
            dirLight1.position.set(1, 1, 1)
            this.scene.add(dirLight1)
            var dirLight2 = new this.$THREE.DirectionalLight(0x002288)
            dirLight2.position.set(- 1, - 1, - 1)
            this.scene.add(dirLight2)
            var ambientLight = new this.$THREE.AmbientLight(0x222222)
            this.scene.add(ambientLight)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('miscControlsTrackball-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('miscControlsTrackball-container')[0].appendChild(this.stats.dom)
            //
            this.gui = new GUI()
            this.gui.add(this.params, 'orthographicCamera').name('use orthographic').onChange((value) => {
                this.controls.dispose()
                this.createControls(value ? this.orthographicCamera : this.perspectiveCamera)
            })
            //
            window.addEventListener('resize', this.onWindowResize, false)
            this.createControls(this.perspectiveCamera)
        },
        createControls(camera) {
            this.controls = new TrackballControls(camera, this.renderer.domElement)
            this.controls.rotateSpeed = 1.0
            this.controls.zoomSpeed = 1.2
            this.controls.panSpeed = 0.8
            this.controls.keys = [ 65, 83, 68 ]
        },
        onWindowResize() {
            var aspect = (window.innerWidth - 281) / window.innerHeight
            this.perspectiveCamera.aspect = aspect
            this.perspectiveCamera.updateProjectionMatrix()
            this.orthographicCamera.left = - this.frustumSize * aspect / 2
            this.orthographicCamera.right = this.frustumSize * aspect / 2
            this.orthographicCamera.top = this.frustumSize / 2
            this.orthographicCamera.bottom = - this.frustumSize / 2
            this.orthographicCamera.updateProjectionMatrix()
            this.renderer.setSize((window.innerWidth - 281), window.innerHeight)
            this.controls.handleResize()
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.stats.update()
            this.render()
        },
        render() {
            var camera = (this.params.orthographicCamera) ? this.orthographicCamera : this.perspectiveCamera
            this.renderer.render(this.scene, camera)
        }
    },
}
</script>

<style scoped>
.miscControlsTrackball-container {
    position: relative;
    width: 100%;
}
#info {
    background-color: #ccc;
    color: #000;
}
#info a {
    color: #f00;
}
</style>
