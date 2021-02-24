<template>
    <div class="webglPostprocessingAdvanced-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl postprocessing example<br/>
			<a href="http://g3d.cs.williams.edu/g3d/data10/index.html#mesh19" target="_blank" rel="noopener">Lee Perry-Smith</a> head
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { BloomPass } from '@/components/jsm/postprocessing/BloomPass.js'
import { FilmPass } from '@/components/jsm/postprocessing/FilmPass.js'
import { DotScreenPass } from '@/components/jsm/postprocessing/DotScreenPass.js'
import { MaskPass, ClearMaskPass } from '@/components/jsm/postprocessing/MaskPass.js'
import { TexturePass } from '@/components/jsm/postprocessing/TexturePass.js'
import { BleachBypassShader } from '@/components/jsm/shaders/BleachBypassShader.js'
import { ColorifyShader } from '@/components/jsm/shaders/ColorifyShader.js'
import { HorizontalBlurShader } from '@/components/jsm/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from '@/components/jsm/shaders/VerticalBlurShader.js'
import { SepiaShader } from '@/components/jsm/shaders/SepiaShader.js'
import { VignetteShader } from '@/components/jsm/shaders/VignetteShader.js'
import { GammaCorrectionShader } from '@/components/jsm/shaders/GammaCorrectionShader.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            composerScene: null,
            composer1: null,
            composer2: null,
            composer3: null,
            composer4: null,
            cameraOrtho: null,
            cameraPerspective: null,
            sceneModel: null,
            sceneBG: null,
            renderer: null,
            mesh: null,
            directionalLight: null,
			width: null,
			height: null,
			halfWidth: null,
			halfHeight: null,
            quadBG: null,
            quadMask: null,
            renderScene: null,
			delta: 0.01
        }
    },
    mounted() {
        this.width = this.$webglInnerWidth || 2
        this.height = window.innerHeight || 2
        this.halfWidth = this.width / 2
        this.halfHeight = this.height / 2
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            //
            this.cameraOrtho = new this.$THREE.OrthographicCamera(- this.halfWidth, this.halfWidth, this.halfHeight, - this.halfHeight, - 10000, 10000)
            this.cameraOrtho.position.z = 100
            this.cameraPerspective = new this.$THREE.PerspectiveCamera(50, this.width / this.height, 1, 10000)
            this.cameraPerspective.position.z = 900
            //
            this.sceneModel = new this.$THREE.Scene()
            this.sceneBG = new this.$THREE.Scene()
            //
            this.directionalLight = new this.$THREE.DirectionalLight(0xffffff)
            this.directionalLight.position.set(0, - 0.1, 1).normalize()
            this.sceneModel.add(this.directionalLight)
            var loader = new GLTFLoader()
            loader.load("static/models/gltf/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
                this.createMesh(gltf.scene.children[ 0 ].geometry, this.sceneModel, 100)
            })
            //
            var diffuseMap = new this.$THREE.TextureLoader().load("static/textures/cube/SwedishRoyalCastle/pz.jpg")
            diffuseMap.encoding = this.$THREE.sRGBEncoding
            var materialColor = new this.$THREE.MeshBasicMaterial({
                map: diffuseMap,
                depthTest: false
            })
            this.quadBG = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(1, 1), materialColor)
            this.quadBG.position.z = - 500
            this.quadBG.scale.set(this.width, this.height, 1)
            this.sceneBG.add(this.quadBG)
            //
            var sceneMask = new this.$THREE.Scene()
            this.quadMask = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(1, 1), new this.$THREE.MeshBasicMaterial({ color: 0xffaa00 }))
            this.quadMask.position.z = - 300
            this.quadMask.scale.set(this.width / 2, this.height / 2, 1)
            sceneMask.add(this.quadMask)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.width, this.height)
            this.renderer.autoClear = false
            //
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            var shaderBleach = BleachBypassShader
            var shaderSepia = SepiaShader
            var shaderVignette = VignetteShader
            var effectBleach = new ShaderPass(shaderBleach)
            var effectSepia = new ShaderPass(shaderSepia)
            var effectVignette = new ShaderPass(shaderVignette)
            var gammaCorrection = new ShaderPass(GammaCorrectionShader)
            effectBleach.uniforms[ "opacity" ].value = 0.95
            effectSepia.uniforms[ "amount" ].value = 0.9
            effectVignette.uniforms[ "offset" ].value = 0.95
            effectVignette.uniforms[ "darkness" ].value = 1.6
            var effectBloom = new BloomPass(0.5)
            var effectFilm = new FilmPass(0.35, 0.025, 648, false)
            var effectFilmBW = new FilmPass(0.35, 0.5, 2048, true)
            var effectDotScreen = new DotScreenPass(new this.$THREE.Vector2(0, 0), 0.5, 0.8)
            var effectHBlur = new ShaderPass(HorizontalBlurShader)
            var effectVBlur = new ShaderPass(VerticalBlurShader)
            effectHBlur.uniforms[ 'h' ].value = 2 / (this.width / 2)
            effectVBlur.uniforms[ 'v' ].value = 2 / (this.height / 2)
            var effectColorify1 = new ShaderPass(ColorifyShader)
            var effectColorify2 = new ShaderPass(ColorifyShader)
            effectColorify1.uniforms[ 'color' ] = new this.$THREE.Uniform(new this.$THREE.Color(1, 0.8, 0.8))
            effectColorify2.uniforms[ 'color' ] = new this.$THREE.Uniform(new this.$THREE.Color(1, 0.75, 0.5))
            var clearMask = new ClearMaskPass()
            var renderMask = new MaskPass(this.sceneModel, this.cameraPerspective)
            var renderMaskInverse = new MaskPass(this.sceneModel, this.cameraPerspective)
            renderMaskInverse.inverse = true
            //
            var rtParameters = {
                minFilter: this.$THREE.LinearFilter,
                magFilter: this.$THREE.LinearFilter,
                format: this.$THREE.RGBFormat,
                stencilBuffer: true
            }
            var rtWidth = this.width / 2
            var rtHeight = this.height / 2
            //
            var renderBackground = new RenderPass(this.sceneBG, this.cameraOrtho)
            var renderModel = new RenderPass(this.sceneModel, this.cameraPerspective)
            renderModel.clear = false
            this.composerScene = new EffectComposer(this.renderer, new this.$THREE.WebGLRenderTarget(rtWidth * 2, rtHeight * 2, rtParameters))
            this.composerScene.addPass(renderBackground)
            this.composerScene.addPass(renderModel)
            this.composerScene.addPass(renderMaskInverse)
            this.composerScene.addPass(effectHBlur)
            this.composerScene.addPass(effectVBlur)
            this.composerScene.addPass(clearMask)
            //
            this.renderScene = new TexturePass(this.composerScene.renderTarget2.texture)
            //
            this.composer1 = new EffectComposer(this.renderer, new this.$THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))
            this.composer1.addPass(this.renderScene)
            this.composer1.addPass(gammaCorrection)
            this.composer1.addPass(effectFilmBW)
            this.composer1.addPass(effectVignette)
            //
            this.composer2 = new EffectComposer(this.renderer, new this.$THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))
            this.composer2.addPass(this.renderScene)
            this.composer2.addPass(gammaCorrection)
            this.composer2.addPass(effectDotScreen)
            this.composer2.addPass(renderMask)
            this.composer2.addPass(effectColorify1)
            this.composer2.addPass(clearMask)
            this.composer2.addPass(renderMaskInverse)
            this.composer2.addPass(effectColorify2)
            this.composer2.addPass(clearMask)
            this.composer2.addPass(effectVignette)
            //
            this.composer3 = new EffectComposer(this.renderer, new this.$THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))
            this.composer3.addPass(this.renderScene)
            this.composer3.addPass(gammaCorrection)
            this.composer3.addPass(effectSepia)
            this.composer3.addPass(effectFilm)
            this.composer3.addPass(effectVignette)
            //
            this.composer4 = new EffectComposer(this.renderer, new this.$THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))
            this.composer4.addPass(this.renderScene)
            this.composer4.addPass(gammaCorrection)
            this.composer4.addPass(effectBloom)
            this.composer4.addPass(effectFilm)
            this.composer4.addPass(effectBleach)
            this.composer4.addPass(effectVignette)
            this.renderScene.uniforms[ "tDiffuse" ].value = this.composerScene.renderTarget2.texture
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.halfWidth = (window.innerWidth - 281) / 2
            this.halfHeight = window.innerHeight / 2
            this.cameraPerspective.aspect = (window.innerWidth - 281) / window.innerHeight
            this.cameraPerspective.updateProjectionMatrix()
            this.cameraOrtho.left = - this.halfWidth
            this.cameraOrtho.right = this.halfWidth
            this.cameraOrtho.top = this.halfHeight
            this.cameraOrtho.bottom = - this.halfHeight
            this.cameraOrtho.updateProjectionMatrix()
            this.renderer.setSize((window.innerWidth - 281), window.innerHeight)
            this.composerScene.setSize(this.halfWidth * 2, this.halfHeight * 2)
            this.composer1.setSize(this.halfWidth, this.halfHeight)
            this.composer2.setSize(this.halfWidth, this.halfHeight)
            this.composer3.setSize(this.halfWidth, this.halfHeight)
            this.composer4.setSize(this.halfWidth, this.halfHeight)
            this.renderScene.uniforms[ "tDiffuse" ].value = this.composerScene.renderTarget2.texture
            this.quadBG.scale.set((window.innerWidth - 281), window.innerHeight, 1)
            this.quadMask.scale.set((window.innerWidth - 281) / 2, window.innerHeight / 2, 1)
        },
        createMesh(geometry, scene, scale) {
            var diffuseMap = new this.$THREE.TextureLoader().load("static/models/gltf/LeePerrySmith/Map-COL.jpg")
            diffuseMap.encoding = this.$THREE.sRGBEncoding
            var mat2 = new this.$THREE.MeshPhongMaterial({
                color: 0x999999,
                specular: 0x080808,
                shininess: 20,
                map: diffuseMap,
                normalMap: new this.$THREE.TextureLoader().load("static/models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg"),
                normalScale: new this.$THREE.Vector2(0.75, 0.75)
            })
            this.mesh = new this.$THREE.Mesh(geometry, mat2)
            this.mesh.position.set(0, - 50, 0)
            this.mesh.scale.set(scale, scale, scale)
            scene.add(this.mesh)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            var time = Date.now() * 0.0004
            if (this.mesh) this.mesh.rotation.y = - time
            this.renderer.setViewport(0, 0, this.halfWidth, this.halfHeight)
            this.composerScene.render(this.delta)
            this.renderer.setViewport(0, 0, this.halfWidth, this.halfHeight)
            this.composer1.render(this.delta)
            this.renderer.setViewport(this.halfWidth, 0, this.halfWidth, this.halfHeight)
            this.composer2.render(this.delta)
            this.renderer.setViewport(0, this.halfHeight, this.halfWidth, this.halfHeight)
            this.composer3.render(this.delta)
            this.renderer.setViewport(this.halfWidth, this.halfHeight, this.halfWidth, this.halfHeight)
            this.composer4.render(this.delta)
        }
    },
}
</script>

<style scoped>
.webglPostprocessingAdvanced-container {
    width: 100%;
}
</style>
