<template>
    <div class="webglLoaderTextureDds-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl - compressed textures<br/>
			leaf texture by <a href="http://opengameart.org/node/10505">lauris71</a>, explosion texture by <a href="http://opengameart.org/node/7728">bart</a>
		</div>
    </div>
</template>

<script>
import { DDSLoader } from '@/components/jsm/loaders/DDSLoader.js'
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
            /*
            This is how compressed textures are supposed to be used:
            DXT1 - RGB - opaque textures
            DXT3 - RGBA - transparent textures with sharp alpha transitions
            DXT5 - RGBA - transparent textures with full alpha range
            */
            var loader = new DDSLoader()
            var map1 = loader.load('static/textures/compressed/disturb_dxt1_nomip.dds')
            map1.minFilter = map1.magFilter = this.$THREE.LinearFilter
            map1.anisotropy = 4
            var map2 = loader.load('static/textures/compressed/disturb_dxt1_mip.dds')
            map2.anisotropy = 4
            var map3 = loader.load('static/textures/compressed/hepatica_dxt3_mip.dds')
            map3.anisotropy = 4
            var map4 = loader.load('static/textures/compressed/explosion_dxt5_mip.dds')
            map4.anisotropy = 4
            var map5 = loader.load('static/textures/compressed/disturb_argb_nomip.dds')
            map5.minFilter = map5.magFilter = this.$THREE.LinearFilter
            map5.anisotropy = 4
            var map6 = loader.load('static/textures/compressed/disturb_argb_mip.dds')
            map6.anisotropy = 4
            var cubemap1 = loader.load('static/textures/compressed/Mountains.dds', (texture) => {
                texture.magFilter = this.$THREE.LinearFilter
                texture.minFilter = this.$THREE.LinearFilter
                texture.mapping = this.$THREE.CubeReflectionMapping
                material1.needsUpdate = true
            })
            var cubemap2 = loader.load('static/textures/compressed/Mountains_argb_mip.dds', (texture) => {
                texture.magFilter = this.$THREE.LinearFilter
                texture.minFilter = this.$THREE.LinearFilter
                texture.mapping = this.$THREE.CubeReflectionMapping
                material5.needsUpdate = true
            })
            var cubemap3 = loader.load('static/textures/compressed/Mountains_argb_nomip.dds', (texture) => {
                texture.magFilter = this.$THREE.LinearFilter
                texture.minFilter = this.$THREE.LinearFilter
                texture.mapping = this.$THREE.CubeReflectionMapping
                material6.needsUpdate = true
            })
            var material1 = new this.$THREE.MeshBasicMaterial({ map: map1, envMap: cubemap1 })
            var material2 = new this.$THREE.MeshBasicMaterial({ map: map2 })
            var material3 = new this.$THREE.MeshBasicMaterial({ map: map3, alphaTest: 0.5, side: this.$THREE.DoubleSide })
            var material4 = new this.$THREE.MeshBasicMaterial({ map: map4, side: this.$THREE.DoubleSide, blending: this.$THREE.AdditiveBlending, depthTest: false, transparent: true })
            var material5 = new this.$THREE.MeshBasicMaterial({ envMap: cubemap2 })
            var material6 = new this.$THREE.MeshBasicMaterial({ envMap: cubemap3 })
            var material7 = new this.$THREE.MeshBasicMaterial({ map: map5 })
            var material8 = new this.$THREE.MeshBasicMaterial({ map: map6 })
            var mesh = new this.$THREE.Mesh(new this.$THREE.TorusBufferGeometry(100, 50, 32, 16), material1)
            mesh.position.x = - 600
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material2)
            mesh.position.x = - 200
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material3)
            mesh.position.x = - 200
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material4)
            mesh.position.x = - 600
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material5)
            mesh.position.x = 200
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material6)
            mesh.position.x = 200
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material7)
            mesh.position.x = 600
            mesh.position.y = - 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh = new this.$THREE.Mesh(geometry, material8)
            mesh.position.x = 600
            mesh.position.y = 200
            this.scene.add(mesh)
            this.meshes.push(mesh)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderTextureDds-container')[0].appendChild(this.renderer.domElement)
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
.webglLoaderTextureDds-container {
    width: 100%;
}
</style>
