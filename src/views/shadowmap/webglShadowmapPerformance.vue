<template>
    <div class="webglShadowmapPerformance-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - shadowmap - models by <a href="https://mirada.com/" target="_blank" rel="noopener">mirada</a> from <a href="http://www.ro.me" target="_blank" rel="noopener">rome</a><br />
            move camera with WASD / RF + mouse
		</div>
    </div>
</template>

<script>
import { FirstPersonControls } from '@/components/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            SHADOW_MAP_WIDTH: 2048,
            SHADOW_MAP_HEIGHT: 1024,
			SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
			FLOOR: - 250,
			ANIMATION_GROUPS: 25,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
			stats: null,
            NEAR: 5,
            FAR: 3000,
            morph: null,
            mixer: null,
            morphs: [],
            animGroups: [],
			clock: null,
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
            var container = document.createElement('div')
            document.getElementsByClassName('webglShadowmapPerformance-container')[0].appendChild(container)
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
            var light = new this.$THREE.SpotLight(0xffffff, 1, 0, Math.PI / 5, 0.3)
            light.position.set(0, 1500, 1000)
            light.target.position.set(0, 0, 0)
            light.castShadow = true
            light.shadow.camera.near = 1200
            light.shadow.camera.far = 2500
            light.shadow.bias = 0.0001
            light.shadow.mapSize.width = this.SHADOW_MAP_WIDTH
            light.shadow.mapSize.height = this.SHADOW_MAP_HEIGHT
            this.scene.add(light)
            this.createScene()
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.autoClear = false
            //
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
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
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.SCREEN_WIDTH = window.innerWidth - 281
            this.SCREEN_HEIGHT = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.controls.handleResize()
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
            // CUBES
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
            this.mixer = new this.$THREE.AnimationMixer(this.scene)
            for (var i = 0; i !== this.ANIMATION_GROUPS; ++ i) {
                var group = new this.$THREE.AnimationObjectGroup()
                this.animGroups.push(group)
            }
            // MORPHS
            var that = this
            function addMorph(mesh, clip, speed, duration, x, y, z, fudgeColor, massOptimization) {
                mesh = mesh.clone()
                mesh.material = mesh.material.clone()
                if (fudgeColor) {
                    mesh.material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25)
                }
                mesh.speed = speed
                if (massOptimization) {
                    var index = Math.floor(Math.random() * that.ANIMATION_GROUPS),
                        animGroup = that.animGroups[ index ]
                    animGroup.add(mesh)
                    if (! that.mixer.existingAction(clip, animGroup)) {
                        var randomness = 0.6 * Math.random() - 0.3
                        var phase = (index + randomness) / that.ANIMATION_GROUPS
                        that.mixer.clipAction(clip, animGroup).
                            setDuration(duration).
                            startAt(- duration * phase).
                            play()
                    }
                } else {
                    that.mixer.clipAction(clip, mesh).
                        setDuration(duration).
                        startAt(- duration * Math.random()).
                        play()
                }
                mesh.position.set(x, y, z)
                mesh.rotation.y = Math.PI / 2
                mesh.castShadow = true
                mesh.receiveShadow = true
                that.scene.add(mesh)
                that.morphs.push(mesh)
            }
            var gltfLoader = new GLTFLoader()
            gltfLoader.load("static/models/gltf/Horse.glb", (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                var clip = gltf.animations[ 0 ]
                for (var i = - 600; i < 601; i += 2) {
                    addMorph(mesh, clip, 550, 1, 100 - Math.random() * 3000, this.FLOOR, i, true, true)
                }
            })
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            var delta = this.clock.getDelta()
            if (this.mixer) this.mixer.update(delta)
            for (var i = 0; i < this.morphs.length; i ++) {
                this.morph = this.morphs[ i ]
                this.morph.position.x += this.morph.speed * delta
                if (this.morph.position.x > 2000) {
                    this.morph.position.x = - 1000 - Math.random() * 500
                }
            }
            this.controls.update(delta)
            this.renderer.clear()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglShadowmapPerformance-container {
    position: relative;
    width: 100%;
}
</style>
