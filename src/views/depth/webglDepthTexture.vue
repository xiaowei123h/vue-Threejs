<template>
    <div class="webglDepthTexture-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">threejs</a> webgl - depth texture<br/>
			Stores render target depth in a texture attachment.<br/>
			Created by <a href="http://twitter.com/mattdesl" target="_blank" rel="noopener">@mattdesl</a>.

			<div id="error" style="display: none;">
			Your browser does not support <strong>WEBGL_depth_texture</strong>.<br/><br/>
			This demo will not work.
			</div>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            postVert: null,
            postFrag: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            stats: null,
			target: null,
            postScene: null,
            postCamera: null,
            postMaterial: null,
			supportsExtension: true,
			params: null,
			formats: null,
            types: null,
            gui: null
        }
    },
    mounted() {
        this.postVert = `
            varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`
        this.postFrag = `
            #include <packing>
			varying vec2 vUv;
			uniform sampler2D tDiffuse;
			uniform sampler2D tDepth;
			uniform float cameraNear;
			uniform float cameraFar;
			float readDepth(sampler2D depthSampler, vec2 coord) {
				float fragCoordZ = texture2D(depthSampler, coord).x;
				float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
				return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
			}
			void main() {
				//vec3 diffuse = texture2D(tDiffuse, vUv).rgb;
				float depth = readDepth(tDepth, vUv);

				gl_FragColor.rgb = 1.0 - vec3(depth);
				gl_FragColor.a = 1.0;
            }`
        this.params = {
            format: this.$THREE.DepthFormat,
            type: this.$THREE.UnsignedShortType
        }
        this.formats = { DepthFormat: this.$THREE.DepthFormat, DepthStencilFormat: this.$THREE.DepthStencilFormat }
        this.types = { UnsignedShortType: this.$THREE.UnsignedShortType, UnsignedIntType: this.$THREE.UnsignedIntType, UnsignedInt248Type: this.$THREE.UnsignedInt248Type }
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            if (this.renderer.capabilities.isWebGL2 === false && this.renderer.extensions.has('WEBGL_depth_texture') === false) {
                this.supportsExtension = false
                document.querySelector('#error').style.display = 'block'
                return
            }
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglDepthTexture-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglDepthTexture-container')[0].appendChild(this.stats.dom)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.01, 50)
            this.camera.position.z = 4
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
            // Create a render target with depth texture
            this.setupRenderTarget()
            // Our scene
            this.setupScene()
            // Setup post-processing step
            this.setupPost()
            this.onWindowResize()
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.gui = new GUI({ width: 300 })
            this.gui.add(this.params, 'format', this.formats).onChange(this.setupRenderTarget)
            this.gui.add(this.params, 'type', this.types).onChange(this.setupRenderTarget)
            this.gui.open()
        },
        setupRenderTarget() {
            if (this.target) this.target.dispose()
            var format = parseFloat(this.params.format)
            var type = parseFloat(this.params.type)
            this.target = new this.$THREE.WebGLRenderTarget(this.$webglInnerWidth, window.innerHeight)
            this.target.texture.format = this.$THREE.RGBFormat
            this.target.texture.minFilter = this.$THREE.NearestFilter
            this.target.texture.magFilter = this.$THREE.NearestFilter
            this.target.texture.generateMipmaps = false
            this.target.stencilBuffer = (format === this.$THREE.DepthStencilFormat) ? true : false
            this.target.depthBuffer = true
            this.target.depthTexture = new this.$THREE.DepthTexture()
            this.target.depthTexture.format = format
            this.target.depthTexture.type = type
        },
        setupPost() {
            // Setup post processing stage
            this.postCamera = new this.$THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1)
            this.postMaterial = new this.$THREE.ShaderMaterial({
                vertexShader: this.postVert,
                fragmentShader: this.postFrag,
                uniforms: {
                    cameraNear: { value: this.camera.near },
                    cameraFar: { value: this.camera.far },
                    tDiffuse: { value: null },
                    tDepth: { value: null }
                }
            })
            var postPlane = new this.$THREE.PlaneBufferGeometry(2, 2)
            var postQuad = new this.$THREE.Mesh(postPlane, this.postMaterial)
            this.postScene = new this.$THREE.Scene()
            this.postScene.add(postQuad)
        },
        setupScene() {
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.TorusKnotBufferGeometry(1, 0.3, 128, 64)
            var material = new this.$THREE.MeshBasicMaterial({ color: 'blue' })
            var count = 50
            var scale = 5
            for (let i = 0; i < count; i ++) {
                var r = Math.random() * 2.0 * Math.PI
                var z = (Math.random() * 2.0) - 1.0
                var zScale = Math.sqrt(1.0 - z * z) * scale
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(
                    Math.cos(r) * zScale,
                    Math.sin(r) * zScale,
                    z * scale
            )
                mesh.rotation.set(Math.random(), Math.random(), Math.random())
                this.scene.add(mesh)
            }
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            var dpr = this.renderer.getPixelRatio()
            this.target.setSize(this.$webglInnerWidth * dpr, window.innerHeight * dpr)
        },
        animate() {
            if (! this.supportsExtension) return
            requestAnimationFrame(this.animate)
            // render this.scene into this.target
            this.renderer.setRenderTarget(this.target)
            this.renderer.render(this.scene, this.camera)
            // render post FX
            this.postMaterial.uniforms.tDiffuse.value = this.target.texture
            this.postMaterial.uniforms.tDepth.value = this.target.depthTexture
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.postScene, this.postCamera)
            this.controls.update() // required because damping is enabled
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglDepthTexture-container {
    width: 100%;
}
#error {
    margin: auto;
    margin-top: 40px;
    display: block;
    max-width: 400px;
    padding: 20px;
    background: #CE0808;
}
</style>
