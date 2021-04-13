<template>
    <div class="miscLookat-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Object3D.lookAt() example</div>
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
			sphere: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.windowHalfX = window.innerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 15000)
            this.camera.position.z = 3200
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.sphere = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(100, 20, 20), new this.$THREE.MeshNormalMaterial())
            this.scene.add(this.sphere)
            var geometry = new this.$THREE.CylinderBufferGeometry(0, 10, 100, 12)
            geometry.rotateX(Math.PI / 2)
            var material = new this.$THREE.MeshNormalMaterial()
            for (var i = 0; i < 1000; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 4000 - 2000
                mesh.position.y = Math.random() * 4000 - 2000
                mesh.position.z = Math.random() * 4000 - 2000
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 4 + 2
                this.scene.add(mesh)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('miscLookat-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('miscLookat-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.windowHalfX = (window.innerWidth - x) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onDocumentMouseMove(event) {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.mouseX = (event.clientX - x - this.windowHalfX) * 10
            this.mouseY = (event.clientY - this.windowHalfY) * 10
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.0005
            this.sphere.position.x = Math.sin(time * 0.7) * 2000
            this.sphere.position.y = Math.cos(time * 0.5) * 2000
            this.sphere.position.z = Math.cos(time * 0.3) * 2000
            for (var i = 1, l = this.scene.children.length; i < l; i ++) {
                this.scene.children[ i ].lookAt(this.sphere.position)
            }
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.miscLookat-container {
    position: relative;
    width: 100%;
}
#info {
    background-color: #fff;
    color: #444;
}

#info a {
    color: #08b;
}
</style>
