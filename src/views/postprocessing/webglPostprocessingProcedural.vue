<template>
    <div class="webglPostprocessingProcedural-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Procedural Effects Example by <a href="https://clara.io" target="_blank" rel="noopener">Ben Houston</a><br/><br/>
		</div>
        <div id="container"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            proceduralVert: null,
            noiseRandom1DFrag: null,
            noiseRandom2DFrag: null,
            noiseRandom3DFrag: null,
            camera: null,
            postScene: null,
            renderer: null,
            postMaterial: null,
            noiseRandom1DMaterial: null,
            noiseRandom2DMaterial: null,
            noiseRandom3DMaterial: null,
            postQuad: null,
			stats: null,
            params: { procedure: 'noiseRandom3D' },
            gui: null,
        }
    },
    mounted() {
        this.proceduralVert = `
            varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`
        this.noiseRandom1DFrag = `
            #include <common>

			varying vec2 vUv;

			void main() {
				gl_FragColor.xyz = vec3(rand(vUv));
				gl_FragColor.w = 1.0;
            }`
        this.noiseRandom2DFrag = `
            #include <common>

			varying vec2 vUv;

			void main() {
				vec2 rand2 = vec2(rand(vUv), rand(vUv + vec2(0.4, 0.6)));
				gl_FragColor.xyz = mix(mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 1.0), rand2.x), vec3(0.0), rand2.y);
				gl_FragColor.w = 1.0;
            }`
        this.noiseRandom3DFrag = `
            #include <common>

			varying vec2 vUv;

			void main() {
				vec3 rand3 = vec3(rand(vUv), rand(vUv + vec2(0.4, 0.6)), rand(vUv + vec2(0.6, 0.4)));
				gl_FragColor.xyz = rand3;
				gl_FragColor.w = 1.0;
            }`
        this.init()
        this.animate()
        this.initGui()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        initGui() {
            this.gui = new GUI()
            this.gui.add(this.params, 'procedure', [ 'noiseRandom1D', 'noiseRandom2D', 'noiseRandom3D' ])
        },
        init() {
            var container = document.getElementById("container")
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessingProcedural-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            // Setup post processing stage
            this.camera = new this.$THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1)
            this.noiseRandom1DMaterial = new this.$THREE.ShaderMaterial({
                vertexShader: this.proceduralVert,
                fragmentShader: this.noiseRandom1DFrag
            })
            this.noiseRandom2DMaterial = new this.$THREE.ShaderMaterial({
                vertexShader: this.proceduralVert,
                fragmentShader: this.noiseRandom2DFrag
            })
            this.noiseRandom3DMaterial = new this.$THREE.ShaderMaterial({
                vertexShader: this.proceduralVert,
                fragmentShader: this.noiseRandom3DFrag
            })
            this.postMaterial = this.noiseRandom3DMaterial
            var postPlane = new this.$THREE.PlaneBufferGeometry(2, 2)
            this.postQuad = new this.$THREE.Mesh(postPlane, this.postMaterial)
            this.postScene = new this.$THREE.Scene()
            this.postScene.add(this.postQuad)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            switch (this.params.procedure) {
                case 'noiseRandom1D': this.postMaterial = this.noiseRandom1DMaterial; break
                case 'noiseRandom2D': this.postMaterial = this.noiseRandom2DMaterial; break
                case 'noiseRandom3D': this.postMaterial = this.noiseRandom3DMaterial; break
            }
            this.postQuad.material = this.postMaterial
            // render post FX
            this.renderer.render(this.postScene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingProcedural-container {
    position: relative;
    width: 100%;
}
</style>
