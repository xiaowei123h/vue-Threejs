<template>
    <div class="webglMaterialsEnvmaps-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl environment mapping example<br/>
			Equirectangular Map by <a href="http://gl.ict.usc.edu/Data/HighResProbes/">University of Southern California</a><br/>
			Spherical Map by <a href="http://www.pauldebevec.com/Probes/">Paul Debevec</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            controls: null,
            camera: null,
            scene: null,
            renderer: null,
            textureEquirec: null,
            textureCube: null,
            sphereMesh: null,
            sphereMaterial: null,
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
            // CAMERAS
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 100000)
            this.camera.position.set(0, 0, 1000)
            // SCENE
            this.scene = new this.$THREE.Scene()
            // Lights
            var ambient = new this.$THREE.AmbientLight(0xffffff)
            this.scene.add(ambient)
            // Textures
            var loader = new this.$THREE.CubeTextureLoader()
            loader.setPath('static/textures/cube/Bridge2/')
            this.textureCube = loader.load([ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ])
            this.textureCube.encoding = this.$THREE.sRGBEncoding
            var textureLoader = new this.$THREE.TextureLoader()
            this.textureEquirec = textureLoader.load('static/textures/2294472375_24a3b8ef46_o.jpg')
            this.textureEquirec.mapping = this.$THREE.EquirectangularReflectionMapping
            this.textureEquirec.encoding = this.$THREE.sRGBEncoding
            this.scene.background = this.textureCube
            //
            var geometry = new this.$THREE.IcosahedronBufferGeometry(400, 15)
            this.sphereMaterial = new this.$THREE.MeshLambertMaterial({ envMap: this.textureCube })
            this.sphereMesh = new this.$THREE.Mesh(geometry, this.sphereMaterial)
            this.scene.add(this.sphereMesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            document.getElementsByClassName('webglMaterialsEnvmaps-container')[0].appendChild(this.renderer.domElement)
            //
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 500
            this.controls.maxDistance = 2500
            //
            var params = {
                Cube: () => {
                    this.scene.background = this.textureCube
                    this.sphereMaterial.envMap = this.textureCube
                    this.sphereMaterial.needsUpdate = true
                },
                Equirectangular: () => {
                    this.scene.background = this.textureEquirec
                    this.sphereMaterial.envMap = this.textureEquirec
                    this.sphereMaterial.needsUpdate = true
                },
                Refraction: false
            }
            this.gui = new GUI()
            this.gui.add(params, 'Cube')
            this.gui.add(params, 'Equirectangular')
            this.gui.add(params, 'Refraction').onChange((value) => {
                if (value) {
                    this.textureEquirec.mapping = this.$THREE.EquirectangularRefractionMapping
                    this.textureCube.mapping = this.$THREE.CubeRefractionMapping
                } else {
                    this.textureEquirec.mapping = this.$THREE.EquirectangularReflectionMapping
                    this.textureCube.mapping = this.$THREE.CubeReflectionMapping
                }
                this.sphereMaterial.needsUpdate = true
            })
            this.gui.open()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsEnvmaps-container {
    position: relative;
    width: 100%;
}
</style>
