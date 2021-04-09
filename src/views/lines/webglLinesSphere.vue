<template>
    <div class="webglLinesSphere-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - lines WebGL demo
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            SCREEN_WIDTH: null,
            SCREEN_HEIGHT: null,
            r: 450,
			mouseY: 0,
            windowHalfY: null,
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.windowHalfY = window.innerHeight / 2
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(80, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 3000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            var parameters = [[0.25, 0xff7700, 1], [0.5, 0xff9900, 1], [0.75, 0xffaa00, 0.75], [1, 0xffaa00, 0.5], [1.25, 0x000833, 0.8],
                [3.0, 0xaaaaaa, 0.75], [3.5, 0xffffff, 0.5], [4.5, 0xffffff, 0.25], [5.5, 0xffffff, 0.125]]
            var geometry = this.createGeometry()
            for (var i = 0; i < parameters.length; ++ i) {
                var p = parameters[i]
                var material = new this.$THREE.LineBasicMaterial({ color: p[1], opacity: p[2] })
                var line = new this.$THREE.LineSegments(geometry, material)
                line.scale.x = line.scale.y = line.scale.z = p[0]
                line.userData.originalScale = p[0]
                line.rotation.y = Math.random() * Math.PI
                line.updateMatrix()
                this.scene.add(line)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            document.getElementsByClassName('webglLinesSphere-container')[0].appendChild(this.renderer.domElement)
            document.getElementsByClassName('webglLinesSphere-container')[0].style.touchAction = 'none'
            document.getElementsByClassName('webglLinesSphere-container')[0].addEventListener('pointermove', this.onPointerMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            // test geometry swapability
            setInterval(() => {
                var geometry = this.createGeometry()
                this.scene.traverse((object) => {
                    if (object.isLine) {
                        object.geometry.dispose()
                        object.geometry = geometry
                    }
                })
            }, 1000)
        },
        createGeometry() {
            var geometry = new this.$THREE.BufferGeometry()
            var vertices = []
            var vertex = new this.$THREE.Vector3()
            for (var i = 0; i < 1500; i ++) {
                vertex.x = Math.random() * 2 - 1
                vertex.y = Math.random() * 2 - 1
                vertex.z = Math.random() * 2 - 1
                vertex.normalize()
                vertex.multiplyScalar(this.r)
                vertices.push(vertex.x, vertex.y, vertex.z)
                vertex.multiplyScalar(Math.random() * 0.09 + 1)
                vertices.push(vertex.x, vertex.y, vertex.z)
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3))
            return geometry
        },
        onWindowResize() {
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.mouseY = event.clientY - this.windowHalfY
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.camera.position.y += (- this.mouseY + 200 - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
            var time = Date.now() * 0.0001
            for (var i = 0; i < this.scene.children.length; i ++) {
                var object = this.scene.children[i]
                if (object.isLine) {
                    object.rotation.y = time * (i < 4 ? (i + 1) : - (i + 1))
                    if (i < 5) {
                        var scale = object.userData.originalScale * (i / 5 + 1) * (1 + 0.5 * Math.sin(7 * time))
                        object.scale.x = object.scale.y = object.scale.z = scale
                    }
                }
            }
        }
    }
}
</script>

<style scoped>
.webglLinesSphere-container {
    position: relative;
    width: 100%;
}
</style>
