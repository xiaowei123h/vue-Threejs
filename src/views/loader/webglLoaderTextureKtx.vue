<template>
    <div class="webglLoaderTextureKtx-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl - compressed KTX textures<br />
            <a href="https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/">Khronos Texture</a> is a lightweight file format for OpenGL
        </div>
    </div>
</template>

<script>
import { KTXLoader } from '@/components/jsm/loaders/KTXLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
	        meshes: [],
        }
    },
    mounted() {
        this.init()
	    this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderTextureKtx-container')[0].appendChild(this.renderer.domElement)
            var formats = {
                astc: this.renderer.extensions.has('WEBGL_compressed_texture_astc'),
                etc1: this.renderer.extensions.has('WEBGL_compressed_texture_etc1'),
                s3tc: this.renderer.extensions.has('WEBGL_compressed_texture_s3tc'),
                pvrtc: this.renderer.extensions.has('WEBGL_compressed_texture_pvrtc')
            }
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.BoxBufferGeometry(200, 200, 200)
            var material1, material2
            // TODO: add cubemap support
            var loader = new KTXLoader()
            if (formats.pvrtc) {
                material1 = new this.$THREE.MeshBasicMaterial({
                    map: loader.load('static/textures/compressed/disturb_PVR2bpp.ktx')
                })
                material2 = new this.$THREE.MeshBasicMaterial({
                    map: loader.load('static/textures/compressed/lensflare_PVR4bpp.ktx'),
                    depthTest: false,
                    transparent: true,
                    side: this.$THREE.DoubleSide
                })
                this.meshes.push(new this.$THREE.Mesh(geometry, material1))
                this.meshes.push(new this.$THREE.Mesh(geometry, material2))
            }
            if (formats.s3tc) {
                material1 = new this.$THREE.MeshBasicMaterial({
                    map: loader.load('static/textures/compressed/disturb_BC1.ktx')
                })
                material2 = new this.$THREE.MeshBasicMaterial({
                    map: loader.load('static/textures/compressed/lensflare_BC3.ktx'),
                    depthTest: false,
                    transparent: true,
                    side: this.$THREE.DoubleSide
                })
                this.meshes.push(new this.$THREE.Mesh(geometry, material1))
                this.meshes.push(new this.$THREE.Mesh(geometry, material2))
            }
            if (formats.etc1) {
                material1 = new this.$THREE.MeshBasicMaterial({
                    map: loader.load('static/textures/compressed/disturb_ETC1.ktx')
                })
                this.meshes.push(new this.$THREE.Mesh(geometry, material1))
            }
            if (formats.astc) {
                material1 = new this.$THREE.MeshBasicMaterial({
                    map: loader.load('static/textures/compressed/disturb_ASTC4x4.ktx')
                })
                material2 = new this.$THREE.MeshBasicMaterial({
                    map: loader.load('static/textures/compressed/lensflare_ASTC8x8.ktx'),
                    depthTest: false,
                    transparent: true,
                    side: this.$THREE.DoubleSide
                })
                this.meshes.push(new this.$THREE.Mesh(geometry, material1))
                this.meshes.push(new this.$THREE.Mesh(geometry, material2))
            }
            var x = - this.meshes.length / 2 * 150
            for (var i = 0; i < this.meshes.length; ++ i, x += 300) {
                var mesh = this.meshes[ i ]
                mesh.position.x = x
                mesh.position.y = 0
                this.scene.add(mesh)
            }
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var time = Date.now() * 0.001
            for (var i = 0; i < this.meshes.length; i ++) {
                var mesh = this.meshes[ i ]
                mesh.rotation.x = time
                mesh.rotation.y = time
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderTextureKtx-container {
    width: 100%;
}
</style>
