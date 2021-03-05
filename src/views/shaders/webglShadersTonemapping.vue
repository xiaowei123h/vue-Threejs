<template>
    <div class="webglShadersTonemapping-container">
        <div id="d">
			<div id="info">
				<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl demo :
				Earth diffuse and city lights by <a href="http://seanward.org" target="_blank" rel="noopener">Sean Ward</a> :

			</div>
			<div class="label" style="position: absolute;left: 10%;bottom: 10%;">
				Low Dynamic Range<br/>
				Static Tone Mapping
			</div>
			<div class="label" style="position: absolute;left: 40%;bottom: 10%;">
				High Dynamic Range<br/>
				Static Tone Mapping
			</div>
			<div class="label" style="position: absolute;left: 73%;bottom: 10%;">
				High Dynamic Range<br/>
				Adaptive Tone Mapping
			</div>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { AdaptiveToneMappingPass } from '@/components/jsm/postprocessing/AdaptiveToneMappingPass.js'
import { BloomPass } from '@/components/jsm/postprocessing/BloomPass.js'
import { GammaCorrectionShader } from '@/components/jsm/shaders/GammaCorrectionShader.js'
export default {
    data() {
        return {
            bloomPass: null,
            adaptToneMappingPass: null,
            ldrToneMappingPass: null,
            hdrToneMappingPass: null,
			params: null,
            camera: null,
            scene: null,
            renderer: null,
            dynamicHdrEffectComposer: null,
            hdrEffectComposer: null,
            ldrEffectComposer: null,
            cameraCube: null,
            sceneCube: null,
            cameraBG: null,
            debugScene: null,
            adaptiveLuminanceMat: null,
            currentLuminanceMat: null,
			directionalLight: null,
			orbitControls: null,
			windowHalfX: null,
			windowHalfY: null,
            windowThirdX: null,
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
            this.params = {
                bloomAmount: 1.0,
                sunLight: 4.0,
                enabled: true,
                avgLuminance: 0.7,
                middleGrey: 0.04,
                maxLuminance: 16,
                adaptionRate: 2.0
            }
            var container = document.createElement('div')
            document.getElementsByClassName('webglShadersTonemapping-container')[0].appendChild(container)
            // CAMERAS
            this.camera = new this.$THREE.PerspectiveCamera(70, this.windowThirdX / window.innerHeight, 0.1, 100000)
            this.camera.position.x = 700
            this.camera.position.y = 400
            this.camera.position.z = 800
            this.cameraCube = new this.$THREE.PerspectiveCamera(70, this.windowThirdX / window.innerHeight, 1, 100000)
            this.cameraBG = new this.$THREE.OrthographicCamera(- this.windowHalfX, this.windowHalfX, this.windowHalfY, - this.windowHalfY, - 10000, 10000)
            this.cameraBG.position.z = 100
            this.orbitControls = new OrbitControls(this.camera, container)
            this.orbitControls.autoRotate = true
            this.orbitControls.autoRotateSpeed = 1
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.sceneCube = new this.$THREE.Scene()
            this.debugScene = new this.$THREE.Scene()
            // LIGHTS
            var ambient = new this.$THREE.AmbientLight(0x050505)
            this.scene.add(ambient)
            this.directionalLight = new this.$THREE.DirectionalLight(0xffffff, this.params.sunLight)
            this.directionalLight.position.set(2, 0, 10).normalize()
            this.scene.add(this.directionalLight)
            var atmoShader = {
                side: this.$THREE.BackSide,
                // blending: this.$THREE.AdditiveBlending,
                transparent: true,
                lights: true,
                uniforms: this.$THREE.UniformsUtils.merge([
                    this.$THREE.UniformsLib[ "common" ],
                    this.$THREE.UniformsLib[ "lights" ]
                ]),
                vertexShader: [
                    "varying vec3 vViewPosition;",
                    "varying vec3 vNormal;",
                    "void main() {",
                    this.$THREE.ShaderChunk[ "beginnormal_vertex" ],
                    this.$THREE.ShaderChunk[ "defaultnormal_vertex" ],
                    "	vNormal = normalize(transformedNormal);",
                    "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
                    "vViewPosition = -mvPosition.xyz;",
                    "gl_Position = projectionMatrix * mvPosition;",
                    "}"
                ].join("\n"),
                fragmentShader: [
                    this.$THREE.ShaderChunk[ "common" ],
                    this.$THREE.ShaderChunk[ "bsdfs" ],
                    this.$THREE.ShaderChunk[ "lights_pars_begin" ],
                    this.$THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
                    "void main() {",
                    "vec3 normal = normalize(-vNormal);",
                    "vec3 viewPosition = normalize(vViewPosition);",
                    "#if NUM_DIR_LIGHTS > 0",
                    "vec3 dirDiffuse = vec3(0.0);",
                    "for(int i = 0; i < NUM_DIR_LIGHTS; i ++) {",
                    "vec4 lDirection = viewMatrix * vec4(directionalLights[i].direction, 0.0);",
                    "vec3 dirVector = normalize(lDirection.xyz);",
                    "float dotProduct = dot(viewPosition, dirVector);",
                    "dotProduct = 1.0 * max(dotProduct, 0.0) + (1.0 - max(-dot(normal, dirVector), 0.0));",
                    "dotProduct *= dotProduct;",
                    "dirDiffuse += max(0.5 * dotProduct, 0.0) * directionalLights[i].color;",
                    "}",
                    "#endif",
                    //Fade out atmosphere at edge
                    "float viewDot = abs(dot(normal, viewPosition));",
                    "viewDot = clamp(pow(viewDot + 0.6, 10.0), 0.0, 1.0);",
                    "vec3 color = vec3(0.05, 0.09, 0.13) * dirDiffuse;",
                    "gl_FragColor = vec4(color, viewDot);",
                    "}"
                ].join("\n")
            }
            var earthAtmoMat = new this.$THREE.ShaderMaterial(atmoShader)
            var earthMat = new this.$THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 200
            })
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load('static/textures/planets/earth_atmos_4096.jpg', (tex) => {
                earthMat.map = tex
                earthMat.map.encoding = this.$THREE.sRGBEncoding
                earthMat.needsUpdate = true
            })
            textureLoader.load('static/textures/planets/earth_specular_2048.jpg', (tex) => {
                earthMat.specularMap = tex
                earthMat.specularMap.encoding = this.$THREE.sRGBEncoding
                earthMat.needsUpdate = true
            })
            // var earthNormal = textureLoader.load('static/textures/planets/earth-new-normal-2048.jpg', function(tex) {
            // 	earthMat.normalMap = tex
            // 	earthMat.needsUpdate = true
            // })
            var earthLights = textureLoader.load('static/textures/planets/earth_lights_2048.png')
            earthLights.encoding = this.$THREE.sRGBEncoding
            var earthLightsMat = new this.$THREE.MeshBasicMaterial({
                color: 0xffffff,
                blending: this.$THREE.AdditiveBlending,
                transparent: true,
                depthTest: false,
                map: earthLights,
            })
            var clouds = textureLoader.load('static/textures/planets/earth_clouds_2048.png')
            clouds.encoding = this.$THREE.sRGBEncoding
            var earthCloudsMat = new this.$THREE.MeshLambertMaterial({
                color: 0xffffff,
                blending: this.$THREE.NormalBlending,
                transparent: true,
                depthTest: false,
                map: clouds
            })
            var earthGeo = new this.$THREE.SphereBufferGeometry(600, 24, 24)
            var sphereMesh = new this.$THREE.Mesh(earthGeo, earthMat)
            this.scene.add(sphereMesh)
            var sphereLightsMesh = new this.$THREE.Mesh(earthGeo, earthLightsMat)
            this.scene.add(sphereLightsMesh)
            var sphereCloudsMesh = new this.$THREE.Mesh(earthGeo, earthCloudsMat)
            this.scene.add(sphereCloudsMesh)
            var sphereAtmoMesh = new this.$THREE.Mesh(earthGeo, earthAtmoMat)
            sphereAtmoMesh.scale.set(1.05, 1.05, 1.05)
            this.scene.add(sphereAtmoMesh)
            var vBGShader = [
                // "attribute vec2 uv;",
                "varying vec2 vUv;",
                "void main() {",
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
                "}"
            ].join("\n")
            var pBGShader = [
                "uniform sampler2D map;",
                "varying vec2 vUv;",
                "void main() {",
                "vec2 sampleUV = vUv;",
                "vec4 color = texture2D(map, sampleUV, 0.0);",
                "gl_FragColor = vec4(color.xyz, 1.0);",
                "}"
            ].join("\n")
            // Skybox
            this.adaptiveLuminanceMat = new this.$THREE.ShaderMaterial({
                uniforms: {
                    "map": { value: null }
                },
                vertexShader: vBGShader,
                fragmentShader: pBGShader,
                depthTest: false,
                // color: 0xffffff
                blending: this.$THREE.NoBlending
            })
            this.currentLuminanceMat = new this.$THREE.ShaderMaterial({
                uniforms: {
                    "map": { value: null }
                },
                vertexShader: vBGShader,
                fragmentShader: pBGShader,
                depthTest: false
                // color: 0xffffff
                // blending: this.$THREE.NoBlending
            })
            var quadBG = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(0.1, 0.1), this.currentLuminanceMat)
            quadBG.position.z = - 500
            quadBG.position.x = - window.innerWidth * 0.5 + window.innerWidth * 0.05
            quadBG.scale.set(window.innerWidth, window.innerHeight, 1)
            this.debugScene.add(quadBG)
            quadBG = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(0.1, 0.1), this.adaptiveLuminanceMat)
            quadBG.position.z = - 500
            quadBG.position.x = - window.innerWidth * 0.5 + window.innerWidth * 0.15
            quadBG.scale.set(window.innerWidth, window.innerHeight, 1)
            this.debugScene.add(quadBG)
            var r = "static/textures/cube/MilkyWay/"
            var urls = [ r + "dark-s_px.jpg", r + "dark-s_nx.jpg",
                            r + "dark-s_py.jpg", r + "dark-s_ny.jpg",
                            r + "dark-s_pz.jpg", r + "dark-s_nz.jpg" ]
            var textureCube = new this.$THREE.CubeTextureLoader().load(urls)
            textureCube.encoding = this.$THREE.sRGBEncoding
            this.sceneCube.background = textureCube
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.autoClear = false
            container.appendChild(this.renderer.domElement)
            // var width = window.innerWidth || 1
            var height = window.innerHeight || 1
            var parameters = { minFilter: this.$THREE.LinearFilter, magFilter: this.$THREE.LinearFilter, format: this.$THREE.RGBAFormat }
            var regularRenderTarget = new this.$THREE.WebGLRenderTarget(this.windowThirdX, height, parameters)
            this.ldrEffectComposer = new EffectComposer(this.renderer, regularRenderTarget)
            parameters.type = this.$THREE.FloatType
            if (this.renderer.capabilities.isWebGL2 === false && this.renderer.extensions.has('OES_texture_half_float_linear') === false) {
                parameters.type = undefined // avoid usage of floating point textures
            }
            var hdrRenderTarget = new this.$THREE.WebGLRenderTarget(this.windowThirdX, height, parameters)
            this.dynamicHdrEffectComposer = new EffectComposer(this.renderer, hdrRenderTarget)
            this.dynamicHdrEffectComposer.setSize(window.innerWidth, window.innerHeight)
            this.hdrEffectComposer = new EffectComposer(this.renderer, hdrRenderTarget)
            var debugPass = new RenderPass(this.debugScene, this.cameraBG)
            debugPass.clear = false
            var scenePass = new RenderPass(this.scene, this.camera, undefined, undefined, undefined)
            var skyboxPass = new RenderPass(this.sceneCube, this.cameraCube)
            scenePass.clear = false
            this.adaptToneMappingPass = new AdaptiveToneMappingPass(true, 256)
            this.adaptToneMappingPass.needsSwap = true
            this.ldrToneMappingPass = new AdaptiveToneMappingPass(false, 256)
            this.hdrToneMappingPass = new AdaptiveToneMappingPass(false, 256)
            this.bloomPass = new BloomPass()
            var gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
            this.dynamicHdrEffectComposer.addPass(skyboxPass)
            this.dynamicHdrEffectComposer.addPass(scenePass)
            this.dynamicHdrEffectComposer.addPass(this.adaptToneMappingPass)
            this.dynamicHdrEffectComposer.addPass(this.bloomPass)
            this.dynamicHdrEffectComposer.addPass(gammaCorrectionPass)
            this.hdrEffectComposer.addPass(skyboxPass)
            this.hdrEffectComposer.addPass(scenePass)
            this.hdrEffectComposer.addPass(this.hdrToneMappingPass)
            this.hdrEffectComposer.addPass(this.bloomPass)
            this.hdrEffectComposer.addPass(gammaCorrectionPass)
            this.ldrEffectComposer.addPass(skyboxPass)
            this.ldrEffectComposer.addPass(scenePass)
            this.ldrEffectComposer.addPass(this.ldrToneMappingPass)
            this.ldrEffectComposer.addPass(this.bloomPass)
            this.ldrEffectComposer.addPass(gammaCorrectionPass)
            this.gui = new GUI()
            var sceneGui = this.gui.addFolder('Scenes')
            var toneMappingGui = this.gui.addFolder('ToneMapping')
            var staticToneMappingGui = this.gui.addFolder('StaticOnly')
            var adaptiveToneMappingGui = this.gui.addFolder('AdaptiveOnly')
            sceneGui.add(this.params, 'bloomAmount', 0.0, 10.0)
            sceneGui.add(this.params, 'sunLight', 0.1, 12.0)
            toneMappingGui.add(this.params, 'enabled')
            toneMappingGui.add(this.params, 'middleGrey', 0, 12)
            toneMappingGui.add(this.params, 'maxLuminance', 1, 30)
            staticToneMappingGui.add(this.params, 'avgLuminance', 0.001, 2.0)
            adaptiveToneMappingGui.add(this.params, 'adaptionRate', 0.0, 10.0)
            this.gui.open()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.windowThirdX = window.innerWidth / 3
            this.camera.aspect = this.windowThirdX / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.cameraCube.aspect = this.windowThirdX / window.innerHeight
            this.cameraCube.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.bloomPass) {
                this.bloomPass.copyUniforms[ "opacity" ].value = this.params.bloomAmount
            }
            if (this.adaptToneMappingPass) {
                this.adaptToneMappingPass.setAdaptionRate(this.params.adaptionRate)
                this.adaptiveLuminanceMat.uniforms[ "map" ].value = this.adaptToneMappingPass.luminanceRT
                this.currentLuminanceMat.uniforms[ "map" ].value = this.adaptToneMappingPass.currentLuminanceRT
                this.adaptToneMappingPass.enabled = this.params.enabled
                this.adaptToneMappingPass.setMaxLuminance(this.params.maxLuminance)
                this.adaptToneMappingPass.setMiddleGrey(this.params.middleGrey)
                this.hdrToneMappingPass.enabled = this.params.enabled
                this.hdrToneMappingPass.setMaxLuminance(this.params.maxLuminance)
                this.hdrToneMappingPass.setMiddleGrey(this.params.middleGrey)
                if (this.hdrToneMappingPass.setAverageLuminance) {
                    this.hdrToneMappingPass.setAverageLuminance(this.params.avgLuminance)
                }
                this.ldrToneMappingPass.enabled = this.params.enabled
                this.ldrToneMappingPass.setMaxLuminance(this.params.maxLuminance)
                this.ldrToneMappingPass.setMiddleGrey(this.params.middleGrey)
                if (this.ldrToneMappingPass.setAverageLuminance) {
                    this.ldrToneMappingPass.setAverageLuminance(this.params.avgLuminance)
                }
            }
            this.directionalLight.intensity = this.params.sunLight
            this.orbitControls.update()
            this.render()
        },
        render() {
            this.camera.lookAt(this.scene.position)
            this.cameraCube.rotation.copy(this.camera.rotation)
            this.renderer.setViewport(0, 0, this.windowThirdX, window.innerHeight)
            this.ldrEffectComposer.render(0.017)
            this.renderer.setViewport(this.windowThirdX, 0, this.windowThirdX, window.innerHeight)
            this.hdrEffectComposer.render(0.017)
            this.renderer.setViewport(this.windowThirdX * 2, 0, this.windowThirdX, window.innerHeight)
            this.dynamicHdrEffectComposer.render(0.017)
        }
    },
}
</script>

<style scoped>
.webglShadersTonemapping-container {
    width: 100%;
}
.label {
    background-color: black;
    position: absolute;
    z-index: 100;
    padding: 5px
}
</style>
