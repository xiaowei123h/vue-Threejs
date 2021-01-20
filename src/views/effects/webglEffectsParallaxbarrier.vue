<template>
    <div class="webglEffectsParallaxbarrier-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - effects - parallax barrier<br/>
			skybox by <a href="http://ict.debevec.org/~debevec/" target="_blank" rel="noopener">Paul Debevec</a>
		</div>
    </div>
</template>

<script>
import { ParallaxBarrierEffect } from '@/components/jsm/effects/ParallaxBarrierEffect.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            effect: null,
			spheres: [],
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
            this.container = document.createElement('div')
            document.getElementsByClassName('webglEffectsParallaxbarrier-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.01, 100)
            this.camera.position.z = 3
            this.camera.focalLength = 3
            var path = "static/textures/cube/pisa/"
            var format = '.png'
            var urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ]
            var textureCube = new this.$THREE.CubeTextureLoader().load(urls)
            this.scene = new this.$THREE.Scene()
            this.scene.background = textureCube
            var geometry = new this.$THREE.SphereBufferGeometry(0.1, 32, 16)
            var material = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube })
            for (var i = 0; i < 500; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 10 - 5
                mesh.position.y = Math.random() * 10 - 5
                mesh.position.z = Math.random() * 10 - 5
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1
                this.scene.add(mesh)
                this.spheres.push(mesh)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.container.appendChild(this.renderer.domElement)
            var width = this.$webglInnerWidth || 2
            var height = window.innerHeight || 2
            this.effect = new ParallaxBarrierEffect(this.renderer)
            this.effect.setSize(width, height)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = this.$webglInnerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.camera.aspect = this.$webglInnerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.effect.setSize(this.$webglInnerWidth, window.innerHeight)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) / 100
            this.mouseY = (event.clientY - this.windowHalfY) / 100
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var timer = 0.0001 * Date.now()
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            for (var i = 0, il = this.spheres.length; i < il; i ++) {
                var sphere = this.spheres[ i ]
                sphere.position.x = 5 * Math.cos(timer + i)
                sphere.position.y = 5 * Math.sin(timer + i * 1.1)
            }
            this.effect.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglEffectsParallaxbarrier-container {
    width: 100%;
}
</style>
