<template>
    <div class="webxrVrVideo-container">
        <div id="container"></div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - 360 stereo video<br />
			stereoscopic panoramic render by <a href="http://pedrofe.com/rendering-for-oculus-rift-with-arnold/" target="_blank" rel="noopener">pedrofe</a>. scene from <a href="http://www.meryproject.com/" target="_blank" rel="noopener">mery project</a>.
		</div>

		<video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
			<source src="static/textures/MaryOculus.webm">
			<source src="static/textures/MaryOculus.mp4">
		</video>
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
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            container.addEventListener('click', () => {
                video.play()
            })
            this.camera = new this.$THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000)
            this.camera.layers.enable(1) // render left view when no stereo available
            // video
            var video = document.getElementById('video')
            video.play()
            var texture = new this.$THREE.Texture(video)
            setInterval(function () {
                if (video.readyState >= video.HAVE_CURRENT_DATA) {
                    texture.needsUpdate = true
                }
            }, 1000 / 24)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x101010)
            // left
            var geometry1 = new this.$THREE.SphereBufferGeometry(500, 60, 40)
            // invert the geometry on the x-axis so that all of the faces point inward
            geometry1.scale(- 1, 1, 1)
            var uvs1 = geometry1.attributes.uv.array
            for (var i = 0; i < uvs1.length; i += 2) {
                uvs1[ i ] *= 0.5
            }
            var material1 = new this.$THREE.MeshBasicMaterial({ map: texture })
            var mesh1 = new this.$THREE.Mesh(geometry1, material1)
            mesh1.rotation.y = - Math.PI / 2
            mesh1.layers.set(1) // display in left eye only
            this.scene.add(mesh1)
            // right
            var geometry2 = new this.$THREE.SphereBufferGeometry(500, 60, 40)
            geometry2.scale(- 1, 1, 1)
            var uvs2 = geometry2.attributes.uv.array
            for (var i = 0; i < uvs2.length; i += 2) {
                uvs2[ i ] *= 0.5
                uvs2[ i ] += 0.5
            }
            var material2 = new this.$THREE.MeshBasicMaterial({ map: texture })
            var mesh2 = new this.$THREE.Mesh(geometry2, material2)
            mesh2.rotation.y = - Math.PI / 2
            mesh2.layers.set(2) // display in right eye only
            this.scene.add(mesh2)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            this.renderer.xr.setReferenceSpaceType('local')
            container.appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrVideo-container')[0].appendChild(VRButton.createButton(this.renderer))
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrVideo-container {
    width: 100%;
}
</style>
