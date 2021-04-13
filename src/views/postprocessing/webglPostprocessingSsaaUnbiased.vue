<template>
    <div class="webglPostprocessingSsaaUnbiased-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Unbiased Manual Supersamling Anti-Aliasing (SSAA) pass by <a href="https://clara.io" target="_blank" rel="noopener">Ben Houston</a><br/><br/>
			This example shows how to unbias the rounding errors accumulated using high number of SSAA samples on a 8-bit per channel buffer.<br/><br/>
			Turn off the "unbiased" feature to see the banding that results from accumulated rounding errors.
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { SSAARenderPass } from '@/components/jsm/postprocessing/SSAARenderPass.js'
import { CopyShader } from '@/components/jsm/shaders/CopyShader.js'
export default {
    data() {
        return {
            scene: null,
            renderer: null,
            composer: null,
            copyPass: null,
            cameraP: null,
            ssaaRenderPassP: null,
            cameraO: null,
            ssaaRenderPassO: null,
            gui: null,
            stats: null,
			params: {
				sampleLevel: 4,
				renderToScreen: false,
				unbiased: true,
				camera: 'perspective',
				clearColor: 'black',
				clearAlpha: 1.0,
				autoRotate: true
			},
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
            this.gui.add(this.params, "unbiased")
            this.gui.add(this.params, "renderToScreen")
            this.gui.add(this.params, 'sampleLevel', {
                'Level 0: 1 Sample': 0,
                'Level 1: 2 Samples': 1,
                'Level 2: 4 Samples': 2,
                'Level 3: 8 Samples': 3,
                'Level 4: 16 Samples': 4,
                'Level 5: 32 Samples': 5
            })
            this.gui.add(this.params, 'camera', [ 'perspective', 'orthographic' ])
            this.gui.add(this.params, "clearColor", [ 'black', 'white', 'blue', 'green', 'red' ])
            this.gui.add(this.params, "clearAlpha", 0, 1)
            this.gui.add(this.params, "autoRotate")
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
            document.getElementsByClassName('webglPostprocessingSsaaUnbiased-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            this.cameraP = new this.$THREE.PerspectiveCamera(65, aspect, 3, 10)
            this.cameraP.position.z = 7
            this.cameraO = new this.$THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 3, 10)
            this.cameraO.position.z = 7
            var fov = this.$THREE.MathUtils.degToRad(this.cameraP.fov)
            var hyperfocus = (this.cameraP.near + this.cameraP.far) / 2
            var _height = 2 * Math.tan(fov / 2) * hyperfocus
            this.cameraO.zoom = height / _height
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
                mesh.scale.setScalar(Math.random() * 0.2 + 0.05)
                group.add(mesh)
            }
            // postprocessing
            this.composer = new EffectComposer(this.renderer)
            this.composer.setPixelRatio(1) // ensure pixel ratio is always 1 for performance reasons
            this.ssaaRenderPassP = new SSAARenderPass(this.scene, this.cameraP)
            this.composer.addPass(this.ssaaRenderPassP)
            this.ssaaRenderPassO = new SSAARenderPass(this.scene, this.cameraO)
            this.composer.addPass(this.ssaaRenderPassO)
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
            var aspect = width / height
            this.cameraP.aspect = aspect
            this.cameraO.updateProjectionMatrix()
            this.cameraO.left = - height * aspect
            this.cameraO.right = height * aspect
            this.cameraO.top = height
            this.cameraO.bottom = - height
            this.cameraO.updateProjectionMatrix()
            this.renderer.setSize(width, height)
            this.composer.setSize(width, height)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            if (this.params.autoRotate) {
                for (var i = 0; i < this.scene.children.length; i ++) {
                    var child = this.scene.children[ i ]
                    child.rotation.x += 0.005
                    child.rotation.y += 0.01
                }
            }
            var newColor = this.ssaaRenderPassP.clearColor
            switch (this.params.clearColor) {
                case 'blue': newColor = 0x0000ff; break
                case 'red': newColor = 0xff0000; break
                case 'green': newColor = 0x00ff00; break
                case 'white': newColor = 0xffffff; break
                case 'black': newColor = 0x000000; break
            }
            this.ssaaRenderPassP.clearColor = this.ssaaRenderPassO.clearColor = newColor
            this.ssaaRenderPassP.clearAlpha = this.ssaaRenderPassO.clearAlpha = this.params.clearAlpha
            this.ssaaRenderPassP.sampleLevel = this.ssaaRenderPassO.sampleLevel = this.params.sampleLevel
            this.ssaaRenderPassP.unbiased = this.ssaaRenderPassO.unbiased = this.params.unbiased
            this.ssaaRenderPassP.enabled = (this.params.camera === 'perspective')
            this.ssaaRenderPassO.enabled = (this.params.camera === 'orthographic')
            this.copyPass.enabled = ! this.params.renderToScreen
            this.composer.render()
            this.stats.end()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingSsaaUnbiased-container {
    position: relative;
    width: 100%;
}
</style>
