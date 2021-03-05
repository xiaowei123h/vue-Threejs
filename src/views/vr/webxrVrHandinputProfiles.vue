<template>
    <div class="webxrVrHandinputProfiles-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - handinput - profiles<br/>
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
			currentHandModel: {
				left: 0,
				right: 0
			},
			handModels: {
				left: null,
				right: null
			},
			controls: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrVrHandinputProfiles-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            window.scene = this.scene
            this.scene.background = new this.$THREE.Color(0x444444)
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10)
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
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrHandinputProfiles-container')[0].appendChild(VRButton.createButton(this.renderer))
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
            this.scene.add(this.hand1)
            handModels.left = [
                handModelFactory.createHandModel(this.hand1, "boxes"),
                handModelFactory.createHandModel(this.hand1, "spheres"),
                handModelFactory.createHandModel(this.hand1, "oculus", { model: "lowpoly" }),
                handModelFactory.createHandModel(this.hand1, "oculus")
            ]
            handModels.left.forEach(model => {
                model.visible = false
                this.hand1.add(model)
            })
            handModels.left[ this.currentHandModel.left ].visible = true
            function cycleHandModel(hand) {
                handModels[ hand ][ this.currentHandModel[ hand ] ].visible = false
                this.currentHandModel[ hand ] = (this.currentHandModel[ hand ] + 1) % handModels[ hand ].length
                handModels[ hand ][ this.currentHandModel[ hand ] ].visible = true
            }
            this.hand1.addEventListener('pinchend', evt => {
                cycleHandModel(evt.handedness)
            })
            // Hand 2
            this.controllerGrip2 = this.renderer.xr.getControllerGrip(1)
            this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2))
            this.scene.add(this.controllerGrip2)
            this.hand2 = this.renderer.xr.getHand(1)
            this.scene.add(this.hand2)
            this.handModels.right = [
                handModelFactory.createHandModel(this.hand2, "boxes"),
                handModelFactory.createHandModel(this.hand2, "spheres"),
                handModelFactory.createHandModel(this.hand2, "oculus", { model: "lowpoly" }),
                handModelFactory.createHandModel(this.hand2, "oculus")
            ]
            this.handModels.right.forEach(model => {
                model.visible = false
                this.hand2.add(model)
            })
            this.handModels.right[ this.currentHandModel.right ].visible = true
            window.handModels = this.handModels
            this.hand2.addEventListener('pinchend', evt => {
                cycleHandModel(evt.handedness)
            })
            //
            window.hands = [ this.hand1, this.hand2 ]
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
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrHandinputProfiles-container {
    width: 100%;
}
</style>
