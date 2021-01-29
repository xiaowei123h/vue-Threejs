<template>
    <div class="webglLoaderMd2-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - MD2 Loader -
			Character by <a href="http://planetquake.gamespy.com/View.php?view=Quake2.Detail&id=368">Brian Collins</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { MD2Character } from '@/components/jsm/misc/MD2Character.js'
export default {
    data() {
        return {
            SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
            container: null,
            camera: null,
            scene: null,
            renderer: null,
			character: null,
			gui: null,
			playbackConfig: {
				speed: 1.0,
				wireframe: false
			},
			controls: null,
			clock: null,
			stats: null,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderMd2-container')[0].appendChild(this.container)
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 150, 400)
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.scene.fog = new this.$THREE.Fog(0x050505, 400, 1000)
            // LIGHTS
            this.scene.add(new this.$THREE.AmbientLight(0x222222))
            var light1 = new this.$THREE.SpotLight(0xffffff, 5, 1000)
            light1.position.set(200, 250, 500)
            light1.angle = 0.5
            light1.penumbra = 0.5
            light1.castShadow = true
            light1.shadow.mapSize.width = 1024
            light1.shadow.mapSize.height = 1024
            // this.scene.add(new this.$THREE.CameraHelper(light1.shadow.camera))
            this.scene.add(light1)
            var light2 = new this.$THREE.SpotLight(0xffffff, 5, 1000)
            light2.position.set(- 100, 350, 350)
            light2.angle = 0.5
            light2.penumbra = 0.5
            light2.castShadow = true
            light2.shadow.mapSize.width = 1024
            light2.shadow.mapSize.height = 1024
            // this.scene.add(new this.$THREE.CameraHelper(light2.shadow.camera))
            this.scene.add(light2)
            //  GROUND
            var gt = new this.$THREE.TextureLoader().load("static/textures/terrain/grasslight-big.jpg")
            var gg = new this.$THREE.PlaneBufferGeometry(2000, 2000)
            var gm = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, map: gt })
            var ground = new this.$THREE.Mesh(gg, gm)
            ground.rotation.x = - Math.PI / 2
            ground.material.map.repeat.set(8, 8)
            ground.material.map.wrapS = ground.material.map.wrapT = this.$THREE.RepeatWrapping
            ground.material.map.encoding = this.$THREE.sRGBEncoding
            ground.receiveShadow = true
            this.scene.add(ground)
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.container.appendChild(this.renderer.domElement)
            //
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            // STATS
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
            // CONTROLS
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.target.set(0, 50, 0)
            this.controls.update()
            // GUI
            this.gui = new GUI()
            this.gui.add(this.playbackConfig, 'speed', 0, 2).onChange(() => {
                this.character.setPlaybackRate(this.playbackConfig.speed)
            })
            this.gui.add(this.playbackConfig, 'wireframe', false).onChange(() => {
                this.character.setWireframe(this.playbackConfig.wireframe)
            })
            // CHARACTER
            var config = {
                baseUrl: "static/models/md2/ratamahatta/",
                body: "ratamahatta.md2",
                skins: [ "ratamahatta.png", "ctf_b.png", "ctf_r.png", "dead.png", "gearwhore.png" ],
                weapons: [[ "weapon.md2", "weapon.png" ],
                                [ "w_bfg.md2", "w_bfg.png" ],
                                [ "w_blaster.md2", "w_blaster.png" ],
                                [ "w_chaingun.md2", "w_chaingun.png" ],
                                [ "w_glauncher.md2", "w_glauncher.png" ],
                                [ "w_hyperblaster.md2", "w_hyperblaster.png" ],
                                [ "w_machinegun.md2", "w_machinegun.png" ],
                                [ "w_railgun.md2", "w_railgun.png" ],
                                [ "w_rlauncher.md2", "w_rlauncher.png" ],
                                [ "w_shotgun.md2", "w_shotgun.png" ],
                                [ "w_sshotgun.md2", "w_sshotgun.png" ]
                ]
            }
            this.character = new MD2Character()
            this.character.scale = 3
            this.character.onLoadComplete = () => {
                this.setupSkinsGUI(this.character)
                this.setupWeaponsGUI(this.character)
                this.setupGUIAnimations(this.character)
                this.character.setAnimation(this.character.meshBody.geometry.animations[ 0 ].name)
            }
            this.character.loadParts(config)
            this.scene.add(this.character.root)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        labelize(text) {
            var parts = text.split(".")
            if (parts.length > 1) {
                parts.length -= 1
                return parts.join(".")
            }
            return text
        },
        setupWeaponsGUI(character) {
            var folder = this.gui.addFolder("Weapons")
            var generateCallback = (index) => {
                return () => {
                    character.setWeapon(index)
                }
            }
            var guiItems = []
            for (var i = 0; i < character.weapons.length; i ++) {
                var name = character.weapons[ i ].name
                this.playbackConfig[ name ] = generateCallback(i)
                guiItems[ i ] = folder.add(this.playbackConfig, name).name(this.labelize(name))
            }
        },
        setupSkinsGUI(character) {
            var folder = this.gui.addFolder("Skins")
            var generateCallback = (index) => {
                return () => {
                    character.setSkin(index)
                }
            }
            var guiItems = []
            for (var i = 0; i < character.skinsBody.length; i ++) {
                var name = character.skinsBody[ i ].name;
                this.playbackConfig[ name ] = generateCallback(i);
                guiItems[ i ] = folder.add(this.playbackConfig, name).name(this.labelize(name));
            }
        },
        setupGUIAnimations(character) {
            var folder = this.gui.addFolder("Animations")
            var generateCallback = (animationClip) => {
                return () => {
                    character.setAnimation(animationClip.name)
                }
            }
            var guiItems = []
            var animations = character.meshBody.geometry.animations
            for (var i = 0; i < animations.length; i ++) {
                var clip = animations[ i ]
                this.playbackConfig[ clip.name ] = generateCallback(clip)
                guiItems[ i ] = folder.add(this.playbackConfig, clip.name, clip.name)
                i ++
            }
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var delta = this.clock.getDelta()
            this.character.update(delta)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderMd2-container {
    width: 100%;
}
</style>
