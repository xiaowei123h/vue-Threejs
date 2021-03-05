<template>
    <div class="webxrVrBallshooter-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - ball shooter
		</div>
    </div>
</template>

<script>
import { BoxLineGeometry } from '@/components/jsm/geometries/BoxLineGeometry.js'
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from '@/components/jsm/webxr/XRControllerModelFactory.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            controller1: null,
            controller2: null,
            controllerGrip1: null,
            controllerGrip2: null,
			room: null,
			count: 0,
			radius: 0.08,
			normal: null,
			relativeVelocity: null,
			clock: null,
        }
    },
    mounted() {
        this.normal = new this.$THREE.Vector3()
        this.relativeVelocity = new this.$THREE.Vector3()
        this.clock = new this.$THREE.Clock()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x505050)
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.set(0, 1.6, 3)
            this.room = new this.$THREE.LineSegments(
                new BoxLineGeometry(6, 6, 6, 10, 10, 10),
                new this.$THREE.LineBasicMaterial({ color: 0x808080 })
            )
            this.room.geometry.translate(0, 3, 0)
            this.scene.add(this.room)
            this.scene.add(new this.$THREE.HemisphereLight(0x606060, 0x404040))
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(1, 1, 1).normalize()
            this.scene.add(light)
            var geometry = new this.$THREE.IcosahedronBufferGeometry(radius, 3)
            for (var i = 0; i < 200; i ++) {
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
                object.position.x = Math.random() * 4 - 2
                object.position.y = Math.random() * 4
                object.position.z = Math.random() * 4 - 2
                object.userData.velocity = new this.$THREE.Vector3()
                object.userData.velocity.x = Math.random() * 0.01 - 0.005
                object.userData.velocity.y = Math.random() * 0.01 - 0.005
                object.userData.velocity.z = Math.random() * 0.01 - 0.005
                this.room.add(object)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.xr.enabled = true
            document.getElementsByClassName('webxrVrBallshooter-container')[0].appendChild(this.renderer.domElement)
            //
            document.getElementsByClassName('webxrVrBallshooter-container')[0].appendChild(VRButton.createButton(this.renderer))
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
            this.controller1.addEventListener('connected', (event) => {
                this.add(buildController(event.data))
            })
            this.controller1.addEventListener('disconnected', () => {
                this.remove(this.children[ 0 ])
            })
            this.scene.add(this.controller1)
            this.controller2 = this.renderer.xr.getController(1)
            this.controller2.addEventListener('selectstart', onSelectStart)
            this.controller2.addEventListener('selectend', onSelectEnd)
            this.controller2.addEventListener('connected', (event) => {
                this.add(buildController(event.data))
            })
            this.controller2.addEventListener('disconnected', () => {
                this.remove(this.children[ 0 ])
            })
            this.scene.add(this.controller2)
            // The XRControllerModelFactory will automatically fetch controller models
            // that match what the user is holding as closely as possible. The models
            // should be attached to the object returned from getControllerGrip in
            // order to match the orientation of the held device.
            var controllerModelFactory = new XRControllerModelFactory()
            this.controllerGrip1 = this.renderer.xr.getControllerGrip(0)
            this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1))
            this.scene.add(this.controllerGrip1)
            this.controllerGrip2 = this.renderer.xr.getControllerGrip(1)
            this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2))
            this.scene.add(this.controllerGrip2)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        buildController(data) {
            var geometry, material
            switch (data.targetRayMode) {
                case 'tracked-pointer':
                    geometry = new this.$THREE.BufferGeometry()
                    geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute([ 0, 0, 0, 0, 0, - 1 ], 3))
                    geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute([ 0.5, 0.5, 0.5, 0, 0, 0 ], 3))
                    material = new this.$THREE.LineBasicMaterial({ vertexColors: true, blending: this.$THREE.AdditiveBlending })
                    return new this.$THREE.Line(geometry, material)
                case 'gaze':
                    geometry = new this.$THREE.RingBufferGeometry(0.02, 0.04, 32).translate(0, 0, - 1)
                    material = new this.$THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true })
                    return new this.$THREE.Mesh(geometry, material)
            }
        },
        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        },
        handleController(controller) {
            if (controller.userData.isSelecting) {
                var object = this.room.children[ count ++ ]
                object.position.copy(controller.position)
                object.userData.velocity.x = (Math.random() - 0.5) * 3
                object.userData.velocity.y = (Math.random() - 0.5) * 3
                object.userData.velocity.z = (Math.random() - 9)
                object.userData.velocity.applyQuaternion(controller.quaternion)
                if (this.count === this.room.children.length) this.count = 0
            }
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.handleController(this.controller1)
            this.handleController(this.controller2)
            //
            var delta = this.clock.getDelta() * 0.8 // slow down simulation
            var range = 3 - this.radius
            for (var i = 0; i < this.room.children.length; i ++) {
                var object = this.room.children[ i ]
                object.position.x += object.userData.velocity.x * delta
                object.position.y += object.userData.velocity.y * delta
                object.position.z += object.userData.velocity.z * delta
                // keep objects inside this.room
                if (object.position.x < - range || object.position.x > range) {
                    object.position.x = this.$THREE.MathUtils.clamp(object.position.x, - range, range)
                    object.userData.velocity.x = - object.userData.velocity.x
                }
                if (object.position.y < this.radius || object.position.y > 6) {
                    object.position.y = Math.max(object.position.y, this.radius)
                    object.userData.velocity.x *= 0.98
                    object.userData.velocity.y = - object.userData.velocity.y * 0.8
                    object.userData.velocity.z *= 0.98
                }
                if (object.position.z < - range || object.position.z > range) {
                    object.position.z = this.$THREE.MathUtils.clamp(object.position.z, - range, range)
                    object.userData.velocity.z = - object.userData.velocity.z
                }
                for (var j = i + 1; j < this.room.children.length; j ++) {
                    var object2 = this.room.children[ j ]
                    this.normal.copy(object.position).sub(object2.position)
                    var distance = this.normal.length()
                    if (distance < 2 * this.radius) {
                        this.normal.multiplyScalar(0.5 * distance - this.radius)
                        object.position.sub(this.normal)
                        object2.position.add(this.normal)
                        this.normal.normalize()
                        relativeVelocity.copy(object.userData.velocity).sub(object2.userData.velocity)
                        this.normal = this.normal.multiplyScalar(relativeVelocity.dot(this.normal))
                        object.userData.velocity.sub(this.normal)
                        object2.userData.velocity.add(this.normal)
                    }
                }
                object.userData.velocity.y -= 9.8 * delta
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrBallshooter-container {
    width: 100%;
}
</style>
