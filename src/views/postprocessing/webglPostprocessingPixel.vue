<template>
    <div class="webglPostprocessingPixel-container">
        <div id="container"></div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - pixel shader by <a href="http://wongbryan.github.io">wongbryan</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { PixelShader } from '@/components/jsm/shaders/PixelShader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            gui: null,
            composer: null,
            controls: null,
            pixelPass: null,
            params: null,
			group: null,
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
        updateGUI() {
            this.pixelPass.uniforms[ "pixelSize" ].value = this.params.pixelSize
        },
        resize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.pixelPass.uniforms[ "resolution" ].value.set(window.innerWidth - 281, window.innerHeight).multiplyScalar(window.devicePixelRatio)
        },
        init() {
            var container = document.getElementById('container')
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set(0, 0, 30)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.rotateSpeed = 2.0
            this.controls.panSpeed = 0.8
            this.controls.zoomSpeed = 1.5
            this.scene = new this.$THREE.Scene()
            var hemisphereLight = new this.$THREE.HemisphereLight(0xfceafc, 0x000000, .8)
            this.scene.add(hemisphereLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, .5)
            dirLight.position.set(150, 75, 150)
            this.scene.add(dirLight)
            var dirLight2 = new this.$THREE.DirectionalLight(0xffffff, .2)
            dirLight2.position.set(- 150, 75, - 150)
            this.scene.add(dirLight2)
            var dirLight3 = new this.$THREE.DirectionalLight(0xffffff, .1)
            dirLight3.position.set(0, 125, 0)
            this.scene.add(dirLight3)
            var geometries = [
                new this.$THREE.SphereBufferGeometry(1, 64, 64),
                new this.$THREE.BoxBufferGeometry(1, 1, 1),
                new this.$THREE.ConeBufferGeometry(1, 1, 32),
                new this.$THREE.TetrahedronBufferGeometry(1),
                new this.$THREE.TorusKnotBufferGeometry(1, .4)
            ]
            this.group = new this.$THREE.Group()
            for (var i = 0; i < 25; i ++) {
                var geom = geometries[ Math.floor(Math.random() * geometries.length) ]
                var color = new this.$THREE.Color()
                color.setHSL(Math.random(), .7 + .2 * Math.random(), .5 + .1 * Math.random())
                var mat = new this.$THREE.MeshPhongMaterial({ color: color, shininess: 200 })
                var mesh = new this.$THREE.Mesh(geom, mat)
                var s = 4 + Math.random() * 10
                mesh.scale.set(s, s, s)
                mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
                mesh.position.multiplyScalar(Math.random() * 200)
                mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
                this.group.add(mesh)
            }
            this.scene.add(this.group)
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(new RenderPass(this.scene, this.camera))
            this.pixelPass = new ShaderPass(PixelShader)
            this.pixelPass.uniforms[ "resolution" ].value = new this.$THREE.Vector2(this.$webglInnerWidth, window.innerHeight)
            this.pixelPass.uniforms[ "resolution" ].value.multiplyScalar(window.devicePixelRatio)
            this.composer.addPass(this.pixelPass)
            window.addEventListener('resize', this.resize)
            this.params = {
                pixelSize: 16,
                postprocessing: true
            }
            this.gui = new GUI()
            this.gui.add(this.params, 'pixelSize').min(2).max(32).step(2)
            this.gui.add(this.params, 'postprocessing')
        },
        update() {
            this.controls.update()
            this.updateGUI()
            this.group.rotation.y += .0015
            this.group.rotation.z += .001
        },
        animate() {
            this.update()
            if (this.params.postprocessing) {
                this.composer.render()
            } else {
                this.renderer.render(this.scene, this.camera)
            }
            window.requestAnimationFrame(this.animate)
        }
    },
}
</script>

<style scoped>
.webglPostprocessingPixel-container {
    width: 100%;
}
</style>
