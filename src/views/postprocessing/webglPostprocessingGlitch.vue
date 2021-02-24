<template>
    <div class="webglPostprocessingGlitch-container">
        <div id="info">
			<label for="dotScreen">Glitch me wild:</label><input id="wildGlitch" type="checkbox"/><br />
		</div>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { GlitchPass } from '@/components/jsm/postprocessing/GlitchPass.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            composer: null,
            object: null,
            light: null,
			glitchPass: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        updateOptions() {
            var wildGlitch = document.getElementById('wildGlitch')
            this.glitchPass.goWild = wildGlitch.checked
        },
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessingGlitch-container')[0].appendChild(this.renderer.domElement)
            //
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 400
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.Fog(0x000000, 1, 1000)
            this.object = new this.$THREE.Object3D()
            this.scene.add(this.object)
            var geometry = new this.$THREE.SphereBufferGeometry(1, 4, 4)
            for (var i = 0; i < 100; i ++) {
                var material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff * Math.random(), flatShading: true })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
                mesh.position.multiplyScalar(Math.random() * 400)
                mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50
                this.object.add(mesh)
            }
            this.scene.add(new this.$THREE.AmbientLight(0x222222))
            this.light = new this.$THREE.DirectionalLight(0xffffff)
            this.light.position.set(1, 1, 1)
            this.scene.add(this.light)
            // postprocessing
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(new RenderPass(this.scene, this.camera))
            this.glitchPass = new GlitchPass()
            this.composer.addPass(this.glitchPass)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            var wildGlitchOption = document.getElementById('wildGlitch')
            wildGlitchOption.addEventListener('change', this.updateOptions)
            this.updateOptions()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(window.innerWidth - 281, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.object.rotation.x += 0.005
            this.object.rotation.y += 0.01
            this.composer.render()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingGlitch-container {
    width: 100%;
}
</style>
