<template>
    <div class="webglInteractiveCubes-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive cubes
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            raycaster: null,
            renderer: null,
			INTERSECTED: null,
			theta: 0,
			mouse: null,
			radius: 100,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglInteractiveCubes-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            var light = new this.$THREE.DirectionalLight(0xffffff, 1)
            light.position.set(1, 1, 1).normalize()
            this.scene.add(light)
            var geometry = new this.$THREE.BoxBufferGeometry(20, 20, 20)
            for (var i = 0; i < 2000; i ++) {
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
                object.position.x = Math.random() * 800 - 400
                object.position.y = Math.random() * 800 - 400
                object.position.z = Math.random() * 800 - 400
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.x = Math.random() + 0.5
                object.scale.y = Math.random() + 0.5
                object.scale.z = Math.random() + 0.5
                this.scene.add(object)
            }
            this.raycaster = new this.$THREE.Raycaster()
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onDocumentMouseMove(event) {
            var x, y
            if (window.innerWidth >= 640) {
                x = 281
                y = 0
            } else {
                x = 0
                y = 49
            }
            event.preventDefault()
            this.mouse.x = ((event.clientX - x) / (window.innerWidth - x)) * 2 - 1
            this.mouse.y = - ((event.clientY - y) / window.innerHeight) * 2 + 1
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.theta += 0.1
            this.camera.position.x = this.radius * Math.sin(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.position.y = this.radius * Math.sin(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.position.z = this.radius * Math.cos(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.lookAt(this.scene.position)
            this.camera.updateMatrixWorld()
            // find intersections
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObjects(this.scene.children)
            if (intersects.length > 0) {
                if (this.INTERSECTED != intersects[ 0 ].object) {
                    if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)
                    this.INTERSECTED = intersects[ 0 ].object
                    this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex()
                    this.INTERSECTED.material.emissive.setHex(0xff0000)
                }
            } else {
                if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)
                this.INTERSECTED = null
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInteractiveCubes-container {
    position: relative;
    width: 100%;
    background-color: #f0f0f0;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
