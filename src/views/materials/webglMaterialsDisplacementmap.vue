<template>
    <div class="webglMaterialsDisplacementmap-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - (normal + ao + displacement + environment) map demo.<br />
			ninja head from <a href="https://gpuopen.com/archive/gamescgi/amd-gpu-meshmapper/" target="_blank" rel="noopener">AMD GPU MeshMapper</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
export default {
    data() {
        return {
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
			settings: {
				metalness: 1.0,
				roughness: 0.4,
				ambientIntensity: 0.2,
				aoMapIntensity: 1.0,
				envMapIntensity: 1.0,
				displacementScale: 2.436143, // from original model
				normalScale: 1.0
			},
            mesh: null,
            material: null,
            pointLight: null,
            ambientLight: null,
			height: 500, // of camera frustum
            r: 0.0,
            gui: null,
        }
    },
    mounted() {
        this.init()
        this.animate()
        this.initGui()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        initGui() {
            this.gui = new GUI()
            //let gui = gui.addFolder("Material")
            this.gui.add(this.settings, "metalness").min(0).max(1).onChange((value) => {
                this.material.metalness = value
            })
            this.gui.add(this.settings, "roughness").min(0).max(1).onChange((value) => {
                this.material.roughness = value
            })
            this.gui.add(this.settings, "aoMapIntensity").min(0).max(1).onChange((value) => {
                this.material.aoMapIntensity = value
            })
            this.gui.add(this.settings, "ambientIntensity").min(0).max(1).onChange((value) => {
                this.ambientLight.intensity = value
            })
            this.gui.add(this.settings, "envMapIntensity").min(0).max(3).onChange((value) => {
                this.material.envMapIntensity = value
            })
            this.gui.add(this.settings, "displacementScale").min(0).max(3.0).onChange((value) => {
                this.material.displacementScale = value
            })
            this.gui.add(this.settings, "normalScale").min(- 1).max(1).onChange((value) => {
                this.material.normalScale.set(1, - 1).multiplyScalar(value)
            })
        },
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsDisplacementmap-container')[0].appendChild(container)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            //
            this.scene = new this.$THREE.Scene()
            var aspect = this.$webglInnerWidth / window.innerHeight
            this.camera = new this.$THREE.OrthographicCamera(- this.height * aspect, this.height * aspect, this.height, - this.height, 1, 10000)
            this.camera.position.z = 1500
            this.scene.add(this.camera)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableZoom = false
            this.controls.enableDamping = true
            // lights
            this.ambientLight = new this.$THREE.AmbientLight(0xffffff, this.settings.ambientIntensity)
            this.scene.add(this.ambientLight)
            this.pointLight = new this.$THREE.PointLight(0xff0000, 0.5)
            this.pointLight.position.z = 2500
            this.scene.add(this.pointLight)
            var pointLight2 = new this.$THREE.PointLight(0xff6666, 1)
            this.camera.add(pointLight2)
            var pointLight3 = new this.$THREE.PointLight(0x0000ff, 0.5)
            pointLight3.position.x = - 1000
            pointLight3.position.z = 1000
            this.scene.add(pointLight3)
            // env map
            var path = "static/textures/cube/SwedishRoyalCastle/"
            var format = '.jpg'
            var urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ]
            var reflectionCube = new this.$THREE.CubeTextureLoader().load(urls)
            reflectionCube.encoding = this.$THREE.sRGBEncoding
            // textures
            var textureLoader = new this.$THREE.TextureLoader()
            var normalMap = textureLoader.load("static/models/obj/ninja/normal.png")
            var aoMap = textureLoader.load("static/models/obj/ninja/ao.jpg")
            var displacementMap = textureLoader.load("static/models/obj/ninja/displacement.jpg")
            // material
            this.material = new this.$THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: this.settings.roughness,
                metalness: this.settings.metalness,
                normalMap: normalMap,
                normalScale: new this.$THREE.Vector2(1, - 1), // why does the normal map require negation in this case?
                aoMap: aoMap,
                aoMapIntensity: 1,
                displacementMap: displacementMap,
                displacementScale: this.settings.displacementScale,
                displacementBias: - 0.428408, // from original model
                envMap: reflectionCube,
                envMapIntensity: this.settings.envMapIntensity,
                side: this.$THREE.DoubleSide
            })
            //
            var loader = new OBJLoader()
            loader.load("static/models/obj/ninja/ninjaHead_Low.obj", (group) => {
                var geometry = group.children[ 0 ].geometry
                geometry.attributes.uv2 = geometry.attributes.uv
                geometry.center()
                this.mesh = new this.$THREE.Mesh(geometry, this.material)
                this.mesh.scale.multiplyScalar(25)
                this.scene.add(this.mesh)
            })
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var aspect = (window.innerWidth - 281 )/ window.innerHeight
            this.camera.left = - height * aspect
            this.camera.right = height * aspect
            this.camera.top = height
            this.camera.bottom = - height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth - 281, window.innerHeight)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            this.pointLight.position.x = 2500 * Math.cos(this.r)
            this.pointLight.position.z = 2500 * Math.sin(this.r)
            this.r += 0.01
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsDisplacementmap-container {
    position: relative;
    width: 100%;
}
</style>
