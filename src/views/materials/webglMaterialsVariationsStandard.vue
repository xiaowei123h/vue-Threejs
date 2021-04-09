<template>
    <div class="webglMaterialsVariationsStandard-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Standard Material Variations by <a href="http://clara.io/" target="_blank" rel="noopener">Ben Houston</a>.<br/><br/>
		Note: Every second sphere has an IBL environment map on it.</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			particleLight: null,
			loader: null,
        }
    },
    mounted() {
        this.loader = new this.$THREE.FontLoader()
        this.loader.load('static/fonts/gentilis_regular.typeface.json', (font) => {
            this.init(font)
            this.animate()
        })
    },
    methods: {
        init(font) {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsVariationsStandard-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 2500)
            this.camera.position.set(0.0, 400, 400 * 3.5)
            this.scene = new this.$THREE.Scene()
            var hdrCubeRenderTarget = null
            // Materials
            var imgTexture = new this.$THREE.TextureLoader().load("static/textures/planets/moon_1024.jpg")
            imgTexture.wrapS = imgTexture.wrapT = this.$THREE.RepeatWrapping
            imgTexture.anisotropy = 16
            imgTexture = null
            new RGBELoader()
                .setDataType(this.$THREE.UnsignedByteType)
                .setPath('static/textures/equirectangular/')
                .load('pedestrian_overpass_1k.hdr', (hdrEquirect) => {
                    hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect)
                    hdrEquirect.dispose()
                    pmremGenerator.dispose()
                    var bumpScale = 1
                    var cubeWidth = 400
                    var numberOfSphersPerSide = 5
                    var sphereRadius = (cubeWidth / numberOfSphersPerSide) * 0.8 * 0.5
                    var stepSize = 1.0 / numberOfSphersPerSide
                    var geometry = new this.$THREE.SphereBufferGeometry(sphereRadius, 32, 16)
                    var index = 0
                    for (var alpha = 0; alpha <= 1.0; alpha += stepSize) {
                        for (var beta = 0; beta <= 1.0; beta += stepSize) {
                            for (var gamma = 0; gamma <= 1.0; gamma += stepSize) {
                                // basic monochromatic energy preservation
                                var diffuseColor = new this.$THREE.Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1)
                                var material = new this.$THREE.MeshStandardMaterial({
                                    map: imgTexture,
                                    bumpMap: imgTexture,
                                    bumpScale: bumpScale,
                                    color: diffuseColor,
                                    metalness: beta,
                                    roughness: 1.0 - alpha,
                                    envMap: index % 2 === 0 ? null : hdrCubeRenderTarget.texture
                                })
                                index ++
                                var mesh = new this.$THREE.Mesh(geometry, material)
                                mesh.position.x = alpha * 400 - 200
                                mesh.position.y = beta * 400 - 200
                                mesh.position.z = gamma * 400 - 200
                                this.scene.add(mesh)
                            }
                        }
                        index ++
                    }
                    this.scene.background = hdrCubeRenderTarget.texture
                })
            var that = this
            function addLabel(name, location) {
                var textGeo = new that.$THREE.TextBufferGeometry(name, {
                    font: font,
                    size: 20,
                    height: 1,
                    curveSegments: 1
                })
                var textMaterial = new that.$THREE.MeshBasicMaterial({ color: 0xffffff })
                var textMesh = new that.$THREE.Mesh(textGeo, textMaterial)
                textMesh.position.copy(location)
                that.scene.add(textMesh)
            }
            addLabel("+roughness", new this.$THREE.Vector3(- 350, 0, 0))
            addLabel("-roughness", new this.$THREE.Vector3(350, 0, 0))
            addLabel("-metalness", new this.$THREE.Vector3(0, - 300, 0))
            addLabel("+metalness", new this.$THREE.Vector3(0, 300, 0))
            addLabel("-diffuse", new this.$THREE.Vector3(0, 0, - 300))
            addLabel("+diffuse", new this.$THREE.Vector3(0, 0, 300))
            this.particleLight = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(4, 8, 8), new this.$THREE.MeshBasicMaterial({ color: 0xffffff }))
            this.scene.add(this.particleLight)
            // Lights
            this.scene.add(new this.$THREE.AmbientLight(0x222222))
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 1)
            directionalLight.position.set(1, 1, 1).normalize()
            this.scene.add(directionalLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 2, 800)
            this.particleLight.add(pointLight)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 0.75
            //
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 200
            controls.maxDistance = 2000
            window.addEventListener('resize', this.onWindowResize, false)
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
            var timer = Date.now() * 0.00025
            //this.camera.position.x = Math.cos(timer) * 800
            //this.camera.position.z = Math.sin(timer) * 800
            this.camera.lookAt(this.scene.position)
            this.particleLight.position.x = Math.sin(timer * 7) * 300
            this.particleLight.position.y = Math.cos(timer * 5) * 400
            this.particleLight.position.z = Math.cos(timer * 3) * 300
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsVariationsStandard-container {
    position: relative;
    width: 100%;
}
</style>
