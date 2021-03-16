<template>
    <div class="miscControlsTransform-container">
        <div id="info">
			"W" translate | "E" rotate | "R" scale | "+/-" adjust size<br />
			"Q" toggle world/local space |  "Shift" snap to grid<br />
			"X" toggle X | "Y" toggle Y | "Z" toggle Z | "Spacebar" toggle enabled<br />
			"C" toggle camera | "V" random zoom
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { TransformControls } from '@/components/jsm/controls/TransformControls.js'
export default {
    data() {
        return {
            cameraPersp: null,
            cameraOrtho: null,
            currentCamera: null,
            scene: null,
            renderer: null,
            control: null,
            orbit: null,
        }
    },
    mounted() {
        this.init()
		this.render()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('miscControlsTransform-container')[0].appendChild(this.renderer.domElement)
            var aspect = this.$webglInnerWidth / window.innerHeight
            this.cameraPersp = new this.$THREE.PerspectiveCamera(50, aspect, 0.01, 30000)
            this.cameraOrtho = new this.$THREE.OrthographicCamera(- 600 * aspect, 600 * aspect, 600, - 600, 0.01, 30000)
            this.currentCamera = this.cameraPersp
            this.currentCamera.position.set(1000, 500, 1000)
            this.currentCamera.lookAt(0, 200, 0)
            this.scene = new this.$THREE.Scene()
            this.scene.add(new this.$THREE.GridHelper(1000, 10, 0x888888, 0x444444))
            var light = new this.$THREE.DirectionalLight(0xffffff, 2)
            light.position.set(1, 1, 1)
            this.scene.add(light)
            var texture = new this.$THREE.TextureLoader().load('static/textures/crate.gif', this.render)
            texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
            var geometry = new this.$THREE.BoxBufferGeometry(200, 200, 200)
            var material = new this.$THREE.MeshLambertMaterial({ map: texture, transparent: true })
            this.orbit = new OrbitControls(this.currentCamera, this.renderer.domElement)
            this.orbit.update()
            this.orbit.addEventListener('change', this.render)
            this.control = new TransformControls(this.currentCamera, this.renderer.domElement)
            this.control.addEventListener('change', this.render)
            this.control.addEventListener('dragging-changed', (event) => {
                this.orbit.enabled = ! event.value
            })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            this.control.attach(mesh)
            this.scene.add(this.control)
            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('keydown', (event) => {
                switch (event.keyCode) {
                    case 81: // Q
                        this.control.setSpace(this.control.space === "local" ? "world" : "local")
                        break
                    case 16: // Shift
                        this.control.setTranslationSnap(100)
                        this.control.setRotationSnap(this.$THREE.MathUtils.degToRad(15))
                        this.control.setScaleSnap(0.25)
                        break
                    case 87: // W
                        this.control.setMode("translate")
                        break
                    case 69: // E
                        this.control.setMode("rotate")
                        break
                    case 82: // R
                        this.control.setMode("scale")
                        break
                    case 67: // C
                        var position = this.currentCamera.position.clone()
                        this.currentCamera = this.currentCamera.isPerspectiveCamera ? this.cameraOrtho : this.cameraPersp
                        this.currentCamera.position.copy(position)
                        this.orbit.object = this.currentCamera
                        this.control.camera = this.currentCamera
                        this.currentCamera.lookAt(this.orbit.target.x, this.orbit.target.y, this.orbit.target.z)
                        this.onWindowResize()
                        break
                    case 86: // V
                        var randomFoV = Math.random() + 0.1
                        var randomZoom = Math.random() + 0.1
                        this.cameraPersp.fov = randomFoV * 160
                        this.cameraOrtho.bottom = - randomFoV * 500
                        this.cameraOrtho.top = randomFoV * 500
                        this.cameraPersp.zoom = randomZoom * 5
                        this.cameraOrtho.zoom = randomZoom * 5
                        this.onWindowResize()
                        break
                    case 187:
                    case 107: // +, =, num+
                        this.control.setSize(this.control.size + 0.1)
                        break
                    case 189:
                    case 109: // -, _, num-
                        this.control.setSize(Math.max(this.control.size - 0.1, 0.1))
                        break
                    case 88: // X
                        this.control.showX = ! this.control.showX
                        break
                    case 89: // Y
                        this.control.showY = ! this.control.showY
                        break
                    case 90: // Z
                        this.control.showZ = ! this.control.showZ
                        break
                    case 32: // Spacebar
                        this.control.enabled = ! this.control.enabled
                        break
                }
            })
            window.addEventListener('keyup', (event) => {
                switch (event.keyCode) {
                    case 16: // Shift
                        this.control.setTranslationSnap(null)
                        this.control.setRotationSnap(null)
                        this.control.setScaleSnap(null)
                        break
                }
            })
        },
        onWindowResize() {
            var aspect = (window.innerWidth - 281) / window.innerHeight
            this.cameraPersp.aspect = aspect
            this.cameraPersp.updateProjectionMatrix()
            this.cameraOrtho.left = this.cameraOrtho.bottom * aspect
            this.cameraOrtho.right = this.cameraOrtho.top * aspect
            this.cameraOrtho.updateProjectionMatrix()
            this.renderer.setSize((window.innerWidth - 281), window.innerHeight)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.currentCamera)
        }
    },
}
</script>

<style scoped>
.miscControlsTransform-container {
    width: 100%;
}
</style>
