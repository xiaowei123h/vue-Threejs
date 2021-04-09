<template>
    <div class="webaudioSandbox-container">
        <div id="overlay">
            <el-button type="primary" size="mini" @click="init">Play</el-button>
		</div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webaudio - sandbox<br/>
			music by <a href="http://www.newgrounds.com/audio/listen/358232" target="_blank" rel="noopener">larrylarrybb</a>,
			<a href="http://www.newgrounds.com/audio/listen/376737" target="_blank" rel="noopener">skullbeatz</a> and
			<a href="http://opengameart.org/content/project-utopia-seamless-loop" target="_blank" rel="noopener">congusbongus</a><br/><br/>
			navigate with WASD / arrows / mouse
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { FirstPersonControls } from '@/components/jsm/controls/FirstPersonControls.js'
export default {
    data() {
        return {
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            light: null,
            material1: null,
            material2: null,
            material3: null,
            analyser1: null,
            analyser2: null,
            analyser3: null,
			clock: null,
            startButton: null,
            gui: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var overlay = document.getElementById('overlay')
            overlay.remove()
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set(0, 25, 0)
            var listener = new this.$THREE.AudioListener()
            this.camera.add(listener)
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.FogExp2(0x000000, 0.0025)
            this.light = new this.$THREE.DirectionalLight(0xffffff)
            this.light.position.set(0, 0.5, 1).normalize()
            this.scene.add(this.light)
            var sphere = new this.$THREE.SphereBufferGeometry(20, 32, 16)
            this.material1 = new this.$THREE.MeshPhongMaterial({ color: 0xffaa00, flatShading: true, shininess: 0 })
            this.material2 = new this.$THREE.MeshPhongMaterial({ color: 0xff2200, flatShading: true, shininess: 0 })
            this.material3 = new this.$THREE.MeshPhongMaterial({ color: 0x6622aa, flatShading: true, shininess: 0 })
            // sound spheres
            var audioLoader = new this.$THREE.AudioLoader()
            var mesh1 = new this.$THREE.Mesh(sphere, this.material1)
            mesh1.position.set(- 250, 30, 0)
            this.scene.add(mesh1)
            var sound1 = new this.$THREE.PositionalAudio(listener)
            audioLoader.load('static/sounds/358232_j_s_song.ogg', (buffer) => {
                sound1.setBuffer(buffer)
                sound1.setRefDistance(20)
                sound1.play()
            })
            mesh1.add(sound1)
            //
            var mesh2 = new this.$THREE.Mesh(sphere, this.material2)
            mesh2.position.set(250, 30, 0)
            this.scene.add(mesh2)
            var sound2 = new this.$THREE.PositionalAudio(listener)
            audioLoader.load('static/sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg', (buffer) => {
                sound2.setBuffer(buffer)
                sound2.setRefDistance(20)
                sound2.play()
            })
            mesh2.add(sound2)
            //
            var mesh3 = new this.$THREE.Mesh(sphere, this.material3)
            mesh3.position.set(0, 30, - 250)
            this.scene.add(mesh3)
            var sound3 = new this.$THREE.PositionalAudio(listener)
            var oscillator = listener.context.createOscillator()
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(144, sound3.context.currentTime)
            oscillator.start(0)
            sound3.setNodeSource(oscillator)
            sound3.setRefDistance(20)
            sound3.setVolume(0.5)
            mesh3.add(sound3)
            // analysers
            this.analyser1 = new this.$THREE.AudioAnalyser(sound1, 32)
            this.analyser2 = new this.$THREE.AudioAnalyser(sound2, 32)
            this.analyser3 = new this.$THREE.AudioAnalyser(sound3, 32)
            // global ambient audio
            var sound4 = new this.$THREE.Audio(listener)
            audioLoader.load('static/sounds/Project_Utopia.ogg', (buffer) => {
                sound4.setBuffer(buffer)
                sound4.setLoop(true)
                sound4.setVolume(0.5)
                sound4.play()
            })
            // ground
            var helper = new this.$THREE.GridHelper(1000, 10, 0x444444, 0x444444)
            helper.position.y = 0.1
            this.scene.add(helper)
            //
            var SoundControls = function () {
                this.master = listener.getMasterVolume()
                this.firstSphere = sound1.getVolume()
                this.secondSphere = sound2.getVolume()
                this.thirdSphere = sound3.getVolume()
                this.Ambient = sound4.getVolume()
            }
            var GeneratorControls = function () {
                this.frequency = oscillator.frequency.value
                this.wavetype = oscillator.type
            }
            this.gui = new GUI()
            var soundControls = new SoundControls()
            var generatorControls = new GeneratorControls()
            var volumeFolder = this.gui.addFolder('sound volume')
            var generatorFolder = this.gui.addFolder('sound generator')
            volumeFolder.add(soundControls, 'master').min(0.0).max(1.0).step(0.01).onChange(() => {
                listener.setMasterVolume(soundControls.master)
            })
            volumeFolder.add(soundControls, 'firstSphere').min(0.0).max(1.0).step(0.01).onChange(() => {
                sound1.setVolume(soundControls.firstSphere)
            })
            volumeFolder.add(soundControls, 'secondSphere').min(0.0).max(1.0).step(0.01).onChange(() => {
                sound2.setVolume(soundControls.secondSphere)
            })
            volumeFolder.add(soundControls, 'thirdSphere').min(0.0).max(1.0).step(0.01).onChange(() => {
                sound3.setVolume(soundControls.thirdSphere)
            })
            volumeFolder.add(soundControls, 'Ambient').min(0.0).max(1.0).step(0.01).onChange(() => {
                sound4.setVolume(soundControls.Ambient)
            })
            volumeFolder.open()
            generatorFolder.add(generatorControls, 'frequency').min(50.0).max(5000.0).step(1.0).onChange(() => {
                oscillator.frequency.setValueAtTime(generatorControls.frequency, listener.context.currentTime)
            })
            generatorFolder.add(generatorControls, 'wavetype', [ 'sine', 'square', 'sawtooth', 'triangle' ]).onChange(() => {
                oscillator.type = generatorControls.wavetype
            })
            generatorFolder.open()
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webaudioSandbox-container')[0].appendChild(this.renderer.domElement)
            //
            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)
            this.controls.movementSpeed = 70
            this.controls.lookSpeed = 0.05
            this.controls.noFly = true
            this.controls.lookVertical = false
            //
            window.addEventListener('resize', this.onWindowResize, false)
            this.animate()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.controls.handleResize()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var delta = this.clock.getDelta()
            this.controls.update(delta)
            this.material1.emissive.b = this.analyser1.getAverageFrequency() / 256
            this.material2.emissive.b = this.analyser2.getAverageFrequency() / 256
            this.material3.emissive.b = this.analyser3.getAverageFrequency() / 256
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webaudioSandbox-container {
    position: relative;
    width: 100%;
    background-color: rgba(0, 0, 0, .95);
}
#overlay {
    text-align: center;
    height: 100vh;
    line-height: 100vh;
}
</style>
