<template>
    <div class="webglGeometryCube-container">
        
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
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 400
            this.scene = new this.$THREE.Scene()
            const texture = new this.$THREE.TextureLoader().load('static/textures/crate.gif')
            const geometry = new this.$THREE.BoxBufferGeometry(200, 200, 200)
            const material = new this.$THREE.MeshBasicMaterial({ map: texture })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryCube-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.mesh.rotation.x += 0.005
            this.mesh.rotation.y += 0.01
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryCube-container {
    position: relative;
    width: 100%;
}
</style>
