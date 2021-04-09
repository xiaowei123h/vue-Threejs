<template>
    <div class="webglShadowmesh-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - shadow mesh<br />
            <el-button id="lightButton" size="mini" @click="lightButtonHandler">Switch to PointLight</el-button>
			<!-- <input id="lightButton" type="button" value="Switch to PointLight"> -->
		</div>
        <div id="container"></div>
    </div>
</template>

<script>
import { ShadowMesh } from '@/components/jsm/objects/ShadowMesh.js'
export default {
    data() {
        return {
            SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
			scene: null,
			camera: null,
			clock: null,
			renderer: null,
			sunLight: null,
			useDirectionalLight: true,
            arrowHelper1: null,
            arrowHelper2: null,
            arrowHelper3: null,
			arrowDirection: null,
			arrowPosition1: null,
			arrowPosition2: null,
			arrowPosition3: null,
			groundMesh: null,
            lightSphere: null,
            lightHolder: null,
            pyramid: null,
            pyramidShadow: null,
            sphere: null,
            sphereShadow: null,
            cube: null,
            cubeShadow: null,
            cylinder: null,
            cylinderShadow: null,
            torus: null,
            torusShadow: null,
			normalVector: null,
			planeConstant: 0.01, // this value must be slightly higher than the groundMesh's y position of 0.0
			groundPlane: null,
			lightPosition4D: null,
			verticalAngle: 0,
			horizontalAngle: 0,
			frameTime: 0,
			TWO_PI: null,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.scene = new this.$THREE.Scene()
        this.camera = new this.$THREE.PerspectiveCamera(55, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 3000)
        this.clock = new this.$THREE.Clock()
        this.renderer = new this.$THREE.WebGLRenderer()
        this.sunLight = new this.$THREE.DirectionalLight('rgb(255,255,255)', 1)
        this.arrowDirection = new this.$THREE.Vector3()
        this.arrowPosition1 = new this.$THREE.Vector3()
        this.arrowPosition2 = new this.$THREE.Vector3()
        this.arrowPosition3 = new this.$THREE.Vector3()
        this.normalVector = new this.$THREE.Vector3(0, 1, 0)
        this.groundPlane = new this.$THREE.Plane(this.normalVector, this.planeConstant)
        this.lightPosition4D = new this.$THREE.Vector4()
        this.TWO_PI = Math.PI * 2
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.scene.background = new this.$THREE.Color(0x0096ff)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            document.getElementById("container").appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
            this.camera.position.set(0, 2.5, 10)
            this.scene.add(this.camera)
            this.onWindowResize()
            this.sunLight.position.set(5, 7, - 1)
            this.sunLight.lookAt(this.scene.position)
            this.scene.add(this.sunLight)
            this.lightPosition4D.x = this.sunLight.position.x
            this.lightPosition4D.y = this.sunLight.position.y
            this.lightPosition4D.z = this.sunLight.position.z
            // amount of light-ray divergence. Ranging from:
            // 0.001 = sunlight(min divergence) to 1.0 = pointlight(max divergence)
            this.lightPosition4D.w = 0.001 // must be slightly greater than 0, due to 0 causing matrixInverse errors
            // YELLOW ARROW HELPERS
            this.arrowDirection.subVectors(this.scene.position, this.sunLight.position).normalize()
            this.arrowPosition1.copy(this.sunLight.position)
            this.arrowHelper1 = new this.$THREE.ArrowHelper(this.arrowDirection, this.arrowPosition1, 0.9, 0xffff00, 0.25, 0.08)
            this.scene.add(this.arrowHelper1)
            this.arrowPosition2.copy(this.sunLight.position).add(new this.$THREE.Vector3(0, 0.2, 0))
            this.arrowHelper2 = new this.$THREE.ArrowHelper(this.arrowDirection, this.arrowPosition2, 0.9, 0xffff00, 0.25, 0.08)
            this.scene.add(this.arrowHelper2)
            this.arrowPosition3.copy(this.sunLight.position).add(new this.$THREE.Vector3(0, - 0.2, 0))
            this.arrowHelper3 = new this.$THREE.ArrowHelper(this.arrowDirection, this.arrowPosition3, 0.9, 0xffff00, 0.25, 0.08)
            this.scene.add(this.arrowHelper3)
            // LIGHTBULB
            var lightSphereGeometry = new this.$THREE.SphereBufferGeometry(0.09)
            var lightSphereMaterial = new this.$THREE.MeshBasicMaterial({ color: 'rgb(255,255,255)' })
            this.lightSphere = new this.$THREE.Mesh(lightSphereGeometry, lightSphereMaterial)
            this.scene.add(this.lightSphere)
            this.lightSphere.visible = false
            var lightHolderGeometry = new this.$THREE.CylinderBufferGeometry(0.05, 0.05, 0.13)
            var lightHolderMaterial = new this.$THREE.MeshBasicMaterial({ color: 'rgb(75,75,75)' })
            this.lightHolder = new this.$THREE.Mesh(lightHolderGeometry, lightHolderMaterial)
            this.scene.add(this.lightHolder)
            this.lightHolder.visible = false
            // GROUND
            var groundGeometry = new this.$THREE.BoxBufferGeometry(30, 0.01, 40)
            var groundMaterial = new this.$THREE.MeshLambertMaterial({ color: 'rgb(0,130,0)' })
            this.groundMesh = new this.$THREE.Mesh(groundGeometry, groundMaterial)
            this.groundMesh.position.y = 0.0 //this value must be slightly lower than the planeConstant (0.01) parameter above
            this.scene.add(this.groundMesh)
            // RED CUBE and CUBE's SHADOW
            var cubeGeometry = new this.$THREE.BoxBufferGeometry(1, 1, 1)
            var cubeMaterial = new this.$THREE.MeshLambertMaterial({ color: 'rgb(255,0,0)', emissive: 0x200000 })
            this.cube = new this.$THREE.Mesh(cubeGeometry, cubeMaterial)
            this.cube.position.z = - 1
            this.scene.add(this.cube)
            this.cubeShadow = new ShadowMesh(this.cube)
            this.scene.add(this.cubeShadow)
            // BLUE CYLINDER and CYLINDER's SHADOW
            var cylinderGeometry = new this.$THREE.CylinderBufferGeometry(0.3, 0.3, 2)
            var cylinderMaterial = new this.$THREE.MeshPhongMaterial({ color: 'rgb(0,0,255)', emissive: 0x000020 })
            this.cylinder = new this.$THREE.Mesh(cylinderGeometry, cylinderMaterial)
            this.cylinder.position.z = - 2.5
            this.scene.add(this.cylinder)
            this.cylinderShadow = new ShadowMesh(this.cylinder)
            this.scene.add(this.cylinderShadow)
            // MAGENTA TORUS and TORUS' SHADOW
            var torusGeometry = new this.$THREE.TorusBufferGeometry(1, 0.2, 10, 16, this.TWO_PI)
            var torusMaterial = new this.$THREE.MeshPhongMaterial({ color: 'rgb(255,0,255)', emissive: 0x200020 })
            this.torus = new this.$THREE.Mesh(torusGeometry, torusMaterial)
            this.torus.position.z = - 6
            this.scene.add(this.torus)
            this.torusShadow = new ShadowMesh(this.torus)
            this.scene.add(this.torusShadow)
            // WHITE SPHERE and SPHERE'S SHADOW
            var sphereGeometry = new this.$THREE.SphereBufferGeometry(0.5, 20, 10)
            var sphereMaterial = new this.$THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)', emissive: 0x222222 })
            this.sphere = new this.$THREE.Mesh(sphereGeometry, sphereMaterial)
            this.sphere.position.set(4, 0.5, 2)
            this.scene.add(this.sphere)
            this.sphereShadow = new ShadowMesh(this.sphere)
            this.scene.add(this.sphereShadow)
            // YELLOW PYRAMID and PYRAMID'S SHADOW
            var pyramidGeometry = new this.$THREE.CylinderBufferGeometry(0, 0.5, 2, 4)
            var pyramidMaterial = new this.$THREE.MeshPhongMaterial({ color: 'rgb(255,255,0)', emissive: 0x440000, flatShading: true, shininess: 0 })
            this.pyramid = new this.$THREE.Mesh(pyramidGeometry, pyramidMaterial)
            this.pyramid.position.set(- 4, 1, 2)
            this.scene.add(this.pyramid)
            this.pyramidShadow = new ShadowMesh(this.pyramid)
            this.scene.add(this.pyramidShadow)
            // document.getElementById('lightButton').addEventListener('click', this.lightButtonHandler)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.frameTime = this.clock.getDelta()
            this.cube.rotation.x += 1.0 * this.frameTime
            this.cube.rotation.y += 1.0 * this.frameTime
            this.cylinder.rotation.y += 1.0 * this.frameTime
            this.cylinder.rotation.z -= 1.0 * this.frameTime
            this.torus.rotation.x -= 1.0 * this.frameTime
            this.torus.rotation.y -= 1.0 * this.frameTime
            this.pyramid.rotation.y += 0.5 * this.frameTime
            this.horizontalAngle += 0.5 * this.frameTime
            if (this.horizontalAngle > this.TWO_PI)
                this.horizontalAngle -= this.TWO_PI
            this.cube.position.x = Math.sin(this.horizontalAngle) * 4
            this.cylinder.position.x = Math.sin(this.horizontalAngle) * - 4
            this.torus.position.x = Math.cos(this.horizontalAngle) * 4
            this.verticalAngle += 1.5 * this.frameTime
            if (this.verticalAngle > this.TWO_PI)
                this.verticalAngle -= this.TWO_PI
            this.cube.position.y = Math.sin(this.verticalAngle) * 2 + 2.9
            this.cylinder.position.y = Math.sin(this.verticalAngle) * 2 + 3.1
            this.torus.position.y = Math.cos(this.verticalAngle) * 2 + 3.3
            // update the ShadowMeshes to follow their shadow-casting objects
            this.cubeShadow.update(this.groundPlane, this.lightPosition4D)
            this.cylinderShadow.update(this.groundPlane, this.lightPosition4D)
            this.torusShadow.update(this.groundPlane, this.lightPosition4D)
            this.sphereShadow.update(this.groundPlane, this.lightPosition4D)
            this.pyramidShadow.update(this.groundPlane, this.lightPosition4D)
            this.renderer.render(this.scene, this.camera)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        lightButtonHandler() {
            this.useDirectionalLight = ! this.useDirectionalLight
            if (this.useDirectionalLight) {
                this.scene.background.setHex(0x0096ff)
                this.groundMesh.material.color.setHex(0x008200)
                this.sunLight.position.set(5, 7, - 1)
                this.sunLight.lookAt(this.scene.position)
                this.lightPosition4D.x = this.sunLight.position.x
                this.lightPosition4D.y = this.sunLight.position.y
                this.lightPosition4D.z = this.sunLight.position.z
                this.lightPosition4D.w = 0.001 // more of a directional Light value
                this.arrowHelper1.visible = true
                this.arrowHelper2.visible = true
                this.arrowHelper3.visible = true
                this.lightSphere.visible = false
                this.lightHolder.visible = false
                document.getElementById('lightButton').value = "Switch to PointLight"
            } else {
                this.scene.background.setHex(0x000000)
                this.groundMesh.material.color.setHex(0x969696)
                this.sunLight.position.set(0, 6, - 2)
                this.sunLight.lookAt(this.scene.position)
                this.lightSphere.position.copy(this.sunLight.position)
                this.lightHolder.position.copy(this.lightSphere.position)
                this.lightHolder.position.y += 0.12
                this.lightPosition4D.x = this.sunLight.position.x
                this.lightPosition4D.y = this.sunLight.position.y
                this.lightPosition4D.z = this.sunLight.position.z
                this.lightPosition4D.w = 0.9 // more of a point Light value
                this.arrowHelper1.visible = false
                this.arrowHelper2.visible = false
                this.arrowHelper3.visible = false
                this.lightSphere.visible = true
                this.lightHolder.visible = true
                document.getElementById('lightButton').value = "Switch to this.$THREE.DirectionalLight"
            }
        }
    },
}
</script>

<style scoped>
.webglShadowmesh-container {
    position: relative;
    width: 100%;
}
#info {
    left: calc(50% + 140.5px);
}
</style>
