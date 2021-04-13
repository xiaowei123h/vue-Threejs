<template>
    <div class="webxrVrRollercoaster-container">
        
    </div>
</template>

<script>
import {
    RollerCoasterGeometry,
    RollerCoasterShadowGeometry,
    RollerCoasterLiftersGeometry,
    TreesGeometry,
    SkyGeometry
} from '@/components/jsm/misc/RollerCoaster.js'
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
export default {
    data() {
        return {
            mesh: null,
            material: null,
            geometry: null,
            renderer: null,
            scene: null,
            light: null,
            train: null,
            camera: null,
            positions: null,
            vertex: null,
            tangent: null,
            lookAt: null,
            velocity: 0,
            progress: 0,
            prevTime: null,
            funfairs: [],
            position: null,
            curve: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            this.renderer.xr.setReferenceSpaceType('local')
            document.getElementsByClassName('webxrVrRollercoaster-container')[0].appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrRollercoaster-container')[0].appendChild(VRButton.createButton(this.renderer))
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0ff)
            this.light = new this.$THREE.HemisphereLight(0xfff0f0, 0x606066)
            this.light.position.set(1, 1, 1)
            this.scene.add(this.light)
            this.train = new this.$THREE.Object3D()
            this.scene.add(this.train)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 500)
            this.train.add(this.camera)
            // environment
            this.geometry = new this.$THREE.PlaneBufferGeometry(500, 500, 15, 15)
            this.geometry.rotateX(- Math.PI / 2)
            this.positions = this.geometry.attributes.position.array
            this.vertex = new this.$THREE.Vector3()
            for (var i = 0; i < this.positions.length; i += 3) {
                this.vertex.fromArray(this.positions, i)
                this.vertex.x += Math.random() * 10 - 5
                this.vertex.z += Math.random() * 10 - 5
                var distance = (this.vertex.distanceTo(this.scene.position) / 5) - 25
                this.vertex.y = Math.random() * Math.max(0, distance)
                this.vertex.toArray(this.positions, i)
            }
            this.geometry.computeVertexNormals()
            this.material = new this.$THREE.MeshLambertMaterial({
                color: 0x407000
            })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.scene.add(this.mesh)
            this.geometry = new TreesGeometry(this.mesh)
            this.material = new this.$THREE.MeshBasicMaterial({
                side: this.$THREE.DoubleSide, vertexColors: true
            })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.scene.add(this.mesh)
            this.geometry = new SkyGeometry()
            this.material = new this.$THREE.MeshBasicMaterial({ color: 0xffffff })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.scene.add(this.mesh)
            var PI2 = Math.PI * 2
            this.curve = (() => {
                var vector = new this.$THREE.Vector3()
                var vector2 = new this.$THREE.Vector3()
                return {
                    getPointAt: function (t) {
                        t = t * PI2
                        var x = Math.sin(t * 3) * Math.cos(t * 4) * 50
                        var y = Math.sin(t * 10) * 2 + Math.cos(t * 17) * 2 + 5
                        var z = Math.sin(t) * Math.sin(t * 4) * 50
                        return vector.set(x, y, z).multiplyScalar(2)
                    },
                    getTangentAt: function (t) {
                        var delta = 0.0001
                        var t1 = Math.max(0, t - delta)
                        var t2 = Math.min(1, t + delta)
                        return vector2.copy(this.getPointAt(t2))
                            .sub(this.getPointAt(t1)).normalize()
                    }
                }
            })()
            this.geometry = new RollerCoasterGeometry(this.curve, 1500)
            this.material = new this.$THREE.MeshPhongMaterial({
                vertexColors: true
            })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.scene.add(this.mesh)
            this.geometry = new RollerCoasterLiftersGeometry(this.curve, 100)
            this.material = new this.$THREE.MeshPhongMaterial()
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.mesh.position.y = 0.1
            this.scene.add(this.mesh)
            this.geometry = new RollerCoasterShadowGeometry(this.curve, 500)
            this.material = new this.$THREE.MeshBasicMaterial({
                color: 0x305000, depthWrite: false, transparent: true
            })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.mesh.position.y = 0.1
            this.scene.add(this.mesh)
            //
            this.geometry = new this.$THREE.CylinderBufferGeometry(10, 10, 5, 15)
            this.material = new this.$THREE.MeshLambertMaterial({
                color: 0xff8080,
                //flatShading: true // Lambert does not support flat shading
            })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.mesh.position.set(- 80, 10, - 70)
            this.mesh.rotation.x = Math.PI / 2
            this.scene.add(this.mesh)
            this.funfairs.push(this.mesh)
            this.geometry = new this.$THREE.CylinderBufferGeometry(5, 6, 4, 10)
            this.material = new this.$THREE.MeshLambertMaterial({
                color: 0x8080ff,
                //flatShading: true // Lambert does not support flat shading
            })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.mesh.position.set(50, 2, 30)
            this.scene.add(this.mesh)
            this.funfairs.push(this.mesh)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.position = new this.$THREE.Vector3()
            this.tangent = new this.$THREE.Vector3()
            this.lookAt = new this.$THREE.Vector3()
            this.prevTime = performance.now()
            this.renderer.setAnimationLoop(this.render)
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrRollercoaster-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrRollercoaster-container')[0].style.height = 'calc(100vh - 49px)'
            }
        },
        onWindowResize() {
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrRollercoaster-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrRollercoaster-container')[0].style.height = 'calc(100vh - 49px)'
            }
            this.$onWindowResize(this.camera, this.renderer)
        },
        render() {
            var time = performance.now()
            var delta = time - this.prevTime
            for (var i = 0; i < this.funfairs.length; i ++) {
                this.funfairs[ i ].rotation.y = time * 0.0004
            }
            //
            this.progress += this.velocity
            this.progress = this.progress % 1
            this.position.copy(this.curve.getPointAt(this.progress))
            this.position.y += 0.3
            this.train.position.copy(this.position)
            this.tangent.copy(this.curve.getTangentAt(this.progress))
            this.velocity -= this.tangent.y * 0.0000001 * delta
            this.velocity = Math.max(0.00004, Math.min(0.0002, this.velocity))
            this.train.lookAt(this.lookAt.copy(this.position).sub(this.tangent))
            //
            this.renderer.render(this.scene, this.camera)
            this.prevTime = time
        }
    },
}
</script>

<style scoped>
.webxrVrRollercoaster-container {
    position: relative;
    width: 100%;
}
</style>
