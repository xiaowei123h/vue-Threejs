<template>
    <div class="webxrVrDragging-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - dragging
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from '@/components/jsm/webxr/XRControllerModelFactory.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,renderer: null,
            controller1: null,
            controller2: null,
            controllerGrip1: null,
            controllerGrip2: null,
			raycaster: null,
			intersected: [],
			tempMatrix: null,
            controls: null,
            group: null,
        }
    },
    mounted() {
        this.tempMatrix = new this.$THREE.Matrix4()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrVrDragging-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x808080)
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.set(0, 1.6, 3)
            this.controls = new OrbitControls(this.camera, this.container)
            this.controls.target.set(0, 1.6, 0)
            this.controls.update()
            var floorGeometry = new this.$THREE.PlaneBufferGeometry(4, 4)
            var floorMaterial = new this.$THREE.MeshStandardMaterial({
                color: 0xeeeeee,
                roughness: 1.0,
                metalness: 0.0
            })
            var floor = new this.$THREE.Mesh(floorGeometry, floorMaterial)
            floor.rotation.x = - Math.PI / 2
            floor.receiveShadow = true
            this.scene.add(floor)
            this.scene.add(new this.$THREE.HemisphereLight(0x808080, 0x606060))
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 6, 0)
            light.castShadow = true
            light.shadow.camera.top = 2
            light.shadow.camera.bottom = - 2
            light.shadow.camera.right = 2
            light.shadow.camera.left = - 2
            light.shadow.mapSize.set(4096, 4096)
            this.scene.add(light)
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            var geometries = [
                new this.$THREE.BoxBufferGeometry(0.2, 0.2, 0.2),
                new this.$THREE.ConeBufferGeometry(0.2, 0.2, 64),
                new this.$THREE.CylinderBufferGeometry(0.2, 0.2, 0.2, 64),
                new this.$THREE.IcosahedronBufferGeometry(0.2, 8),
                new this.$THREE.TorusBufferGeometry(0.2, 0.04, 64, 32)
            ]
            for (var i = 0; i < 50; i ++) {
                var geometry = geometries[ Math.floor(Math.random() * geometries.length) ]
                var material = new this.$THREE.MeshStandardMaterial({
                    color: Math.random() * 0xffffff,
                    roughness: 0.7,
                    metalness: 0.0
                })
                var object = new this.$THREE.Mesh(geometry, material)
                object.position.x = Math.random() * 4 - 2
                object.position.y = Math.random() * 2
                object.position.z = Math.random() * 4 - 2
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.setScalar(Math.random() + 0.5)
                object.castShadow = true
                object.receiveShadow = true
                this.group.add(object)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrDragging-container')[0].appendChild(VRButton.createButton(this.renderer))
            // controllers
            this.controller1 = this.renderer.xr.getController(0)
            this.controller1.addEventListener('selectstart', onSelectStart)
            this.controller1.addEventListener('selectend', onSelectEnd)
            this.scene.add(this.controller1)
            this.controller2 = this.renderer.xr.getController(1)
            this.controller2.addEventListener('selectstart', onSelectStart)
            this.controller2.addEventListener('selectend', onSelectEnd)
            this.scene.add(this.controller2)
            var controllerModelFactory = new XRControllerModelFactory()
            this.controllerGrip1 = this.renderer.xr.getControllerGrip(0)
            this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1))
            this.scene.add(this.controllerGrip1)
            this.controllerGrip2 = this.renderer.xr.getControllerGrip(1)
            this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2))
            this.scene.add(this.controllerGrip2)
            //
            var geometry = new this.$THREE.BufferGeometry().setFromPoints([ new this.$THREE.Vector3(0, 0, 0), new this.$THREE.Vector3(0, 0, - 1) ])
            var line = new this.$THREE.Line(geometry)
            line.name = 'line'
            line.scale.z = 5
            this.controller1.add(line.clone())
            this.controller2.add(line.clone())
            this.raycaster = new this.$THREE.Raycaster()
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onSelectStart(event) {
            var controller = event.target
            var intersections = getIntersections(controller)
            if (intersections.length > 0) {
                var intersection = intersections[ 0 ]
                var object = intersection.object
                object.material.emissive.b = 1
                controller.attach(object)
                controller.userData.selected = object
            }
        },
        onSelectEnd(event) {
            var controller = event.target
            if (controller.userData.selected !== undefined) {
                var object = controller.userData.selected
                object.material.emissive.b = 0
                this.group.attach(object)
                controller.userData.selected = undefined
            }
        },
        getIntersections(controller) {
            this.tempMatrix.identity().extractRotation(controller.matrixWorld)
            this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
            this.raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(this.tempMatrix)
            return this.raycaster.intersectObjects(this.group.children)
        },
        intersectObjects(controller) {
            // Do not highlight when already selected
            if (controller.userData.selected !== undefined) return
            var line = controller.getObjectByName('line')
            var intersections = getIntersections(controller)
            if (intersections.length > 0) {
                var intersection = intersections[ 0 ]
                var object = intersection.object
                object.material.emissive.r = 1
                this.intersected.push(object)
                line.scale.z = intersection.distance
            } else {
                line.scale.z = 5
            }
        },
        cleanIntersected() {
            while (this.intersected.length) {
                var object = this.intersected.pop()
                object.material.emissive.r = 0
            }
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.cleanIntersected()
            this.intersectObjects(this.controller1)
            this.intersectObjects(this.controller2)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrDragging-container {
    width: 100%;
}
</style>
