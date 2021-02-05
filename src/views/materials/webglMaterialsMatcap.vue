<template>
    <div class="webglMaterialsMatcap-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl materials matcap<br />
			Drag-and-drop JPG, PNG, or EXR MatCap image files<br/>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { EXRLoader } from '@/components/jsm/loaders/EXRLoader.js'
export default {
    data() {
        return {
            mesh: null,
            renderer: null,
            scene: null,
            camera: null,
			API: {
				color: 0xffffff, // sRGB
				exposure: 1.0
            },
            gui: null,
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsMatcap-container')[0].appendChild(this.renderer.domElement)
            // tone mapping
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = this.API.exposure
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 100)
            this.camera.position.set(0, 0, 13)
            // controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            controls.enableZoom = false
            controls.enablePan = false
            // manager
            var manager = new this.$THREE.LoadingManager(this.render)
            // matcap
            var loaderEXR = new EXRLoader(manager)
                .setDataType(this.$THREE.UnsignedByteType) // default: FloatType
            var matcap = loaderEXR.load('static/textures/matcaps/040full.exr')
            // normalmap
            var loader = new this.$THREE.TextureLoader(manager)
            var normalmap = loader.load('static/models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg')
            // model
            new GLTFLoader(manager).load('static/models/gltf/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
                this.mesh = gltf.scene.children[ 0 ]
                this.mesh.position.y = - 0.25
                this.mesh.material = new this.$THREE.MeshMatcapMaterial({
                    color: new this.$THREE.Color().setHex(this.API.color).convertSRGBToLinear(),
                    matcap: matcap,
                    normalMap: normalmap
                })
                this.scene.add(this.mesh)
            })
            // gui
            this.gui = new GUI()
            this.gui.addColor(this.API, 'color')
                .listen()
                .onChange(() => {
                    this.mesh.material.color.set(this.API.color).convertSRGBToLinear()
                    this.render()
                })
            this.gui.add(this.API, 'exposure', 0, 2)
                .onChange(() => {
                    this.renderer.toneMappingExposure = this.API.exposure
                    this.render()
                })
            this.gui.domElement.style.webkitUserSelect = 'none'
            // drag 'n drop
            this.initDragAndDrop()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        },
        updateMatcap(texture) {
            if (this.mesh.material.matcap) {
                this.mesh.material.matcap.dispose()
            }
            this.mesh.material.matcap = texture
            this.texture.needsUpdate = true
            this.mesh.material.needsUpdate = true // because the encoding can change
            this.render()
        },
        handleJPG(event) { // PNG, too
            var that = this
            function imgCallback(event) {
                var texture = new this.$THREE.Texture(event.target)
                texture.encoding = this.$THREE.sRGBEncoding
                that.updateMatcap(texture)
            }
            var img = new Image()
            img.onload = imgCallback
            img.src = event.target.result
        },
        handleEXR(event) {
            var contents = event.target.result
            var loader = new EXRLoader()
            loader.setDataType(this.$THREE.UnsignedByteType) // default: FloatType
            var texData = loader.parse(contents)
            var texture = new this.$THREE.DataTexture()
            texture.image.width = texData.width
            texture.image.height = texData.height
            texture.image.data = texData.data
            texture.format = texData.format
            texture.type = texData.type
            switch (texture.type) {
                case this.$THREE.UnsignedByteType:
                    texture.encoding = this.$THREE.RGBEEncoding
                    texture.minFilter = this.$THREE.NearestFilter
                    texture.magFilter = this.$THREE.NearestFilter
                    texture.generateMipmaps = false
                    texture.flipY = false
                    break
                case this.$THREE.FloatType:
                case this.$THREE.HalfFloatType:
                    texture.encoding = this.$THREE.LinearEncoding
                    texture.minFilter = this.$THREE.LinearFilter
                    texture.magFilter = this.$THREE.LinearFilter
                    texture.generateMipmaps = false
                    texture.flipY = false
                    break
            }
            this.updateMatcap(texture)
        },
        loadFile(file) {
            var filename = file.name
            var extension = filename.split('.').pop().toLowerCase()
            if (extension === 'exr') {
                var reader = new FileReader()
                reader.addEventListener('load', (event) => {
                    handleEXR(event)
                }, false)
                reader.readAsArrayBuffer(file)
            } else { // 'jpg', 'png'
                var reader = new FileReader()
                reader.addEventListener('load', (event) => {
                    handleJPG(event)
                }, false)
                reader.readAsDataURL(file)
            }
        },
        initDragAndDrop() {
            document.addEventListener('dragover', (event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'copy'
            }, false)
            document.addEventListener('drop', (event) => {
                event.preventDefault()
                loadFile(event.dataTransfer.files[ 0 ])
            }, false)
        }
    },
}
</script>

<style scoped>
.webglMaterialsMatcap-container {
    width: 100%;
}
</style>
