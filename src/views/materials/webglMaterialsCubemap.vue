<template>
    <div class="webglMaterialsCubemap-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - cube mapping demo.<br />
			Texture by <a href="http://www.humus.name/index.php?page=Textures" target="_blank" rel="noopener">Humus</a>, Walt Disney head by <a href="http://davidoreilly.com/post/18087489343/disneyhead" target="_blank" rel="noopener">David OReilly</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			pointLight: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsCubemap-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 5000)
            this.camera.position.z = 2000
            //cubemap
            var path = 'static/textures/cube/SwedishRoyalCastle/'
            var format = '.jpg'
            var urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ]
            var reflectionCube = new this.$THREE.CubeTextureLoader().load(urls)
            var refractionCube = new this.$THREE.CubeTextureLoader().load(urls)
            refractionCube.mapping = this.$THREE.CubeRefractionMapping
            this.scene = new this.$THREE.Scene()
            this.scene.background = reflectionCube
            //lights
            var ambient = new this.$THREE.AmbientLight(0xffffff)
            this.scene.add(ambient)
            this.pointLight = new this.$THREE.PointLight(0xffffff, 2)
            this.scene.add(this.pointLight)
            //materials
            var cubeMaterial3 = new this.$THREE.MeshLambertMaterial({ color: 0xff6600, envMap: reflectionCube, combine: this.$THREE.MixOperation, reflectivity: 0.3 })
            var cubeMaterial2 = new this.$THREE.MeshLambertMaterial({ color: 0xffee00, envMap: refractionCube, refractionRatio: 0.95 })
            var cubeMaterial1 = new this.$THREE.MeshLambertMaterial({ color: 0xffffff, envMap: reflectionCube })
            //models
            var objLoader = new OBJLoader()
            objLoader.setPath('static/models/obj/walt/')
            objLoader.load('WaltHead.obj', (object) => {
                var head = object.children[ 0 ]
                head.scale.multiplyScalar(15)
                head.position.y = - 500
                head.material = cubeMaterial1
                var head2 = head.clone()
                head2.position.x = - 900
                head2.material = cubeMaterial2
                var head3 = head.clone()
                head3.position.x = 900
                head3.material = cubeMaterial3
                this.scene.add(head, head2, head3)
            })
            //renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enableZoom = false
            controls.enablePan = false
            controls.minPolarAngle = Math.PI / 4
            controls.maxPolarAngle = Math.PI / 1.5
            //stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
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
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglMaterialsCubemap-container {
    width: 100%;
}
</style>
