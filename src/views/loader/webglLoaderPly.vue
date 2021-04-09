<template>
    <div class="webglLoaderPly-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
			PLY loader test by <a href="https://github.com/menway" target="_blank" rel="noopener">Wei Meng</a>.<br/>
			Image from <a href="http://people.sc.fsu.edu/~jburkardt/data/ply/ply.html">John Burkardt</a>
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
            cameraTarget: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderPly-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 15)
            this.camera.position.set(3, 0.15, 3)
            this.cameraTarget = new this.$THREE.Vector3(0, - 0.1, 0)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x72645b)
            this.scene.fog = new this.$THREE.Fog(0x72645b, 2, 15)
            // Ground
            var plane = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(40, 40),
                new this.$THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
            )
            plane.rotation.x = - Math.PI / 2
            plane.position.y = - 0.5
            this.scene.add(plane)
            plane.receiveShadow = true
            // PLY file
            var loader = new PLYLoader()
            loader.load('static/models/ply/ascii/dolphins.ply', (geometry) => {
                geometry.computeVertexNormals()
                var material = new this.$THREE.MeshStandardMaterial({ color: 0x0055ff, flatShading: true })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.y = - 0.2
                mesh.position.z = 0.3
                mesh.rotation.x = - Math.PI / 2
                mesh.scale.multiplyScalar(0.001)
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
            })
            loader.load('static/models/ply/binary/Lucy100k.ply', (geometry) => {
                geometry.computeVertexNormals()
                var material = new this.$THREE.MeshStandardMaterial({ color: 0x0055ff, flatShading: true })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = - 0.2
                mesh.position.y = - 0.02
                mesh.position.z = - 0.2
                mesh.scale.multiplyScalar(0.0006)
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
            })
            // Lights
            this.scene.add(new this.$THREE.HemisphereLight(0x443333, 0x111122))
            this.addShadowedLight(1, 1, 1, 0xffffff, 1.35)
            this.addShadowedLight(0.5, 1, - 1, 0xffaa00, 1)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.container.appendChild(this.renderer.domElement)
            // stats
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            // resize
            window.addEventListener('resize', this.onWindowResize, false)
        },
        addShadowedLight(x, y, z, color, intensity) {
            var directionalLight = new this.$THREE.DirectionalLight(color, intensity)
            directionalLight.position.set(x, y, z)
            this.scene.add(directionalLight)
            directionalLight.castShadow = true
            var d = 1
            directionalLight.shadow.camera.left = - d
            directionalLight.shadow.camera.right = d
            directionalLight.shadow.camera.top = d
            directionalLight.shadow.camera.bottom = - d
            directionalLight.shadow.camera.near = 1
            directionalLight.shadow.camera.far = 4
            directionalLight.shadow.mapSize.width = 1024
            directionalLight.shadow.mapSize.height = 1024
            directionalLight.shadow.bias = - 0.001
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
            var timer = Date.now() * 0.0005
            this.camera.position.x = Math.sin(timer) * 2.5
            this.camera.position.z = Math.cos(timer) * 2.5
            this.camera.lookAt(this.cameraTarget)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderPly-container {
    position: relative;
    width: 100%;
}
</style>
