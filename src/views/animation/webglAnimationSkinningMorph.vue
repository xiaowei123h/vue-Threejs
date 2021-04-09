<template>
    <div class="webglAnimationSkinningMorph-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - skinning and morphing<br />
			<p>
				The animation system allows clips to be played individually, looped, or crossfaded with other clips. This example shows a character looping in one of several base animation states, then transitioning smoothly to one-time actions. Facial expressions are controlled independently with morph targets.
			</p>
			Model by
			<a href="https://www.patreon.com/quaternius" target="_blank" rel="noopener">Tomás Laulhé</a>,
			modifications by <a href="https://donmccurdy.com/" target="_blank" rel="noopener">Don McCurdy</a>. CC0.<br />
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            clock: null,
            gui: null,
            mixer: null,
            actions: null,
            activeAction: null,
            previousAction: null,
            camera: null,
            scene: null,
            renderer: null,
            model: null,
            face: null,
            api: {
                state: 'Walking'
            }
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglAnimationSkinningMorph-container')[0].appendChild(this.container)
            // document.body.appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.25, 100)
            this.camera.position.set(- 5, 3, 10)
            this.camera.lookAt(new this.$THREE.Vector3(0, 2, 0))
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xe0e0e0)
            this.scene.fog = new this.$THREE.Fog(0xe0e0e0, 20, 100)
            this.clock = new this.$THREE.Clock()
            // lights
            const hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 20, 0)
            this.scene.add(hemiLight)
            const dirLight = new this.$THREE.DirectionalLight(0xffffff)
            dirLight.position.set(0, 20, 10)
            this.scene.add(dirLight)
            // ground
            const mesh = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(2000, 2000), new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
            mesh.rotation.x = - Math.PI / 2
            this.scene.add(mesh)
            const grid = new this.$THREE.GridHelper(200, 40, 0x000000, 0x000000)
            grid.material.opacity = 0.2
            grid.material.transparent = true
            this.scene.add(grid)
            // model
            const loader = new GLTFLoader()
            var that = this
            loader.load('static/models/gltf/RobotExpressive/RobotExpressive.glb', (gltf) => {
                that.model = gltf.scene
                that.scene.add(that.model)
                that.createGUI(that.model, gltf.animations)
            }, undefined, (e) => {
                console.error(e)
            })
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
            // stats
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        createGUI(model, animations) {
            var states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
            var emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']
            this.gui = new GUI()
            this.mixer = new this.$THREE.AnimationMixer(this.model)
            this.actions = {}
            for (var i = 0; i < animations.length; i ++) {
                var clip = animations[i]
                var action = this.mixer.clipAction(clip)
                this.actions[clip.name] = action
                if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
                    action.clampWhenFinished = true
                    action.loop = this.$THREE.LoopOnce
                }
            }
            // states
            var statesFolder = this.gui.addFolder('States')
            var clipCtrl = statesFolder.add(this.api, 'state').options(states)
            clipCtrl.onChange(() => {
                this.fadeToAction(this.api.state, 0.5)
            })
            statesFolder.open()
            // emotes
            var that = this
            var emoteFolder = this.gui.addFolder('Emotes')
            function createEmoteCallback(name) {
                that.api[name] = function () {
                    that.fadeToAction(name, 0.2)
                    that.mixer.addEventListener('finished', restoreState)
                }
                emoteFolder.add(that.api, name)
            }
            function restoreState() {
                that.mixer.removeEventListener('finished', restoreState)
                that.fadeToAction(that.api.state, 0.2)
            }
            for (var i = 0; i < emotes.length; i ++) {
                createEmoteCallback(emotes[i])
            }
            emoteFolder.open()
            // expressions
            this.face = this.model.getObjectByName('Head_4')
            var expressions = Object.keys(this.face.morphTargetDictionary)
            var expressionFolder = this.gui.addFolder('Expressions')
            for (var i = 0; i < expressions.length; i ++) {
                expressionFolder.add(this.face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i])
            }
            this.activeAction = this.actions['Walking']
            this.activeAction.play()
            expressionFolder.open()
        },
        animate() {
            var dt = this.clock.getDelta()
            if (this.mixer) this.mixer.update(dt)
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        },
        fadeToAction(name, duration) {
            this.previousAction = this.activeAction
            this.activeAction = this.actions[name]
            if (this.previousAction !== this.activeAction) {
                this.previousAction.fadeOut(duration)
            }
            this.activeAction
                .reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(duration)
                .play()
        }
    }
}
</script>

<style scoped>
.webglAnimationSkinningMorph-container {
    position: relative;
    width: 100%;
    color: #222;
}
#info a {
    color: #2fa1d6;
}
#info p {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 2em;
}
#info {
    margin-left: -280px;
}
</style>
