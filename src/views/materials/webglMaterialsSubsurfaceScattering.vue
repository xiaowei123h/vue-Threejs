<template>
    <div class="webglMaterialsSubsurfaceScattering-container">
        <div id="container"></div>
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>
            <br/>Fast subsurface scattering in Blinn-Phong shading demo<br/>
            [Thanks for the art support from <a href="https://github.com/shaochun" target="_blank" rel="noopener">Shaochun Lin</a>]
        </div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { SubsurfaceScatteringShader } from '@/components/jsm/shaders/SubsurfaceScatteringShader.js'
import { FBXLoader } from '@/components/jsm/loaders/FBXLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            model: null,
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
			this.container = document.createElement('div')
			document.getElementsByClassName('webglMaterialsSubsurfaceScattering-container')[0].appendChild(this.container)
			this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 5000)
			this.camera.position.set(0.0, 300, 400 * 4)
			this.scene = new this.$THREE.Scene()
			// Lights
			this.scene.add(new this.$THREE.AmbientLight(0x888888))
			var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 0.03)
			directionalLight.position.set(0.0, 0.5, 0.5).normalize()
			this.scene.add(directionalLight)
			var pointLight1 = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(4, 8, 8), new this.$THREE.MeshBasicMaterial({ color: 0x888888 }))
			pointLight1.add(new this.$THREE.PointLight(0x888888, 7.0, 300))
			this.scene.add(pointLight1)
			pointLight1.position.x = 0
			pointLight1.position.y = - 50
			pointLight1.position.z = 350
			var pointLight2 = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(4, 8, 8), new this.$THREE.MeshBasicMaterial({ color: 0x888800 }))
			pointLight2.add(new this.$THREE.PointLight(0x888800, 1.0, 500))
			this.scene.add(pointLight2)
			pointLight2.position.x = - 100
			pointLight2.position.y = 20
			pointLight2.position.z = - 260
			this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.container.appendChild(this.renderer.domElement)
			this.renderer.outputEncoding = this.$THREE.sRGBEncoding
			//
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
			this.container.appendChild(this.stats.dom)
			var controls = new OrbitControls(this.camera, this.container)
			controls.minDistance = 500
			controls.maxDistance = 3000
			window.addEventListener('resize', this.onWindowResize, false)
			this.initMaterial()
        },
        initMaterial() {
			var loader = new this.$THREE.TextureLoader()
			var imgTexture = loader.load('static/models/fbx/white.jpg')
			var thicknessTexture = loader.load('static/models/fbx/bunny_thickness.jpg')
			imgTexture.wrapS = imgTexture.wrapT = this.$THREE.RepeatWrapping
			var shader = SubsurfaceScatteringShader
			var uniforms = this.$THREE.UniformsUtils.clone(shader.uniforms)
			uniforms[ 'map' ].value = imgTexture
			uniforms[ 'diffuse' ].value = new this.$THREE.Vector3(1.0, 0.2, 0.2)
			uniforms[ 'shininess' ].value = 500
			uniforms[ 'thicknessMap' ].value = thicknessTexture
			uniforms[ 'thicknessColor' ].value = new this.$THREE.Vector3(0.5, 0.3, 0.0)
			uniforms[ 'thicknessDistortion' ].value = 0.1
			uniforms[ 'thicknessAmbient' ].value = 0.4
			uniforms[ 'thicknessAttenuation' ].value = 0.8
			uniforms[ 'thicknessPower' ].value = 2.0
			uniforms[ 'thicknessScale' ].value = 16.0
			var material = new this.$THREE.ShaderMaterial({
				uniforms: uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader,
				lights: true
			})
			material.extensions.derivatives = true
			// LOADER
			var loaderFBX = new FBXLoader()
			loaderFBX.load('static/models/fbx/stanford-bunny.fbx', (object) => {
				this.model = object.children[ 0 ]
				this.model.position.set(0, 0, 10)
				this.model.scale.setScalar(1)
				this.model.material = material
				this.scene.add(this.model)
			})
			this.initGUI(uniforms)
        },
        initGUI(uniforms) {
			this.gui = new GUI()
			var ThicknessControls = function () {
				this.distortion = uniforms[ 'thicknessDistortion' ].value
				this.ambient = uniforms[ 'thicknessAmbient' ].value
				this.attenuation = uniforms[ 'thicknessAttenuation' ].value
				this.power = uniforms[ 'thicknessPower' ].value
				this.scale = uniforms[ 'thicknessScale' ].value
			}
			var thicknessControls = new ThicknessControls()
			var thicknessFolder = this.gui.addFolder('Thickness Control')
			thicknessFolder.add(thicknessControls, 'distortion').min(0.01).max(1).step(0.01).onChange(() => {
				uniforms[ 'thicknessDistortion' ].value = thicknessControls.distortion
			})
			thicknessFolder.add(thicknessControls, 'ambient').min(0.01).max(5.0).step(0.05).onChange(() => {
				uniforms[ 'thicknessAmbient' ].value = thicknessControls.ambient
			})
			thicknessFolder.add(thicknessControls, 'attenuation').min(0.01).max(5.0).step(0.05).onChange(() => {
				uniforms[ 'thicknessAttenuation' ].value = thicknessControls.attenuation
			})
			thicknessFolder.add(thicknessControls, 'power').min(0.01).max(16.0).step(0.1).onChange(() => {
				uniforms[ 'thicknessPower' ].value = thicknessControls.power
			})
			thicknessFolder.add(thicknessControls, 'scale').min(0.01).max(50.0).step(0.1).onChange(() => {
				uniforms[ 'thicknessScale' ].value = thicknessControls.scale
			})
			thicknessFolder.open()
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
			this.$statsPosition(this.stats)
        },
        animate() {
			requestAnimationFrame(this.animate)
			this.render()
			this.stats.update()
        },
        render() {
			if (this.model) this.model.rotation.y = performance.now() / 5000
			this.renderer.render(this.scene, this.camera)
		}
    },
}
</script>

<style scoped>
.webglMaterialsSubsurfaceScattering-container {
	position: relative;
    width: 100%;
}
</style>
