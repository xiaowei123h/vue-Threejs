<template>
    <div class="webglPostprocessingSsao-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - screen space ambient occlusion<br/>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { SSAOPass } from '@/components/jsm/postprocessing/SSAOPass.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			composer: null,
            group: null, 
            gui: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglPostprocessingSsao-container')[0].appendChild(this.container)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessingSsao-container')[0].appendChild(this.renderer.domElement)
            this.camera = new this.$THREE.PerspectiveCamera(65, this.$webglInnerWidth / window.innerHeight, 100, 700)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xaaaaaa)
            this.scene.add(new this.$THREE.DirectionalLight())
            this.scene.add(new this.$THREE.HemisphereLight())
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            var geometry = new this.$THREE.BoxBufferGeometry(10, 10, 10)
            for (var i = 0; i < 100; i ++) {
                var material = new this.$THREE.MeshLambertMaterial({
                    color: Math.random() * 0xffffff
                })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 400 - 200
                mesh.position.y = Math.random() * 400 - 200
                mesh.position.z = Math.random() * 400 - 200
                mesh.rotation.x = Math.random()
                mesh.rotation.y = Math.random()
                mesh.rotation.z = Math.random()
                mesh.scale.setScalar(Math.random() * 10 + 2)
                this.group.add(mesh)
            }
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            this.composer = new EffectComposer(this.renderer)
            var ssaoPass = new SSAOPass(this.scene, this.camera, width, height)
            ssaoPass.kernelRadius = 16
            this.composer.addPass(ssaoPass)
            // Init gui
            this.gui = new GUI()
            this.gui.add(ssaoPass, 'output', {
                'Default': SSAOPass.OUTPUT.Default,
                'SSAO Only': SSAOPass.OUTPUT.SSAO,
                'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
                'Beauty': SSAOPass.OUTPUT.Beauty,
                'Depth': SSAOPass.OUTPUT.Depth,
                'Normal': SSAOPass.OUTPUT.Normal
            }).onChange(function (value) {
                ssaoPass.output = parseInt(value)
            })
            this.gui.add(ssaoPass, 'kernelRadius').min(0).max(32)
            this.gui.add(ssaoPass, 'minDistance').min(0.001).max(0.02)
            this.gui.add(ssaoPass, 'maxDistance').min(0.01).max(0.3)
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
            this.render()
            this.stats.end()
        },
        render() {
            var timer = performance.now()
            this.group.rotation.x = timer * 0.0002
            this.group.rotation.y = timer * 0.0001
            this.composer.render()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingSsao-container {
    width: 100%;
    background-color: #aaa;
}
</style>
