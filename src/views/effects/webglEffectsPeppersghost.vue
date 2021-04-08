<template>
    <div class="webglEffectsPeppersghost-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - <a href="https://en.wikipedia.org/wiki/Pepper%27s_ghost">peppers ghost effect</a> demo <br />
			<a href="http://www.instructables.com/id/Reflective-Prism/?ALLSTEPS" target="_blank" rel="noopener">how to build the reflective prism</a>
		</div>
    </div>
</template>

<script>
import { PeppersGhostEffect } from '@/components/jsm/effects/PeppersGhostEffect.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            effect: null,
			group: null,
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglEffectsPeppersghost-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 100000)
            this.scene = new this.$THREE.Scene()
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            // Cube
            var geometry = new this.$THREE.BoxBufferGeometry().toNonIndexed() // ensure unique vertices for each triangle
            var position = geometry.attributes.position
            var colors = []
            var color = new this.$THREE.Color()
            // generate for each side of the cube a different color
            for (var i = 0; i < position.count; i += 6) {
                color.setHex(Math.random() * 0xffffff)
                // first face
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
                // second face
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
            }
            geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            var material = new this.$THREE.MeshBasicMaterial({ vertexColors: true })
            for (var i = 0; i < 10; i ++) {
                var cube = new this.$THREE.Mesh(geometry, material)
                cube.position.x = Math.random() * 2 - 1
                cube.position.y = Math.random() * 2 - 1
                cube.position.z = Math.random() * 2 - 1
                cube.scale.multiplyScalar(Math.random() + 0.5)
                this.group.add(cube)
            }
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.container.appendChild(this.renderer.domElement)
            this.effect = new PeppersGhostEffect(this.renderer)
            this.effect.setSize(this.$webglInnerWidth, window.innerHeight)
            this.effect.Distance = 5
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.camera.aspect = (window.innerWidth - 281) / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.effect.setSize((window.innerWidth - 281), window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.group.rotation.y += 0.01
            this.effect.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglEffectsPeppersghost-container {
    position: relative;
    width: 100%;
}
</style>
