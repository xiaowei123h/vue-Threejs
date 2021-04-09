<template>
    <div class="webglPostprocessingUnrealBloomSelective-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> Click on a sphere to toggle bloom<br>By <a href="http://github.com/Temdog007" target="_blank" rel="noopener">Temdog007</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from '@/components/jsm/postprocessing/UnrealBloomPass.js'
export default {
    data() {
        return {
            vertexshader: null,
            fragmentshader: null,
            ENTIRE_SCENE: 0,
            bloomLayer: null,
            params: null,
            darkMaterial: null,
            materials: null,
            renderer: null,
            scene: null,
            camera: null,
            controls: null,
            renderScene: null,
            bloomPass: null,
            bloomComposer: null,
            finalPass: null,
            finalComposer: null,
            raycaster: null,
            mouse: null,
            gui: null,
            folder: null,
            BLOOM_SCENE: 1
        }
    },
    mounted() {
        this.vertexshader = `
            varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`
        this.fragmentshader = `
            uniform sampler2D baseTexture;
			uniform sampler2D bloomTexture;
			varying vec2 vUv;
			void main() {
				gl_FragColor = (texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv));
            }`
        this.bloomLayer = new this.$THREE.Layers()
        this.bloomLayer.set(this.BLOOM_SCENE)
        this.params = {
            exposure: 1,
            bloomStrength: 5,
            bloomThreshold: 0,
            bloomRadius: 0,
            scene: "Scene with Glow"
        }
        this.darkMaterial = new this.$THREE.MeshBasicMaterial({ color: "black" })
        this.materials = {}
        this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
        this.renderer.toneMapping = this.$THREE.ReinhardToneMapping
        document.getElementsByClassName('webglPostprocessingUnrealBloomSelective-container')[0].appendChild(this.renderer.domElement)
        this.scene = new this.$THREE.Scene()
        this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 200)
        this.camera.position.set(0, 0, 20)
        this.camera.lookAt(0, 0, 0)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.maxPolarAngle = Math.PI * 0.5
        this.controls.minDistance = 1
        this.controls.maxDistance = 100
        this.controls.addEventListener('change', this.render)
        this.scene.add(new this.$THREE.AmbientLight(0x404040))
        this.renderScene = new RenderPass(this.scene, this.camera)
        this.bloomPass = new UnrealBloomPass(new this.$THREE.Vector2(this.$webglInnerWidth, window.innerHeight), 1.5, 0.4, 0.85)
        this.bloomPass.threshold = this.params.bloomThreshold
        this.bloomPass.strength = this.params.bloomStrength
        this.bloomPass.radius = this.params.bloomRadius
        this.bloomComposer = new EffectComposer(this.renderer)
        this.bloomComposer.renderToScreen = false
        this.bloomComposer.addPass(this.renderScene)
        this.bloomComposer.addPass(this.bloomPass)
        this.finalPass = new ShaderPass(
            new this.$THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                },
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader,
                defines: {}
            }), "baseTexture"
        )
        this.finalPass.needsSwap = true
        this.finalComposer = new EffectComposer(this.renderer)
        this.finalComposer.addPass(this.renderScene)
        this.finalComposer.addPass(this.finalPass)
        this.raycaster = new this.$THREE.Raycaster()
        this.mouse = new this.$THREE.Vector2()
        window.addEventListener('click', this.onDocumentMouseClick, false)
        this.gui = new GUI()
        this.gui.add(this.params, 'scene', [ 'Scene with Glow', 'Glow only', 'Scene only' ]).onChange((value) => {
            switch (value) 	{
                case 'Scene with Glow':
                    this.bloomComposer.renderToScreen = false
                    break
                case 'Glow only':
                    this.bloomComposer.renderToScreen = true
                    break
                case 'Scene only':
                    // nothing to do
                    break
            }
            this.render()
        })
        this.folder = this.gui.addFolder('Bloom Parameters')
        this.folder.add(this.params, 'exposure', 0.1, 2).onChange((value) => {
            this.renderer.toneMappingExposure = Math.pow(value, 4.0)
            this.render()
        })
        this.folder.add(this.params, 'bloomThreshold', 0.0, 1.0).onChange((value) => {
            this.bloomPass.threshold = Number(value)
            this.render()
        })
        this.folder.add(this.params, 'bloomStrength', 0.0, 10.0).onChange((value) => {
            this.bloomPass.strength = Number(value)
            this.render()
        })
        this.folder.add(this.params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange((value) => {
            this.bloomPass.radius = Number(value)
            this.render()
        })
        this.setupScene()
        window.onresize = () => {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.bloomComposer.setSize(width, height)
            this.finalComposer.setSize(width, height)
            this.render()
        }
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        onDocumentMouseClick(event) {
            event.preventDefault()
            this.mouse.x = (event.clientX / this.$webglInnerWidth) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObjects(this.scene.children)
            if (intersects.length > 0) {
                var object = intersects[ 0 ].object
                object.layers.toggle(this.BLOOM_SCENE)
                this.render()
            }
        },
        setupScene() {
            this.scene.traverse(this.disposeMaterial)
            this.scene.children.length = 0
            var geometry = new this.$THREE.IcosahedronBufferGeometry(1, 15)
            for (var i = 0; i < 50; i ++) {
                var color = new this.$THREE.Color()
                color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05)
                var material = new this.$THREE.MeshBasicMaterial({ color: color })
                var sphere = new this.$THREE.Mesh(geometry, material)
                sphere.position.x = Math.random() * 10 - 5
                sphere.position.y = Math.random() * 10 - 5
                sphere.position.z = Math.random() * 10 - 5
                sphere.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0)
                sphere.scale.setScalar(Math.random() * Math.random() + 0.5)
                this.scene.add(sphere)
                if (Math.random() < 0.25) sphere.layers.enable(this.BLOOM_SCENE)
            }
            this.render()
        },
        disposeMaterial(obj) {
            if (obj.material) {
                obj.material.dispose()
            }
        },
        render() {
            switch (this.params.scene) {
                case 'Scene only':
                    this.renderer.render(this.scene, this.camera)
                    break
                case 'Glow only':
                    this.renderBloom(false)
                    break
                case 'Scene with Glow':
                default:
                    // render scene with bloom
                    this.renderBloom(true)
                    // render the entire scene, then render bloom scene on top
                    this.finalComposer.render()
                    break
            }
        },
        renderBloom(mask) {
            if (mask === true) {
                this.scene.traverse(this.darkenNonBloomed)
                this.bloomComposer.render()
                this.scene.traverse(this.restoreMaterial)
            } else {
                this.camera.layers.set(this.BLOOM_SCENE)
                this.bloomComposer.render()
                this.camera.layers.set(this.ENTIRE_SCENE)
            }
        },
        darkenNonBloomed(obj) {
            if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
                this.materials[ obj.uuid ] = obj.material
                obj.material = this.darkMaterial
            }
        },
        restoreMaterial(obj) {
            if (this.materials[ obj.uuid ]) {
                obj.material = this.materials[ obj.uuid ]
                delete this.materials[ obj.uuid ]
            }
        }
    },
}
</script>

<style scoped>
.webglPostprocessingUnrealBloomSelective-container {
    position: relative;
    width: 100%;
}
</style>
