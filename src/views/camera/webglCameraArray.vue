<template>
    <div class="webglCameraArray-container">
        
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			mesh: null,
			AMOUNT: 6
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var ASPECT_RATIO = this.$webglInnerWidth / window.innerHeight
            var WIDTH = (this.$webglInnerWidth / this.AMOUNT) * window.devicePixelRatio
            var HEIGHT = (window.innerHeight / this.AMOUNT) * window.devicePixelRatio
            var cameras = []
            for (var y = 0; y < this.AMOUNT; y ++) {
                for (var x = 0; x < this.AMOUNT; x ++) {
                    var subcamera = new this.$THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10)
                    subcamera.viewport = new this.$THREE.Vector4(Math.floor(x * WIDTH), Math.floor(y * HEIGHT), Math.ceil(WIDTH), Math.ceil(HEIGHT))
                    subcamera.position.x = (x / this.AMOUNT) - 0.5
                    subcamera.position.y = 0.5 - (y / this.AMOUNT)
                    subcamera.position.z = 1.5
                    subcamera.position.multiplyScalar(2)
                    subcamera.lookAt(0, 0, 0)
                    subcamera.updateMatrixWorld()
                    cameras.push(subcamera)
                }
            }
            this.camera = new this.$THREE.ArrayCamera(cameras)
            this.camera.position.z = 3
            this.scene = new this.$THREE.Scene()
            this.scene.add(new this.$THREE.AmbientLight(0x222244))
            var light = new this.$THREE.DirectionalLight()
            light.position.set(0.5, 0.5, 1)
            light.castShadow = true
            light.shadow.camera.zoom = 4 // tighter shadow map
            this.scene.add(light)
            var geometryBackground = new this.$THREE.PlaneBufferGeometry(100, 100)
            var materialBackground = new this.$THREE.MeshPhongMaterial({ color: 0x000066 })
            var background = new this.$THREE.Mesh(geometryBackground, materialBackground)
            background.receiveShadow = true
            background.position.set(0, 0, - 1)
            this.scene.add(background)
            var geometryCylinder = new this.$THREE.CylinderBufferGeometry(0.5, 0.5, 1, 32)
            var materialCylinder = new this.$THREE.MeshPhongMaterial({ color: 0xff0000 })
            this.mesh = new this.$THREE.Mesh(geometryCylinder, materialCylinder)
            this.mesh.castShadow = true
            this.mesh.receiveShadow = true
            this.scene.add(this.mesh)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            document.getElementsByClassName('webglCameraArray-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var ASPECT_RATIO = (window.innerWidth - 281) / window.innerHeight
            var WIDTH = ((window.innerWidth - 281) / this.AMOUNT) * window.devicePixelRatio
            var HEIGHT = (window.innerHeight / this.AMOUNT) * window.devicePixelRatio
            this.camera.aspect = ASPECT_RATIO
            this.camera.updateProjectionMatrix()
            for (var y = 0; y < this.AMOUNT; y ++) {
                for (var x = 0; x < this.AMOUNT; x ++) {
                    var subcamera = this.camera.cameras[this.AMOUNT * y + x]
                    subcamera.viewport.set(
                        Math.floor(x * WIDTH),
                        Math.floor(y * HEIGHT),
                        Math.ceil(WIDTH),
                        Math.ceil(HEIGHT))
                    subcamera.aspect = ASPECT_RATIO
                    subcamera.updateProjectionMatrix()
                }
            }
            this.renderer.setSize((window.innerWidth - 281), window.innerHeight)
        },
        animate() {
            this.mesh.rotation.x += 0.005
            this.mesh.rotation.z += 0.01
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        }
    }
}
</script>

<style scoped>
.webglCameraArray-container {
    width: 100%;
}
</style>