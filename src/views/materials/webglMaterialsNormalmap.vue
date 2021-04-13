<template>
    <div class="webglMaterialsNormalmap-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl normalmap demo.<br/>
			<a href="http://graphics.cs.williams.edu/data/meshes.xml#14" target="_blank" rel="noopener">Lee Perry-Smith</a> head.
		</div>
    </div>
</template>

<script>
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { BleachBypassShader } from '@/components/jsm/shaders/BleachBypassShader.js'
import { ColorCorrectionShader } from '@/components/jsm/shaders/ColorCorrectionShader.js'
import { FXAAShader } from '@/components/jsm/shaders/FXAAShader.js'
import { GammaCorrectionShader } from '@/components/jsm/shaders/GammaCorrectionShader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            loader: null,
            camera: null,
            scene: null,
            renderer: null,
			mesh: null,
            directionalLight: null,
            pointLight: null,
            ambientLight: null,
			mouseX: 0,
			mouseY: 0,
			targetX: 0,
			targetY: 0,
			windowHalfX: null,
			windowHalfY: null,
            composer: null,
            effectFXAA: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsNormalmap-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 1200
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x111111)
            // LIGHTS
            this.ambientLight = new this.$THREE.AmbientLight(0x444444)
            this.scene.add(this.ambientLight)
            this.pointLight = new this.$THREE.PointLight(0xffffff, 1.25, 1000)
            this.pointLight.position.set(0, 0, 600)
            this.scene.add(this.pointLight)
            this.directionalLight = new this.$THREE.DirectionalLight(0xffffff)
            this.directionalLight.position.set(1, - 0.5, - 1)
            this.scene.add(this.directionalLight)
            var textureLoader = new this.$THREE.TextureLoader()
            var diffuseMap = textureLoader.load("static/models/gltf/LeePerrySmith/Map-COL.jpg")
            diffuseMap.encoding = this.$THREE.sRGBEncoding
            var specularMap = textureLoader.load("static/models/gltf/LeePerrySmith/Map-SPEC.jpg")
            specularMap.encoding = this.$THREE.sRGBEncoding
            var normalMap = textureLoader.load("static/models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg")
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xdddddd,
                specular: 0x222222,
                shininess: 35,
                map: diffuseMap,
                specularMap: specularMap,
                normalMap: normalMap,
                normalScale: new this.$THREE.Vector2(0.8, 0.8)
            })
            this.loader = new GLTFLoader()
            this.loader.load("static/models/gltf/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
                this.createScene(gltf.scene.children[ 0 ].geometry, 100, material)
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            // COMPOSER
            this.renderer.autoClear = false
            var renderModel = new RenderPass(this.scene, this.camera)
            var effectBleach = new ShaderPass(BleachBypassShader)
            var effectColor = new ShaderPass(ColorCorrectionShader)
            this.effectFXAA = new ShaderPass(FXAAShader)
            var gammaCorrection = new ShaderPass(GammaCorrectionShader)
            this.effectFXAA.uniforms[ 'resolution' ].value.set(1 / this.$webglInnerWidth, 1 / window.innerHeight)
            effectBleach.uniforms[ 'opacity' ].value = 0.2
            effectColor.uniforms[ 'powRGB' ].value.set(1.4, 1.45, 1.45)
            effectColor.uniforms[ 'mulRGB' ].value.set(1.1, 1.1, 1.1)
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(renderModel)
            this.composer.addPass(this.effectFXAA)
            this.composer.addPass(effectBleach)
            this.composer.addPass(effectColor)
            this.composer.addPass(gammaCorrection)
            // EVENTS
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        createScene(geometry, scale, material) {
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.mesh.position.y = - 50
            this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale
            this.scene.add(this.mesh)
        },
        onWindowResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.composer.setSize(width, height)
            this.effectFXAA.uniforms[ 'resolution' ].value.set(1 / width, 1 / height)
        },
        onDocumentMouseMove(event) {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.mouseX = (event.clientX - x - this.windowHalfX)
            this.mouseY = (event.clientY - this.windowHalfY)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.targetX = this.mouseX * .001
            this.targetY = this.mouseY * .001
            if (this.mesh) {
                this.mesh.rotation.y += 0.05 * (this.targetX - this.mesh.rotation.y)
                this.mesh.rotation.x += 0.05 * (this.targetY - this.mesh.rotation.x)
            }
            this.composer.render()
        }
    },
}
</script>

<style scoped>
.webglMaterialsNormalmap-container {
    position: relative;
    width: 100%;
}
</style>
