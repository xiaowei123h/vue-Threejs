<template>
    <div class="webglPostprocessing-container">
        
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'

import { RGBShiftShader } from '@/components/jsm/shaders/RGBShiftShader.js'
import { DotScreenShader } from '@/components/jsm/shaders/DotScreenShader.js'
export default {
    data() {
        return {
            camera: null,
            renderer: null,
            composer: null,
			object: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessing-container')[0].appendChild(this.renderer.domElement)
            //
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 400
            var scene = new this.$THREE.Scene()
            scene.fog = new this.$THREE.Fog(0x000000, 1, 1000)
            this.object = new this.$THREE.Object3D()
            scene.add(this.object)
            var geometry = new this.$THREE.SphereBufferGeometry(1, 4, 4)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
            for (var i = 0; i < 100; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
                mesh.position.multiplyScalar(Math.random() * 400)
                mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50
                this.object.add(mesh)
            }
            scene.add(new this.$THREE.AmbientLight(0x222222))
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(1, 1, 1)
            scene.add(light)
            // postprocessing
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(new RenderPass(scene, this.camera))
            var effect1 = new ShaderPass(DotScreenShader)
            effect1.uniforms[ 'scale' ].value = 4
            this.composer.addPass(effect1)
            var effect2 = new ShaderPass(RGBShiftShader)
            effect2.uniforms[ 'amount' ].value = 0.0015
            this.composer.addPass(effect2)
            //
            window.addEventListener('resize', this.onWindowResize, false)
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
.webglPostprocessing-container {
    position: relative;
    width: 100%;
}
</style>
