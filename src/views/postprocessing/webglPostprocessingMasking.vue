<template>
    <div class="webglPostprocessingMasking-container">
        <div id="container"></div>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { TexturePass } from '@/components/jsm/postprocessing/TexturePass.js'
import { ClearPass } from '@/components/jsm/postprocessing/ClearPass.js'
import { MaskPass, ClearMaskPass } from '@/components/jsm/postprocessing/MaskPass.js'
import { CopyShader } from '@/components/jsm/shaders/CopyShader.js'
export default {
    data() {
        return {
            camera: null,
            composer: null,
            renderer: null,
            box: null,
            torus: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 10
            var scene1 = new this.$THREE.Scene()
            var scene2 = new this.$THREE.Scene()
            this.box = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(4, 4, 4))
            scene1.add(this.box)
            this.torus = new this.$THREE.Mesh(new this.$THREE.TorusBufferGeometry(3, 1, 16, 32))
            scene2.add(this.torus)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setClearColor(0xe0e0e0)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false
            document.getElementsByClassName('webglPostprocessingMasking-container')[0].appendChild(this.renderer.domElement)
            //
            var clearPass = new ClearPass()
            var clearMaskPass = new ClearMaskPass()
            var maskPass1 = new MaskPass(scene1, this.camera)
            var maskPass2 = new MaskPass(scene2, this.camera)
            var texture1 = new this.$THREE.TextureLoader().load('static/textures/758px-Canestra_di_frutta_(Caravaggio).jpg')
            texture1.minFilter = this.$THREE.LinearFilter
            var texture2 = new this.$THREE.TextureLoader().load('static/textures/2294472375_24a3b8ef46_o.jpg')
            var texturePass1 = new TexturePass(texture1)
            var texturePass2 = new TexturePass(texture2)
            var outputPass = new ShaderPass(CopyShader)
            var parameters = {
                minFilter: this.$THREE.LinearFilter,
                magFilter: this.$THREE.LinearFilter,
                format: this.$THREE.RGBFormat,
                stencilBuffer: true
            }
            var renderTarget = new this.$THREE.WebGLRenderTarget(this.$webglInnerWidth, window.innerHeight, parameters)
            this.composer = new EffectComposer(this.renderer, renderTarget)
            this.composer.addPass(clearPass)
            this.composer.addPass(maskPass1)
            this.composer.addPass(texturePass1)
            this.composer.addPass(clearMaskPass)
            this.composer.addPass(maskPass2)
            this.composer.addPass(texturePass2)
            this.composer.addPass(clearMaskPass)
            this.composer.addPass(outputPass)
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
            var time = performance.now() * 0.001 + 6000
            this.box.position.x = Math.cos(time / 1.5) * 2
            this.box.position.y = Math.sin(time) * 2
            this.box.rotation.x = time
            this.box.rotation.y = time / 2
            this.torus.position.x = Math.cos(time) * 2
            this.torus.position.y = Math.sin(time / 1.5) * 2
            this.torus.rotation.x = time
            this.torus.rotation.y = time / 2
            this.renderer.clear()
            this.composer.render(time)
        }
    },
}
</script>

<style scoped>
.webglPostprocessingMasking-container {
    width: 100%;
}
</style>
