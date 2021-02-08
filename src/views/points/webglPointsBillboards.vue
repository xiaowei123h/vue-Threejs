<template>
    <div class="webglPointsBillboards-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl particle billboards example
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            material: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
            windowHalfY: null,
            gui: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(55, this.$webglInnerWidth / window.innerHeight, 2, 2000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.FogExp2(0x000000, 0.001)
            var geometry = new this.$THREE.BufferGeometry()
            var vertices = []
            var sprite = new this.$THREE.TextureLoader().load('static/textures/sprites/disc.png')
            for (var i = 0; i < 10000; i ++) {
                var x = 2000 * Math.random() - 1000
                var y = 2000 * Math.random() - 1000
                var z = 2000 * Math.random() - 1000
                vertices.push(x, y, z)
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3))
            this.material = new this.$THREE.PointsMaterial({ size: 35, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true })
            this.material.color.setHSL(1.0, 0.3, 0.7)
            var particles = new this.$THREE.Points(geometry, this.material)
            this.scene.add(particles)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPointsBillboards-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglPointsBillboards-container')[0].appendChild(this.stats.dom)
            //
            this.gui = new GUI()
            this.gui.add(this.material, 'sizeAttenuation').onChange(() => {
                this.material.needsUpdate = true
            })
            this.gui.open()
            //
            document.getElementsByClassName('webglPointsBillboards-container')[0].style.touchAction = 'none'
            document.getElementsByClassName('webglPointsBillboards-container')[0].addEventListener('pointermove', this.onPointerMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.mouseX = event.clientX - this.windowHalfX
            this.mouseY = event.clientY - this.windowHalfY
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.00005
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * 0.05
            this.camera.lookAt(this.scene.position)
            var h = (360 * (1.0 + time) % 360) / 360
            this.material.color.setHSL(h, 0.5, 0.5)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglPointsBillboards-container {
    width: 100%;
}
</style>
