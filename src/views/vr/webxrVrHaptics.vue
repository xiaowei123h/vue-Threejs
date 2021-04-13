<template>
    <div class="webxrVrHaptics-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - haptics
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
            scene: null,
            renderer: null,
            controller1: null,
            controller2: null,
            controllerGrip1: null,
            controllerGrip2: null,
			box: null,
			controllers: [],
			oscillators: [],
            controls: null,
            group: null,
			audioCtx: null,
        }
    },
    mounted() {
        this.box = new this.$THREE.Box3()
        this.init()
		this.animate()
    },
    methods: {
        initAudio() {
            if (this.audioCtx !== null) {
                return
            }
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
            function createOscillator() {
                var oscillator = this.audioCtx.createOscillator()
                var real = Array.from({ length: 8192 }, (_, n) => (
                    n === 0 ?
                        0 :
                        4 / (n * Math.PI) * Math.sin(Math.PI * n * 0.18)
            ))
                var imag = real.map(() => 0)
                oscillator.setPeriodicWave(this.audioCtx.createPeriodicWave(Float32Array.from(real), Float32Array.from(imag)))
                oscillator.start()
                return oscillator
            }
            this.oscillators.push(createOscillator())
            this.oscillators.push(createOscillator())
            window.this.oscillators = this.oscillators
        },
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrVrHaptics-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x808080)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 10)
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
            this.group.position.z = - 0.5
            this.scene.add(this.group)
            for (var i = 0; i < 10; i ++) {
                var intensity = (i + 1) / 10
                var w = 0.1
                var h = 0.1
                var minH = 1
                var geometry = new this.$THREE.BoxBufferGeometry(w, h * i + minH, w)
                var material = new this.$THREE.MeshStandardMaterial({
                    color: new this.$THREE.Color(intensity, 0.1, 0.1),
                    roughness: 0.7,
                    metalness: 0.0
                })
                var object = new this.$THREE.Mesh(geometry, material)
                object.position.x = (i - 5) * (w + 0.05)
                object.castShadow = true
                object.receiveShadow = true
                object.userData = {
                    index: i + 1,
                    intensity: intensity
                }
                this.group.add(object)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrHaptics-container')[0].appendChild(VRButton.createButton(this.renderer))
            document.getElementById("VRButton").addEventListener("click", () => {
                this.initAudio()
            })
            // controllers
            this.controller1 = this.renderer.xr.getController(0)
            this.scene.add(this.controller1)
            this.controller2 = this.renderer.xr.getController(1)
            this.scene.add(this.controller2)
            var controllerModelFactory = new XRControllerModelFactory()
            this.controllerGrip1 = this.renderer.xr.getControllerGrip(0)
            this.controllerGrip1.addEventListener("connected", this.controllerConnected)
            this.controllerGrip1.addEventListener("disconnected", this.controllerDisconnected)
            this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1))
            this.scene.add(this.controllerGrip1)
            this.controllerGrip2 = this.renderer.xr.getControllerGrip(1)
            this.controllerGrip2.addEventListener("connected", this.controllerConnected)
            this.controllerGrip2.addEventListener("disconnected", this.controllerDisconnected)
            this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2))
            this.scene.add(this.controllerGrip2)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrHaptics-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrHaptics-container')[0].style.height = 'calc(100vh - 49px)'
            }
        },
        controllerConnected(evt) {
            this.controllers.push({
                gamepad: evt.data.gamepad,
                grip: evt.target,
                colliding: false,
                playing: false
            })
        },
        controllerDisconnected(evt) {
            var index = this.controllers.findIndex(o => o.controller === evt.target)
            if (index !== - 1) {
                this.controllers.splice(index, 1)
            }
        },
        onWindowResize() {
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrHaptics-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrHaptics-container')[0].style.height = 'calc(100vh - 49px)'
            }
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        handleCollisions() {
            for (var g = 0; g < this.controllers.length; g ++) {
                this.controllers[ g ].colliding = false
                var { grip, gamepad } = this.controllers[ g ]
                var sphere = {
                    radius: 0.03,
                    center: grip.position
                }
                if ("hapticActuators" in gamepad && gamepad.hapticActuators != null && gamepad.hapticActuators.length > 0) {
                    for (var i = 0; i < group.children.length; i ++) {
                        var child = group.children[ i ]
                        box.setFromObject(child)
                        if (box.intersectsSphere(sphere)) {
                            child.material.emissive.b = 1
                            var intensity = child.userData.index / group.children.length
                            child.scale.setScalar(1 + Math.random() * 0.1 * intensity)
                            gamepad.hapticActuators[ 0 ].pulse(intensity, 100)
                            oscillators[ g ].frequency.value = 100 + intensity * 60
                            this.controllers[ g ].colliding = true
                        } else {
                            child.material.emissive.b = 0
                            child.scale.setScalar(1)
                        }
                    }
                }
                if (this.controllers[ g ].colliding) {
                    if (! this.controllers[ g ].playing) {
                        this.controllers[ g ].playing = true
                        oscillators[ g ].connect(this.audioCtx.destination)
                    }
                } else {
                    if (this.controllers[ g ].playing) {
                        this.controllers[ g ].playing = false
                        oscillators[ g ].disconnect(this.audioCtx.destination)
                    }
                }
            }
        },
        render() {
            this.handleCollisions()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrHaptics-container {
    position: relative;
    width: 100%;
}
</style>
