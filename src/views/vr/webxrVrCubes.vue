<template>
    <div class="webxrVrCubes-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - interactive cubes
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
            clock: null,
			container: null,
            camera: null,
            scene: null,
            raycaster: null,
            renderer: null,
			room: null,
            controller: null,
            controllerGrip: null,
			INTERSECTED: null,
			tempMatrix: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.tempMatrix = new this.$THREE.Matrix4()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrVrCubes-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x505050)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.set(0, 1.6, 3)
            this.scene.add(this.camera)
            this.room = new this.$THREE.LineSegments(
                new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
                new this.$THREE.LineBasicMaterial({ color: 0x808080 })
            )
            this.scene.add(this.room)
            this.scene.add(new this.$THREE.HemisphereLight(0x606060, 0x404040))
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(1, 1, 1).normalize()
            this.scene.add(light)
            var geometry = new this.$THREE.BoxBufferGeometry(0.15, 0.15, 0.15)
            for (var i = 0; i < 200; i ++) {
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
                object.position.x = Math.random() * 4 - 2
                object.position.y = Math.random() * 4
                object.position.z = Math.random() * 4 - 2
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.x = Math.random() + 0.5
                object.scale.y = Math.random() + 0.5
                object.scale.z = Math.random() + 0.5
                object.userData.velocity = new this.$THREE.Vector3()
                object.userData.velocity.x = Math.random() * 0.01 - 0.005
                object.userData.velocity.y = Math.random() * 0.01 - 0.005
                object.userData.velocity.z = Math.random() * 0.01 - 0.005
                this.room.add(object)
            }
            this.raycaster = new this.$THREE.Raycaster()
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            //
            var that = this
            function onSelectStart() {
                that.userData.isSelecting = true
            }
            function onSelectEnd() {
                that.userData.isSelecting = false
            }
            this.controller = this.renderer.xr.getController(0)
            this.controller.addEventListener('selectstart', onSelectStart)
            this.controller.addEventListener('selectend', onSelectEnd)
            this.controller.addEventListener('connected', (event) => {
                this.add(buildController(event.data))
            })
            this.controller.addEventListener('disconnected', () => {
                this.remove(this.children[ 0 ]);
            });
            this.scene.add(this.controller);
            var controllerModelFactory = new XRControllerModelFactory();
            this.controllerGrip = this.renderer.xr.getControllerGrip(0);
            this.controllerGrip.add(controllerModelFactory.createControllerModel(this.controllerGrip));
            this.scene.add(this.controllerGrip);
            window.addEventListener('resize', this.onWindowResize, false);
            //
            document.getElementsByClassName('webxrVrCubes-container')[0].appendChild(VRButton.createButton(this.renderer));
        },
        buildController(data) {
            var geometry, material;
            switch (data.targetRayMode) {
                case 'tracked-pointer':
                    geometry = new this.$THREE.BufferGeometry();
                    geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute([ 0, 0, 0, 0, 0, - 1 ], 3));
                    geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute([ 0.5, 0.5, 0.5, 0, 0, 0 ], 3));
                    material = new this.$THREE.LineBasicMaterial({ vertexColors: true, blending: this.$THREE.AdditiveBlending });
                    return new this.$THREE.Line(geometry, material);
                case 'gaze':
                    geometry = new this.$THREE.RingBufferGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
                    material = new this.$THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
                    return new this.$THREE.Mesh(geometry, material);
            }

        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render);
        },
        render() {
            var delta = this.clock.getDelta() * 60;
            if (this.controller.userData.isSelecting === true) {
                var cube = this.room.children[ 0 ];
                this.room.remove(cube);
                cube.position.copy(this.controller.position);
                cube.userData.velocity.x = (Math.random() - 0.5) * 0.02 * delta;
                cube.userData.velocity.y = (Math.random() - 0.5) * 0.02 * delta;
                cube.userData.velocity.z = (Math.random() * 0.01 - 0.05) * delta;
                cube.userData.velocity.applyQuaternion(this.controller.quaternion);
                this.room.add(cube);
            }
            // find intersections
            this.tempMatrix.identity().extractRotation(this.controller.matrixWorld);
            this.raycaster.ray.origin.setFromMatrixPosition(this.controller.matrixWorld);
            this.raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(this.tempMatrix);
            var intersects = this.raycaster.intersectObjects(this.room.children);
            if (intersects.length > 0) {
                if (this.INTERSECTED != intersects[ 0 ].object) {
                    if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                    this.INTERSECTED = intersects[ 0 ].object;
                    this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                    this.INTERSECTED.material.emissive.setHex(0xff0000);
                }
            } else {
                if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                this.INTERSECTED = undefined;
            }
            // Keep cubes inside this.room
            for (var i = 0; i < this.room.children.length; i ++) {
                var cube = this.room.children[ i ];
                cube.userData.velocity.multiplyScalar(1 - (0.001 * delta));
                cube.position.add(cube.userData.velocity);
                if (cube.position.x < - 3 || cube.position.x > 3) {
                    cube.position.x = this.$THREE.MathUtils.clamp(cube.position.x, - 3, 3);
                    cube.userData.velocity.x = - cube.userData.velocity.x;
                }
                if (cube.position.y < 0 || cube.position.y > 6) {
                    cube.position.y = this.$THREE.MathUtils.clamp(cube.position.y, 0, 6);
                    cube.userData.velocity.y = - cube.userData.velocity.y;
                }
                if (cube.position.z < - 3 || cube.position.z > 3) {
                    cube.position.z = this.$THREE.MathUtils.clamp(cube.position.z, - 3, 3);
                    cube.userData.velocity.z = - cube.userData.velocity.z;
                }
                cube.rotation.x += cube.userData.velocity.x * 2 * delta;
                cube.rotation.y += cube.userData.velocity.y * 2 * delta;
                cube.rotation.z += cube.userData.velocity.z * 2 * delta;
            }
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webxrVrCubes-container {
    position: relative;
    width: 100%;
}
</style>
