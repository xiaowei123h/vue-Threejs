<template>
    <div class="webglLoaderTexturePvrtc-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl - PVR compressed textures
		</div>
    </div>
</template>

<script>
import { PVRLoader } from '@/components/jsm/loaders/PVRLoader.js'
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
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.BoxBufferGeometry(200, 200, 200)
            //
            var that = this
            var onCube1Loaded = function (texture) {
                texture.magFilter = that.$THREE.LinearFilter
                texture.minFilter = that.$THREE.LinearFilter
                texture.mapping = that.$THREE.CubeReflectionMapping
                material6.needsUpdate = true
            }
            var onCube2Loaded = function (texture) {
                texture.magFilter = that.$THREE.LinearFilter
                // texture.minFilter = LinearMipmapNearestFilter
                texture.minFilter = that.$THREE.LinearFilter
                texture.mapping = that.$THREE.CubeReflectionMapping
                material8.needsUpdate = true
            }
            //
            var loader = new PVRLoader()
            var disturb_4bpp_rgb = loader.load('static/textures/compressed/disturb_4bpp_rgb.pvr')
            var disturb_4bpp_rgb_v3 = loader.load('static/textures/compressed/disturb_4bpp_rgb_v3.pvr')
            var disturb_4bpp_rgb_mips = loader.load('static/textures/compressed/disturb_4bpp_rgb_mips.pvr')
            var disturb_2bpp_rgb = loader.load('static/textures/compressed/disturb_2bpp_rgb.pvr')
            var flare_4bpp_rgba = loader.load('static/textures/compressed/flare_4bpp_rgba.pvr')
            var flare_2bpp_rgba = loader.load('static/textures/compressed/flare_2bpp_rgba.pvr')
            var park3_cube_nomip_4bpp_rgb = loader.load('static/textures/compressed/park3_cube_nomip_4bpp_rgb.pvr', onCube1Loaded)
            var park3_cube_mip_2bpp_rgb_v3 = loader.load('static/textures/compressed/park3_cube_mip_2bpp_rgb_v3.pvr', onCube2Loaded)
            disturb_2bpp_rgb.minFilter =
            disturb_2bpp_rgb.magFilter =
            flare_4bpp_rgba.minFilter =
            flare_4bpp_rgba.magFilter =
            disturb_4bpp_rgb.minFilter =
            disturb_4bpp_rgb.magFilter =
            disturb_4bpp_rgb_v3.minFilter =
            disturb_4bpp_rgb_v3.magFilter =
            flare_2bpp_rgba.minFilter =
            flare_2bpp_rgba.magFilter = this.$THREE.LinearFilter
            var material1 = new this.$THREE.MeshBasicMaterial({ map: disturb_4bpp_rgb })
            var material2 = new this.$THREE.MeshBasicMaterial({ map: disturb_4bpp_rgb_mips })
            var material3 = new this.$THREE.MeshBasicMaterial({ map: disturb_2bpp_rgb })
            var material4 = new this.$THREE.MeshBasicMaterial({ map: flare_4bpp_rgba, side: this.$THREE.DoubleSide, depthTest: false, transparent: true })
            var material5 = new this.$THREE.MeshBasicMaterial({ map: flare_2bpp_rgba, side: this.$THREE.DoubleSide, depthTest: false, transparent: true })
            var material6 = new this.$THREE.MeshBasicMaterial({ envMap: park3_cube_nomip_4bpp_rgb })
            var material8 = new this.$THREE.MeshBasicMaterial({ envMap: park3_cube_mip_2bpp_rgb_v3 })
            var material7 = new this.$THREE.MeshBasicMaterial({ map: disturb_4bpp_rgb_v3 })
            //
            var mesh = new this.$THREE.Mesh(geometry, material1)
            mesh.position.x = - 500
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material2)
            mesh.position.x = - 166
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material3)
            mesh.position.x = 166
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material7)
            mesh.position.x = 500
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material4)
            mesh.position.x = - 500
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material5)
            mesh.position.x = - 166
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            var torus = new this.$THREE.TorusBufferGeometry(100, 50, 32, 24)
            mesh = new this.$THREE.Mesh(torus, material6)
            mesh.position.x = 166
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(torus, material8)
            mesh.position.x = 500
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderTexturePvrtc-container')[0].appendChild(this.renderer.domElement)
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
    },
}
</script>

<style scoped>
.webglLoaderTexturePvrtc-container {
    position: relative;
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
