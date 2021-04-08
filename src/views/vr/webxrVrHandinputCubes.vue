<template>
    <div class="webxrVrHandinputCubes-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - handinput - cubes<br/>
			(Oculus Browser with #webxr-hands flag enabled)
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from '@/components/jsm/webxr/XRControllerModelFactory.js'
import { XRHandModelFactory } from '@/components/jsm/webxr/XRHandModelFactory.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            hand1: null,
            hand2: null,
            controller1: null,
            controller2: null,
            controllerGrip1: null,
            controllerGrip2: null,
			controls: null,
			grabbing: false,
			scaling: {
				active: false,
				initialDistance: 0,
				object: null,
				initialScale: 1
			},
            spheres: [],
            SphereRadius: 0.05
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrVrHandinputCubes-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x444444)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.set(0, 1.6, 3)
            this.controls = new OrbitControls(this.camera, this.container)
            this.controls.target.set(0, 1.6, 0)
            this.controls.update()
            var floorGeometry = new this.$THREE.PlaneBufferGeometry(4, 4)
            var floorMaterial = new this.$THREE.MeshStandardMaterial({ color: 0x222222 })
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
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrHandinputCubes-container')[0].appendChild(VRButton.createButton(this.renderer))
            // controllers
            this.controller1 = this.renderer.xr.getController(0)
            this.scene.add(this.controller1)
            this.controller2 = this.renderer.xr.getController(1)
            this.scene.add(this.controller2)
            var controllerModelFactory = new XRControllerModelFactory()
            var handModelFactory = new XRHandModelFactory().setPath("static/models/fbx/")
            // Hand 1
            this.controllerGrip1 = this.renderer.xr.getControllerGrip(0)
            this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1))
            this.scene.add(this.controllerGrip1)
            this.hand1 = this.renderer.xr.getHand(0)
            this.hand1.addEventListener('pinchstart', this.onPinchStartLeft)
            this.hand1.addEventListener('pinchend', () => {
                scaling.active = false
            })
            this.hand1.add(handModelFactory.createHandModel(this.hand1))
            this.scene.add(this.hand1)
            // Hand 2
            this.controllerGrip2 = this.renderer.xr.getControllerGrip(1)
            this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2))
            this.scene.add(this.controllerGrip2)
            this.hand2 = this.renderer.xr.getHand(1)
            this.hand2.addEventListener('pinchstart', this.onPinchStartRight)
            this.hand2.addEventListener('pinchend', this.onPinchEndRight)
            this.hand2.add(handModelFactory.createHandModel(this.hand2))
            this.scene.add(this.hand2)
            //
            var geometry = new this.$THREE.BufferGeometry().setFromPoints([ new this.$THREE.Vector3(0, 0, 0), new this.$THREE.Vector3(0, 0, - 1) ])
            var line = new this.$THREE.Line(geometry)
            line.name = 'line'
            line.scale.z = 5
            this.controller1.add(line.clone())
            this.controller2.add(line.clone())
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPinchStartLeft(event) {
            var controller = event.target
            if (this.grabbing) {
                var indexTip = controller.joints[ XRHand.INDEX_PHALANX_TIP ]
                var sphere = collideObject(indexTip)
                if (sphere) {
                    var sphere2 = this.hand2.userData.selected
                    console.log("sphere1", sphere, "sphere2", sphere2)
                    if (sphere === sphere2) {
                        this.scaling.active = true
                        this.scaling.object = sphere
                        this.scaling.initialScale = sphere.scale.x
                        this.scaling.initialDistance = indexTip.position.distanceTo(this.hand2.joints[ XRHand.INDEX_PHALANX_TIP ].position)
                        return
                    }
                }
            }
            var geometry = new this.$THREE.BoxBufferGeometry(SphereRadius, SphereRadius, SphereRadius)
            var material = new this.$THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff,
                roughness: 1.0,
                metalness: 0.0
            })
            var spawn = new this.$THREE.Mesh(geometry, material)
            spawn.geometry.computeBoundingSphere()
            var indexTip = controller.joints[ XRHand.INDEX_PHALANX_TIP ]
            spawn.position.copy(indexTip.position)
            spawn.quaternion.copy(indexTip.quaternion)
            spheres.push(spawn)
            this.scene.add(spawn)
        },
        collideObject(indexTip) {
            for (var i = 0; i < spheres.length; i ++) {
                var sphere = spheres[ i ]
                var distance = indexTip.getWorldPosition().distanceTo(sphere.getWorldPosition())
                if (distance < sphere.geometry.boundingSphere.radius * sphere.scale.x) {
                    return sphere
                }
            }
            return null
        },
        onPinchStartRight(event) {
            var controller = event.target
            var indexTip = controller.joints[ XRHand.INDEX_PHALANX_TIP ]
            var object = collideObject(indexTip)
            if (object) {
                this.grabbing = true
                indexTip.attach(object)
                controller.userData.selected = object
                console.log("Selected", object)
            }
        },
        onPinchEndRight(event) {
            var controller = event.target
            if (controller.userData.selected !== undefined) {
                var object = controller.userData.selected
                object.material.emissive.b = 0
                this.scene.attach(object)
                controller.userData.selected = undefined
                this.grabbing = false
            }
            this.scaling.active = false
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            if (this.scaling.active) {
                var indexTip1Pos = hand1.joints[ XRHand.INDEX_PHALANX_TIP ].position
                var indexTip2Pos = hand2.joints[ XRHand.INDEX_PHALANX_TIP ].position
                var distance = indexTip1Pos.distanceTo(indexTip2Pos)
                var newScale = this.scaling.initialScale + distance / this.scaling.initialDistance - 1
                this.scaling.object.scale.setScalar(newScale)
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrHandinputCubes-container {
    position: relative;
    width: 100%;
}
</style>
