<template>
    <div class="webglShadowmap-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - shadowmap - models by <a href="https://mirada.com/" target="_blank" rel="noopener">mirada</a> from <a href="http://www.ro.me" target="_blank" rel="noopener">rome</a><br />
            move camera with WASD / RF + mouse<br />
            t: toggle HUD
		</div>
    </div>
</template>

<script>
import { FirstPersonControls } from '@/components/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { ShadowMapViewer } from '@/components/jsm/utils/ShadowMapViewer.js'
export default {
    data() {
        return {
            SHADOW_MAP_WIDTH: 2048,
            SHADOW_MAP_HEIGHT: 1024,
			SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
			FLOOR: - 250,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            container: null,
            stats: null,
            NEAR: 10,
            FAR: 3000,
			mixer: null,
			morphs: [],
			light: null,
			lightShadowMapViewer: null,
			clock: null,
			showHUD: false,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.clock = new this.$THREE.Clock()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglShadowmap-container')[0].appendChild(this.container)
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(23, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, this.NEAR, this.FAR)
            this.camera.position.set(700, 50, 1900)
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x59472b)
            this.scene.fog = new this.$THREE.Fog(0x59472b, 1000, this.FAR)
            // LIGHTS
            var ambient = new this.$THREE.AmbientLight(0x444444)
            this.scene.add(ambient)
            this.light = new this.$THREE.SpotLight(0xffffff, 1, 0, Math.PI / 5, 0.3)
            this.light.position.set(0, 1500, 1000)
            this.light.target.position.set(0, 0, 0)
            this.light.castShadow = true
            this.light.shadow.camera.near = 1200
            this.light.shadow.camera.far = 2500
            this.light.shadow.bias = 0.0001
            this.light.shadow.mapSize.width = this.SHADOW_MAP_WIDTH
            this.light.shadow.mapSize.height = this.SHADOW_MAP_HEIGHT
            this.scene.add(this.light)
            this.createHUD()
            this.createScene()
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.autoClear = false
            //
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFShadowMap
            // CONTROLS
            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)
            this.controls.lookSpeed = 0.0125
            this.controls.movementSpeed = 500
            this.controls.noFly = false
            this.controls.lookVertical = true
            this.controls.lookAt(this.scene.position)
            // STATS
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            //container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('keydown', this.onKeyDown, false)
        },
        onWindowResize() {
            this.SCREEN_WIDTH = window.innerWidth - 281
            this.SCREEN_HEIGHT = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.controls.handleResize()
        },
        onKeyDown(event) {
            switch (event.keyCode) {
                case 84:	/*t*/
                    this.showHUD = ! this.showHUD
                    break
            }
        },
        createHUD() {
            this.lightShadowMapViewer = new ShadowMapViewer(this.light)
            this.lightShadowMapViewer.position.x = 10
            this.lightShadowMapViewer.position.y = this.SCREEN_HEIGHT - (this.SHADOW_MAP_HEIGHT / 4) - 10
            this.lightShadowMapViewer.size.width = this.SHADOW_MAP_WIDTH / 4
            this.lightShadowMapViewer.size.height = this.SHADOW_MAP_HEIGHT / 4
            this.lightShadowMapViewer.update()
        },
        createScene() {
            // GROUND
            var geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            var planeMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xffb851 })
            var ground = new this.$THREE.Mesh(geometry, planeMaterial)
            ground.position.set(0, this.FLOOR, 0)
            ground.rotation.x = - Math.PI / 2
            ground.scale.set(100, 100, 100)
            ground.castShadow = false
            ground.receiveShadow = true
            this.scene.add(ground)
            // TEXT
            var loader = new this.$THREE.FontLoader()
            loader.load('static/fonts/helvetiker_bold.typeface.json', (font) => {
                var textGeo = new this.$THREE.TextBufferGeometry("this.$THREE.JS", {
                    font: font,
                    size: 200,
                    height: 50,
                    curveSegments: 12,
                    bevelThickness: 2,
                    bevelSize: 5,
                    bevelEnabled: true
                })
                textGeo.computeBoundingBox()
                var centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x)
                var textMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xffffff })
                var mesh = new this.$THREE.Mesh(textGeo, textMaterial)
                mesh.position.x = centerOffset
                mesh.position.y = this.FLOOR + 67
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
            })
            // CUBE
            var cubes1 = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(1500, 220, 150), planeMaterial)
            cubes1.position.y = this.FLOOR - 50
            cubes1.position.z = 20
            cubes1.castShadow = true
            cubes1.receiveShadow = true
            this.scene.add(cubes1)
            var cubes2 = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(1600, 170, 250), planeMaterial)
            cubes2.position.y = this.FLOOR - 50
            cubes2.position.z = 20
            cubes2.castShadow = true
            cubes2.receiveShadow = true
            this.scene.add(cubes2)
            // MORPHS
            this.mixer = new this.$THREE.AnimationMixer(this.scene)
            var that = this
            function addMorph(mesh, clip, speed, duration, x, y, z, fudgeColor) {
                mesh = mesh.clone()
                mesh.material = mesh.material.clone()
                if (fudgeColor) {
                    mesh.material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25)
                }
                mesh.speed = speed
                that.mixer.clipAction(clip, mesh).
                    setDuration(duration).
                // to shift the playback out of phase:
                    startAt(- duration * Math.random()).
                    play()
                mesh.position.set(x, y, z)
                mesh.rotation.y = Math.PI / 2
                mesh.castShadow = true
                mesh.receiveShadow = true
                that.scene.add(mesh)
                that.morphs.push(mesh)
            }
            var gltfloader = new GLTFLoader()
            gltfloader.load("static/models/gltf/Horse.glb", (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                var clip = gltf.animations[ 0 ]
                addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, this.FLOOR, 300, true)
                addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, this.FLOOR, 450, true)
                addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, this.FLOOR, 600, true)
                addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, this.FLOOR, - 300, true)
                addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, this.FLOOR, - 450, true)
                addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, this.FLOOR, - 600, true)
            })
            gltfloader.load("static/models/gltf/Flamingo.glb", (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                var clip = gltf.animations[ 0 ]
                addMorph(mesh, clip, 500, 1, 500 - Math.random() * 500, this.FLOOR + 350, 40)
            })
            gltfloader.load("static/models/gltf/Stork.glb", (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                var clip = gltf.animations[ 0 ]
                addMorph(mesh, clip, 350, 1, 500 - Math.random() * 500, this.FLOOR + 350, 340)
            })
            gltfloader.load("static/models/gltf/Parrot.glb", (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                var clip = gltf.animations[ 0 ]
                addMorph(mesh, clip, 450, 0.5, 500 - Math.random() * 500, this.FLOOR + 300, 700)
            })
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var delta = this.clock.getDelta()
            this.mixer.update(delta)
            for (var i = 0; i < this.morphs.length; i ++) {
                var morph = this.morphs[ i ]
                morph.position.x += morph.speed * delta
                if (morph.position.x > 2000) {
                    morph.position.x = - 1000 - Math.random() * 500
                }
            }
            this.controls.update(delta)
            this.renderer.clear()
            this.renderer.render(this.scene, this.camera)
            // Render debug HUD with shadow map
            if (this.showHUD) {
                this.lightShadowMapViewer.render(this.renderer)
            }
        }
    },
}
</script>

<style scoped>
.webglShadowmap-container {
    position: relative;
    width: 100%;
}
</style>
