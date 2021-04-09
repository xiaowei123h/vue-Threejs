<template>
    <div class="css2dLabel-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> css2d - label</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from '@/components/jsm/renderers/CSS2DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            labelRenderer: null,
			clock: null,
			textureLoader: null,
			moon: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.textureLoader = new this.$THREE.TextureLoader()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var EARTH_RADIUS = 1
            var MOON_RADIUS = 0.27
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 200)
            this.camera.position.set(10, 5, 20)
            this.scene = new this.$THREE.Scene()
            var dirLight = new this.$THREE.DirectionalLight(0xffffff)
            dirLight.position.set(0, 0, 1)
            this.scene.add(dirLight)
            var axesHelper = new this.$THREE.AxesHelper(5)
            this.scene.add(axesHelper)
            //
            var earthGeometry = new this.$THREE.SphereBufferGeometry(EARTH_RADIUS, 16, 16)
            var earthMaterial = new this.$THREE.MeshPhongMaterial({
                specular: 0x333333,
                shininess: 5,
                map: this.textureLoader.load('static/textures/planets/earth_atmos_2048.jpg'),
                specularMap: this.textureLoader.load('static/textures/planets/earth_specular_2048.jpg'),
                normalMap: this.textureLoader.load('static/textures/planets/earth_normal_2048.jpg'),
                normalScale: new this.$THREE.Vector2(0.85, 0.85)
            })
            var earth = new this.$THREE.Mesh(earthGeometry, earthMaterial)
            this.scene.add(earth);
            var moonGeometry = new this.$THREE.SphereBufferGeometry(MOON_RADIUS, 16, 16);
            var moonMaterial = new this.$THREE.MeshPhongMaterial({
                shininess: 5,
                map: this.textureLoader.load('static/textures/planets/moon_1024.jpg')
            })
            this.moon = new this.$THREE.Mesh(moonGeometry, moonMaterial)
            this.scene.add(this.moon)
            //
            var earthDiv = document.createElement('div')
            earthDiv.className = 'label'
            earthDiv.textContent = 'Earth'
            earthDiv.style.marginTop = '-1em'
            var earthLabel = new CSS2DObject(earthDiv)
            earthLabel.position.set(0, EARTH_RADIUS, 0)
            earth.add(earthLabel)
            var moonDiv = document.createElement('div')
            moonDiv.className = 'label'
            moonDiv.textContent = 'Moon'
            moonDiv.style.marginTop = '-1em'
            var moonLabel = new CSS2DObject(moonDiv)
            moonLabel.position.set(0, MOON_RADIUS, 0)
            this.moon.add(moonLabel)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('css2dLabel-container')[0].appendChild(this.renderer.domElement)
            this.labelRenderer = new CSS2DRenderer()
            this.labelRenderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.labelRenderer.domElement.style.position = 'absolute'
            this.labelRenderer.domElement.style.top = '0px'
            document.getElementsByClassName('css2dLabel-container')[0].appendChild(this.labelRenderer.domElement)
            var controls = new OrbitControls(this.camera, this.labelRenderer.domElement)
            controls.minDistance = 5
            controls.maxDistance = 100
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.labelRenderer.setSize(window.innerWidth - 281, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var elapsed = this.clock.getElapsedTime()
            this.moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5)
            this.renderer.render(this.scene, this.camera)
            this.labelRenderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.css2dLabel-container {
    position: relative;
    width: 100%;
}
.label {
    color: #FFF;
    font-family: sans-serif;
    padding: 2px;
    background: rgba(0, 0, 0, .6);
}
</style>
