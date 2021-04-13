<template>
    <div class="webglAnimationSkinningBlending-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Skeletal Animation Blending
			(model from <a href="https://www.mixamo.com/" target="_blank" rel="noopener">mixamo.com</a>)<br/>
			Note: crossfades are possible with blend weights being set to (1,0,0), (0,1,0) or (0,0,1)
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            scene: null,
            renderer: null,
            camera: null,
            stats: null,
            mixer: null,
            clock: null,
            model: null,
            skeleton: null,
            crossFadeControls: [],
            idleAction: null,
            walkAction: null,
            runAction: null,
            idleWeight: null,
            walkWeight: null,
            runWeight: null,
            actions: null,
            settings: null,
            singleStepMode: false,
            sizeOfNextStep: 0,
            gui: null
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set( 1, 2, - 3 )
            this.camera.lookAt(0,1,0)
            this.clock = new this.$moduleTHREE.Clock()
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0xa0a0a0)
            this.scene.fog = new this.$moduleTHREE.Fog(0xa0a0a0, 10, 50)
            var hemiLight = new this.$moduleTHREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 20, 0)
            this.scene.add(hemiLight)
            var dirLight = new this.$moduleTHREE.DirectionalLight(0xffffff)
            dirLight.position.set(- 3, 10, - 10)
            dirLight.castShadow = true
            dirLight.shadow.camera.top = 2
            dirLight.shadow.camera.bottom = - 2
            dirLight.shadow.camera.left = - 2
            dirLight.shadow.camera.right = 2
            dirLight.shadow.camera.near = 0.1
            dirLight.shadow.camera.far = 40
            this.scene.add(dirLight)
            this.scene.add(new this.$moduleTHREE.CameraHelper(dirLight.shadow.camera))
            // ground
            var mesh = new this.$moduleTHREE.Mesh(new this.$moduleTHREE.PlaneBufferGeometry(100, 100), new this.$moduleTHREE.MeshPhongMaterial({color: 0x999999, depthWrite: false}))
            mesh.rotation.x = - Math.PI / 2
            mesh.receiveShadow = true
            // this.scene.add(mesh)
            var loader = new GLTFLoader()
            
            loader.load('static/models/gltf/Soldier.glb', (gltf) => {
                console.log('gltf')
                console.log(gltf.scene)
                this.model = gltf.scene
                this.scene.add(gltf.scene)
                this.model.traverse((object) => {
                    if(object.isMesh) object.castShadow = true
                })
                //
                this.skeleton = new this.$moduleTHREE.SkeletonHelper(this.model)
                this.skeleton.visible = false
                this.scene.add(this.skeleton)
                //
                this.createPanel()
                //
                console.log(gltf.animations)
                var animations = gltf.animations
                console.log('this.model')
                console.log(this.model)
                this.mixer = new this.$moduleTHREE.AnimationMixer(this.model)
                this.idleAction = this.mixer.clipAction(animations[0])
                this.walkAction = this.mixer.clipAction(animations[3])
                this.runAction = this.mixer.clipAction(animations[1])
                this.actions = [this.idleAction, this.walkAction, this.runAction]
                this.activateAllActions()
                this.animate()
            })
            this.renderer = new this.$moduleTHREE.WebGLRenderer({antialias: true})
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$moduleTHREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        createPanel() {
            this.gui = new GUI({width: 310})
            var folder1 = this.gui.addFolder('Visibility')
            var folder2 = this.gui.addFolder('Activation/Deactivation')
            var folder3 = this.gui.addFolder('Pausing/Stepping')
            var folder4 = this.gui.addFolder('Crossfading')
            var folder5 = this.gui.addFolder('Blend Weights')
            var folder6 = this.gui.addFolder('General Speed')
            this.settings = {
                'show model': true,
                'show skeleton': false,
                'deactivate all': this.deactivateAllActions,
                'activate all': this.activateAllActions,
                'pause/continue': this.pauseContinue,
                'make single step': this.toSingleStepMode,
                'modify step size': 0.05,
                'from walk to idle': () => {
                    this.prepareCrossFade(this.walkAction, this.idleAction, 1.0)
                },
                'from idle to walk': () => {
                    this.prepareCrossFade(this.idleAction, this.walkAction, 0.5)
                },
                'from walk to run': () => {
                    this.prepareCrossFade(this.walkAction, this.runAction, 2.5)
                },
                'from run to walk': () => {
                    this.prepareCrossFade(this.runAction, this.walkAction, 5.0)
                },
                'use default duration': true,
                'set custom duration': 3.5,
                'modify idle weight': 0.0,
                'modify walk weight': 1.0,
                'modify run weight': 0.0,
                'modify time scale': 1.0
            }
            folder1.add(this.settings, 'show model').onChange(this.showModel)
            folder1.add(this.settings, 'show skeleton').onChange(this.showSkeleton)
            folder2.add(this.settings, 'deactivate all')
            folder2.add(this.settings, 'activate all')
            folder3.add(this.settings, 'pause/continue')
            folder3.add(this.settings, 'make single step')
            folder3.add(this.settings, 'modify step size', 0.01, 0.1, 0.001)
            this.crossFadeControls.push(folder4.add(this.settings, 'from walk to idle'))
            this.crossFadeControls.push(folder4.add(this.settings, 'from idle to walk'))
            this.crossFadeControls.push(folder4.add(this.settings, 'from walk to run'))
            this.crossFadeControls.push(folder4.add(this.settings, 'from run to walk'))
            folder4.add(this.settings, 'use default duration')
            folder4.add(this.settings, 'set custom duration', 0, 10, 0.01)
            folder5.add(this.settings, 'modify idle weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
                this.setWeight(this.idleAction, weight)
            })
            folder5.add(this.settings, 'modify walk weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
                this.setWeight(this.walkAction, weight)
            })
            folder5.add(this.settings, 'modify run weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
                this.setWeight(this.runAction, weight)
            })
            folder6.add(this.settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(this.modifyTimeScale)
            folder1.open()
            folder2.open()
            folder3.open()
            folder4.open()
            folder5.open()
            folder6.open()
            this.crossFadeControls.forEach((control) => {
                control.classList1 = control.domElement.parentElement.parentElement.classList
                control.classList2 = control.domElement.previousElementSibling.classList
                control.setDisabled = () => {
                    control.classList1.add('no-pointer-events')
                    control.classList2.add('control-disabled')
                }
                control.setEnabled = () => {
                    control.classList1.remove('no-pointer-events')
                    control.classList2.remove('control-disabled')
                }
            })
        },
        deactivateAllActions() {
            this.actions.forEach((action) => {
                action.stop()
            })
        },
        activateAllActions() {
            this.setWeight(this.idleAction, this.settings['modify idle weight'])
            this.setWeight(this.walkAction, this.settings['modify walk weight'])
            this.setWeight(this.runAction, this.settings['modify run weight'])
            this.actions.forEach((action) => {
                action.play()
            })
        },
        // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
		// the start action's timeScale to ((start animation's duration) / (end animation's duration))
        setWeight(action, weight) {
            action.enabled = true
            action.setEffectiveTimeScale(1)
            action.setEffectiveWeight(weight)
        },
        pauseContinue() {
            if (this.singleStepMode) {
                this.singleStepMode = false
                this.unPauseAllActions()
            } else {
                if (this.idleAction.paused) {
                    this.unPauseAllActions()
                } else {
                    this.pauseAllActions()
                }
            }
        },
        unPauseAllActions() {
            this.actions.forEach((action) => {
                action.paused = false
            })
        },
        pauseAllActions() {
            this.actions.forEach((action) => {
                action.paused = true
            })
        },
        toSingleStepMode() {
            this.unPauseAllActions()
            this.singleStepMode = true
            this.sizeOfNextStep = this.settings['modify step size']
        },
        prepareCrossFade(startAction, endAction, defaultDuration) {
            // Switch default / custom crossfade duration (according to the user's choice)
            var duration = this.setCrossFadeDuration(defaultDuration)
            // Make sure that we don't go on in singleStepMode, and that all actions are unpaused
            this.singleStepMode = false
            this.unPauseAllActions()
            // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
            // else wait until the current action has finished its current loop
            if (startAction === this.idleAction) {
                this.executeCrossFade(startAction, endAction, duration)
            } else {
                this.synchronizeCrossFade(startAction, endAction, duration)
            }
        },
        setCrossFadeDuration(defaultDuration) {
            // Switch default crossfade duration <-> custom crossfade duration
            if (this.settings['use default duration']) {
                return defaultDuration
            } else {
                return this.settings['set custom duration']
            }
        },
        executeCrossFade(startAction, endAction, duration) {
            // Not only the start action, but also the end action must get a weight of 1 before fading
            // (concerning the start action this is already guaranteed in this place)
            this.setWeight(endAction, 1)
            endAction.time = 0
            // Crossfade with warping - you can also try without warping by setting the third parameter to false
            startAction.crossFadeTo(endAction, duration, true)
        },
        synchronizeCrossFade(startAction, endAction, duration) {
            this.mixer.addEventListener('loop', onLoopFinished)
            var that = this
            function onLoopFinished(event) {
                if (event.action === startAction) {
                    that.mixer.removeEventListener('loop', onLoopFinished)
                    that.executeCrossFade(startAction, endAction, duration)
                }
            }
        },
        showModel(visibility) {
            this.model.visible = visibility
        },
        showSkeleton(visibility) {
            this.skeleton.visible = visibility
        },
        modifyTimeScale(speed) {
            this.mixer.timeScale = speed
        },
        // Called by the render loop
        updateWeightSliders() {
            this.settings['modify idle weight'] = this.idleWeight
            this.settings['modify walk weight'] = this.walkWeight
            this.settings['modify run weight'] = this.runWeight
        },
        // Called by the render loop
        updateCrossFadeControls() {
            this.crossFadeControls.forEach(function(control) {
                control.setDisabled()
            })
            if (this.idleWeight === 1 && this.walkWeight === 0 && this.runWeight === 0) {
                this.crossFadeControls[1].setEnabled()
            }
            if (this.idleWeight === 0 && this.walkWeight === 1 && this.runWeight === 0) {
                this.crossFadeControls[0].setEnabled()
                this.crossFadeControls[2].setEnabled()
            }
            if (this.idleWeight === 0 && this.walkWeight === 0 && this.runWeight === 1) {
                this.crossFadeControls[3].setEnabled()
            }
        },
        animate() {
            // Render loop
            requestAnimationFrame(this.animate)
            this.idleWeight = this.idleAction.getEffectiveWeight()
            this.walkWeight = this.walkAction.getEffectiveWeight()
            this.runWeight = this.runAction.getEffectiveWeight()
            // Update the panel values if weights are modified from "outside" (by crossfadings)
            this.updateWeightSliders()
            // Enable/disable crossfade controls according to current weight values
            this.updateCrossFadeControls()
            // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
            var mixerUpdateDelta = this.clock.getDelta()
            // If in single step mode, make one step and then do nothing (until the user clicks again)
            if (this.singleStepMode) {
                this.mixerUpdateDelta = this.sizeOfNextStep
                this.sizeOfNextStep = 0
            }
            // Update the animation mixer, the stats panel, and render this frame
            this.mixer.update(mixerUpdateDelta)
            this.stats.update()
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglAnimationSkinningBlending-container {
    position: relative;
    width: 100%;
}
#info a {
    color: #f00;
}
.ac {  /* prevent dat-gui from being selected */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.no-pointer-events {
    pointer-events: none;
}
.control-disabled {
    color: #888;
    text-decoration: line-through;
}
</style>
