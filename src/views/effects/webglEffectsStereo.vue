<template>
    <div class="webglEffectsStereo-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - effects - stereo. skybox by <a href="http://www.zfight.com/" target="_blank" rel="noopener">Jochum Skoglund</a>
		</div>
    </div>
</template>

<script>
import { StereoEffect } from '@/components/jsm/effects/StereoEffect.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            effect: null,
			spheres: [],
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.windowHalfX = window.innerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglEffectsStereo-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000)
            this.camera.position.z = 3200
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.CubeTextureLoader()
                .setPath('static/textures/cube/Park3Med/')
                .load([ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ])
            var geometry = new this.$THREE.SphereBufferGeometry(100, 32, 16)
            var textureCube = new this.$THREE.CubeTextureLoader()
                .setPath('static/textures/cube/Park3Med/')
                .load([ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ])
            textureCube.mapping = this.$THREE.CubeRefractionMapping
            var material = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 })
            for (var i = 0; i < 500; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 10000 - 5000
                mesh.position.y = Math.random() * 10000 - 5000
                mesh.position.z = Math.random() * 10000 - 5000
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1
                this.scene.add(mesh)
                this.spheres.push(mesh)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.container.appendChild(this.renderer.domElement)
            this.effect = new StereoEffect(this.renderer)
            this.effect.setSize(this.$webglInnerWidth, window.innerHeight)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.windowHalfX = (window.innerWidth - x) / 2
            this.windowHalfY = window.innerHeight / 2
            this.camera.aspect = (window.innerWidth - x) / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.effect.setSize((window.innerWidth - x), window.innerHeight)
        },
        onDocumentMouseMove(event) {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.mouseX = (event.clientX - x - this.windowHalfX) * 10
            this.mouseY = (event.clientY - this.windowHalfY) * 10
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var timer = 0.0001 * Date.now()
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            for (var i = 0, il = this.spheres.length; i < il; i ++) {
                var sphere = this.spheres[ i ]
                sphere.position.x = 5000 * Math.cos(timer + i)
                sphere.position.y = 5000 * Math.sin(timer + i * 1.1)
            }
            this.effect.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglEffectsStereo-container {
    position: relative;
    width: 100%;
}
</style>
