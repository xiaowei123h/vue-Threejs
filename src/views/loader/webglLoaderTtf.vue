<template>
    <div class="webglLoaderTtf-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - TTFLoader using opentype by gero3
			<br/>type to enter new text, drag to spin the text
		</div>
    </div>
</template>

<script>
import { TTFLoader } from '@/components/jsm/loaders/TTFLoader.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            cameraTarget: null,
            scene: null,
            renderer: null,
            group: null,
            textMesh1: null,
            textMesh2: null,
            textGeo: null,
            material: null,
			firstLetter: true,
			text:'three.js',
			height: 20,
            size: 70,
            hover: 30,
            curveSegments: 4,
            bevelThickness: 2,
            bevelSize: 1.5,
			font: null,
			mirror: true,
			targetRotation: 0,
			targetRotationOnPointerDown: 0,
			pointerX: 0,
			pointerXOnPointerDown: 0,
			windowHalfX: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderTtf-container')[0].appendChild(this.container)
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(30, this.$webglInnerWidth / window.innerHeight, 1, 1500)
            this.camera.position.set(0, 400, 700)
            this.cameraTarget = new this.$THREE.Vector3(0, 150, 0)
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x000000)
            this.scene.fog = new this.$THREE.Fog(0x000000, 250, 1400)
            // LIGHTS
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.125)
            dirLight.position.set(0, 0, 1).normalize()
            this.scene.add(dirLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 1.5)
            pointLight.position.set(0, 100, 90)
            pointLight.color.setHSL(Math.random(), 1, 0.5)
            this.scene.add(pointLight)
            this.material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
            this.group = new this.$THREE.Group()
            this.group.position.y = 100
            this.scene.add(this.group)
            var loader = new TTFLoader()
            loader.load('static/fonts/ttf/kenpixel.ttf', (json) => {
                this.font = new this.$THREE.Font(json)
                this.createText()
            })
            var plane = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(10000, 10000),
                new this.$THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
            )
            plane.position.y = 100
            plane.rotation.x = - Math.PI / 2
            this.scene.add(plane)
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            // EVENTS
            this.container.style.touchAction = 'none'
            this.container.addEventListener('pointerdown', this.onPointerDown, false)
            document.addEventListener('keypress', this.onDocumentKeyPress, false)
            document.addEventListener('keydown', this.onDocumentKeyDown, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentKeyDown(event) {
            if (this.firstLetter) {
                this.firstLetter = false
                this.text = ''
            }
            var keyCode = event.keyCode
            // backspace
            if (keyCode === 8) {
                event.preventDefault()
                this.text = this.text.substring(0, this.text.length - 1)
                this.refreshText()
                return false
            }
        },
        onDocumentKeyPress(event) {
            var keyCode = event.which
            // backspace
            if (keyCode === 8) {
                event.preventDefault()
            } else {
                var ch = String.fromCharCode(keyCode)
                this.text += ch
                this.refreshText()
            }
        },
        createText() {
            this.textGeo = new this.$THREE.TextBufferGeometry(this.text, {
                font: this.font,
                size: this.size,
                height: this.height,
                curveSegments: this.curveSegments,
                bevelThickness: this.bevelThickness,
                bevelSize: this.bevelSize,
                bevelEnabled: true
            })
            this.textGeo.computeBoundingBox()
            this.textGeo.computeVertexNormals()
            var centerOffset = - 0.5 * (this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x)
            this.textMesh1 = new this.$THREE.Mesh(this.textGeo, this.material)
            this.textMesh1.position.x = centerOffset
            this.textMesh1.position.y = this.hover
            this.textMesh1.position.z = 0
            this.textMesh1.rotation.x = 0
            this.textMesh1.rotation.y = Math.PI * 2
            this.group.add(this.textMesh1)
            if (this.mirror) {
                this.textMesh2 = new this.$THREE.Mesh(this.textGeo, this.material)
                this.textMesh2.position.x = centerOffset
                this.textMesh2.position.y = - this.hover
                this.textMesh2.position.z = this.height
                this.textMesh2.rotation.x = Math.PI
                this.textMesh2.rotation.y = Math.PI * 2
                this.group.add(this.textMesh2)
            }
        },
        refreshText() {
            this.group.remove(this.textMesh1)
            if (this.mirror) this.group.remove(this.textMesh2)
            if (! this.text) return
            this.createText()
        },
        onPointerDown(event) {
            if (event.isPrimary === false) return
            this.pointerXOnPointerDown = event.clientX - this.windowHalfX
            this.targetRotationOnPointerDown = this.targetRotation
            document.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.pointerX = event.clientX - this.windowHalfX
            this.targetRotation = this.targetRotationOnPointerDown + (this.pointerX - this.pointerXOnPointerDown) * 0.02
        },
        onPointerUp() {
            if (event.isPrimary === false) return
            document.removeEventListener('pointermove', this.onPointerMove)
            document.removeEventListener('pointerup', this.onPointerUp)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.group.rotation.y += (this.targetRotation - this.group.rotation.y) * 0.05
            this.camera.lookAt(this.cameraTarget)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglLoaderTtf-container {
    width: 100%;
}
</style>
