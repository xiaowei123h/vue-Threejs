<template>
    <div class="webglPostprocessingSao-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - Scalable Ambient Occlusion (SAO)<br/>
			shader by <a href="http://clara.io">Ben Houston</a> / Post-processing pass by <a href="http://ludobaka.github.io">Ludobaka</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { SAOPass } from '@/components/jsm/postprocessing/SAOPass.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            composer: null,
            renderPass: null,
            saoPass: null,
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
            document.getElementsByClassName('webglPostprocessingSao-container')[0].appendChild(this.container)
            var width = this.$webglInnerWidth || 1
            var height = window.innerHeight || 1
            var devicePixelRatio = window.devicePixelRatio || 1
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setClearColor(0x000000)
            this.renderer.setPixelRatio(devicePixelRatio)
            this.renderer.setSize(width, height)
            document.getElementsByClassName('webglPostprocessingSao-container')[0].appendChild(this.renderer.domElement)
            this.camera = new this.$THREE.PerspectiveCamera(65, width / height, 3, 10)
            this.camera.position.z = 7
            this.scene = new this.$THREE.Scene()
            this.group = new this.$THREE.Object3D()
            this.scene.add(this.group)
            var light = new this.$THREE.PointLight(0xddffdd, 0.8)
            light.position.z = 70
            light.position.y = - 70
            light.position.x = - 70
            this.scene.add(light)
            var light2 = new this.$THREE.PointLight(0xffdddd, 0.8)
            light2.position.z = 70
            light2.position.x = - 70
            light2.position.y = 70
            this.scene.add(light2)
            var light3 = new this.$THREE.PointLight(0xddddff, 0.8)
            light3.position.z = 70
            light3.position.x = 70
            light3.position.y = - 70
            this.scene.add(light3)
            var light4 = new this.$THREE.AmbientLight(0xffffff, 0.05)
            this.scene.add(light4)
            var geometry = new this.$THREE.SphereBufferGeometry(3, 48, 24)
            for (var i = 0; i < 120; i ++) {
                var material = new this.$THREE.MeshStandardMaterial()
                material.roughness = 0.5 * Math.random() + 0.25
                material.metalness = 0
                material.color.setHSL(Math.random(), 1.0, 0.3)
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 4 - 2
                mesh.position.y = Math.random() * 4 - 2
                mesh.position.z = Math.random() * 4 - 2
                mesh.rotation.x = Math.random()
                mesh.rotation.y = Math.random()
                mesh.rotation.z = Math.random()
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 0.2 + 0.05
                this.group.add(mesh)
            }
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            this.composer = new EffectComposer(this.renderer)
            this.renderPass = new RenderPass(this.scene, this.camera)
            this.composer.addPass(this.renderPass)
            this.saoPass = new SAOPass(this.scene, this.camera, false, true)
            this.composer.addPass(this.saoPass)
            // Init gui
            this.gui = new GUI()
            this.gui.add(this.saoPass.params, 'output', {
                'Beauty': SAOPass.OUTPUT.Beauty,
                'Beauty+SAO': SAOPass.OUTPUT.Default,
                'SAO': SAOPass.OUTPUT.SAO,
                'Depth': SAOPass.OUTPUT.Depth,
                'Normal': SAOPass.OUTPUT.Normal
            }).onChange((value) => {
                this.saoPass.params.output = parseInt(value)
            })
            this.gui.add(this.saoPass.params, 'saoBias', - 1, 1)
            this.gui.add(this.saoPass.params, 'saoIntensity', 0, 1)
            this.gui.add(this.saoPass.params, 'saoScale', 0, 10)
            this.gui.add(this.saoPass.params, 'saoKernelRadius', 1, 100)
            this.gui.add(this.saoPass.params, 'saoMinResolution', 0, 1)
            this.gui.add(this.saoPass.params, 'saoBlur')
            this.gui.add(this.saoPass.params, 'saoBlurRadius', 0, 200)
            this.gui.add(this.saoPass.params, 'saoBlurStdDev', 0.5, 150)
            this.gui.add(this.saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var width = (window.innerWidth - 291) || 1
            var height = window.innerHeight || 1
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
.webglPostprocessingSao-container {
    width: 100%;
}
</style>
