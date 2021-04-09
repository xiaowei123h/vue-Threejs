<template>
    <div class="webglLoaderMd2Control-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - MD2 Loader -
			Ogro by <a href="http://planetquake.gamespy.com/View.php?view=Quake2.Detail&id=556">Magarnigal</a><br />
			use arrows to control characters, mouse for camera
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { MD2CharacterComplex } from '@/components/jsm/misc/MD2CharacterComplex.js';
import { Gyroscope } from '@/components/jsm/misc/Gyroscope.js'
export default {
    data() {
        return {
            SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			characters: [],
			nCharacters: 0,
			cameraControls: null,
			controls: {
				moveForward: false,
				moveBackward: false,
				moveLeft: false,
				moveRight: false
			},
			clock: null,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = window.innerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderMd2Control-container')[0].appendChild(this.container)
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000)
            this.camera.position.set(0, 150, 1300)
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.scene.fog = new this.$THREE.Fog(0xffffff, 1000, 4000)
            this.scene.add(this.camera)
            // LIGHTS
            this.scene.add(new this.$THREE.AmbientLight(0x222222))
            var light = new this.$THREE.DirectionalLight(0xffffff, 2.25)
            light.position.set(200, 450, 500)
            light.castShadow = true
            light.shadow.mapSize.width = 1024
            light.shadow.mapSize.height = 512
            light.shadow.camera.near = 100
            light.shadow.camera.far = 1200
            light.shadow.camera.left = - 1000
            light.shadow.camera.right = 1000
            light.shadow.camera.top = 350
            light.shadow.camera.bottom = - 350
            this.scene.add(light)
            // this.scene.add(new this.$THREE.CameraHelper(light.shadow.camera));
            //  GROUND
            var gt = new this.$THREE.TextureLoader().load("static/textures/terrain/grasslight-big.jpg")
            var gg = new this.$THREE.PlaneBufferGeometry(16000, 16000)
            var gm = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, map: gt })
            var ground = new this.$THREE.Mesh(gg, gm)
            ground.rotation.x = - Math.PI / 2
            ground.material.map.repeat.set(64, 64)
            ground.material.map.wrapS = this.$THREE.RepeatWrapping
            ground.material.map.wrapT = this.$THREE.RepeatWrapping
            ground.material.map.encoding = this.$THREE.sRGBEncoding
            // note that because the ground does not cast a shadow, .castShadow is left false
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
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
            // STATS
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('keydown', this.onKeyDown, false)
            document.addEventListener('keyup', this.onKeyUp, false)
            // CONTROLS
            this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement)
            this.cameraControls.target.set(0, 50, 0)
            this.cameraControls.enableKeys = false
            this.cameraControls.update()
            // CHARACTER
            var configOgro = {
                baseUrl: "static/models/md2/ogro/",
                body: "ogro.md2",
                skins: [ "grok.jpg", "ogrobase.png", "arboshak.png", "ctf_r.png", "ctf_b.png", "darkam.png", "freedom.png",
                            "gib.png", "gordogh.png", "igdosh.png", "khorne.png", "nabogro.png",
                            "sharokh.png" ],
                weapons: [[ "weapon.md2", "weapon.jpg" ]],
                animations: {
                    move: "run",
                    idle: "stand",
                    jump: "jump",
                    attack: "attack",
                    crouchMove: "cwalk",
                    crouchIdle: "cstand",
                    crouchAttach: "crattack"
                },
                walkSpeed: 350,
                crouchSpeed: 175
            }
            var nRows = 1
            var nSkins = configOgro.skins.length
            this.nCharacters = nSkins * nRows
            for (var i = 0; i < this.nCharacters; i ++) {
                var character = new MD2CharacterComplex()
                character.scale = 3
                character.controls = this.controls
                this.characters.push(character)
            }
            var that = this
            var baseCharacter = new MD2CharacterComplex()
            baseCharacter.scale = 3
            baseCharacter.onLoadCompvare = function () {
                var k = 0
                for (var j = 0; j < nRows; j ++) {
                    for (var i = 0; i < nSkins; i ++) {
                        var cloneCharacter = that.characters[ k ]
                        cloneCharacter.shareParts(baseCharacter)
                        // cast and receive shadows
                        cloneCharacter.enableShadows(true)
                        cloneCharacter.setWeapon(0)
                        cloneCharacter.setSkin(i)
                        cloneCharacter.root.position.x = (i - nSkins / 2) * 150
                        cloneCharacter.root.position.z = j * 250
                        that.scene.add(cloneCharacter.root)
                        k ++
                    }
                }
                var gyro = new Gyroscope()
                gyro.add(that.camera)
                gyro.add(light, light.target)
                that.characters[ Math.floor(nSkins / 2) ].root.add(gyro)
            }
            console.log(configOgro)
            baseCharacter.loadParts(configOgro)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onKeyDown(event) {
            switch (event.keyCode) {
                case 38: /*up*/
                case 87: /*W*/ 	this.controls.moveForward = true; break
                case 40: /*down*/
                case 83: /*S*/ 	 this.controls.moveBackward = true; break
                case 37: /*left*/
                case 65: /*A*/ this.controls.moveLeft = true; break
                case 39: /*right*/
                case 68: /*D*/ this.controls.moveRight = true; break
                //case 67: /*C*/     controls.crouch = true; break;
                //case 32: /*space*/ controls.jump = true; break;
                //case 17: /*ctrl*/  controls.attack = true; break;
            }
        },
        onKeyUp(event) {
            switch (event.keyCode) {
                case 38: /*up*/
                case 87: /*W*/ this.controls.moveForward = false; break
                case 40: /*down*/
                case 83: /*S*/ 	 this.controls.moveBackward = false; break
                case 37: /*left*/
                case 65: /*A*/ 	 this.controls.moveLeft = false; break
                case 39: /*right*/
                case 68: /*D*/ this.controls.moveRight = false; break
                //case 67: /*C*/     controls.crouch = false; break;
                //case 32: /*space*/ controls.jump = false; break;
                //case 17: /*ctrl*/  controls.attack = false; break;
            }
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var delta = this.clock.getDelta()
            for (var i = 0; i < this.nCharacters; i ++) {
                this.characters[ i ].update(delta)
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderMd2Control-container {
    position: relative;
    width: 100%;
    background-color: #fff;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
