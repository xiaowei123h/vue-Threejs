<template>
    <div class="webgl2MultisampledRenderbuffers-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Multisampled Renderbuffers<br />
			Left: WebGLRenderTarget, Right: WebGLMultisampleRenderTarget.
		</div>
		<div id="container">
		</div>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { CopyShader } from '@/components/jsm/shaders/CopyShader.js'
import { WEBGL } from '@/components/jsm/WebGL.js'
export default {
    data() {
        return {
            camera: null,
            renderer: null,
            clock: null,
            group: null,
            container: null,
            composer1: null,
            composer2: null,
        }
    },
    mounted() {
        if (WEBGL.isWebGL2Available() === false) {
            document.getElementsByClassName('webgl2MultisampledRenderbuffers-container')[0].appendChild(WEBGL.getWebGL2ErrorMessage())
        }
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 500
            var scene = new this.$THREE.Scene()
            scene.background = new this.$THREE.Color(0xffffff)
            scene.fog = new this.$THREE.Fog(0xcccccc, 100, 1500)
            this.clock = new this.$THREE.Clock()
            //
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x222222, 1.5)
            hemiLight.position.set(1, 1, 1)
            scene.add(hemiLight)
            //
            this.group = new this.$THREE.Group()
            var geometry = new this.$THREE.SphereBufferGeometry(10, 64, 40)
            var material = new this.$THREE.MeshLambertMaterial({ color: 0xee0808 })
            var material2 = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
            for (var i = 0; i < 10; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 600 - 300
                mesh.position.y = Math.random() * 600 - 300
                mesh.position.z = Math.random() * 600 - 300
                mesh.rotation.x = Math.random()
                mesh.rotation.z = Math.random()
                mesh.scale.setScalar(Math.random() * 5 + 5)
                this.group.add(mesh)
                var mesh2 = new this.$THREE.Mesh(geometry, material2)
                mesh2.position.copy(mesh.position)
                mesh2.rotation.copy(mesh.rotation)
                mesh2.scale.copy(mesh.scale)
                this.group.add(mesh2)
            }
            scene.add(this.group)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.autoClear = false
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            var parameters = {
                format: this.$THREE.RGBFormat
            }
            var size = this.renderer.getDrawingBufferSize(new this.$THREE.Vector2())
            var renderTarget = new this.$THREE.WebGLMultisampleRenderTarget(size.width, size.height, parameters)
            var renderPass = new RenderPass(scene, this.camera)
            var copyPass = new ShaderPass(CopyShader)
            //
            this.composer1 = new EffectComposer(this.renderer)
            this.composer1.addPass(renderPass)
            this.composer1.addPass(copyPass)
            //
            this.composer2 = new EffectComposer(this.renderer, renderTarget)
            this.composer2.addPass(renderPass)
            this.composer2.addPass(copyPass)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.composer1.setSize(window.innerWidth - 281, window.innerHeight)
            this.composer2.setSize(window.innerWidth - 281, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var halfWidth = (window.innerWidth - 281) / 2
            this.group.rotation.y += this.clock.getDelta() * 0.1
            this.renderer.setScissorTest(true)
            this.renderer.setScissor(0, 0, halfWidth - 1, window.innerHeight)
            this.composer1.render()
            this.renderer.setScissor(halfWidth, 0, halfWidth, window.innerHeight)
            this.composer2.render()
            this.renderer.setScissorTest(false)
        }
    },
}
</script>

<style scoped>
.webgl2MultisampledRenderbuffers-container {
    width: 100%;
}
#info {
    background-color: #fff;
    color: #222;
}

#info a {
    color: #08f;
}

#container {
    position: absolute;
    top: 70px;
    width: 100%;
    bottom: 0px;
}
</style>
