<template>
    <div class="webglLightsPointlights-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - point lights WebGL demo.<br />
			Walt Disney head by <a href="http://davidoreilly.com/post/18087489343/disneyhead" target="_blank" rel="noopener">David OReilly</a>
		</div>
    </div>
</template>

<script>
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            light1: null,
            light2: null,
            light3: null,
            light4: null,
            object: null,
            stats: null,
			clock: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 100
            this.scene = new this.$THREE.Scene()
            //model
            var loader = new OBJLoader()
            loader.load('static/models/obj/walt/WaltHead.obj', (obj) => {
                this.object = obj
                this.object.scale.multiplyScalar(0.8)
                this.object.position.y = - 30
                this.scene.add(this.object)
            })
            var sphere = new this.$THREE.SphereBufferGeometry(0.5, 16, 8)
            //lights
            this.light1 = new this.$THREE.PointLight(0xff0040, 2, 50)
            this.light1.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: 0xff0040 })))
            this.scene.add(this.light1)
            this.light2 = new this.$THREE.PointLight(0x0040ff, 2, 50)
            this.light2.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: 0x0040ff })))
            this.scene.add(this.light2)
            this.light3 = new this.$THREE.PointLight(0x80ff80, 2, 50)
            this.light3.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: 0x80ff80 })))
            this.scene.add(this.light3)
            this.light4 = new this.$THREE.PointLight(0xffaa00, 2, 50)
            this.light4.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: 0xffaa00 })))
            this.scene.add(this.light4)
            //renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLightsPointlights-container')[0].appendChild(this.renderer.domElement)
            //stats
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglLightsPointlights-container')[0].appendChild(this.stats.dom)
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
            var time = Date.now() * 0.0005
            var delta = this.clock.getDelta()
            if (this.object) this.object.rotation.y -= 0.5 * delta
            this.light1.position.x = Math.sin(time * 0.7) * 30
            this.light1.position.y = Math.cos(time * 0.5) * 40
            this.light1.position.z = Math.cos(time * 0.3) * 30
            this.light2.position.x = Math.cos(time * 0.3) * 30
            this.light2.position.y = Math.sin(time * 0.5) * 40
            this.light2.position.z = Math.sin(time * 0.7) * 30
            this.light3.position.x = Math.sin(time * 0.7) * 30
            this.light3.position.y = Math.cos(time * 0.3) * 40
            this.light3.position.z = Math.sin(time * 0.5) * 30
            this.light4.position.x = Math.sin(time * 0.3) * 30
            this.light4.position.y = Math.cos(time * 0.7) * 40
            this.light4.position.z = Math.sin(time * 0.5) * 30
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLightsPointlights-container {
    position: relative;
    width: 100%;
}
</style>
