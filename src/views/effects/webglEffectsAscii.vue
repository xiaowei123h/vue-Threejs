<template>
    <div class="webglEffectsAscii-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - effects - ascii</div>
    </div>
</template>

<script>
import { AsciiEffect } from '@/components/jsm/effects/AsciiEffect.js'
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
export default {
    data() {
        return {
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            effect: null,
            sphere: null,
            plane: null,
			start: null,
        }
    },
    mounted() {
        this.start = Date.now()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.y = 150
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0, 0, 0)
            var pointLight1 = new this.$THREE.PointLight(0xffffff)
            pointLight1.position.set(500, 500, 500)
            this.scene.add(pointLight1)
            var pointLight2 = new this.$THREE.PointLight(0xffffff, 0.25)
            pointLight2.position.set(- 500, - 500, - 500)
            this.scene.add(pointLight2)
            this.sphere = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(200, 20, 10), new this.$THREE.MeshPhongMaterial({ flatShading: true }))
            this.scene.add(this.sphere)
            // Plane
            this.plane = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(400, 400), new this.$THREE.MeshBasicMaterial({ color: 0xe0e0e0 }))
            this.plane.position.y = - 200
            this.plane.rotation.x = - Math.PI / 2
            this.scene.add(this.plane)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.effect = new AsciiEffect(this.renderer, ' .:-+*=%@#', { invert: true })
            this.effect.setSize(this.$webglInnerWidth, window.innerHeight)
            this.effect.domElement.style.color = 'white'
            this.effect.domElement.style.backgroundColor = 'black'
            // Special case: append this.effect.domElement, instead of renderer.domElement.
            // AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.
            document.getElementsByClassName('webglEffectsAscii-container')[0].appendChild(this.effect.domElement)
            this.controls = new TrackballControls(this.camera, this.effect.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.effect.setSize(this.$webglInnerWidth, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var timer = Date.now() - this.start
            this.sphere.position.y = Math.abs(Math.sin(timer * 0.002)) * 150
            this.sphere.rotation.x = timer * 0.0003
            this.sphere.rotation.z = timer * 0.0002
            this.controls.update()
            this.effect.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglEffectsAscii-container {
    width: 100%;
}
</style>
