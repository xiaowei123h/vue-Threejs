<template>
    <div class="webglPostprocessingBackgrounds-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Backgrounds: ClearPass, TexturePass and CubeTexturePass<br/>
			by <a href="https://clara.io" target="_blank" rel="noopener">Ben Houston</a>
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { TexturePass } from '@/components/jsm/postprocessing/TexturePass.js'
import { CubeTexturePass } from '@/components/jsm/postprocessing/CubeTexturePass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { ClearPass } from '@/components/jsm/postprocessing/ClearPass.js'
import { CopyShader } from '@/components/jsm/shaders/CopyShader.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            scene: null,
            renderer: null,
            composer: null,
            clearPass: null,
            texturePass: null,
            renderPass: null,
            cameraP: null,
            cubeTexturePassP: null,
            gui: null,
            stats: null,
			params: {
				clearPass: true,
				clearColor: 'white',
				clearAlpha: 1.0,
				texturePass: true,
				texturePassOpacity: 1.0,
				cubeTexturePass: true,
				cubeTexturePassOpacity: 1.0,
				renderPass: true
			}
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
            this.gui.add(this.params, "clearPass")
            this.gui.add(this.params, "clearColor", [ 'black', 'white', 'blue', 'green', 'red' ])
            this.gui.add(this.params, "clearAlpha", 0, 1)
            this.gui.add(this.params, "texturePass")
            this.gui.add(this.params, "texturePassOpacity", 0, 1)
            this.gui.add(this.params, "cubeTexturePass")
            this.gui.add(this.params, "cubeTexturePassOpacity", 0, 1)
            this.gui.add(this.params, "renderPass")
            this.gui.open()
        },
        init() {
            var container = document.getElementById("container")
            var width = this.$webglInnerWidth || 1
            var height = window.innerHeight || 1
            var aspect = width / height
            var devicePixelRatio = window.devicePixelRatio || 1
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(devicePixelRatio)
            this.renderer.setSize(width, height)
            document.getElementsByClassName('webglPostprocessingBackgrounds-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            this.cameraP = new this.$THREE.PerspectiveCamera(65, aspect, 1, 10)
            this.cameraP.position.z = 7
            this.scene = new this.$THREE.Scene()
            var group = new this.$THREE.Group()
            this.scene.add(group)
            var light = new this.$THREE.PointLight(0xddffdd, 1.0)
            light.position.z = 70
            light.position.y = - 70
            light.position.x = - 70
            this.scene.add(light)
            var light2 = new this.$THREE.PointLight(0xffdddd, 1.0)
            light2.position.z = 70
            light2.position.x = - 70
            light2.position.y = 70
            this.scene.add(light2)
            var light3 = new this.$THREE.PointLight(0xddddff, 1.0)
            light3.position.z = 70
            light3.position.x = 70
            light3.position.y = - 70
            this.scene.add(light3)
            var geometry = new this.$THREE.SphereBufferGeometry(1, 48, 24)
            var material = new this.$THREE.MeshStandardMaterial()
            material.roughness = 0.5 * Math.random() + 0.25
            material.metalness = 0
            material.color.setHSL(Math.random(), 1.0, 0.3)
            var mesh = new this.$THREE.Mesh(geometry, material)
            group.add(mesh)
            // postprocessing
            var genCubeUrls = (prefix, postfix) => {
                return [
                    prefix + 'px' + postfix, prefix + 'nx' + postfix,
                    prefix + 'py' + postfix, prefix + 'ny' + postfix,
                    prefix + 'pz' + postfix, prefix + 'nz' + postfix
                ]
            }
            this.composer = new EffectComposer(this.renderer)
            this.clearPass = new ClearPass(this.params.clearColor, this.params.clearAlpha)
            this.composer.addPass(this.clearPass)
            this.texturePass = new TexturePass()
            this.composer.addPass(this.texturePass)
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load("textures/hardwood2_diffuse.jpg", (map) => {
                this.texturePass.map = map
            })
            this.cubeTexturePassP = null
            var ldrUrls = genCubeUrls("textures/cube/pisa/", ".png")
            new this.$THREE.CubeTextureLoader().load(ldrUrls, (ldrCubeMap) => {
                this.cubeTexturePassP = new CubeTexturePass(this.cameraP, ldrCubeMap)
                this.composer.insertPass(this.cubeTexturePassP, 2)
            })
            this.renderPass = new RenderPass(this.scene, this.cameraP)
            this.renderPass.clear = false
            this.composer.addPass(this.renderPass)
            var copyPass = new ShaderPass(CopyShader)
            this.composer.addPass(copyPass)
            var controls = new OrbitControls(this.cameraP, this.renderer.domElement)
            controls.enableZoom = false
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            var aspect = width / height
            this.cameraP.aspect = aspect
            this.cameraP.updateProjectionMatrix()
            this.renderer.setSize(width, height)
            this.composer.setSize(width, height)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.cameraP.updateMatrixWorld(true)
            var newColor = this.clearPass.clearColor
            switch (this.params.clearColor) {
                case 'blue': newColor = 0x0000ff; break
                case 'red': newColor = 0xff0000; break
                case 'green': newColor = 0x00ff00; break
                case 'white': newColor = 0xffffff; break
                case 'black': newColor = 0x000000; break
            }
            this.clearPass.enabled = this.params.clearPass
            this.clearPass.clearColor = newColor
            this.clearPass.clearAlpha = this.params.clearAlpha
            this.texturePass.enabled = this.params.texturePass
            this.texturePass.opacity = this.params.texturePassOpacity
            if (this.cubeTexturePassP !== null) {
                this.cubeTexturePassP.enabled = this.params.cubeTexturePass
                this.cubeTexturePassP.opacity = this.params.cubeTexturePassOpacity
            }
            this.renderPass.enabled = this.params.renderPass
            this.composer.render()
            this.stats.end()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingBackgrounds-container {
    position: relative;
    width: 100%;
}
</style>
