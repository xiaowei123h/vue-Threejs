<template>
    <div class="webglMathOrientationTransform-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - gradually transform an orientation to a target orientation
		</div>
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
            target: null,
			spherical: null,
			rotationMatrix: null,
			targetQuaternion: null,
			clock: null,
			speed: 2,
        }
    },
    mounted() {
        this.spherical = new this.$THREE.Spherical()
        this.rotationMatrix = new this.$THREE.Matrix4()
        this.targetQuaternion = new this.$THREE.Quaternion()
        this.clock = new this.$THREE.Clock()
        this.speed = 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.01, 10)
            this.camera.position.z = 5
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.ConeBufferGeometry(0.1, 0.5, 8)
            geometry.rotateX(Math.PI * 0.5)
            var material = new this.$THREE.MeshNormalMaterial()
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            //
            var targetGeometry = new this.$THREE.SphereBufferGeometry(0.05)
            var targetMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xff0000 })
            this.target = new this.$THREE.Mesh(targetGeometry, targetMaterial)
            this.scene.add(this.target)
            //
            var sphereGeometry = new this.$THREE.SphereBufferGeometry(2, 32, 32)
            var sphereMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.3 })
            var sphere = new this.$THREE.Mesh(sphereGeometry, sphereMaterial)
            this.scene.add(sphere)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMathOrientationTransform-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onResize, false)
            //
            this.generateTarget()
        },
        onResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            if (! this.mesh.quaternion.equals(this.targetQuaternion)) {
                var step = this.speed * delta
                this.mesh.quaternion.rotateTowards(this.targetQuaternion, step)
            }
            this.renderer.render(this.scene, this.camera)
        },
        generateTarget() {
            // generate a random point on a sphere
            this.spherical.theta = Math.random() * Math.PI * 2
            this.spherical.phi = Math.acos((2 * Math.random()) - 1)
            this.spherical.radius = 2
            this.target.position.setFromSpherical(this.spherical)
            // compute this.target rotation
            this.rotationMatrix.lookAt(this.target.position, this.mesh.position, this.mesh.up)
            this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix)
            setTimeout(this.generateTarget, 2000)
        }
    },
}
</script>

<style scoped>
.webglMathOrientationTransform-container {
    width: 100%;
}
</style>
