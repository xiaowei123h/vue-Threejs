<template>
    <div class="webglMaterialsCubemapMipmaps-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - cubemap customized mipmaps demo. Author <a href="https://github.com/AngusLang" target="_blank">Angus</a><br/>
			Left: webgl generated mipmaps<br/>
			Right: manual mipmaps<br/>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { loadCubeTextureWithMipmaps } from '@/utils/webglMaterialsCubemapMipmaps.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
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
            document.getElementsByClassName('webglMaterialsCubemapMipmaps-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            loadCubeTextureWithMipmaps().then((cubeTexture) => {
                //model
                var sphere = new this.$THREE.SphereBufferGeometry(100, 128, 128)
                //manual mipmaps
                var material = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, envMap: cubeTexture })
                material.name = 'manual mipmaps'
                var mesh = new this.$THREE.Mesh(sphere, material)
                mesh.position.set(100, 0, 0)
                this.scene.add(mesh)
                //webgl mipmaps
                material = material.clone()
                material.name = 'auto mipmaps'
                var autoCubeTexture = cubeTexture.clone()
                autoCubeTexture.mipmaps = []
                autoCubeTexture.generateMipmaps = true
                autoCubeTexture.needsUpdate = true
                material.envMap = autoCubeTexture
                mesh = new this.$THREE.Mesh(sphere, material)
                mesh.position.set(- 100, 0, 0)
                this.scene.add(mesh)
            })
            //renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minPolarAngle = Math.PI / 4
            controls.maxPolarAngle = Math.PI / 1.5
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsCubemapMipmaps-container {
    width: 100%;
}
</style>
