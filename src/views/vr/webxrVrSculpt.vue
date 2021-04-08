<template>
    <div class="webxrVrSculpt-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - sculpt
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { MarchingCubes } from '@/components/jsm/objects/MarchingCubes.js'
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            controller1: null,
            controller2: null,
            controls: null,
            blob: null,
			points: [],
        }
    },
    mounted() {
        this.init()
        this.initBlob()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrVrSculpt-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x222222)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.01, 50)
            this.camera.position.set(0, 1.6, 3)
            this.controls = new OrbitControls(this.camera, this.container)
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
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 6, 0)
            this.scene.add(light)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrSculpt-container')[0].appendChild(VRButton.createButton(this.renderer))
            // controllers
            function onSelectStart() {
                this.userData.isSelecting = true
            }
            function onSelectEnd() {
                this.userData.isSelecting = false
            }
            this.controller1 = this.renderer.xr.getController(0)
            this.controller1.addEventListener('selectstart', onSelectStart)
            this.controller1.addEventListener('selectend', onSelectEnd)
            this.controller1.userData.id = 0
            this.scene.add(this.controller1)
            this.controller2 = this.renderer.xr.getController(1)
            this.controller2.addEventListener('selectstart', onSelectStart)
            this.controller2.addEventListener('selectend', onSelectEnd)
            this.controller2.userData.id = 1
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
        initBlob() {
            /*
            let path = "textures/cube/SwedishRoyalCastle/"
            let format = '.jpg'
            let urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ]
            let reflectionCube = new CubeTextureLoader().load(urls)
            */
            var material = new this.$THREE.MeshStandardMaterial({
                color: 0xffffff,
                // envMap: reflectionCube,
                roughness: 0.9,
                metalness: 0.0,
                transparent: true
            })
            this.blob = new MarchingCubes(64, material)
            this.blob.position.y = 1
            this.scene.add(this.blob)
            this.initPoints()
        },
        initPoints() {
            this.points = [
                { position: new this.$THREE.Vector3(), strength: 0.04, subtract: 10 },
                { position: new this.$THREE.Vector3(), strength: - 0.08, subtract: 10 }
            ]
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        transformPoint(vector) {
            vector.x = (vector.x + 1.0) / 2.0
            vector.y = (vector.y / 2.0)
            vector.z = (vector.z + 1.0) / 2.0
        },
        handleController(controller) {
            var pivot = controller.getObjectByName('pivot')
            if (pivot) {
                var id = controller.userData.id
                var matrix = pivot.matrixWorld
                this.points[ id ].position.setFromMatrixPosition(matrix)
                this.transformPoint(this.points[ id ].position)
                if (controller.userData.isSelecting) {
                    var strength = this.points[ id ].strength / 2
                    var vector = new this.$THREE.Vector3().setFromMatrixPosition(matrix)
                    this.transformPoint(vector)
                    this.points.push({ position: vector, strength: strength, subtract: 10 })
                }
            }
        },
        updateBlob() {
            this.blob.reset()
            for (let i = 0; i < this.points.length; i ++) {
                var point = this.points[ i ]
                var position = point.position
                this.blob.addBall(position.x, position.y, position.z, point.strength, point.subtract)
            }
        },
        render() {
            this.handleController(this.controller1)
            this.handleController(this.controller2)
            this.updateBlob()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrSculpt-container {
    position: relative;
    width: 100%;
}
</style>
