<template>
    <div class="webglPostprocessingDof-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl depth-of-field with bokeh example<br/>
			shader by <a href="http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html">Martins Upitis</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { BokehPass } from '@/components/jsm/postprocessing/BokehPass.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            singleMaterial: null,
            zmaterial: null,
            parameters: null,
            nobjects: null,
            cubeMaterial: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
			width: null,
			height: null,
            materials: [],
            objects: [],
            postprocessing: {},
            gui: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.width = this.$webglInnerWidth
        this.height = window.innerHeight
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglPostprocessingDof-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.width / this.height, 1, 3000)
            this.camera.position.z = 200
            this.scene = new this.$THREE.Scene()
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.width, this.height)
            container.appendChild(this.renderer.domElement)
            var path = 'static/textures/cube/SwedishRoyalCastle/'
            var format = '.jpg'
            var urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ]
            var textureCube = new this.$THREE.CubeTextureLoader().load(urls)
            this.parameters = { color: 0xff1100, envMap: textureCube }
            this.cubeMaterial = new this.$THREE.MeshBasicMaterial(this.parameters)
            this.singleMaterial = false
            if (this.singleMaterial) zmaterial = [ this.cubeMaterial ]
            var geo = new this.$THREE.SphereBufferGeometry(1, 20, 10)
            var xgrid = 14, ygrid = 9, zgrid = 14
            this.nobjects = xgrid * ygrid * zgrid
            var s = 60
            var count = 0
            for (var i = 0; i < xgrid; i ++) {
                for (var j = 0; j < ygrid; j ++) {
                    for (var k = 0; k < zgrid; k ++) {
                        var mesh
                        if (this.singleMaterial) {
                            mesh = new this.$THREE.Mesh(geo, zmaterial)
                        } else {
                            mesh = new this.$THREE.Mesh(geo, new this.$THREE.MeshBasicMaterial(this.parameters))
                            this.materials[ count ] = mesh.material
                        }
                        var x = 200 * (i - xgrid / 2)
                        var y = 200 * (j - ygrid / 2)
                        var z = 200 * (k - zgrid / 2)
                        mesh.position.set(x, y, z)
                        mesh.scale.set(s, s, s)
                        mesh.matrixAutoUpdate = false
                        mesh.updateMatrix()
                        this.scene.add(mesh)
                        this.objects.push(mesh)
                        count ++
                    }
                }
            }
            this.initPostprocessing()
            this.renderer.autoClear = false
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            container.style.touchAction = 'none'
            container.addEventListener('pointermove', this.onPointerMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
            var effectController = {
                focus: 500.0,
                aperture: 5,
                maxblur: 0.01
            }
            var matChanger = () => {
                this.postprocessing.bokeh.uniforms[ "focus" ].value = effectController.focus
                this.postprocessing.bokeh.uniforms[ "aperture" ].value = effectController.aperture * 0.00001
                this.postprocessing.bokeh.uniforms[ "maxblur" ].value = effectController.maxblur
            }
            this.gui = new GUI()
            this.gui.add(effectController, "focus", 10.0, 3000.0, 10).onChange(matChanger)
            this.gui.add(effectController, "aperture", 0, 10, 0.1).onChange(matChanger)
            this.gui.add(effectController, "maxblur", 0.0, 0.01, 0.001).onChange(matChanger)
            this.gui.close()
            matChanger()
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.mouseX = event.clientX - this.windowHalfX
            this.mouseY = event.clientY - this.windowHalfY
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.width = window.innerWidth - 281
            this.height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.postprocessing.composer.setSize(this.width, this.height)
        },
        initPostprocessing() {
            var renderPass = new RenderPass(this.scene, this.camera)
            var bokehPass = new BokehPass(this.scene, this.camera, {
                focus: 1.0,
                aperture: 0.025,
                maxblur: 0.01,
                width: this.width,
                height: this.height
            })
            var composer = new EffectComposer(this.renderer)
            composer.addPass(renderPass)
            composer.addPass(bokehPass)
            this.postprocessing.composer = composer
            this.postprocessing.bokeh = bokehPass
        },
        animate() {
            requestAnimationFrame(this.animate, this.renderer.domElement)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            var time = Date.now() * 0.00005
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.036
            this.camera.position.y += (- (this.mouseY) - this.camera.position.y) * 0.036
            this.camera.lookAt(this.scene.position)
            if (! this.singleMaterial) {
                for (var i = 0; i < this.nobjects; i ++) {
                    var h = (360 * (i / this.nobjects + time) % 360) / 360
                    this.materials[ i ].color.setHSL(h, 1, 0.5)
                }
            }
            this.postprocessing.composer.render(0.1)
        }
    },
}
</script>

<style scoped>
.webglPostprocessingDof-container {
    position: relative;
    width: 100%;
}
</style>
