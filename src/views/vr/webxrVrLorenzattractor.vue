<template>
    <div class="webxrVrLorenzattractor-container">
        
    </div>
</template>

<script>
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            attractor: null,
            light: null,
			x: 15 * Math.random(),
			y: 15 * Math.random(),
			z: 15 * Math.random(),
			scale: .02, // for reducing overall displayed size
			speed: 5, // integer, increase for faster visualization
			steps: 100000,
			current: 1,
			shown: 10000,
			beta: 8 / 3,
			rho: 28,
			sigma: 10,
			dt: .005,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        draw() {
            var geometry = this.attractor.geometry
            geometry.attributes.position.array.copyWithin(3)
            geometry.attributes.color.array.copyWithin(3)
            if (this.current < this.steps) {
                var dx = this.sigma * (this.y - this.x) * this.dt
                var dy = (this.x * (this.rho - this.z) - this.y) * this.dt
                var dz = (this.x * this.y - this.beta * this.z) * this.dt
                this.x += dx
                this.y += dy
                this.z += dz
                geometry.attributes.position.set([ this.scale * this.x, this.scale * this.y, this.scale * this.z ], 0)
                this.light.color.setHSL(this.current / this.steps, 1, .5)
                geometry.attributes.color.set(this.light.color.toArray(), 0)
            }
            if (this.current < this.steps + this.shown) {
                this.current ++
            } else {
                this.current = 0
            }
        },
        init() {
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.set(0, 1.6, 1)
            //
            var geometry = new this.$THREE.BufferGeometry()
            var positions = new Float32Array(3 * this.shown)
            for (var i = 0; i < positions.length; i += 3) {
                positions.set([ this.scale * this.x, this.scale * this.y, this.scale * this.z ], i)
            }
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            var colors = new Float32Array(3 * this.shown)
            for (var i = 0; i < positions.length; i += 3) {
                colors.set([ 1, 0, 0 ], i)
            }
            geometry.setAttribute('color', new this.$THREE.BufferAttribute(colors, 3))
            var material = new this.$THREE.LineBasicMaterial({ vertexColors: true })
            this.attractor = new this.$THREE.Line(geometry, material)
            this.attractor.position.set(0, 1.5, - 2)
            this.attractor.frustumCulled = false // critical to avoid blackouts!
            this.scene.add(this.attractor)
            //
            this.light = new this.$THREE.PointLight(0xffffff, 1)
            this.light.distance = 2
            this.attractor.add(this.light)
            var ground = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(10, 10),
                new this.$THREE.MeshPhongMaterial()
            )
            ground.geometry.rotateX(- 90 * Math.PI / 180)
            this.scene.add(ground)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            document.getElementsByClassName('webxrVrLorenzattractor-container')[0].appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrLorenzattractor-container')[0].appendChild(VRButton.createButton(this.renderer))
            //
            window.addEventListener('resize', this.onWindowResize, false)
            //
            if (typeof TESTING !== 'undefined' ) { for (var i = 0; i < 200; i ++) { render(); } }
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            for (var i = 0; i < this.speed; i ++) this.draw()
            this.attractor.geometry.attributes.position.needsUpdate = true
            this.attractor.geometry.attributes.color.needsUpdate = true
            this.attractor.rotation.z += .001
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrLorenzattractor-container {
    position: relative;
    width: 100%;
}
</style>
