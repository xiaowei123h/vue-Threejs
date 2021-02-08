<template>
    <div class="webglMirror-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - mirror
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Reflector } from '@/components//jsm/objects/Reflector.js'
export default {
    data() {
        return {
            WIDTH: null,
			HEIGHT: null,
			// camera
			VIEW_ANGLE: 45,
			ASPECT: null,
			NEAR: 1,
			FAR: 500,
            camera: null,
            scene: null,
            renderer: null,
			cameraControls: null,
            sphereGroup: null,
            smallSphere: null,
        }
    },
    mounted() {
        this.WIDTH = this.$webglInnerWidth
        this.HEIGHT = window.innerHeight
        this.ASPECT = this.WIDTH / this.HEIGHT
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.WIDTH, this.HEIGHT)
            container.appendChild(this.renderer.domElement)
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR)
            this.camera.position.set(0, 75, 160)
            this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement)
            this.cameraControls.target.set(0, 40, 0)
            this.cameraControls.maxDistance = 400
            this.cameraControls.minDistance = 10
            this.cameraControls.update()
            //
            var planeGeo = new this.$THREE.PlaneBufferGeometry(100.1, 100.1)
            // reflectors/mirrors
            var geometry, material
            geometry = new this.$THREE.CircleBufferGeometry(40, 64)
            var groundMirror = new Reflector(geometry, {
                clipBias: 0.003,
                textureWidth: this.WIDTH * window.devicePixelRatio,
                textureHeight: this.HEIGHT * window.devicePixelRatio,
                color: 0x777777
            })
            groundMirror.position.y = 0.5
            groundMirror.rotateX(- Math.PI / 2)
            this.scene.add(groundMirror)
            geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            var verticalMirror = new Reflector(geometry, {
                clipBias: 0.003,
                textureWidth: this.WIDTH * window.devicePixelRatio,
                textureHeight: this.HEIGHT * window.devicePixelRatio,
                color: 0x889999
            })
            verticalMirror.position.y = 50
            verticalMirror.position.z = - 50
            this.scene.add(verticalMirror)
            this.sphereGroup = new this.$THREE.Object3D()
            this.scene.add(this.sphereGroup)
            geometry = new this.$THREE.CylinderBufferGeometry(0.1, 15 * Math.cos(Math.PI / 180 * 30), 0.1, 24, 1)
            material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x444444 })
            var sphereCap = new this.$THREE.Mesh(geometry, material)
            sphereCap.position.y = - 15 * Math.sin(Math.PI / 180 * 30) - 0.05
            sphereCap.rotateX(- Math.PI)
            geometry = new this.$THREE.SphereBufferGeometry(15, 24, 24, Math.PI / 2, Math.PI * 2, 0, Math.PI / 180 * 120)
            var halfSphere = new this.$THREE.Mesh(geometry, material)
            halfSphere.add(sphereCap)
            halfSphere.rotateX(- Math.PI / 180 * 135)
            halfSphere.rotateZ(- Math.PI / 180 * 20)
            halfSphere.position.y = 7.5 + 15 * Math.sin(Math.PI / 180 * 30)
            this.sphereGroup.add(halfSphere)
            geometry = new this.$THREE.IcosahedronBufferGeometry(5, 0)
            material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x333333, flatShading: true })
            this.smallSphere = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.smallSphere)
            // walls
            var planeTop = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0xffffff }))
            planeTop.position.y = 100
            planeTop.rotateX(Math.PI / 2)
            this.scene.add(planeTop)
            var planeBottom = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0xffffff }))
            planeBottom.rotateX(- Math.PI / 2)
            this.scene.add(planeBottom)
            var planeFront = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0x7f7fff }))
            planeFront.position.z = 50
            planeFront.position.y = 50
            planeFront.rotateY(Math.PI)
            this.scene.add(planeFront)
            var planeRight = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0x00ff00 }))
            planeRight.position.x = 50
            planeRight.position.y = 50
            planeRight.rotateY(- Math.PI / 2)
            this.scene.add(planeRight)
            var planeLeft = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0xff0000 }))
            planeLeft.position.x = - 50
            planeLeft.position.y = 50
            planeLeft.rotateY(Math.PI / 2)
            this.scene.add(planeLeft)
            // lights
            var mainLight = new this.$THREE.PointLight(0xcccccc, 1.5, 250)
            mainLight.position.y = 60
            this.scene.add(mainLight)
            var greenLight = new this.$THREE.PointLight(0x00ff00, 0.25, 1000)
            greenLight.position.set(550, 50, 0)
            this.scene.add(greenLight)
            var redLight = new this.$THREE.PointLight(0xff0000, 0.25, 1000)
            redLight.position.set(- 550, 50, 0)
            this.scene.add(redLight)
            var blueLight = new this.$THREE.PointLight(0x7f7fff, 0.25, 1000)
            blueLight.position.set(0, 50, 550)
            this.scene.add(blueLight)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var timer = Date.now() * 0.01
            this.sphereGroup.rotation.y -= 0.002
            this.smallSphere.position.set(
                Math.cos(timer * 0.1) * 30,
                Math.abs(Math.cos(timer * 0.2)) * 20 + 5,
                Math.sin(timer * 0.1) * 30
            )
            this.smallSphere.rotation.y = (Math.PI / 2) - timer * 0.1
            this.smallSphere.rotation.z = timer * 0.8
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMirror-container {
    width: 100%;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
