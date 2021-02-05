<template>
    <div class="webglMaterialsCubemapRefraction-container">
        <div id="info">
			<a href="https://threejs.org">Three.js</a> cube map refraction demo<br/>
			Lucy model from
            <a href="http://graphics.stanford.edu/data/3Dscanrep/">Stanford 3d scanning repository</a><br/>
			Texture by <a href="http://www.humus.name/index.php?page=Textures" target="_blank" rel="noopener">Humus</a>
		</div>
    </div>
</template>

<script>
import { PLYLoader } from '@/components/jsm/loaders/PLYLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			pointLight: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsCubemapRefraction-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 100000)
            this.camera.position.z = - 4000
            //
            var r = "static/textures/cube/Park3Med/"
            var urls = [
                r + "px.jpg", r + "nx.jpg",
                r + "py.jpg", r + "ny.jpg",
                r + "pz.jpg", r + "nz.jpg"
            ]
            var textureCube = new this.$THREE.CubeTextureLoader().load(urls)
            textureCube.mapping = this.$THREE.CubeRefractionMapping
            this.scene = new this.$THREE.Scene()
            this.scene.background = textureCube
            // LIGHTS
            var ambient = new this.$THREE.AmbientLight(0xffffff)
            this.scene.add(ambient)
            this.pointLight = new this.$THREE.PointLight(0xffffff, 2)
            this.scene.add(this.pointLight)
            // light representation
            var sphere = new this.$THREE.SphereBufferGeometry(100, 16, 8)
            var mesh = new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: 0xffffff }))
            mesh.scale.set(0.05, 0.05, 0.05)
            this.pointLight.add(mesh)
            // material samples
            var cubeMaterial3 = new this.$THREE.MeshPhongMaterial({ color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 })
            var cubeMaterial2 = new this.$THREE.MeshPhongMaterial({ color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 })
            var cubeMaterial1 = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 })
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            var loader = new PLYLoader()
            loader.load('static/models/ply/binary/Lucy100k.ply', (geometry) => {
                this.createScene(geometry, cubeMaterial1, cubeMaterial2, cubeMaterial3)
            })
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        createScene(geometry, m1, m2, m3) {
            geometry.computeVertexNormals()
            var s = 1.5
            var mesh = new this.$THREE.Mesh(geometry, m1)
            mesh.scale.x = mesh.scale.y = mesh.scale.z = s
            this.scene.add(mesh)
            mesh = new this.$THREE.Mesh(geometry, m2)
            mesh.position.x = - 1500
            mesh.scale.x = mesh.scale.y = mesh.scale.z = s
            this.scene.add(mesh)
            mesh = new this.$THREE.Mesh(geometry, m3)
            mesh.position.x = 1500
            mesh.scale.x = mesh.scale.y = mesh.scale.z = s
            this.scene.add(mesh)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) * 4
            this.mouseY = (event.clientY - this.windowHalfY) * 4
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var timer = - 0.0002 * Date.now()
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.pointLight.position.x = 1500 * Math.cos(timer)
            this.pointLight.position.z = 1500 * Math.sin(timer)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsCubemapRefraction-container {
    width: 100%;
}
</style>
