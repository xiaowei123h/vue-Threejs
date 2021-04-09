<template>
    <div class="webglGeometryHierarchy-container">
        
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            group: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.scene.fog = new this.$THREE.Fog(0xffffff, 1, 10000)
            var geometry = new this.$THREE.BoxBufferGeometry(100, 100, 100)
            var material = new this.$THREE.MeshNormalMaterial()
            this.group = new this.$THREE.Group()
            for (var i = 0; i < 1000; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 2000 - 1000
                mesh.position.y = Math.random() * 2000 - 1000
                mesh.position.z = Math.random() * 2000 - 1000
                mesh.rotation.x = Math.random() * 2 * Math.PI
                mesh.rotation.y = Math.random() * 2 * Math.PI
                mesh.matrixAutoUpdate = false
                mesh.updateMatrix()
                this.group.add(mesh)
            }
            this.scene.add(this.group)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryHierarchy-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglGeometryHierarchy-container')[0].appendChild(this.stats.dom)
            //
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) * 10
            this.mouseY = (event.clientY - this.windowHalfY) * 10
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.001
            var rx = Math.sin(time * 0.7) * 0.5,
                ry = Math.sin(time * 0.3) * 0.5,
                rz = Math.sin(time * 0.2) * 0.5
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * 0.05
            this.camera.lookAt(this.scene.position)
            this.group.rotation.x = rx
            this.group.rotation.y = ry
            this.group.rotation.z = rz
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryHierarchy-container {
    position: relative;
    width: 100%;
}
</style>
