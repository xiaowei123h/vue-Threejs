<template>
    <div class="webglMorphtargetsHorse-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - morph targets - horse<br/>
			model by <a href="https://mirada.com/" target="_blank" rel="noopener">mirada</a> from <a href="http://www.ro.me" target="_blank" rel="noopener">rome</a>
		</div>
    </div>
</template>

<script>
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,renderer: null,
            mesh: null,
            mixer: null,
			radius: 600,
			theta: 0,
			prevTime: Date.now(),
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMorphtargetsHorse-container')[0].appendChild(this.container)
            //
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.y = 300
            this.camera.target = new this.$THREE.Vector3(0, 150, 0)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            //
            var light1 = new this.$THREE.DirectionalLight(0xefefff, 1.5)
            light1.position.set(1, 1, 1).normalize()
            this.scene.add(light1)
            var light2 = new this.$THREE.DirectionalLight(0xffefef, 1.5)
            light2.position.set(- 1, - 1, - 1).normalize()
            this.scene.add(light2)
            var loader = new GLTFLoader()
            loader.load("static/models/gltf/Horse.glb", (gltf) => {
                this.mesh = gltf.scene.children[ 0 ]
                this.mesh.scale.set(1.5, 1.5, 1.5)
                this.scene.add(this.mesh)
                this.mixer = new this.$THREE.AnimationMixer(this.mesh)
                this.mixer.clipAction(gltf.animations[ 0 ]).setDuration(1).play()
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.theta += 0.1
            this.camera.position.x = this.radius * Math.sin(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.position.z = this.radius * Math.cos(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.lookAt(this.camera.target)
            if (this.mixer) {
                var time = Date.now()
                this.mixer.update((time - this.prevTime) * 0.001)
                this.prevTime = time
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMorphtargetsHorse-container {
    position: relative;
    width: 100%;
    background-color: #f0f0f0;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
