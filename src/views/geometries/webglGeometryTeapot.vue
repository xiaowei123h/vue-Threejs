<template>
    <div class="webglGeometryTeapot-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - the Utah Teapot<br />
			from <a href="https://www.udacity.com/course/interactive-3d-graphics--cs291" target="_blank" rel="noopener">Udacity Interactive 3D Graphics</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { TeapotBufferGeometry } from '@/components/jsm/geometries/TeapotBufferGeometry.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			cameraControls: null,
			effectController: null,
			teapotSize: 400,
            ambientLight: null,
            light: null,
			tess: - 1,	// force initialization
			bBottom: null,
			bLid: null,
			bBody: null,
			bFitLid: null,
			bNonBlinn: null,
			shading: null,
            wireMaterial: null,
            flatMaterial: null,
            gouraudMaterial: null,
            phongMaterial: null,
            texturedMaterial: null,
            reflectiveMaterial: null,
            teapot: null,
            textureCube: null,
			// allocate these just once
			diffuseColor: null,
            specularColor: null,
            gui: null
        }
    },
    mounted() {
        this.diffuseColor = new this.$THREE.Color()
        this.specularColor = new this.$THREE.Color()
        this.init()
        this.render()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglGeometryTeapot-container')[0].appendChild(container)
            var canvasWidth = this.$webglInnerWidth
            var canvasHeight = window.innerHeight
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 80000)
            this.camera.position.set(- 600, 550, 1300)
            // LIGHTS
            this.ambientLight = new this.$THREE.AmbientLight(0x333333)	// 0.2
            this.light = new this.$THREE.DirectionalLight(0xFFFFFF, 1.0)
            // direction is set in GUI
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(canvasWidth, canvasHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            container.appendChild(this.renderer.domElement)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
            // CONTROLS
            this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement)
            this.cameraControls.addEventListener('change', this.render)
            // TEXTURE MAP
            var textureMap = new this.$THREE.TextureLoader().load('static/textures/uv_grid_opengl.jpg')
            textureMap.wrapS = textureMap.wrapT = this.$THREE.RepeatWrapping
            textureMap.anisotropy = 16
            textureMap.encoding = this.$THREE.sRGBEncoding
            // REFLECTION MAP
            var path = "static/textures/cube/pisa/"
            var urls = [
                path + "px.png", path + "nx.png",
                path + "py.png", path + "ny.png",
                path + "pz.png", path + "nz.png"
            ]
            this.textureCube = new this.$THREE.CubeTextureLoader().load(urls)
            this.textureCube.encoding = this.$THREE.sRGBEncoding
            // MATERIALS
            var materialColor = new this.$THREE.Color()
            materialColor.setRGB(1.0, 1.0, 1.0)
            this.wireMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true })
            this.flatMaterial = new this.$THREE.MeshPhongMaterial({ color: materialColor, specular: 0x000000, flatShading: true, side: this.$THREE.DoubleSide })
            this.gouraudMaterial = new this.$THREE.MeshLambertMaterial({ color: materialColor, side: this.$THREE.DoubleSide })
            this.phongMaterial = new this.$THREE.MeshPhongMaterial({ color: materialColor, side: this.$THREE.DoubleSide })
            this.texturedMaterial = new this.$THREE.MeshPhongMaterial({ color: materialColor, map: textureMap, side: this.$THREE.DoubleSide })
            this.reflectiveMaterial = new this.$THREE.MeshPhongMaterial({ color: materialColor, envMap: this.textureCube, side: this.$THREE.DoubleSide })
            // scene itself
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xAAAAAA)
            this.scene.add(this.ambientLight)
            this.scene.add(this.light)
            // GUI
            this.setupGui()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        setupGui() {
            this.effectController = {
                shininess: 40.0,
                ka: 0.17,
                kd: 0.51,
                ks: 0.2,
                metallic: true,
                hue:	0.121,
                saturation: 0.73,
                lightness: 0.66,
                lhue:	0.04,
                lsaturation: 0.01,	// non-zero so that fractions will be shown
                llightness: 1.0,
                // bizarrely, if you initialize these with negative numbers, the sliders
                // will not show any decimal places.
                lx: 0.32,
                ly: 0.39,
                lz: 0.7,
                newTess: 15,
                bottom: true,
                lid: true,
                body: true,
                fitLid: false,
                nonblinn: false,
                newShading: "glossy"
            }
            var h
            this.gui = new GUI()
            // material (attributes)
            h = this.gui.addFolder("Material control")
            h.add(this.effectController, "shininess", 1.0, 400.0, 1.0).name("shininess").onChange(this.render)
            h.add(this.effectController, "kd", 0.0, 1.0, 0.025).name("diffuse strength").onChange(this.render)
            h.add(this.effectController, "ks", 0.0, 1.0, 0.025).name("specular strength").onChange(this.render)
            h.add(this.effectController, "metallic").onChange(this.render)
            // material (color)
            h = this.gui.addFolder("Material color")
            h.add(this.effectController, "hue", 0.0, 1.0, 0.025).name("hue").onChange(this.render)
            h.add(this.effectController, "saturation", 0.0, 1.0, 0.025).name("saturation").onChange(this.render)
            h.add(this.effectController, "lightness", 0.0, 1.0, 0.025).name("lightness").onChange(this.render)
            // light (point)
            h = this.gui.addFolder("Lighting")
            h.add(this.effectController, "lhue", 0.0, 1.0, 0.025).name("hue").onChange(this.render)
            h.add(this.effectController, "lsaturation", 0.0, 1.0, 0.025).name("saturation").onChange(this.render)
            h.add(this.effectController, "llightness", 0.0, 1.0, 0.025).name("lightness").onChange(this.render)
            h.add(this.effectController, "ka", 0.0, 1.0, 0.025).name("ambient").onChange(this.render)
            // light (directional)
            h = this.gui.addFolder("Light direction")
            h.add(this.effectController, "lx", - 1.0, 1.0, 0.025).name("x").onChange(this.render)
            h.add(this.effectController, "ly", - 1.0, 1.0, 0.025).name("y").onChange(this.render)
            h.add(this.effectController, "lz", - 1.0, 1.0, 0.025).name("z").onChange(this.render)
            h = this.gui.addFolder("Tessellation control")
            h.add(this.effectController, "newTess", [ 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50 ]).name("Tessellation Level").onChange(this.render)
            h.add(this.effectController, "lid").name("display lid").onChange(this.render)
            h.add(this.effectController, "body").name("display body").onChange(this.render)
            h.add(this.effectController, "bottom").name("display bottom").onChange(this.render)
            h.add(this.effectController, "fitLid").name("snug lid").onChange(this.render)
            h.add(this.effectController, "nonblinn").name("original scale").onChange(this.render)
            // shading
            this.gui.add(this.effectController, "newShading", [ "wireframe", "flat", "smooth", "glossy", "textured", "reflective" ]).name("Shading").onChange(this.render)
        },
        render() {
            if (this.effectController.newTess !== this.tess ||
                this.effectController.bottom !== this.bBottom ||
                this.effectController.lid !== this.bLid ||
                this.effectController.body !== this.bBody ||
                this.effectController.fitLid !== this.bFitLid ||
                this.effectController.nonblinn !== this.bNonBlinn ||
                this.effectController.newShading !== this.shading) {
                this.tess = this.effectController.newTess
                this.bBottom = this.effectController.bottom
                this.bLid = this.effectController.lid
                this.bBody = this.effectController.body
                this.bFitLid = this.effectController.fitLid
                this.bNonBlinn = this.effectController.nonblinn
                this.shading = this.effectController.newShading
                this.createNewTeapot()
            }
            // We're a bit lazy here. We could check to see if any material attributes changed and update
            // only if they have. But, these calls are cheap enough and this is just a demo.
            this.phongMaterial.shininess = this.effectController.shininess
            this.texturedMaterial.shininess = this.effectController.shininess
            this.diffuseColor.setHSL(this.effectController.hue, this.effectController.saturation, this.effectController.lightness)
            if (this.effectController.metallic) {
                // make colors match to give a more metallic look
                this.specularColor.copy(this.diffuseColor)
            } else {
                // more of a plastic look
                this.specularColor.setRGB(1, 1, 1)
            }
            this.diffuseColor.multiplyScalar(this.effectController.kd)
            this.flatMaterial.color.copy(this.diffuseColor)
            this.gouraudMaterial.color.copy(this.diffuseColor)
            this.phongMaterial.color.copy(this.diffuseColor)
            this.texturedMaterial.color.copy(this.diffuseColor)
            this.specularColor.multiplyScalar(this.effectController.ks)
            this.phongMaterial.specular.copy(this.specularColor)
            this.texturedMaterial.specular.copy(this.specularColor)
            // Ambient's actually controlled by the light for this demo
            this.ambientLight.color.setHSL(this.effectController.hue, this.effectController.saturation, this.effectController.lightness * this.effectController.ka)
            this.light.position.set(this.effectController.lx, this.effectController.ly, this.effectController.lz)
            this.light.color.setHSL(this.effectController.lhue, this.effectController.lsaturation, this.effectController.llightness)
            // skybox is rendered separately, so that it is always behind the teapot.
            if (this.shading === "reflective") {
                this.scene.background = this.textureCube
            } else {
                this.scene.background = null
            }
            this.renderer.render(this.scene, this.camera)
        },
        createNewTeapot() {
            if (this.teapot !== null) {
                this.teapot.geometry.dispose()
                this.scene.remove(this.teapot)
            }
            var teapotGeometry = new TeapotBufferGeometry(this.teapotSize,
                this.tess,
                this.effectController.bottom,
                this.effectController.lid,
                this.effectController.body,
                this.effectController.fitLid,
                ! this.effectController.nonblinn)
            this.teapot = new this.$THREE.Mesh(
                teapotGeometry,
                this.shading === "wireframe" ? this.wireMaterial : (
                    this.shading === "flat" ? this.flatMaterial : (
                        this.shading === "smooth" ? this.gouraudMaterial : (
                            this.shading === "glossy" ? this.phongMaterial : (
                                this.shading === "textured" ? this.texturedMaterial : this.reflectiveMaterial)))))	// if no match, pick Phong
            this.scene.add(this.teapot)
        }
    }
}
</script>

<style scoped>
.webglGeometryTeapot-container {
    width: 100%;
}
</style>
