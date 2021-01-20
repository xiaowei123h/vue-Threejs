<template>
    <div class="webglGeometryHierarchy2-container">
        
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
            root: null,
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
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 15000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            var geometry = new this.$THREE.BoxBufferGeometry(100, 100, 100)
            var material = new this.$THREE.MeshNormalMaterial()
            this.root = new this.$THREE.Mesh(geometry, material)
            this.root.position.x = 1000
            this.scene.add(this.root)
            var amount = 200
            var object, parent = this.root
            for (var i = 0; i < amount; i ++) {
                object = new this.$THREE.Mesh(geometry, material)
                object.position.x = 100
                parent.add(object)
                parent = object
            }
            parent = this.root
            for (var i = 0; i < amount; i ++) {
                object = new this.$THREE.Mesh(geometry, material)
                object.position.x = - 100
                parent.add(object)
                parent = object
            }
            parent = this.root
            for (var i = 0; i < amount; i ++) {
                object = new this.$THREE.Mesh(geometry, material)
                object.position.y = - 100
                parent.add(object)
                parent = object
            }
            parent = this.root
            for (var i = 0; i < amount; i ++) {
                object = new this.$THREE.Mesh(geometry, material)
                object.position.y = 100
                parent.add(object)
                parent = object
            }
            parent = this.root
            for (var i = 0; i < amount; i ++) {
                object = new this.$THREE.Mesh(geometry, material)
                object.position.z = - 100
                parent.add(object)
                parent = object
            }
            parent = this.root
            for (var i = 0; i < amount; i ++) {
                object = new this.$THREE.Mesh(geometry, material)
                object.position.z = 100
                parent.add(object)
                parent = object
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryHierarchy2-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglGeometryHierarchy2-container')[0].appendChild(this.stats.dom)
            //
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
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
            var time = Date.now() * 0.001 + 10000
            var rx = Math.sin(time * 0.7) * 0.2
            var ry = Math.sin(time * 0.3) * 0.1
            var rz = Math.sin(time * 0.2) * 0.1
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * 0.05
            this.camera.lookAt(this.scene.position)
            this.root.traverse((object) => {
                object.rotation.x = rx
                object.rotation.y = ry
                object.rotation.z = rz
            })
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryHierarchy2-container {
    width: 100%;
}
</style>
