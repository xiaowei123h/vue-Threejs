<template>
    <div class="webglPostprocessingSobel-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - webgl - postprocessing<br/>
			sobel (edge detection)
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { LuminosityShader } from '@/components/jsm/shaders/LuminosityShader.js'
import { SobelOperatorShader } from '@/components/jsm/shaders/SobelOperatorShader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            composer: null,
			effectSobel: null,
			params: {
				enable: true
            },
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
            //
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.1, 200)
            this.camera.position.set(0, 10, 25)
            this.camera.lookAt(this.scene.position)
            //
            var geometry = new this.$THREE.TorusKnotBufferGeometry(8, 3, 256, 32, 2, 3)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0xffff00 })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            //
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            this.scene.add(this.camera)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessingSobel-container')[0].appendChild(this.renderer.domElement)
            // postprocessing
            this.composer = new EffectComposer(this.renderer)
            var renderPass = new RenderPass(this.scene, this.camera)
            this.composer.addPass(renderPass)
            // color to grayscale conversion
            var effectGrayScale = new ShaderPass(LuminosityShader)
            this.composer.addPass(effectGrayScale)
            // you might want to use a gaussian blur filter before
            // the next pass to improve the result of the Sobel operator
            // Sobel operator
            this.effectSobel = new ShaderPass(SobelOperatorShader)
            this.effectSobel.uniforms[ 'resolution' ].value.x = this.$webglInnerWidth * window.devicePixelRatio
            this.effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio
            this.composer.addPass(this.effectSobel)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 10
            controls.maxDistance = 100
            //
            this.gui = new GUI()
            this.gui.add(this.params, 'enable')
            this.gui.open()
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(window.innerWidth - 281, window.innerHeight)
            this.effectSobel.uniforms[ 'resolution' ].value.x = (window.innerWidth - 281) * window.devicePixelRatio
            this.effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.params.enable === true) {
                this.composer.render()
            } else {
                this.renderer.render(this.scene, this.camera)
            }
        }
    },
}
</script>

<style scoped>
.webglPostprocessingSobel-container {
    position: relative;
    width: 100%;
}
</style>
