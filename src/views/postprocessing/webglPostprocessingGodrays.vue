<template>
    <div class="webglPostprocessingGodrays-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl god-rays example - tree by <a href="http://www.turbosquid.com/3d-models/free-tree-3d-model/592617" target="_blank" rel="noopener">stanloshka</a>
		</div>
    </div>
</template>

<script>
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from '@/components/jsm/shaders/GodRaysShader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            materialDepth: null,
			sphereMesh: null,
			sunPosition: null,
			clipPosition: null,
			screenSpacePosition: null,
			postprocessing: { enabled: true },
			orbitRadius: 200,
			bgColor: 0x000511,
			sunColor: 0xffee00,
			// Use a smaller size for some of the god-ray render targets for better performance.
			godrayRenderTargetResolutionMultiplier: 1.0 / 4.0,
        }
    },
    mounted() {
        this.sunPosition = new this.$THREE.Vector3(0, 1000, - 1000)
        this.clipPosition = new this.$THREE.Vector4()
        this.screenSpacePosition = new this.$THREE.Vector3()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglPostprocessingGodrays-container')[0].appendChild(this.container)
            //
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 3000)
            this.camera.position.z = 200
            this.scene = new this.$THREE.Scene()
            //
            this.materialDepth = new this.$THREE.MeshDepthMaterial()
            var materialScene = new this.$THREE.MeshBasicMaterial({ color: 0x000000 })
            // tree
            var loader = new OBJLoader()
            loader.load('static/models/obj/tree.obj', (object) => {
                object.material = materialScene
                object.position.set(0, - 150, - 150)
                object.scale.multiplyScalar(400)
                this.scene.add(object)
            })
            // sphere
            var geo = new this.$THREE.SphereBufferGeometry(1, 20, 10)
            this.sphereMesh = new this.$THREE.Mesh(geo, materialScene)
            this.sphereMesh.scale.multiplyScalar(20)
            this.scene.add(this.sphereMesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setClearColor(0xffffff)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.autoClear = false
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 50
            controls.maxDistance = 500
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.initPostprocessing(this.$webglInnerWidth, window.innerHeight)
        },
        onWindowResize() {
            var renderTargetWidth = window.innerWidth - 281
            var renderTargetHeight = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.postprocessing.rtTextureColors.setSize(renderTargetWidth, renderTargetHeight)
            this.postprocessing.rtTextureDepth.setSize(renderTargetWidth, renderTargetHeight)
            this.postprocessing.rtTextureDepthMask.setSize(renderTargetWidth, renderTargetHeight)
            var adjustedWidth = renderTargetWidth * this.godrayRenderTargetResolutionMultiplier
            var adjustedHeight = renderTargetHeight * this.godrayRenderTargetResolutionMultiplier
            this.postprocessing.rtTextureGodRays1.setSize(adjustedWidth, adjustedHeight)
            this.postprocessing.rtTextureGodRays2.setSize(adjustedWidth, adjustedHeight)
        },
        initPostprocessing(renderTargetWidth, renderTargetHeight) {
            this.postprocessing.scene = new this.$THREE.Scene()
            this.postprocessing.camera = new this.$THREE.OrthographicCamera(- 0.5, 0.5, 0.5, - 0.5, - 10000, 10000)
            this.postprocessing.camera.position.z = 100
            this.postprocessing.scene.add(this.postprocessing.camera)
            var pars = { minFilter: this.$THREE.LinearFilter, magFilter: this.$THREE.LinearFilter, format: this.$THREE.RGBFormat }
            this.postprocessing.rtTextureColors = new this.$THREE.WebGLRenderTarget(renderTargetWidth, renderTargetHeight, pars)
            // Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
            // investigate further for now.
            // pars.format = LuminanceFormat
            // I would have this quarter size and use it as one of the ping-pong render
            // targets but the aliasing causes some temporal flickering
            this.postprocessing.rtTextureDepth = new this.$THREE.WebGLRenderTarget(renderTargetWidth, renderTargetHeight, pars)
            this.postprocessing.rtTextureDepthMask = new this.$THREE.WebGLRenderTarget(renderTargetWidth, renderTargetHeight, pars)
            // The ping-pong render targets can use an adjusted resolution to minimize cost
            var adjustedWidth = renderTargetWidth * this.godrayRenderTargetResolutionMultiplier
            var adjustedHeight = renderTargetHeight * this.godrayRenderTargetResolutionMultiplier
            this.postprocessing.rtTextureGodRays1 = new this.$THREE.WebGLRenderTarget(adjustedWidth, adjustedHeight, pars)
            this.postprocessing.rtTextureGodRays2 = new this.$THREE.WebGLRenderTarget(adjustedWidth, adjustedHeight, pars)
            // god-ray shaders
            var godraysMaskShader = GodRaysDepthMaskShader
            this.postprocessing.godrayMaskUniforms = this.$THREE.UniformsUtils.clone(godraysMaskShader.uniforms)
            this.postprocessing.materialGodraysDepthMask = new this.$THREE.ShaderMaterial({
                uniforms: this.postprocessing.godrayMaskUniforms,
                vertexShader: godraysMaskShader.vertexShader,
                fragmentShader: godraysMaskShader.fragmentShader
            })
            var godraysGenShader = GodRaysGenerateShader
            this.postprocessing.godrayGenUniforms = this.$THREE.UniformsUtils.clone(godraysGenShader.uniforms)
            this.postprocessing.materialGodraysGenerate = new this.$THREE.ShaderMaterial({
                uniforms: this.postprocessing.godrayGenUniforms,
                vertexShader: godraysGenShader.vertexShader,
                fragmentShader: godraysGenShader.fragmentShader
            })
            var godraysCombineShader = GodRaysCombineShader
            this.postprocessing.godrayCombineUniforms = this.$THREE.UniformsUtils.clone(godraysCombineShader.uniforms)
            this.postprocessing.materialGodraysCombine = new this.$THREE.ShaderMaterial({
                uniforms: this.postprocessing.godrayCombineUniforms,
                vertexShader: godraysCombineShader.vertexShader,
                fragmentShader: godraysCombineShader.fragmentShader
            })
            var godraysFakeSunShader = GodRaysFakeSunShader
            this.postprocessing.godraysFakeSunUniforms = this.$THREE.UniformsUtils.clone(godraysFakeSunShader.uniforms)
            this.postprocessing.materialGodraysFakeSun = new this.$THREE.ShaderMaterial({
                uniforms: this.postprocessing.godraysFakeSunUniforms,
                vertexShader: godraysFakeSunShader.vertexShader,
                fragmentShader: godraysFakeSunShader.fragmentShader
            })
            this.postprocessing.godraysFakeSunUniforms.bgColor.value.setHex(this.bgColor)
            this.postprocessing.godraysFakeSunUniforms.sunColor.value.setHex(this.sunColor)
            this.postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.75
            this.postprocessing.quad = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(1.0, 1.0),
                this.postprocessing.materialGodraysGenerate
        )
            this.postprocessing.quad.position.z = - 9900
            this.postprocessing.scene.add(this.postprocessing.quad)
        },
        animate() {
            requestAnimationFrame(this.animate, this.renderer.domElement)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        getStepSize(filterLen, tapsPerPass, pass) {
            return filterLen * Math.pow(tapsPerPass, - pass)
        },
        filterGodRays(inputTex, renderTarget, stepSize) {
            this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysGenerate
            this.postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepSize
            this.postprocessing.godrayGenUniforms[ "tInput" ].value = inputTex
            this.renderer.setRenderTarget(renderTarget)
            this.renderer.render(this.postprocessing.scene, this.postprocessing.camera)
            this.postprocessing.scene.overrideMaterial = null
        },
        render() {
            var time = Date.now() / 4000
            this.sphereMesh.position.x = this.orbitRadius * Math.cos(time)
            this.sphereMesh.position.z = this.orbitRadius * Math.sin(time) - 100
            if (this.postprocessing.enabled) {
                this.clipPosition.x = this.sunPosition.x
                this.clipPosition.y = this.sunPosition.y
                this.clipPosition.z = this.sunPosition.z
                this.clipPosition.w = 1
                this.clipPosition.applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix)
                // perspective divide (produce NDC space)
                this.clipPosition.x /= this.clipPosition.w
                this.clipPosition.y /= this.clipPosition.w
                this.screenSpacePosition.x = (this.clipPosition.x + 1) / 2 // transform from [-1,1] to [0,1]
                this.screenSpacePosition.y = (this.clipPosition.y + 1) / 2 // transform from [-1,1] to [0,1]
                this.screenSpacePosition.z = this.clipPosition.z // needs to stay in clip space for visibilty checks
                // Give it to the god-ray and sun shaders
                this.postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.copy(this.screenSpacePosition)
                this.postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.copy(this.screenSpacePosition)
                // -- Draw sky and sun --
                // Clear colors and depths, will clear to sky color
                this.renderer.setRenderTarget(this.postprocessing.rtTextureColors)
                this.renderer.clear(true, true, false)
                // Sun render. Runs a shader that gives a brightness based on the screen
                // space distance to the sun. Not very efficient, so i make a scissor
                // rectangle around the suns position to avoid rendering surrounding pixels.
                var sunsqH = 0.74 * window.innerHeight // 0.74 depends on extent of sun from shader
                var sunsqW = 0.74 * window.innerHeight // both depend on height because sun is aspect-corrected
                this.screenSpacePosition.x *= this.$webglInnerWidth
                this.screenSpacePosition.y *= window.innerHeight
                this.renderer.setScissor(this.screenSpacePosition.x - sunsqW / 2, this.screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH)
                this.renderer.setScissorTest(true)
                this.postprocessing.godraysFakeSunUniforms[ "fAspect" ].value = this.$webglInnerWidth / window.innerHeight
                this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysFakeSun
                this.renderer.setRenderTarget(this.postprocessing.rtTextureColors)
                this.renderer.render(this.postprocessing.scene, this.postprocessing.camera)
                this.renderer.setScissorTest(false)
                // -- Draw scene objects --
                // Colors
                this.scene.overrideMaterial = null
                this.renderer.setRenderTarget(this.postprocessing.rtTextureColors)
                this.renderer.render(this.scene, this.camera)
                // Depth
                this.scene.overrideMaterial = this.materialDepth
                this.renderer.setRenderTarget(this.postprocessing.rtTextureDepth)
                this.renderer.clear()
                this.renderer.render(this.scene, this.camera)
                //
                this.postprocessing.godrayMaskUniforms[ "tInput" ].value = this.postprocessing.rtTextureDepth.texture
                this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysDepthMask
                this.renderer.setRenderTarget(this.postprocessing.rtTextureDepthMask)
                this.renderer.render(this.postprocessing.scene, this.postprocessing.camera)
                // -- Render god-rays --
                // Maximum length of god-rays (in texture space [0,1]X[0,1])
                var filterLen = 1.0
                // Samples taken by filter
                var TAPS_PER_PASS = 6.0
                // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
                // would start with a small filter support and grow to large. however
                // the large-to-small order produces less objectionable aliasing artifacts that
                // appear as a glimmer along the length of the beams
                // pass 1 - render into first ping-pong target
                this.filterGodRays(this.postprocessing.rtTextureDepthMask.texture, this.postprocessing.rtTextureGodRays2, this.getStepSize(filterLen, TAPS_PER_PASS, 1.0))
                // pass 2 - render into second ping-pong target
                this.filterGodRays(this.postprocessing.rtTextureGodRays2.texture, this.postprocessing.rtTextureGodRays1, this.getStepSize(filterLen, TAPS_PER_PASS, 2.0))
                // pass 3 - 1st RT
                this.filterGodRays(this.postprocessing.rtTextureGodRays1.texture, this.postprocessing.rtTextureGodRays2, this.getStepSize(filterLen, TAPS_PER_PASS, 3.0))
                // final pass - composite god-rays onto colors
                this.postprocessing.godrayCombineUniforms[ "tColors" ].value = this.postprocessing.rtTextureColors.texture
                this.postprocessing.godrayCombineUniforms[ "tGodRays" ].value = this.postprocessing.rtTextureGodRays2.texture
                this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysCombine
                this.renderer.setRenderTarget(null)
                this.renderer.render(this.postprocessing.scene, this.postprocessing.camera)
                this.postprocessing.scene.overrideMaterial = null
            } else {
                this.renderer.setRenderTarget(null)
                this.renderer.clear()
                this.renderer.render(this.scene, this.camera)
            }
        }
    },
}
</script>

<style scoped>
.webglPostprocessingGodrays-container {
    position: relative;
    width: 100%;
}
</style>
