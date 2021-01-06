<template>
    <div class="webglAnimationSkinningAdditiveBlending-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Skeletal Additive Animation Blending
			(model from <a href="https://www.mixamo.com/" target="_blank" rel="noopener">mixamo.com</a>)<br/>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            scene: null,
            renderer: null,
            camera: null,
            stats: null,
            model: null,
            skeleton: null,
            mixer: null,
            clock: null,
            crossFadeControls: [],
            currentBaseAction: 'idle',
			allActions: [],
			baseActions: {
				idle: { weight: 1 },
				walk: { weight: 0 },
				run: { weight: 0 }
			},
			additiveActions: {
				sneak_pose: { weight: 0 },
				sad_pose: { weight: 0 },
				agree: { weight: 0 },
				headShake: { weight: 0 }
			},
            panelSettings: null,
            numAnimations: null,
            gui: null
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.clock = new this.$THREE.Clock()
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xa0a0a0)
            this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 10, 50)
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 20, 0)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff)
            dirLight.position.set(3, 10, 10)
            dirLight.castShadow = true
            dirLight.shadow.camera.top = 2
            dirLight.shadow.camera.bottom = - 2
            dirLight.shadow.camera.left = - 2
            dirLight.shadow.camera.right = 2
            dirLight.shadow.camera.near = 0.1
            dirLight.shadow.camera.far = 40
            this.scene.add(dirLight)
            // ground
            var mesh = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(100, 100), new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
            mesh.rotation.x = - Math.PI / 2
            mesh.receiveShadow = true
            this.scene.add(mesh)
            var loader = new GLTFLoader()
            var that = this
            loader.load('static/models/gltf/Xbot.glb', function (gltf) {
                that.model = gltf.scene
                that.scene.add(that.model)
                that.model.traverse(function (object) {
                    if (object.isMesh) object.castShadow = true
                })
                that.skeleton = new that.$THREE.SkeletonHelper(that.model)
                that.skeleton.visible = false
                that.scene.add(that.skeleton)
                var animations = gltf.animations
                that.mixer = new that.$THREE.AnimationMixer(that.model)
                that.numAnimations = animations.length
                for (var i = 0; i !== that.numAnimations; ++ i) {
                    var clip = animations[i]
                    var name = clip.name
                    if (that.baseActions[name]) {
                        var action = that.mixer.clipAction(clip)
                        that.activateAction(action)
                        that.baseActions[name].action = action
                        that.allActions.push(action)
                    } else if (that.additiveActions[name]) {
                        // Make the clip additive and remove the reference frame
                        that.$THREE.AnimationUtils.makeClipAdditive(clip)
                        if (clip.name.endsWith('_pose')) {
                            clip = that.$THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30)
                        }
                        var action = that.mixer.clipAction(clip)
                        that.activateAction(action)
                        that.additiveActions[name].action = action
                        that.allActions.push(action)
                    }
                }
                that.createPanel()
                that.animate()
            })
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            container.appendChild(this.renderer.domElement)
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 100)
            this.camera.position.set(- 1, 2, 3)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enablePan = false
            controls.enableZoom = false
            controls.target.set(0, 1, 0)
            controls.update()
            this.stats = new this.$Stats()
            container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        activateAction(action) {
            var clip = action.getClip()
            var settings = this.baseActions[clip.name] || this.additiveActions[clip.name]
            this.setWeight(action, settings.weight)
            action.play()
        },
        createPanel() {
            this.gui = new GUI({ width: 310 })
            var folder1 = this.gui.addFolder('Base Actions')
            var folder2 = this.gui.addFolder('Additive Action Weights')
            var folder3 = this.gui.addFolder('General Speed')
            this.panelSettings = {
                'modify time scale': 1.0
            }
            var baseNames = ['None', ...Object.keys(this.baseActions)]
            for (let i = 0, l = baseNames.length; i !== l; ++ i) {
                var name = baseNames[i]
                var settings = this.baseActions[name]
                this.panelSettings[name] = () => {
                    var currentSettings = this.baseActions[this.currentBaseAction]
                    var currentAction = currentSettings ? currentSettings.action : null
                    var action = settings ? settings.action : null
                    this.prepareCrossFade(currentAction, action, 0.35)
                }
                this.crossFadeControls.push(folder1.add(this.panelSettings, name))
            }
            for (var name of Object.keys(this.additiveActions)) {
                var settings = this.additiveActions[name]
                this.panelSettings[name] = settings.weight
                folder2.add(this.panelSettings, name, 0.0, 1.0, 0.01).listen().onChange((weight) => {
                    this.setWeight(settings.action, weight)
                    settings.weight = weight
                })
            }
            folder3.add(this.panelSettings, 'modify time scale', 0.0, 1.5, 0.01).onChange(this.modifyTimeScale)
            folder1.open()
            folder2.open()
            folder3.open()
            this.crossFadeControls.forEach((control) => {
                control.classList1 = control.domElement.parentElement.parentElement.classList
                control.classList2 = control.domElement.previousElementSibling.classList
                control.setInactive = () => {
                    control.classList2.add('control-inactive')
                }
                control.setActive = () => {
                    control.classList2.remove('control-inactive')
                }
                var settings = this.baseActions[control.property]
                if (! settings || ! settings.weight) {
                    control.setInactive()
                }
            })
        },
        prepareCrossFade(startAction, endAction, duration) {
            // If the current action is 'idle', execute the crossfade immediately;
            // else wait until the current action has finished its current loop
            if (this.currentBaseAction === 'idle' || ! startAction || ! endAction) {
                this.executeCrossFade(startAction, endAction, duration)
            } else {
                this.synchronizeCrossFade(startAction, endAction, duration)
            }
            // Update control colors
            if (endAction) {
                var clip = endAction.getClip()
                this.currentBaseAction = clip.name
            } else {
                this.currentBaseAction = 'None'
            }
            this.crossFadeControls.forEach((control) => {
                var name = control.property
                if (name === this.currentBaseAction) {
                    control.setActive()
                } else {
                    control.setInactive()
                }
            })
        },
        executeCrossFade(startAction, endAction, duration) {
            // Not only the start action, but also the end action must get a weight of 1 before fading
            // (concerning the start action this is already guaranteed in this place)
            if (endAction) {
                this.setWeight(endAction, 1)
                endAction.time = 0
                if (startAction) {
                    // Crossfade with warping
                    startAction.crossFadeTo(endAction, duration, true)
                } else {
                    // Fade in
                    endAction.fadeIn(duration)
                }
            } else {
                // Fade out
                startAction.fadeOut(duration)
            }
        },
        setWeight(action, weight) {
            action.enabled = true
            action.setEffectiveTimeScale(1)
            action.setEffectiveWeight(weight)
        },
        synchronizeCrossFade(startAction, endAction, duration) {
            this.mixer.addEventListener('loop', onLoopFinished)
            function onLoopFinished(event) {
                if (event.action === startAction) {
                    this.mixer.removeEventListener('loop', onLoopFinished)
                    this.executeCrossFade(startAction, endAction, duration)
                }
            }
        },
        animate() {
            // Render loop
            requestAnimationFrame(this.animate)
            for (var i = 0; i !== this.numAnimations; ++ i) {
                var action = this.allActions[i]
                var clip = action.getClip()
                var settings = this.baseActions[clip.name] || this.additiveActions[clip.name]
                settings.weight = action.getEffectiveWeight()
            }
            // Get the time elapsed since the last frame, used for mixer update
            var mixerUpdateDelta = this.clock.getDelta()
            // Update the animation mixer, the stats panel, and render this frame
            this.mixer.update(mixerUpdateDelta)
            this.stats.update()
            this.renderer.render(this.scene, this.camera)
        },
        modifyTimeScale(speed) {
            this.mixer.timeScale = speed
        }
    }
}
</script>

<style scoped>
.webglAnimationSkinningAdditiveBlending-container {
    width: 100%;
}
#info a {
    color: blue;
}
.ac {  /* prevent dat-gui from being selected */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.control-inactive {
    color: #888;
}
</style>
