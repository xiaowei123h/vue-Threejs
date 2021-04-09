<template>
    <div class="webglLightsPointlights2-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - point lights WebGL demo
		</div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            light1: null,
            light2: null,
            light3: null,
            light4: null,
            light5: null,
            light6: null,
			clock: null,
			stats: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 300)
            this.camera.position.set(0, 15, 150)
            this.camera.lookAt(0, 0, 0)
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x040306)
            this.scene.fog = new this.$THREE.Fog(0x040306, 10, 300)
            // TEXTURES
            var textureLoader = new this.$THREE.TextureLoader()
            var texture = textureLoader.load("static/textures/disturb.jpg")
            texture.repeat.set(20, 10)
            texture.wrapS = texture.wrapT = this.$THREE.RepeatWrapping
            texture.encoding = this.$THREE.sRGBEncoding
            // MATERIALS
            var groundMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, map: texture })
            var objectMaterial = new this.$THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 1.0 })
            // GROUND
            var mesh = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(800, 400, 2, 2), groundMaterial)
            mesh.position.y = - 5
            mesh.rotation.x = - Math.PI / 2
            this.scene.add(mesh)
            // OBJECTS
            var objectGeometry = new this.$THREE.TorusBufferGeometry(1.5, 0.4, 8, 16)
            for (var i = 0; i < 5000; i ++) {
                var mesh = new this.$THREE.Mesh(objectGeometry, objectMaterial)
                mesh.position.x = 400 * (0.5 - Math.random())
                mesh.position.y = 50 * (0.5 - Math.random()) + 25
                mesh.position.z = 200 * (0.5 - Math.random())
                mesh.rotation.y = 3.14 * (0.5 - Math.random())
                mesh.rotation.x = 3.14 * (0.5 - Math.random())
                mesh.matrixAutoUpdate = false
                mesh.updateMatrix()
                this.scene.add(mesh)
            }
            // LIGHTS
            var intensity = 2.5
            var distance = 100
            var decay = 2.0
            var c1 = 0xff0040, c2 = 0x0040ff, c3 = 0x80ff80, c4 = 0xffaa00, c5 = 0x00ffaa, c6 = 0xff1100
            var sphere = new this.$THREE.SphereBufferGeometry(0.25, 16, 8)
            this.light1 = new this.$THREE.PointLight(c1, intensity, distance, decay)
            this.light1.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: c1 })))
            this.scene.add(this.light1)
            this.light2 = new this.$THREE.PointLight(c2, intensity, distance, decay)
            this.light2.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: c2 })))
            this.scene.add(this.light2)
            this.light3 = new this.$THREE.PointLight(c3, intensity, distance, decay)
            this.light3.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: c3 })))
            this.scene.add(this.light3)
            this.light4 = new this.$THREE.PointLight(c4, intensity, distance, decay)
            this.light4.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: c4 })))
            this.scene.add(this.light4)
            this.light5 = new this.$THREE.PointLight(c5, intensity, distance, decay)
            this.light5.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: c5 })))
            this.scene.add(this.light5)
            this.light6 = new this.$THREE.PointLight(c6, intensity, distance, decay)
            this.light6.add(new this.$THREE.Mesh(sphere, new this.$THREE.MeshBasicMaterial({ color: c6 })))
            this.scene.add(this.light6)
            var dlight = new this.$THREE.DirectionalLight(0xffffff, 0.05)
            dlight.position.set(0.5, 1, 0).normalize()
            this.scene.add(dlight)
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            // CONTROLS
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.rotateSpeed = 1.0
            this.controls.zoomSpeed = 1.2
            this.controls.panSpeed = 0.8
            this.controls.dynamicDampingFactor = 0.15
            this.controls.keys = [ 65, 83, 68 ]
            // STATS
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.controls.handleResize()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.00025
            var d = 150
            this.light1.position.x = Math.sin(time * 0.7) * d
            this.light1.position.z = Math.cos(time * 0.3) * d
            this.light2.position.x = Math.cos(time * 0.3) * d
            this.light2.position.z = Math.sin(time * 0.7) * d
            this.light3.position.x = Math.sin(time * 0.7) * d
            this.light3.position.z = Math.sin(time * 0.5) * d
            this.light4.position.x = Math.sin(time * 0.3) * d
            this.light4.position.z = Math.sin(time * 0.5) * d
            this.light5.position.x = Math.cos(time * 0.3) * d
            this.light5.position.z = Math.sin(time * 0.5) * d
            this.light6.position.x = Math.cos(time * 0.7) * d
            this.light6.position.z = Math.cos(time * 0.5) * d
            this.controls.update(this.clock.getDelta())
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLightsPointlights2-container {
    position: relative;
    width: 100%;
}
</style>
