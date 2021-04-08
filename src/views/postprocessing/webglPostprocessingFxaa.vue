<template>
    <div class="webglPostprocessingFxaa-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - postprocessing - FXAA<br />
			Left scene processed with FXAA, right scene is rendered without anti-aliasing.
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
import { FXAAShader } from '@/components/jsm/shaders/FXAAShader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
            group: null,
            container: null,
            composer1: null,
            composer2: null,
            fxaaPass: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, ((this.container.offsetWidth - 281) * 0.5) / this.container.offsetHeight, 1, 2000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.scene.fog = new this.$THREE.Fog(0xcccccc, 100, 1500)
            this.clock = new this.$THREE.Clock()
            //
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 1000, 0)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.8)
            dirLight.position.set(- 3000, 1000, - 1000)
            this.scene.add(dirLight)
            //
            this.group = new this.$THREE.Group()
            var geometry = new this.$THREE.TetrahedronBufferGeometry(10)
            var material = new this.$THREE.MeshStandardMaterial({ color: 0xee0808, flatShading: true })
            for (var i = 0; i < 100; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 500 - 250
                mesh.position.y = Math.random() * 500 - 250
                mesh.position.z = Math.random() * 500 - 250
                mesh.scale.setScalar(Math.random() * 2 + 1)
                mesh.rotation.x = Math.random() * Math.PI
                mesh.rotation.y = Math.random() * Math.PI
                mesh.rotation.z = Math.random() * Math.PI
                this.group.add(mesh)
            }
            this.scene.add(this.group)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ alpha: true })
            this.renderer.autoClear = false
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize((this.container.offsetWidth - 281), this.container.offsetHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            var renderPass = new RenderPass(this.scene, this.camera)
            //
            this.fxaaPass = new ShaderPass(FXAAShader)
            var pixelRatio = this.renderer.getPixelRatio()
            this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ((this.container.offsetWidth - 281) * pixelRatio)
            this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / (this.container.offsetHeight * pixelRatio)
            this.composer1 = new EffectComposer(this.renderer)
            this.composer1.addPass(renderPass)
            this.composer1.addPass(this.fxaaPass)
            //
            var copyPass = new ShaderPass(CopyShader)
            this.composer2 = new EffectComposer(this.renderer)
            this.composer2.addPass(renderPass)
            this.composer2.addPass(copyPass)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.camera.aspect = ((this.container.offsetWidth - 281) * 0.5) / this.container.offsetHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize((this.container.offsetWidth - 281), this.container.offsetHeight)
            this.composer1.setSize((this.container.offsetWidth - 281), this.container.offsetHeight)
            this.composer2.setSize((this.container.offsetWidth - 281), this.container.offsetHeight)
            var pixelRatio = this.renderer.getPixelRatio()
            this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ((this.container.offsetWidth - 281) * pixelRatio)
            this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / (this.container.offsetHeight * pixelRatio)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var halfWidth = (this.container.offsetWidth - 281) / 2
            this.group.rotation.y += this.clock.getDelta() * 0.1
            this.renderer.setViewport(0, 0, halfWidth, this.container.offsetHeight)
            this.composer1.render()
            this.renderer.setViewport(halfWidth, 0, halfWidth, this.container.offsetHeight)
            this.composer2.render()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingFxaa-container {
    position: relative;
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
    top: 80px;
    width: 100%;
    bottom: 0px;
}
</style>

<style>
#info {
    background-color: #fff;
    color: #222;
}

#info a {
    color: #08f;
}

#container {
    position: absolute;
    top: 80px;
    width: 100%;
    bottom: 0px;
}
</style>
