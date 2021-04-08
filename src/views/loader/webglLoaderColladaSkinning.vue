<template>
    <div class="webglLoaderColladaSkinning-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> collada loader - skinning<br/>
			Dancing Stormtrooper by <a href="https://sketchfab.com/strykerdoesgames" target="_blank" rel="noopener">StrykerDoesAnimation</a>: null,
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC Attribution</a>
		</div>
    </div>
</template>

<script>
import { ColladaLoader } from '@/components/jsm/loaders/ColladaLoader.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            clock: null,
            controls: null,
            camera: null,
            scene: null,
            renderer: null,
            mixer: null,
        }
    },
    mounted() {
        this.init();
		this.animate();
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$moduleTHREE.PerspectiveCamera(25, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(15, 10, - 15)
            this.scene = new this.$moduleTHREE.Scene()
            this.clock = new this.$moduleTHREE.Clock()
            // collada
            var loader = new ColladaLoader()
            loader.load('static/models/collada/stormtrooper/stormtrooper.dae', (collada) => {
                var animations = collada.animations
                var avatar = collada.scene
                avatar.traverse(function (node) {
                    if (node.isSkinnedMesh) {
                        node.frustumCulled = false
                    }
                })
                this.mixer = new this.$moduleTHREE.AnimationMixer(avatar)
                this.mixer.clipAction(animations[ 0 ]).play()
                this.scene.add(avatar)
            })
            //
            var gridHelper = new this.$moduleTHREE.GridHelper(10, 20, 0x888888, 0x444444)
            this.scene.add(gridHelper)
            //
            var ambientLight = new this.$moduleTHREE.AmbientLight(0xffffff, 0.2)
            this.scene.add(ambientLight)
            var pointLight = new this.$moduleTHREE.PointLight(0xffffff, 0.8)
            this.scene.add(this.camera)
            this.camera.add(pointLight)
            //
            this.renderer = new this.$moduleTHREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.screenSpacePanning = true
            this.controls.minDistance = 5
            this.controls.maxDistance = 40
            this.controls.target.set(0, 2, 0)
            this.controls.update()
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var delta = this.clock.getDelta()
            if (this.mixer !== null) {
                this.mixer.update(delta)
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderColladaSkinning-container {
    width: 100%;
}
</style>
