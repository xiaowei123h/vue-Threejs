<template>
    <div class="webglMaterialsVideo-container">
        <div id="overlay">
			<button id="startButton">Play</button>
		</div>
		<div id="container"></div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl video demo<br/>
			playing <a href="http://durian.blender.org/" target="_blank" rel="noopener">sintel</a> trailer
		</div>

		<video id="video" loop crossOrigin="anonymous" playsinline style="display:none">
			<source src="static/textures/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
			<source src="static/textures/sintel.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
		</video>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { BloomPass } from '@/components/jsm/postprocessing/BloomPass.js'
import { CopyShader } from '@/components/jsm/shaders/CopyShader.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            video: null,
            texture: null,
            material: null,
            mesh: null,
			composer: null,
			mouseX: 0,
			mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
			cube_count: null,
			meshes: [],
            materials: [],
            xgrid: 20,
            ygrid: 10,
            startButton: null,
            h: null,
            counter: 1,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.startButton = document.getElementById('startButton')
        this.startButton.addEventListener('click', () => {
            this.init()
            this.animate()
        }, false)
    },
    methods: {
        init() {
            var overlay = document.getElementById('overlay')
            overlay.remove()
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsVideo-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0.5, 1, 1).normalize()
            this.scene.add(light)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.video = document.getElementById('video')
            this.video.play()
            this.video.addEventListener('play', () => {
                this.currentTime = 3
            }, false)
            this.texture = new this.$THREE.VideoTexture(this.video)
            //
            var i, j, ox, oy, geometry
            var ux = 1 / this.xgrid
            var uy = 1 / this.ygrid
            var xsize = 480 / this.xgrid
            var ysize = 204 / this.ygrid
            var parameters = { color: 0xffffff, map: this.texture }
            this.cube_count = 0
            for (i = 0; i < this.xgrid; i ++) {
                for (j = 0; j < this.ygrid; j ++) {
                    ox = i
                    oy = j
                    geometry = new this.$THREE.BoxBufferGeometry(xsize, ysize, xsize)
                    this.change_uvs(geometry, ux, uy, ox, oy)
                    this.materials[ this.cube_count ] = new this.$THREE.MeshLambertMaterial(parameters)
                    this.material = this.materials[ this.cube_count ]
                    this.material.hue = i / this.xgrid
                    this.material.saturation = 1 - j / this.ygrid
                    this.material.color.setHSL(this.material.hue, this.material.saturation, 0.5)
                    this.mesh = new this.$THREE.Mesh(geometry, this.material)
                    this.mesh.position.x = (i - this.xgrid / 2) * xsize
                    this.mesh.position.y = (j - this.ygrid / 2) * ysize
                    this.mesh.position.z = 0
                    this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = 1
                    this.scene.add(this.mesh)
                    this.mesh.dx = 0.001 * (0.5 - Math.random())
                    this.mesh.dy = 0.001 * (0.5 - Math.random())
                    this.meshes[ this.cube_count ] = this.mesh
                    this.cube_count += 1
                }
            }
            this.renderer.autoClear = false
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            // postprocessing
            var renderModel = new RenderPass(this.scene, this.camera)
            var effectBloom = new BloomPass(1.3)
            var effectCopy = new ShaderPass(CopyShader)
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(renderModel)
            this.composer.addPass(effectBloom)
            this.composer.addPass(effectCopy)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(window.innerWidth - 281, window.innerHeight)
        },
        change_uvs(geometry, unitx, unity, offsetx, offsety) {
            var uvs = geometry.attributes.uv.array
            for (var i = 0; i < uvs.length; i += 2) {
                uvs[ i ] = (uvs[ i ] + offsetx) * unitx
                uvs[ i + 1 ] = (uvs[ i + 1 ] + offsety) * unity
            }
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX)
            this.mouseY = (event.clientY - this.windowHalfY) * 0.3
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var time = Date.now() * 0.00005
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * 0.05
            this.camera.lookAt(this.scene.position)
            for (var i = 0; i < this.cube_count; i ++) {
                this.material = this.materials[ i ]
                this.h = (360 * (this.material.hue + time) % 360) / 360
                this.material.color.setHSL(this.h, this.material.saturation, 0.5)
            }
            if (this.counter % 1000 > 200) {
                for (var i = 0; i < this.cube_count; i ++) {
                    this.mesh = this.meshes[ i ]
                    this.mesh.rotation.x += 10 * this.mesh.dx
                    this.mesh.rotation.y += 10 * this.mesh.dy
                    this.mesh.position.x -= 150 * this.mesh.dx
                    this.mesh.position.y += 150 * this.mesh.dy
                    this.mesh.position.z += 300 * this.mesh.dx
                }
            }
            if (this.counter % 1000 === 0) {
                for (var i = 0; i < this.cube_count; i ++) {
                    this.mesh = this.meshes[ i ]
                    this.mesh.dx *= - 1
                    this.mesh.dy *= - 1
                }
            }
            this.counter ++
            this.renderer.clear()
            this.composer.render()
        }
    },
}
</script>

<style scoped>
.webglMaterialsVideo-container {
    width: 100%;
}
</style>
