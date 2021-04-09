<template>
    <div class="physicsAmmoInstancing-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> physics - ammo.js instancing
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { AmmoPhysics } from '@/components/jsm/physics/AmmoPhysics.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            physics: null,
            position: null,
            boxes: null,
            spheres: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        async init() {
            this.physics = await AmmoPhysics()
            this.position = new this.$THREE.Vector3()
            //
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(- 1, 1.5, 2)
            this.camera.lookAt(0, 0.5, 0)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x666666)
            var hemiLight = new this.$THREE.HemisphereLight()
            hemiLight.intensity = 0.35
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight()
            dirLight.position.set(5, 5, 5)
            dirLight.castShadow = true
            dirLight.shadow.camera.zoom = 2
            this.scene.add(dirLight)
            var floor = new this.$THREE.Mesh(
                new this.$THREE.BoxBufferGeometry(10, 5, 10),
                new this.$THREE.ShadowMaterial({ color: 0x111111 })
            )
            floor.position.y = - 2.5
            floor.receiveShadow = true
            this.scene.add(floor)
            this.physics.addMesh(floor)
            //
            var material = new this.$THREE.MeshLambertMaterial()
            var matrix = new this.$THREE.Matrix4()
            var color = new this.$THREE.Color()
            // Boxes
            var geometryBox = new this.$THREE.BoxBufferGeometry(0.1, 0.1, 0.1)
            this.boxes = new this.$THREE.InstancedMesh(geometryBox, material, 100)
            this.boxes.castShadow = true
            this.boxes.receiveShadow = true
            this.scene.add(this.boxes)
            for (var i = 0; i < this.boxes.count; i ++) {
                matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5)
                this.boxes.setMatrixAt(i, matrix)
                this.boxes.setColorAt(i, color.setHex(0xffffff * Math.random()))
            }
            this.physics.addMesh(this.boxes, 1)
            // Spheres
            var geometrySphere = new this.$THREE.IcosahedronBufferGeometry(0.075, 3)
            this.spheres = new this.$THREE.InstancedMesh(geometrySphere, material, 100)
            this.spheres.castShadow = true
            this.spheres.receiveShadow = true
            this.scene.add(this.spheres)
            for (var i = 0; i < this.spheres.count; i ++) {
                matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5)
                this.spheres.setMatrixAt(i, matrix)
                this.spheres.setColorAt(i, color.setHex(0xffffff * Math.random()))
            }
            this.physics.addMesh(this.spheres, 1)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            document.getElementsByClassName('physicsAmmoInstancing-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('physicsAmmoInstancing-container')[0].appendChild(this.stats.dom)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.y = 0.5
            controls.update()
            this.animate()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            //
            var index = Math.floor(Math.random() * this.boxes.count)
            this.position.set(0, Math.random() + 1, 0)
            this.physics.setMeshPosition(this.boxes, this.position, index)
            //
            index = Math.floor(Math.random() * this.spheres.count)
            this.position.set(0, Math.random() + 1, 0)
            this.physics.setMeshPosition(this.spheres, this.position, index)
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.physicsAmmoInstancing-container {
    position: relative;
    width: 100%;
}
</style>
