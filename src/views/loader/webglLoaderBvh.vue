<template>
    <div class="webglLoaderBvh-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - BVH Loader<br/>
			animation from <a href="http://mocap.cs.cmu.edu/">http://mocap.cs.cmu.edu/</a>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { BVHLoader } from '@/components/jsm/loaders/BVHLoader.js'
export default {
    data() {
        return {
            clock: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            mixer: null,
            skeletonHelper: null,
            loader: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
        this.loader = new BVHLoader()
        this.loader.load("static/models/bvh/pirouette.bvh", (result) => {
            this.skeletonHelper = new this.$THREE.SkeletonHelper(result.skeleton.bones[ 0 ])
            this.skeletonHelper.skeleton = result.skeleton // allow animation mixer to bind to this.$THREE.SkeletonHelper directly
            var boneContainer = new this.$THREE.Group()
            boneContainer.add(result.skeleton.bones[ 0 ])
            this.scene.add(this.skeletonHelper)
            this.scene.add(boneContainer)
            // play animation
            this.mixer = new this.$THREE.AnimationMixer(this.skeletonHelper)
            this.mixer.clipAction(result.clip).setEffectiveWeight(1.0).play()
        })
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 200, 300)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xeeeeee)
            this.scene.add(new this.$THREE.GridHelper(400, 10))
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoaderBvh-container')[0].appendChild(this.renderer.domElement)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 300
            this.controls.maxDistance = 700
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
.webglLoaderBvh-container {
    position: relative;
    width: 100%;
    background-color: #eee;
}
#info {		
    color: #444;
}
#info a {
    color: #08f;
}
</style>
