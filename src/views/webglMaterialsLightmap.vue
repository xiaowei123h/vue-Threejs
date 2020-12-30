<template>
    <div class="webglMLightmap-container">
        
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            vertexShader: '',
            SCREEN_WIDTH: '',
            SCREEN_HEIGHT: '',
            container: '',
            stats: '',
            camera: '',
            scene: '',
            renderer: '',
            light: '',
            uniforms: {},
            skyGeo: '',
            skyMat: '',
            sky: '',
            controls: '',
            loader: ''
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.initShaderMaterialsData()
        this.init()
        this.animate()
    },
    methods: {
        initShaderMaterialsData() {
            this.vertexShader = `
            varying vec3 vWorldPosition;

			void main() {
				vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
				vWorldPosition = worldPosition.xyz;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`
            this.fragmentShader = `
            uniform vec3 topColor;
			uniform vec3 bottomColor;
			uniform float offset;
			uniform float exponent;

			varying vec3 vWorldPosition;

			void main() {
				float h = normalize( vWorldPosition + offset ).y;
				gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
			}`
        },
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMLightmap-container')[0].appendChild(this.container)
            // document.body.appendChild(container)
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(40, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 10000)
            this.camera.position.set(700, 200, - 500)
            // SCENE
            this.scene = new this.$THREE.Scene()
            // LIGHTS
            this.light = new this.$THREE.DirectionalLight(0xaabbff, 0.3)
            this.light.position.x = 300
            this.light.position.y = 250
            this.light.position.z = - 500
            this.scene.add(this.light)
            // SKYDOME
            // const vertexShader = document.getElementById('vertexShader').textContent
            // const fragmentShader = document.getElementById('fragmentShader').textContent
            this.uniforms = {
                topColor: { value: new this.$THREE.Color(0x0077ff) },
                bottomColor: { value: new this.$THREE.Color(0xffffff) },
                offset: { value: 400 },
                exponent: { value: 0.6 }
            }
            this.uniforms.topColor.value.copy(this.light.color)
            this.skyGeo = new this.$THREE.SphereBufferGeometry(4000, 32, 15)
            this.skyMat = new this.$THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader,
                side: this.$THREE.BackSide
            })
            this.sky = new this.$THREE.Mesh(this.skyGeo, this.skyMat)
            this.scene.add(this.sky)
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            // CONTROLS
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.maxPolarAngle = 0.9 * Math.PI / 2
            this.controls.enableZoom = false
            // STATS
            this.stats = new this.$Stats()
            this.container.appendChild(this.stats.dom)
            // MODEL
            this.loader = new this.$THREE.ObjectLoader()
            var that = this
            this.loader.load("static/models/json/lightmap/lightmap.json", function (object) {
                that.scene.add(object)
            })
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        }
    }
}
</script>

<style scoped>

</style>
