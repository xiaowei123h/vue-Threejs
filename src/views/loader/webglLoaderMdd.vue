<template>
    <div class="webglLoaderMdd-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - MDDLoader
		</div>
    </div>
</template>

<script>
import { MDDLoader } from '@/components/jsm/loaders/MDDLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            mixer: null,
            clock: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(8, 8, 8)
            this.camera.lookAt(this.scene.position)
            this.clock = new this.$THREE.Clock()
            //
            var loader = new MDDLoader()
            loader.load('static/models/mdd/cube.mdd', (result) => {
                var morphTargets = result.morphTargets
                var clip = result.clip
                // clip.optimize() // optional
                var geometry = new this.$THREE.BoxBufferGeometry()
                geometry.morphAttributes.position = morphTargets // apply morph targets
                var material = new this.$THREE.MeshNormalMaterial({ morphTargets: true })
                var mesh = new this.$THREE.Mesh(geometry, material)
                this.scene.add(mesh)
                this.mixer = new this.$THREE.AnimationMixer(mesh)
                this.mixer.clipAction(clip).play() // use clip
                this.animate()
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderMdd-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            if (this.mixer) this.mixer.update(delta)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderMdd-container {
    width: 100%;
}
</style>
