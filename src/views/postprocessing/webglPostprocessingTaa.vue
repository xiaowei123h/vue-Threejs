<template>
    <div class="webglPostprocessingTaa-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Temporal Anti-Aliasing (TAA) pass by <a href="https://clara.io" target="_blank" rel="noopener">Ben Houston</a><br/><br/>
			When there is no motion in the scene, the TAA render pass accumulates jittered camera samples<br/>
			across frames to create a high quality anti-aliased result.<br/><br/>
			Texture interpolation, mipmapping and anistropic sampling is disabled to emphasize<br/> the effect SSAA levels have one the resulting render quality.
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { TAARenderPass } from '@/components/jsm/postprocessing/TAARenderPass.js'
import { CopyShader } from '@/components/jsm/shaders/CopyShader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            composer: null,
            copyPass: null,
            taaRenderPass: null,
            renderPass: null,
            gui: null,
            stats: null,
			index: 0,
			param: { TAAEnabled: "1", TAASampleLevel: 0 },
        }
    },
    mounted() {
        this.init()
        this.animate()
        this.clearGui()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        clearGui() {
            if (this.gui) this.gui.destroy()
            this.gui = new GUI()
            this.gui.add(this.param, 'TAAEnabled', {
                'Disabled': '0',
                'Enabled': '1'
            }).onFinishChange(() => {
                if (this.taaRenderPass) {
                    this.taaRenderPass.enabled = (this.param.TAAEnabled === "1")
                    this.renderPass.enabled = (this.param.TAAEnabled !== "1")
                }
            })
            this.gui.add(this.param, 'TAASampleLevel', {
                'Level 0: 1 Sample': 0,
                'Level 1: 2 Samples': 1,
                'Level 2: 4 Samples': 2,
                'Level 3: 8 Samples': 3,
                'Level 4: 16 Samples': 4,
                'Level 5: 32 Samples': 5
            }).onFinishChange(() => {
                if (this.taaRenderPass) {
                    this.taaRenderPass.sampleLevel = this.param.TAASampleLevel
                }
            })
            this.gui.open()
        },
        init() {
            var container = document.getElementById("container")
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessingTaa-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
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
            texture.minFilter = this.$THREE.NearestFilter
            texture.magFilter = this.$THREE.NearestFilter
            texture.anisotropy = 1
            texture.generateMipmaps = false
            var material2 = new this.$THREE.MeshBasicMaterial({ map: texture })
            var mesh2 = new this.$THREE.Mesh(geometry, material2)
            mesh2.position.x = 100
            this.scene.add(mesh2)
            // postprocessing
            this.composer = new EffectComposer(this.renderer)
            this.taaRenderPass = new TAARenderPass(this.scene, this.camera)
            this.taaRenderPass.unbiased = false
            this.composer.addPass(this.taaRenderPass)
            this.renderPass = new RenderPass(this.scene, this.camera)
            this.renderPass.enabled = false
            this.composer.addPass(this.renderPass)
            this.copyPass = new ShaderPass(CopyShader)
            this.composer.addPass(this.copyPass)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            var width = window.innerWidth - x
            var height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.composer.setSize(width, height)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.index ++
            if (Math.round(this.index / 200) % 2 === 0) {
                for (var i = 0; i < this.scene.children.length; i ++) {
                    var child = this.scene.children[ i ]
                    child.rotation.x += 0.005
                    child.rotation.y += 0.01
                }
                if (this.taaRenderPass) this.taaRenderPass.accumulate = false
            } else {
                if (this.taaRenderPass) this.taaRenderPass.accumulate = true
            }
            this.composer.render()
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingTaa-container {
    position: relative;
    width: 100%;
}
</style>
