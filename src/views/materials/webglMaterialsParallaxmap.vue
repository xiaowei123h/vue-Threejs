<template>
    <div class="webglMaterialsParallaxmap-container">
        <div id="info">
			<a href="https://threejs.org">Three.js</a> parallax mapping <br />
			Oryginal shaders authors:
			<a href="http://sunandblackcat.com/tipFullView.php?topicid=28">Igor Dyhta</a>,
			<a href="http://mmikkelsen3d.blogspot.sk/2012/02/parallaxpoc-mapping-and-no-tangent.html">Morten S. Mikkelsen</a><br />
			Texture by <a href="http://agf81.deviantart.com/">AGF81</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ParallaxShader } from '@/components/jsm/shaders/ParallaxShader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            material: null,
            renderer: null,
            stats: null,
            gui: null,
            effectController: {
				'mode': 'relief',
				'scale': 0.005,
				'minLayers': 20,
				'maxLayers': 25
			}
        }
    },
    mounted() {
        this.init()
        this.initGUI()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsParallaxmap-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.01, 10)
            this.camera.position.z = 2
            this.scene = new this.$THREE.Scene()
            //
            var shader = ParallaxShader
            var uniforms = this.$THREE.UniformsUtils.clone(shader.uniforms)
            var parameters = {
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: uniforms
            }
            //
            var textureLoader = new this.$THREE.TextureLoader()
            this.material = new this.$THREE.ShaderMaterial(parameters)
            this.material.map = textureLoader.load('static/textures/brick_diffuse.jpg')
            this.material.bumpMap = textureLoader.load('static/textures/brick_bump.jpg')
            this.material.map.anisotropy = 4
            this.material.bumpMap.anisotropy = 4
            uniforms[ 'map' ].value = this.material.map
            uniforms[ 'bumpMap' ].value = this.material.bumpMap
            //
            var geometry = new this.$THREE.BoxBufferGeometry(1.0, 1.0, 1.0)
            var mesh = new this.$THREE.Mesh(geometry, this.material)
            this.scene.add(mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 1
            controls.maxDistance = 5
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        guiChanged() {
            var uniforms = this.material.uniforms
            uniforms[ 'parallaxScale' ].value = - 1.0 * this.effectController.scale
            uniforms[ 'parallaxMinLayers' ].value = this.effectController.minLayers
            uniforms[ 'parallaxMaxLayers' ].value = this.effectController.maxLayers
            this.material.defines = {}
            this.material.defines[ ParallaxShader.modes[ this.effectController.mode ] ] = ''
            this.material.needsUpdate = true
        },
        initGUI() {
            this.gui = new GUI()
            this.gui.add(this.effectController, 'mode', Object.keys(ParallaxShader.modes)).onChange(this.guiChanged)
            this.gui.add(this.effectController, 'scale', 0.0, 0.01, 0.001).onChange(this.guiChanged)
            this.gui.add(this.effectController, 'minLayers', 1.0, 30, 1).onChange(this.guiChanged)
            this.gui.add(this.effectController, 'maxLayers', 1.0, 30, 1).onChange(this.guiChanged)
            this.guiChanged()
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
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsParallaxmap-container {
    width: 100%;
}
</style>
