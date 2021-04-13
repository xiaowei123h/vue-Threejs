<template>
    <div class="webglLoaderTextureKtx2-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl - KTX2 texture loader<br />
			<a href="http://github.khronos.org/KTX-Specification/" target="_blank" rel="noopener">KTX2</a> with
			<a href="https://github.com/binomialLLC/basis_universal" target="_blank">Basis Universal GPU Texture Codec</a>
		</div>
    </div>
</template>

<script>
import { KTX2Loader } from '@/components/jsm/loaders/KTX2Loader.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            width: null,
			height: null,
            renderer: null,
            scene: null,
            camera: null,
            controls: null,
            geometry: null,
            material: null,
            mesh: null,
            formatStrings: null,
        }
    },
    mounted() {
        this.width = this.$webglInnerWidth
        this.height = window.innerHeight
        this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(this.width, this.height)
        this.renderer.outputEncoding = this.$THREE.sRGBEncoding
        document.getElementsByClassName('webglLoaderTextureKtx2-container')[0].appendChild(this.renderer.domElement)
        this.scene = new this.$THREE.Scene()
        this.scene.background = new this.$THREE.Color(0x202020)
        this.camera = new this.$THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 100)
        this.camera.position.set(2, 1.5, 1)
        this.camera.lookAt(this.scene.position)
        this.scene.add(this.camera)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.autoRotate = true
        // PlaneBufferGeometry UVs assume flipY=true, which compressed textures don't support.
        this.geometry = this.flipY(new this.$THREE.PlaneBufferGeometry())
        this.material = new this.$THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            side: this.$THREE.DoubleSide
        })
        this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.mesh)
        this.formatStrings = {
            [ this.$THREE.RGBAFormat ]: "RGBA32",
            [ this.$THREE.RGBA_ASTC_4x4_Format ]: "RGBA_ASTC_4x4",
            [ this.$THREE.RGB_S3TC_DXT1_Format ]: "RGB_S3TC_DXT1",
            [ this.$THREE.RGBA_S3TC_DXT5_Format ]: "RGBA_S3TC_DXT5",
            [ this.$THREE.RGB_PVRTC_4BPPV1_Format ]: "RGB_PVRTC_4BPPV1",
            [ this.$THREE.RGBA_PVRTC_4BPPV1_Format ]: "RGBA_PVRTC_4BPPV1",
            [ this.$THREE.RGB_ETC1_Format ]: "RGB_ETC1",
            [ this.$THREE.RGB_ETC2_Format ]: "RGB_ETC2",
            [ this.$THREE.RGBA_ETC2_EAC_Format ]: "RGB_ETC2_EAC",
        }
        // Samples: sample_etc1s.ktx2, sample_uastc.ktx2
        new KTX2Loader()
            .detectSupport(this.renderer)
            .load('static/textures/compressed/sample_uastc.ktx2', (texture) => {
                console.info(`transcoded to ${this.formatStrings[ texture.format ]}`)
                this.material.map = texture
                this.material.transparent = true
                this.material.needsUpdate = true
            }, (p) => console.log(`...${p}`), (e) => console.error(e))
        this.animate()
        window.addEventListener('resize', () => {
            this.$onWindowResize(this.camera, this.renderer)
        }, false)
    },
    methods: {
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        },
        flipY(geometry) {
            var uv = geometry.attributes.uv
            for (var i = 0; i < uv.count; i ++) {
                uv.setY(i, 1 - uv.getY(i))
            }
            return geometry
        }
    }
}
</script>

<style scoped>
.webglLoaderTextureKtx2-container {
    position: relative;
    width: 100%;
}
</style>
