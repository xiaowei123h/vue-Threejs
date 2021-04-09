<template>
    <div class="webglPerformanceStatic-container">
        
    </div>
</template>

<script>
export default {
    data() {
        return {
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglPerformanceStatic-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 3200
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.scene.matrixAutoUpdate = false
            var material = new this.$THREE.MeshNormalMaterial()
            var loader = new this.$THREE.BufferGeometryLoader()
            loader.load('static/models/json/suzanne_buffergeometry.json', (geometry) => {
                geometry.computeVertexNormals()
                for (let i = 0; i < 7700; i ++) {
                    var mesh = new this.$THREE.Mesh(geometry, material)
                    mesh.position.x = Math.random() * 10000 - 5000
                    mesh.position.y = Math.random() * 10000 - 5000
                    mesh.position.z = Math.random() * 10000 - 5000
                    mesh.rotation.x = Math.random() * 2 * Math.PI
                    mesh.rotation.y = Math.random() * 2 * Math.PI
                    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50 + 100
                    mesh.matrixAutoUpdate = false
                    mesh.updateMatrix()
                    this.scene.add(mesh)
                }
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
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
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglPerformanceStatic-container {
    position: relative;
    width: 100%;
    background-color: #fff;
}
</style>
