<template>
    <div class="webglLoaderMmdAudio-container">
        <div id="overlay">
            <el-button size="small" type="primary" @click="handleStartButton">Play</el-button>
		</div>
		<div id="info">
		<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - MMDLoader test<br />
		<a href="https://github.com/mrdoob/three.js/tree/master/examples/models/mmd#readme" target="_blank" rel="noopener">MMD Assets license</a><br />
		Copyright
		<a href="https://sites.google.com/view/evpvp/" target="_blank" rel="noopener">Model Data</a>
		<a href="http://www.nicovideo.jp/watch/sm13147122" target="_blank" rel="noopener">Dance Data</a>
		<a href="http://www.nicovideo.jp/watch/sm11938255" target="_blank" rel="noopener">Audio Data</a><br />
		Camera is customized from <a href="http://www.nicovideo.jp/watch/sm19168559" target="_blank" rel="noopener">this Data</a>
		</div>
    </div>
</template>

<script>
// import { Ammo } from '@/utils/ammo.wasm.js'
import { OutlineEffect } from '@/components/jsm/effects/OutlineEffect.js'
import { MMDLoader } from '@/components/jsm/loaders/MMDLoader.js'
import { MMDAnimationHelper } from '@/components/jsm/animation/MMDAnimationHelper.js'
export default {
    data() {
        return {
            mesh: null,
            camera: null,
            scene: null,
            renderer: null,
            effect: null,
			helper: null,
			ready: false,
			clock: null
        }
    },
    mounted() {
        this.clock = new this.$moduleTHREE.Clock()
    },
    methods: {
        handleStartButton() {
            Ammo().then(() => {
                this.init()
                this.animate()
            })
        },
        init() {
            var overlay = document.getElementById('overlay')
            overlay.remove()
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderMmdAudio-container')[0].appendChild(container)
            this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            // scene
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0xffffff)
            this.scene.add(new this.$moduleTHREE.PolarGridHelper(30, 10))
            var listener = new this.$moduleTHREE.AudioListener()
            this.camera.add(listener)
            this.scene.add(this.camera)
            var ambient = new this.$moduleTHREE.AmbientLight(0x666666)
            this.scene.add(ambient)
            var directionalLight = new this.$moduleTHREE.DirectionalLight(0x887766)
            directionalLight.position.set(- 1, 1, 1).normalize()
            this.scene.add(directionalLight)
            //
            this.renderer = new this.$moduleTHREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.effect = new OutlineEffect(this.renderer)
            // model
            function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100
                    console.log(Math.round(percentComplete, 2) + '% downloaded')
                }
            }
            var modelFile = 'static/models/mmd/miku/miku_v2.pmd'
            var vmdFiles = [ 'static/models/mmd/vmds/wavefile_v2.vmd' ]
            var cameraFiles = [ 'static/models/mmd/vmds/wavefile_camera.vmd' ]
            var audioFile = 'static/models/mmd/audios/wavefile_short.mp3'
            var audioParams = { delayTime: 160 * 1 / 30 }
            this.helper = new MMDAnimationHelper()
            var loader = new MMDLoader()
            loader.loadWithAnimation(modelFile, vmdFiles, (mmd) => {
                this.mesh = mmd.mesh
                this.helper.add(this.mesh, {
                    animation: mmd.animation,
                    physics: true
                })
                loader.loadAnimation(cameraFiles, this.camera, (cameraAnimation) => {
                    this.helper.add(this.camera, {
                        animation: cameraAnimation
                    })
                    new this.$moduleTHREE.AudioLoader().load(audioFile, (buffer) => {
                        var audio = new this.$moduleTHREE.Audio(listener).setBuffer(buffer)
                        this.helper.add(audio, audioParams)
                        this.scene.add(this.mesh)
                        this.ready = true
                    }, onProgress, null)
                }, onProgress, null)
            }, onProgress, null)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.camera.aspect = (window.innerWidth - 281) / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.effect.setSize((window.innerWidth - 281), window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            if (this.ready) {
                this.helper.update(this.clock.getDelta())
            }
            this.effect.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderMmdAudio-container {
    position: relative;
    width: 100%;
    height: 100vh;
}
#overlay {
    text-align: center;
    line-height: 100vh;
}
#info {
    margin-left: -175px;
    color: #444;
}
#info a {
    color: #08f;
}
</style>
