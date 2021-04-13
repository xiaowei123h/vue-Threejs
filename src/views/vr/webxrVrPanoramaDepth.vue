<template>
    <div class="webxrVrPanoramaDepth-container">
        <div id="container"></div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - panorama with depth<br />
			Created by <a href="https://orfleisher.com" target="_blank" rel="noopener">@juniorxsound</a>. Panorama from <a href="https://krpano.com/examples/?depthmap" target="_blank" rel="noopener">krpano</a>.
		</div>
    </div>
</template>

<script>
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            sphere: null,
            clock: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.clock = new this.$THREE.Clock()
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x101010)
            var light = new this.$THREE.AmbientLight(0xffffff, 1)
            this.scene.add(light)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.scene.add(this.camera)
            // Create the panoramic sphere geometery
            var panoSphereGeo = new this.$THREE.SphereBufferGeometry(6, 256, 256)
            // Create the panoramic sphere material
            var panoSphereMat = new this.$THREE.MeshStandardMaterial({
                side: this.$THREE.BackSide,
                displacementScale: - 4.0
            })
            // Create the panoramic sphere mesh
            this.sphere = new this.$THREE.Mesh(panoSphereGeo, panoSphereMat)
            // Load and assign the texture and depth map
            var manager = new this.$THREE.LoadingManager()
            var loader = new this.$THREE.TextureLoader(manager)
            loader.load('static/textures/kandao3.jpg', (texture) => {
                texture.minFilter = this.$THREE.NearestFilter
                texture.generateMipmaps = false
                this.sphere.material.map = texture
            })
            loader.load('static/textures/kandao3_depthmap.jpg', (depth) => {
                depth.minFilter = this.$THREE.NearestFilter
                depth.generateMipmaps = false
                this.sphere.material.displacementMap = depth
            })
            // On load complete add the panoramic this.sphere to the this.scene
            manager.onLoad = () => {
                this.scene.add(this.sphere)
            }
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            this.renderer.xr.setReferenceSpaceType('local')
            container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrPanoramaDepth-container')[0].appendChild(VRButton.createButton(this.renderer))
            //
            window.addEventListener('resize', this.onWindowResize, false)
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrPanoramaDepth-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrPanoramaDepth-container')[0].style.height = 'calc(100vh - 49px)'
            }
        },
        onWindowResize() {
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrPanoramaDepth-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrPanoramaDepth-container')[0].style.height = 'calc(100vh - 49px)'
            }
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            // If we are not presenting move the this.camera a little so the effect is visible
            if (this.renderer.xr.isPresenting === false) {
                var time = this.clock.getElapsedTime()
                this.sphere.rotation.y += 0.001
                this.sphere.position.x = Math.sin(time) * 0.2
                this.sphere.position.z = Math.cos(time) * 0.2
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrPanoramaDepth-container {
    position: relative;
    width: 100%;
}
</style>
