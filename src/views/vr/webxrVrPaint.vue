<template>
    <div class="webxrVrPaint-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - paint
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { TubePainter } from '@/components/jsm/misc/TubePainter.js'
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            controller1: null,
            controller2: null,
			cursor: null,
			controls: null,
        }
    },
    mounted() {
        this.cursor = new this.$THREE.Vector3()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webxrVrPaint-container')[0].appendChild(container)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x222222)
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50)
            this.camera.position.set(0, 1.6, 3)
            this.controls = new OrbitControls(this.camera, container)
            this.controls.target.set(0, 1.6, 0)
            this.controls.update()
            var tableGeometry = new this.$THREE.BoxBufferGeometry(0.5, 0.8, 0.5)
            var tableMaterial = new this.$THREE.MeshStandardMaterial({
                color: 0x444444,
                roughness: 1.0,
                metalness: 0.0
            })
            var table = new this.$THREE.Mesh(tableGeometry, tableMaterial)
            table.position.y = 0.35
            table.position.z = 0.85
            this.scene.add(table)
            var floorGometry = new this.$THREE.PlaneBufferGeometry(4, 4)
            var floorMaterial = new this.$THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 1.0,
                metalness: 0.0
            })
            var floor = new this.$THREE.Mesh(floorGometry, floorMaterial)
            floor.rotation.x = - Math.PI / 2
            this.scene.add(floor)
            var grid = new this.$THREE.GridHelper(10, 20, 0x111111, 0x111111)
            // grid.material.depthTest = false // avoid z-fighting
            this.scene.add(grid)
            this.scene.add(new this.$THREE.HemisphereLight(0x888877, 0x777788))
            var light = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            light.position.set(0, 4, 0)
            this.scene.add(light)
            //
            var painter1 = new TubePainter()
            this.scene.add(painter1.mesh)
            var painter2 = new TubePainter()
            this.scene.add(painter2.mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.xr.enabled = true
            container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrPaint-container')[0].appendChild(VRButton.createButton(this.renderer))
            // controllers
            function onSelectStart() {
                this.userData.isSelecting = true
            }
            function onSelectEnd() {
                this.userData.isSelecting = false
            }
            function onSqueezeStart() {
                this.userData.isSqueezing = true
                this.userData.positionAtSqueezeStart = this.position.y
                this.userData.scaleAtSqueezeStart = this.scale.x
            }
            function onSqueezeEnd() {
                this.userData.isSqueezing = false
            }
            this.controller1 = renderer.xr.getController(0)
            this.controller1.addEventListener('selectstart', onSelectStart)
            this.controller1.addEventListener('selectend', onSelectEnd)
            this.controller1.addEventListener('squeezestart', onSqueezeStart)
            this.controller1.addEventListener('squeezeend', onSqueezeEnd)
            this.controller1.userData.painter = painter1
            this.scene.add(this.controller1)
            this.controller2 = renderer.xr.getController(1)
            this.controller2.addEventListener('selectstart', onSelectStart)
            this.controller2.addEventListener('selectend', onSelectEnd)
            this.controller2.addEventListener('squeezestart', onSqueezeStart)
            this.controller2.addEventListener('squeezeend', onSqueezeEnd)
            this.controller2.userData.painter = painter2
            this.scene.add(this.controller2)
            //
            var geometry = new this.$THREE.CylinderBufferGeometry(0.01, 0.02, 0.08, 5)
            geometry.rotateX(- Math.PI / 2)
            var material = new this.$THREE.MeshStandardMaterial({ flatShading: true })
            var mesh = new this.$THREE.Mesh(geometry, material)
            var pivot = new this.$THREE.Mesh(new this.$THREE.IcosahedronBufferGeometry(0.01, 3))
            pivot.name = 'pivot'
            pivot.position.z = - 0.05
            mesh.add(pivot)
            this.controller1.add(mesh.clone())
            this.controller2.add(mesh.clone())
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        handleController(controller) {
            var userData = controller.userData
            var painter = userData.painter
            var pivot = controller.getObjectByName('pivot')
            if (userData.isSqueezing === true) {
                var delta = (controller.position.y - userData.positionAtSqueezeStart) * 5
                var scale = Math.max(0.1, userData.scaleAtSqueezeStart + delta)
                pivot.scale.setScalar(scale)
                painter.setSize(scale)
            }
            cursor.setFromMatrixPosition(pivot.matrixWorld)
            if (userData.isSelecting === true) {
                painter.lineTo(cursor)
                painter.update()
            } else {
                painter.moveTo(cursor)
            }
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.handleController(this.controller1)
            this.handleController(this.controller2)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrPaint-container {
    width: 100%;
}
</style>
