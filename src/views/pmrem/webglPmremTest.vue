<template>
    <div class="webglPmremTest-container">
        <div id="container">
			<div id="info">
				<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
				PMREM directional light test <a href="https://github.com/elalish" target="_blank" rel="noopener">Emmett Lalish</a>
				<br>Top row is white metal
				<br>Middle row is white dielectric
				<br>Bottom row is black dielectric.
				<br>Mouse-out is a standard Directional Light.
				<br>Mouse-over is a PMREM of the skybox: a single bright pixel representing the same directional light source.
				<br>The difference between these renders indicates the error in the PMREM approximations.
			</div>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            scene: null,
            camera: null,
            controls: null,
            renderer: null,
        }
    },
    mounted() {
        Promise.resolve()
            .then(this.init)
            .then(this.createObjects)
            .then(this.render)
    },
    methods: {
        init() {
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            var aspect = width / height
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(width, height)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.physicallyCorrectLights = true
            // tonemapping
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 1
            document.getElementsByClassName('webglPmremTest-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onResize, false)
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, aspect, 1, 30)
            this.updateCamera()
            this.camera.position.set(0, 0, 16)
            // controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.addEventListener('change', this.render) // use if there is no animation loop
            this.controls.minDistance = 4
            this.controls.maxDistance = 20
            // light
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 0) // set intensity to 0 to start
            var x = 597
            var y = 213
            var theta = (x + 0.5) * Math.PI / 512
            var phi = (y + 0.5) * Math.PI / 512
            directionalLight.position.setFromSphericalCoords(100, - phi, Math.PI / 2 - theta)
            this.scene.add(directionalLight)
            // this.scene.add(new this.$THREE.DirectionalLightHelper(directionalLight))
            // The spot1Lux HDR environment map is expressed in nits (lux / sr). The directional light has units of lux,
            // so to match a 1 lux light, we set a single pixel with a value equal to 1 divided by the solid
            // angle of the pixel in steradians. This image is 1024 x 512,
            // so the value is 1 / (sin(phi) * (pi / 512) ^ 2) = 27,490 nits.
            document.getElementsByClassName('webglPmremTest-container')[0].addEventListener('mouseover', () => {
                this.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.material.envMapIntensity = 1
                        directionalLight.intensity = 0
                    }
                })
                this.render()
            })
            document.getElementsByClassName('webglPmremTest-container')[0].addEventListener('mouseout', () => {
                this.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.material.envMapIntensity = 0
                        directionalLight.intensity = 1
                    }
                })
                this.render()
            })
        },
        createObjects() {
            var radianceMap = null
            new RGBELoader()
                .setDataType(this.$THREE.UnsignedByteType)
                // .setDataType(this.$THREE.FloatType)
                .setPath('static/textures/equirectangular/')
                .load('spot1Lux.hdr', (texture) => {
                    radianceMap = pmremGenerator.fromEquirectangular(texture).texture
                    pmremGenerator.dispose()
                    this.scene.background = radianceMap
                    var geometry = new this.$THREE.SphereBufferGeometry(0.4, 32, 32)
                    for (var x = 0; x <= 10; x ++) {
                        for (var y = 0; y <= 2; y ++) {
                            var material = new this.$THREE.MeshPhysicalMaterial({
                                roughness: x / 10,
                                metalness: y < 1 ? 1 : 0,
                                color: y < 2 ? 0xffffff : 0x000000,
                                envMap: radianceMap,
                                envMapIntensity: 1
                            })
                            var mesh = new this.$THREE.Mesh(geometry, material)
                            mesh.position.x = x - 5
                            mesh.position.y = 1 - y
                            this.scene.add(mesh)
                        }
                    }
                    this.render()
                })
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
        },
        onResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.camera.aspect = width / height
            this.updateCamera()
            this.renderer.setSize(width, height)
            this.render()
        },
        updateCamera() {
            var horizontalFoV = 40
            var verticalFoV = 2 * Math.atan(Math.tan(horizontalFoV / 2 * Math.PI / 180) / this.camera.aspect) * 180 / Math.PI
            this.camera.fov = verticalFoV
            this.camera.updateProjectionMatrix()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglPmremTest-container {
    width: 100%;
}
</style>
