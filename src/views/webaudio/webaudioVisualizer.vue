<template>
    <div class="webaudioVisualizer-container">
        <div id="overlay">
            <el-button type="primary" size="mini" @click="init">Play</el-button>
		</div>
		<div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> webaudio - visualizer<br/>
			music by <a href="http://www.newgrounds.com/audio/listen/376737" target="_blank" rel="noopener">skullbeatz</a>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            vertexShader: null,
            fragmentShader: null,
            scene: null,
            camera: null,
            renderer: null,
            analyser: null,
            uniforms: null,
        }
    },
    mounted() {
        this.vertexShader = `
            varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4(position, 1.0);
            }`
        this.fragmentShader = `
            uniform sampler2D tAudioData;
			varying vec2 vUv;
			void main() {
				vec3 backgroundColor = vec3(0.125, 0.125, 0.125);
				vec3 color = vec3(1.0, 1.0, 0.0);
				float f = texture2D(tAudioData, vec2(vUv.x, 0.0)).r;
				float i = step(vUv.y, f) * step(f - 0.0125, vUv.y);
				gl_FragColor = vec4(mix(backgroundColor, color, i), 1.0);
			}`
    },
    methods: {
        init() {
            var fftSize = 128
            //
            var overlay = document.getElementById('overlay')
            overlay.remove()
            //
            var container = document.getElementById('container')
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setClearColor(0x000000)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.Camera()
            //
            var listener = new this.$THREE.AudioListener()
            var audio = new this.$THREE.Audio(listener)
            var file = 'static/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3'
            if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
                var loader = new this.$THREE.AudioLoader()
                loader.load(file, function (buffer) {
                    audio.setBuffer(buffer)
                    audio.play()
                })
            } else {
                var mediaElement = new Audio(file)
                mediaElement.play()
                audio.setMediaElementSource(mediaElement)
            }
            this.analyser = new this.$THREE.AudioAnalyser(audio, fftSize)
            //
            var format = (this.renderer.capabilities.isWebGL2) ? this.$THREE.RedFormat : this.$THREE.LuminanceFormat
            this.uniforms = {
                tAudioData: { value: new this.$THREE.DataTexture(this.analyser.data, fftSize / 2, 1, format) }
            }
            var material = new this.$THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader
            })
            var geometry = new this.$THREE.PlaneBufferGeometry(1, 1)
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            //
            window.addEventListener('resize', this.onResize, false)
            this.animate()
        },
        onResize() {
            this.renderer.setSize(window.innerWidth - 281, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.analyser.getFrequencyData()
            this.uniforms.tAudioData.value.needsUpdate = true
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webaudioVisualizer-container {
    width: 100%;
}
#overlay {
    text-align: center;
    height: 100vh;
    line-height: 100vh;
}
</style>
