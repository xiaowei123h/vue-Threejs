<template>
    <div class="webglLensflares-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - lensflares<br/>
			textures from <a href="http://www.ro.me" target="_blank" rel="noopener">ro.me</a><br/>
			fly with WASD/RF/QE + mouse
		</div>
    </div>
</template>

<script>
import { FlyControls } from '@/components/jsm/controls/FlyControls.js'
import { Lensflare, LensflareElement } from '@/components/jsm/objects/Lensflare.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
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
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLensflares-container')[0].appendChild(this.container)
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 15000)
            this.camera.position.z = 250
            // scene
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color().setHSL(0.51, 0.4, 0.01)
            this.scene.fog = new this.$THREE.Fog(this.scene.background, 3500, 15000)
            // world
            var s = 250
            var geometry = new this.$THREE.BoxBufferGeometry(s, s, s)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 50 })
            for (var i = 0; i < 3000; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = 8000 * (2.0 * Math.random() - 1.0)
                mesh.position.y = 8000 * (2.0 * Math.random() - 1.0)
                mesh.position.z = 8000 * (2.0 * Math.random() - 1.0)
                mesh.rotation.x = Math.random() * Math.PI
                mesh.rotation.y = Math.random() * Math.PI
                mesh.rotation.z = Math.random() * Math.PI
                mesh.matrixAutoUpdate = false
                mesh.updateMatrix()
                this.scene.add(mesh)
            }
            // lights
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.05)
            dirLight.position.set(0, - 1, 0).normalize()
            dirLight.color.setHSL(0.1, 0.7, 0.5)
            this.scene.add(dirLight)
            // lensflares
            var textureLoader = new this.$THREE.TextureLoader()
            var textureFlare0 = textureLoader.load('static/textures/lensflare/lensflare0.png')
            var textureFlare3 = textureLoader.load('static/textures/lensflare/lensflare3.png')
            addLight(0.55, 0.9, 0.5, 5000, 0, - 1000)
            addLight(0.08, 0.8, 0.5, 0, 0, - 1000)
            addLight(0.995, 0.5, 0.9, 5000, 5000, - 1000)
            var that = this
            function addLight(h, s, l, x, y, z) {
                var light = new that.$THREE.PointLight(0xffffff, 1.5, 2000)
                light.color.setHSL(h, s, l)
                light.position.set(x, y, z)
                that.scene.add(light)
                var lensflare = new Lensflare()
                lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, light.color))
                lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6))
                lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7))
                lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9))
                lensflare.addElement(new LensflareElement(textureFlare3, 70, 1))
                light.add(lensflare)
            }
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            //
            this.controls = new FlyControls(this.camera, this.renderer.domElement)
            this.controls.movementSpeed = 2500
            this.controls.domElement = this.container
            this.controls.rollSpeed = Math.PI / 6
            this.controls.autoForward = false
            this.controls.dragToLook = false
            // stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            // events
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
            this.controls.update(delta)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLensflares-container {
    width: 100%;
}
</style>
