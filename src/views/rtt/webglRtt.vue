<template>
    <div class="webglRtt-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> render-to-texture webgl example</div>
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
            camera: null,
            sceneRTT: null,
            sceneScreen: null,
            scene: null,
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
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(30, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 100
            this.cameraRTT = new this.$THREE.OrthographicCamera(this.$webglInnerWidth / - 2, this.$webglInnerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000)
            this.cameraRTT.position.z = 100
            //
            this.scene = new this.$THREE.Scene()
            this.sceneRTT = new this.$THREE.Scene()
            this.sceneScreen = new this.$THREE.Scene()
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 0, 1).normalize()
            this.sceneRTT.add(light)
            light = new this.$THREE.DirectionalLight(0xffaaaa, 1.5)
            light.position.set(0, 0, - 1).normalize()
            this.sceneRTT.add(light)
            this.rtTexture = new this.$THREE.WebGLRenderTarget(this.$webglInnerWidth, window.innerHeight, { minFilter: this.$THREE.LinearFilter, magFilter: this.$THREE.NearestFilter, format: this.$THREE.RGBFormat })
            this.material = new this.$THREE.ShaderMaterial({
                uniforms: { time: { value: 0.0 } },
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShaderPass1
            })
            var materialScreen = new this.$THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: this.rtTexture.texture } },
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShaderScreen,
                depthWrite: false
            })
            var plane = new this.$THREE.PlaneBufferGeometry(this.$webglInnerWidth, window.innerHeight)
            this.quad = new this.$THREE.Mesh(plane, this.material)
            this.quad.position.z = - 100
            this.sceneRTT.add(this.quad)
            var torusGeometry = new this.$THREE.TorusBufferGeometry(100, 25, 15, 30)
            var mat1 = new this.$THREE.MeshPhongMaterial({ color: 0x555555, specular: 0xffaa00, shininess: 5 })
            var mat2 = new this.$THREE.MeshPhongMaterial({ color: 0x550000, specular: 0xff2200, shininess: 5 })
            this.zmesh1 = new this.$THREE.Mesh(torusGeometry, mat1)
            this.zmesh1.position.set(0, 0, 100)
            this.zmesh1.scale.set(1.5, 1.5, 1.5)
            this.sceneRTT.add(this.zmesh1)
            this.zmesh2 = new this.$THREE.Mesh(torusGeometry, mat2)
            this.zmesh2.position.set(0, 150, 100)
            this.zmesh2.scale.set(0.75, 0.75, 0.75)
            this.sceneRTT.add(this.zmesh2)
            this.quad = new this.$THREE.Mesh(plane, materialScreen)
            this.quad.position.z = - 100
            this.sceneScreen.add(this.quad)
            var n = 5,
                geometry = new this.$THREE.SphereBufferGeometry(10, 64, 32),
                material2 = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, map: this.rtTexture.texture })
            for (var j = 0; j < n; j ++) {
                for (var i = 0; i < n; i ++) {
                    var mesh = new this.$THREE.Mesh(geometry, material2)
                    mesh.position.x = (i - (n - 1) / 2) * 20
                    mesh.position.y = (j - (n - 1) / 2) * 20
                    mesh.position.z = 0
                    mesh.rotation.y = - Math.PI / 2
                    this.scene.add(mesh)
                }
            }
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX)
            this.mouseY = (event.clientY - this.windowHalfY)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.0015
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            if (this.zmesh1 && this.zmesh2) {
                this.zmesh1.rotation.y = - time
                this.zmesh2.rotation.y = - time + Math.PI / 2
            }
            if (this.material.uniforms[ "time" ].value > 1 || this.material.uniforms[ "time" ].value < 0) {
                this.delta *= - 1
            }
            this.material.uniforms[ "time" ].value += this.delta
            // Render first this.scene into texture
            this.renderer.setRenderTarget(this.rtTexture)
            this.renderer.clear()
            this.renderer.render(this.sceneRTT, this.cameraRTT)
            // Render full screen quad with generated texture
            this.renderer.setRenderTarget(null)
            this.renderer.clear()
            this.renderer.render(this.sceneScreen, this.cameraRTT)
            // Render second this.scene to screen
            // (using first this.scene as regular texture)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglRtt-container {
    width: 100%;
}
</style>
