<template>
    <div class="webglLoaderStl-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
			STL loader test by <a href="https://github.com/aleeper" target="_blank" rel="noopener">aleeper</a>.<br/>
			PR2 head from <a href="http://www.ros.org/wiki/pr2_description">www.ros.org</a>
		</div>
    </div>
</template>

<script>
import { STLLoader } from '@/components/jsm/loaders/STLLoader.js'
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
            document.getElementsByClassName('webglLoaderStl-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 15)
            this.camera.position.set(3, 0.15, 3)
            this.cameraTarget = new this.$THREE.Vector3(0, - 0.25, 0)
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
            // ASCII file
            var loader = new STLLoader()
            loader.load('static/models/stl/ascii/slotted_disk.stl', (geometry) => {
                var material = new this.$THREE.MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 200 })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(0, - 0.25, 0.6)
                mesh.rotation.set(0, - Math.PI / 2, 0)
                mesh.scale.set(0.5, 0.5, 0.5)
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
            })
            // Binary files
            var material = new this.$THREE.MeshPhongMaterial({ color: 0xAAAAAA, specular: 0x111111, shininess: 200 })
            loader.load('static/models/stl/binary/pr2_head_pan.stl', (geometry) => {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(0, - 0.37, - 0.6)
                mesh.rotation.set(- Math.PI / 2, 0, 0)
                mesh.scale.set(2, 2, 2)
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
            })
            loader.load('static/models/stl/binary/pr2_head_tilt.stl', (geometry) => {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(0.136, - 0.37, - 0.6)
                mesh.rotation.set(- Math.PI / 2, 0.3, 0)
                mesh.scale.set(2, 2, 2)
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
            })
            // Colored binary STL
            loader.load('static/models/stl/binary/colored.stl', (geometry) => {
                var meshMaterial = material
                if (geometry.hasColors) {
                    meshMaterial = new this.$THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: true })
                }
                var mesh = new this.$THREE.Mesh(geometry, meshMaterial)
                mesh.position.set(0.5, 0.2, 0)
                mesh.rotation.set(- Math.PI / 2, Math.PI / 2, 0)
                mesh.scale.set(0.3, 0.3, 0.3)
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
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
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
            directionalLight.shadow.bias = - 0.002
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var timer = Date.now() * 0.0005
            this.camera.position.x = Math.cos(timer) * 3
            this.camera.position.z = Math.sin(timer) * 3
            this.camera.lookAt(this.cameraTarget)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderStl-container {
    width: 100%;
}
</style>
