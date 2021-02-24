<template>
    <div class="webglPostprocessingSmaa-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - post-processing SMAA
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from '@/components/jsm/postprocessing/SMAAPass.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            composer: null,
            stats: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById("container")
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessingSmaa-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            //
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 300
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.BoxBufferGeometry(120, 120, 120)
            var material1 = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
            var mesh1 = new this.$THREE.Mesh(geometry, material1)
            mesh1.position.x = - 100
            this.scene.add(mesh1)
            var texture = new this.$THREE.TextureLoader().load("static/textures/brick_diffuse.jpg")
            texture.anisotropy = 4
            var material2 = new this.$THREE.MeshBasicMaterial({ map: texture })
            var mesh2 = new this.$THREE.Mesh(geometry, material2)
            mesh2.position.x = 100
            this.scene.add(mesh2)
            // postprocessing
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(new RenderPass(this.scene, this.camera))
            var pass = new SMAAPass(this.$webglInnerWidth * this.renderer.getPixelRatio(), window.innerHeight * this.renderer.getPixelRatio())
            this.composer.addPass(pass)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(width, height)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            for (var i = 0; i < this.scene.children.length; i ++) {
                var child = this.scene.children[ i ]
                child.rotation.x += 0.005
                child.rotation.y += 0.01
            }
            this.composer.render()
            this.stats.end()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingSmaa-container {
    width: 100%;
}
</style>
