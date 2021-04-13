<template>
    <div class="webglReadFloatBuffer-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> read float pixels webgl example<br/>
			<span id="values"></span>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            fragmentShaderScreen: null,
            fragmentShaderPass1: null,
            vertexShader: null,
            container: null,
            stats: null,
            cameraRTT: null,
            sceneRTT: null,
            sceneScreen: null,
            renderer: null,
            zmesh1: null,
            zmesh2: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
            rtTexture: null,
            material: null,
            quad: null,
			delta: 0.01,
			valueNode: null,
        }
    },
    mounted() {
        this.fragmentShaderScreen = `
            varying vec2 vUv;
			uniform sampler2D tDiffuse;
			void main() {
				gl_FragColor = texture2D(tDiffuse, vUv);
            }`
        this.fragmentShaderPass1 = `
            varying vec2 vUv;
			uniform float time;
			void main() {
				float r = vUv.x;
				if(vUv.y < 0.5) r = 0.0;
				float g = vUv.y;
				if(vUv.x < 0.5) g = 0.0;
				gl_FragColor = vec4(r, g, time, 1.0);
            }`
        this.vertexShader = `
            varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.cameraRTT = new this.$THREE.OrthographicCamera(this.$webglInnerWidth / - 2, this.$webglInnerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000)
            this.cameraRTT.position.z = 100
            //
            this.sceneRTT = new this.$THREE.Scene()
            this.sceneScreen = new this.$THREE.Scene()
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 0, 1).normalize()
            this.sceneRTT.add(light)
            light = new this.$THREE.DirectionalLight(0xffaaaa, 1.5)
            light.position.set(0, 0, - 1).normalize()
            this.sceneRTT.add(light)
            this.rtTexture = new this.$THREE.WebGLRenderTarget(this.$webglInnerWidth, window.innerHeight, { minFilter: this.$THREE.LinearFilter, magFilter: this.$THREE.NearestFilter, format: this.$THREE.RGBAFormat, type: this.$THREE.FloatType })
            this.material = new this.$THREE.ShaderMaterial({
                uniforms: { "time": { value: 0.0 } },
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShaderPass1
            })
            var materialScreen = new this.$THREE.ShaderMaterial({
                uniforms: { "tDiffuse": { value: this.rtTexture.texture } },
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShaderScreen,
                depthWrite: false
            })
            var plane = new this.$THREE.PlaneBufferGeometry(this.$webglInnerWidth, window.innerHeight)
            this.quad = new this.$THREE.Mesh(plane, this.material)
            this.quad.position.z = - 100
            this.sceneRTT.add(this.quad)
            var geometry = new this.$THREE.TorusBufferGeometry(100, 25, 15, 30)
            var mat1 = new this.$THREE.MeshPhongMaterial({ color: 0x555555, specular: 0xffaa00, shininess: 5 })
            var mat2 = new this.$THREE.MeshPhongMaterial({ color: 0x550000, specular: 0xff2200, shininess: 5 })
            this.zmesh1 = new this.$THREE.Mesh(geometry, mat1)
            this.zmesh1.position.set(0, 0, 100)
            this.zmesh1.scale.set(1.5, 1.5, 1.5)
            this.sceneRTT.add(this.zmesh1)
            this.zmesh2 = new this.$THREE.Mesh(geometry, mat2)
            this.zmesh2.position.set(0, 150, 100)
            this.zmesh2.scale.set(0.75, 0.75, 0.75)
            this.sceneRTT.add(this.zmesh2)
            this.quad = new this.$THREE.Mesh(plane, materialScreen)
            this.quad.position.z = - 100
            this.sceneScreen.add(this.quad)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            this.valueNode = document.getElementById('values')
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX)
            this.mouseY = (event.clientY - this.windowHalfY)
        },
        onWindowResize() {
            this.$onWindowResize(this.cameraRTT, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.0015
            if (this.zmesh1 && this.zmesh2) {
                this.zmesh1.rotation.y = - time
                this.zmesh2.rotation.y = - time + Math.PI / 2
            }
            if (this.material.uniforms[ "time" ].value > 1 || this.material.uniforms[ "time" ].value < 0) {
                this.delta *= - 1
            }
            this.material.uniforms[ "time" ].value += this.delta
            this.renderer.clear()
            // Render first scene into texture
            this.renderer.setRenderTarget(this.rtTexture)
            this.renderer.clear()
            this.renderer.render(this.sceneRTT, this.cameraRTT)
            // Render full screen quad with generated texture
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.sceneScreen, this.cameraRTT)
            var read = new Float32Array(4)
            this.renderer.readRenderTargetPixels(this.rtTexture, this.windowHalfX + this.mouseX, this.windowHalfY - this.mouseY, 1, 1, read)
            this.valueNode.innerHTML = 'r:' + read[ 0 ] + '<br/>g:' + read[ 1 ] + '<br/>b:' + read[ 2 ]
        }
    },
}
</script>

<style scoped>
.webglReadFloatBuffer-container {
    position: relative;
    width: 100%;
}
</style>
