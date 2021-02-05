<template>
    <div class="webglMarchingcubes-container">
        <div id="container"></div>
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
            marching cubes<br/>
            based on greggman's <a href="https://webglsamples.org/blob/blob.html">blob</a>, original code by Henrik Rydgård
        </div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { MarchingCubes } from '@/components/jsm/objects/MarchingCubes.js'
import { ToonShader1, ToonShader2, ToonShaderHatching, ToonShaderDotted } from '@/components/jsm/shaders/ToonShader.js'
export default {
    data() {
        return {
            gui: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            materials: null,
            current_material: null,
            light: null,
            pointLight: null,
            ambientLight: null,
            effect: null,
            resolution: null,
            effectController: null,
            time: 0,
            clock: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
		this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
			this.container = document.getElementById('container')
			// CAMERA
			this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 10000)
			this.camera.position.set(- 500, 500, 1500)
			// SCENE
			this.scene = new this.$THREE.Scene()
			this.scene.background = new this.$THREE.Color(0x050505)
			// LIGHTS
			this.light = new this.$THREE.DirectionalLight(0xffffff)
			this.light.position.set(0.5, 0.5, 1)
			this.scene.add(this.light)
			this.pointLight = new this.$THREE.PointLight(0xff3300)
			this.pointLight.position.set(0, 0, 100)
			this.scene.add(this.pointLight)
			this.ambientLight = new this.$THREE.AmbientLight(0x080808)
			this.scene.add(this.ambientLight)
			// MATERIALS
			this.materials = this.generateMaterials()
			this.current_material = "shiny"
			// MARCHING CUBES
			this.resolution = 28
			this.effect = new MarchingCubes(this.resolution, this.materials[ this.current_material ].m, true, true)
			this.effect.position.set(0, 0, 0)
			this.effect.scale.set(700, 700, 700)
			this.effect.enableUvs = false
			this.effect.enableColors = false
			this.scene.add(this.effect)
			// RENDERER
			this.renderer = new this.$THREE.WebGLRenderer()
			this.renderer.outputEncoding = this.$THREE.sRGBEncoding
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.container.appendChild(this.renderer.domElement)
			// CONTROLS
			var controls = new OrbitControls(this.camera, this.renderer.domElement)
			controls.minDistance = 500
			controls.maxDistance = 5000
			// STATS
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
			this.container.appendChild(this.stats.dom)
			// GUI
			this.setupGui()
			// EVENTS
			window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
        },
        generateMaterials() {
			// environment map
			var path = "static/textures/cube/SwedishRoyalCastle/"
			var format = '.jpg'
			var urls = [
				path + 'px' + format, path + 'nx' + format,
				path + 'py' + format, path + 'ny' + format,
				path + 'pz' + format, path + 'nz' + format
			]
			var cubeTextureLoader = new this.$THREE.CubeTextureLoader()
			var reflectionCube = cubeTextureLoader.load(urls)
			var refractionCube = cubeTextureLoader.load(urls)
			refractionCube.mapping = this.$THREE.CubeRefractionMapping
			// toons
			var toonMaterial1 = this.createShaderMaterial(ToonShader1, this.light, this.ambientLight)
			var toonMaterial2 = this.createShaderMaterial(ToonShader2, this.light, this.ambientLight)
			var hatchingMaterial = this.createShaderMaterial(ToonShaderHatching, this.light, this.ambientLight)
			var dottedMaterial = this.createShaderMaterial(ToonShaderDotted, this.light, this.ambientLight)
			var texture = new this.$THREE.TextureLoader().load("static/textures/uv_grid_opengl.jpg")
			texture.wrapS = this.$THREE.RepeatWrapping
			texture.wrapT = this.$THREE.RepeatWrapping
			var materials = {
				"chrome": {
					m: new this.$THREE.MeshLambertMaterial({ color: 0xffffff, envMap: reflectionCube }),
					h: 0, s: 0, l: 1
				},
				"liquid": {
					m: new this.$THREE.MeshLambertMaterial({ color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 }),
					h: 0, s: 0, l: 1
				},
				"shiny": {
					m: new this.$THREE.MeshStandardMaterial({ color: 0x550000, envMap: reflectionCube, roughness: 0.1, metalness: 1.0 }),
					h: 0, s: 0.8, l: 0.2
				},
				"matte": {
					m: new this.$THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x111111, shininess: 1 }),
					h: 0, s: 0, l: 1
				},
				"flat": {
					m: new this.$THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true }),
					h: 0, s: 0, l: 1
				},
				"textured": {
					m: new this.$THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, shininess: 1, map: texture }),
					h: 0, s: 0, l: 1
				},
				"colors": {
					m: new this.$THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: true }),
					h: 0, s: 0, l: 1
				},
				"multiColors": {
					m: new this.$THREE.MeshPhongMaterial({ shininess: 2, vertexColors: true }),
					h: 0, s: 0, l: 1
				},
				"plastic": {
					m: new this.$THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x888888, shininess: 250 }),
					h: 0.6, s: 0.8, l: 0.1
				},
				"toon1": {
					m: toonMaterial1,
					h: 0.2, s: 1, l: 0.75
				},
				"toon2": {
					m: toonMaterial2,
					h: 0.4, s: 1, l: 0.75
				},
				"hatching": {
					m: hatchingMaterial,
					h: 0.2, s: 1, l: 0.9
				},
				"dotted": {
					m: dottedMaterial,
					h: 0.2, s: 1, l: 0.9
				}
			};
			return materials
        },
        createShaderMaterial(shader, light, ambientLight) {
			var u = this.$THREE.UniformsUtils.clone(shader.uniforms)
			var vs = shader.vertexShader
			var fs = shader.fragmentShader
			var material = new this.$THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs })
			material.uniforms[ "uDirLightPos" ].value = light.position
			material.uniforms[ "uDirLightColor" ].value = light.color
			material.uniforms[ "uAmbientLightColor" ].value = ambientLight.color
			return material
        },
        setupGui() {
			var createHandler = (id) => {
				return () => {
					var mat_old = this.materials[ this.current_material ]
					mat_old.h = m_h.getValue()
					mat_old.s = m_s.getValue()
					mat_old.l = m_l.getValue()
					this.current_material = id
					var mat = this.materials[ id ]
					this.effect.material = mat.m
					m_h.setValue(mat.h)
					m_s.setValue(mat.s)
					m_l.setValue(mat.l)
					this.effect.enableUvs = (this.current_material === "textured") ? true : false
					this.effect.enableColors = (this.current_material === "colors" || this.current_material === "multiColors") ? true : false
				}
			}
			this.effectController = {
				material: "shiny",
				speed: 1.0,
				numBlobs: 10,
				resolution: 28,
				isolation: 80,
				floor: true,
				wallx: false,
				wallz: false,
				hue: 0.0,
				saturation: 0.8,
				lightness: 0.1,
				lhue: 0.04,
				lsaturation: 1.0,
				llightness: 0.5,
				lx: 0.5,
				ly: 0.5,
				lz: 1.0,
				dummy: () => {}
			}
			var h
			this.gui = new GUI()
			// material (type)
			h = this.gui.addFolder("Materials")
			for (var m in this.materials) {
				this.effectController[ m ] = createHandler(m)
				h.add(this.effectController, m).name(m)
			}
			// material (color)
			h = this.gui.addFolder("Material color")
			var m_h = h.add(this.effectController, "hue", 0.0, 1.0, 0.025)
			var m_s = h.add(this.effectController, "saturation", 0.0, 1.0, 0.025)
			var m_l = h.add(this.effectController, "lightness", 0.0, 1.0, 0.025)
			// light (point)
			h = this.gui.addFolder("Point light color")
			h.add(this.effectController, "lhue", 0.0, 1.0, 0.025).name("hue")
			h.add(this.effectController, "lsaturation", 0.0, 1.0, 0.025).name("saturation")
			h.add(this.effectController, "llightness", 0.0, 1.0, 0.025).name("lightness")
			// light (directional)
			h = this.gui.addFolder("Directional light orientation")
			h.add(this.effectController, "lx", - 1.0, 1.0, 0.025).name("x")
			h.add(this.effectController, "ly", - 1.0, 1.0, 0.025).name("y")
			h.add(this.effectController, "lz", - 1.0, 1.0, 0.025).name("z")
			// simulation
			h = this.gui.addFolder("Simulation")
			h.add(this.effectController, "speed", 0.1, 8.0, 0.05)
			h.add(this.effectController, "numBlobs", 1, 50, 1)
			h.add(this.effectController, "resolution", 14, 100, 1)
			h.add(this.effectController, "isolation", 10, 300, 1)
			h.add(this.effectController, "floor")
			h.add(this.effectController, "wallx")
			h.add(this.effectController, "wallz")
        },
        updateCubes(object, time, numblobs, floor, wallx, wallz) {
			object.reset()
			// fill the field with some metaballs
			var rainbow = [
				new this.$THREE.Color(0xff0000),
				new this.$THREE.Color(0xff7f00),
				new this.$THREE.Color(0xffff00),
				new this.$THREE.Color(0x00ff00),
				new this.$THREE.Color(0x0000ff),
				new this.$THREE.Color(0x4b0082),
				new this.$THREE.Color(0x9400d3)
			]
			var subtract = 12
			var strength = 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1)
			for (var i = 0; i < numblobs; i ++) {
				var ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5
				var bally = Math.abs(Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i))) * 0.77 // dip into the floor
				var ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin((0.92 + 0.53 * i))) * 0.27 + 0.5
				if (this.current_material === 'multiColors') {
					object.addBall(ballx, bally, ballz, strength, subtract, rainbow[ i % 7 ])
				} else {
					object.addBall(ballx, bally, ballz, strength, subtract)
				}
			}
			if (floor) object.addPlaneY(2, 12)
			if (wallz) object.addPlaneZ(2, 12)
			if (wallx) object.addPlaneX(2, 12)
        },
        animate() {
			requestAnimationFrame(this.animate)
			this.render()
			this.stats.update()
        },
        render() {
			var delta = this.clock.getDelta()
			this.time += delta * this.effectController.speed * 0.5
			// marching cubes
			if (this.effectController.resolution !== this.resolution) {
				this.resolution = this.effectController.resolution
				this.effect.init(Math.floor(this.resolution))
			}
			if (this.effectController.isolation !== this.effect.isolation) {
				this.effect.isolation = this.effectController.isolation
			}
			this.updateCubes(this.effect, this.time, this.effectController.numBlobs, this.effectController.floor, this.effectController.wallx, this.effectController.wallz)
			// materials
			if (this.effect.material instanceof this.$THREE.ShaderMaterial) {
				this.effect.material.uniforms[ "uBaseColor" ].value.setHSL(this.effectController.hue, this.effectController.saturation, this.effectController.lightness)
			} else {
				this.effect.material.color.setHSL(this.effectController.hue, this.effectController.saturation, this.effectController.lightness)
			}
			// lights
			this.light.position.set(this.effectController.lx, this.effectController.ly, this.effectController.lz)
			this.light.position.normalize()
			this.pointLight.color.setHSL(this.effectController.lhue, this.effectController.lsaturation, this.effectController.llightness)
			// render
			this.renderer.render(this.scene, this.camera)
		}
    },
}
</script>

<style scoped>
.webglMarchingcubes-container {
    width: 100%;
}
</style>
