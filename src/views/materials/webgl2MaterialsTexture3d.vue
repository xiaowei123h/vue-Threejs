<template>
    <div class="webgl2MaterialsTexture3d-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Float volume render test (mip / isosurface)
        </div>
        <div id="inset"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { NRRDLoader } from '@/components/jsm/loaders/NRRDLoader.js'
import { VolumeRenderShader1 } from '@/components/jsm/shaders/VolumeShader.js'
import { WEBGL } from '@/components/jsm/WebGL.js'
export default {
    data() {
        return {
            renderer: null,
			scene: null,
			camera: null,
			controls: null,
			material: null,
			volconfig: null,
            cmtextures: null,
            gui: null,
        }
    },
    mounted() {
        if (WEBGL.isWebGL2Available() === false) {
			document.getElementsByClassName('webgl2MaterialsTexture3d-container')[0].appendChild(WEBGL.getWebGL2ErrorMessage())
        }
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
			this.scene = new this.$THREE.Scene()
			// Create renderer
			this.renderer = new this.$THREE.WebGLRenderer()
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			document.getElementsByClassName('webgl2MaterialsTexture3d-container')[0].appendChild(this.renderer.domElement)
			// Create camera (The volume this.renderer does not work very well with perspective yet)
			var h = 512 // frustum height
			var aspect = this.$webglInnerWidth / window.innerHeight
			this.camera = new this.$THREE.OrthographicCamera(- h * aspect / 2, h * aspect / 2, h / 2, - h / 2, 1, 1000)
			this.camera.position.set(0, 0, 128)
			this.camera.up.set(0, 0, 1) // In our data, z is up
			// Create controls
			this.controls = new OrbitControls(this.camera, this.renderer.domElement)
			this.controls.addEventListener('change', this.render)
			this.controls.target.set(64, 64, 128)
			this.controls.minZoom = 0.5
			this.controls.maxZoom = 4
			this.controls.update()
			// this.scene.add(new AxesHelper(128))
			// Lighting is baked into the shader a.t.m.
			// let dirLight = new DirectionalLight(0xffffff)
			// The gui for interaction
			this.volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' }
			this.gui = new GUI()
			this.gui.add(this.volconfig, 'clim1', 0, 1, 0.01).onChange(this.updateUniforms)
			this.gui.add(this.volconfig, 'clim2', 0, 1, 0.01).onChange(this.updateUniforms)
			this.gui.add(this.volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' }).onChange(this.updateUniforms)
			this.gui.add(this.volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' }).onChange(this.updateUniforms)
			this.gui.add(this.volconfig, 'isothreshold', 0, 1, 0.01).onChange(this.updateUniforms)
			// Load the data ...
			new NRRDLoader().load("static/models/nrrd/stent.nrrd", (volume) => {
				// Texture to hold the volume. We have scalars, so we put our data in the red channel.
				// this.$THREEJS will select R32F (33326) based on the this.$THREE.RedFormat and this.$THREE.FloatType.
				// Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
				// TODO: look the dtype up in the volume metadata
				var texture = new this.$THREE.DataTexture3D(volume.data, volume.xLength, volume.yLength, volume.zLength)
				texture.format = this.$THREE.RedFormat
				texture.type = this.$THREE.FloatType
				texture.minFilter = texture.magFilter = this.$THREE.LinearFilter
				texture.unpackAlignment = 1
				// Colormap textures
				this.cmtextures = {
					viridis: new this.$THREE.TextureLoader().load('static/textures/cm_viridis.png', this.render),
					gray: new this.$THREE.TextureLoader().load('static/textures/cm_gray.png', this.render)
				}
				// Material
				var shader = VolumeRenderShader1
				var uniforms = this.$THREE.UniformsUtils.clone(shader.uniforms)
				uniforms[ "u_data" ].value = texture
				uniforms[ "u_size" ].value.set(volume.xLength, volume.yLength, volume.zLength)
				uniforms[ "u_clim" ].value.set(this.volconfig.clim1, this.volconfig.clim2)
				uniforms[ "u_renderstyle" ].value = this.volconfig.renderstyle == 'mip' ? 0 : 1 // 0: MIP, 1: ISO
				uniforms[ "u_renderthreshold" ].value = this.volconfig.isothreshold // For ISO renderstyle
				uniforms[ "u_cmdata" ].value = this.cmtextures[ this.volconfig.colormap ]
				this.material = new this.$THREE.ShaderMaterial({
					uniforms: uniforms,
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader,
					side: this.$THREE.BackSide // The volume shader uses the backface as its "reference point"
				})
				// this.$THREE.Mesh
				var geometry = new this.$THREE.BoxBufferGeometry(volume.xLength, volume.yLength, volume.zLength)
				geometry.translate(volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5)
				var mesh = new this.$THREE.Mesh(geometry, this.material)
				this.scene.add(mesh)
				this.render()
			})
			window.addEventListener('resize', this.onWindowResize, false)
        },
        updateUniforms() {
			this.material.uniforms[ "u_clim" ].value.set(this.volconfig.clim1, this.volconfig.clim2)
			this.material.uniforms[ "u_renderstyle" ].value = this.volconfig.renderstyle == 'mip' ? 0 : 1 // 0: MIP, 1: ISO
			this.material.uniforms[ "u_renderthreshold" ].value = this.volconfig.isothreshold // For ISO renderstyle
			this.material.uniforms[ "u_cmdata" ].value = this.cmtextures[ this.volconfig.colormap ]
			this.render()
        },
        onWindowResize() {
			this.renderer.setSize(window.innerWidth - 281, window.innerHeight)
			var aspect = (window.innerWidth - 281 )/ window.innerHeight
			var frustumHeight = this.camera.top - this.camera.bottom
			this.camera.left = - frustumHeight * aspect / 2
			this.camera.right = frustumHeight * aspect / 2
			this.camera.updateProjectionMatrix()
			this.render()
        },
        render() {
			this.renderer.render(this.scene, this.camera)
		}
    },
}
</script>

<style scoped>
.webgl2MaterialsTexture3d-container {
    width: 100%;
}
</style>
