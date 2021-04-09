<template>
    <div class="webglPostprocessingDof2-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl realistic depth-of-field bokeh example<br/>
			shader ported from <a href="http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)">Martins Upitis</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { BokehShader, BokehDepthShader } from '@/components/jsm/shaders/BokehShader2.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            materialDepth: null,
			windowHalfX: null,
			windowHalfY: null,
			distance: 100,
			effectController: null,
			postprocessing: { enabled: true },
			shaderSettings: {
				rings: 3,
				samples: 4
			},
			mouse: null,
			raycaster: null,
			target: null,
			planes: [],
            leaves: 100,
            gui: null,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.raycaster = new this.$THREE.Raycaster()
        this.target = new this.$THREE.Vector3(0, 20, - 50)
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglPostprocessingDof2-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 3000)
            this.camera.position.y = 150
            this.camera.position.z = 450
            this.scene = new this.$THREE.Scene()
            this.scene.add(this.camera)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false
            this.container.appendChild(this.renderer.domElement)
            var depthShader = BokehDepthShader
            this.materialDepth = new this.$THREE.ShaderMaterial({
                uniforms: depthShader.uniforms,
                vertexShader: depthShader.vertexShader,
                fragmentShader: depthShader.fragmentShader
            })
            this.materialDepth.uniforms[ 'mNear' ].value = this.camera.near
            this.materialDepth.uniforms[ 'mFar' ].value = this.camera.far
            // skybox
            var r = 'static/textures/cube/Bridge2/'
            var urls = [ r + 'posx.jpg', r + 'negx.jpg',
                            r + 'posy.jpg', r + 'negy.jpg',
                            r + 'posz.jpg', r + 'negz.jpg' ]
            var textureCube = new this.$THREE.CubeTextureLoader().load(urls)
            this.scene.background = textureCube
            // plane particles
            var planePiece = new this.$THREE.PlaneBufferGeometry(10, 10, 1, 1)
            var planeMat = new this.$THREE.MeshPhongMaterial({
                color: 0xffffff * 0.4,
                shininess: 0.5,
                specular: 0xffffff,
                envMap: textureCube,
                side: this.$THREE.DoubleSide
            })
            var rand = Math.random
            for (var i = 0; i < this.leaves; i ++) {
                var plane = new this.$THREE.Mesh(planePiece, planeMat)
                plane.rotation.set(rand(), rand(), rand())
                plane.rotation.dx = rand() * 0.1
                plane.rotation.dy = rand() * 0.1
                plane.rotation.dz = rand() * 0.1
                plane.position.set(rand() * 150, 0 + rand() * 300, rand() * 150)
                plane.position.dx = (rand() - 0.5)
                plane.position.dz = (rand() - 0.5)
                this.scene.add(plane)
                this.planes.push(plane)
            }
            // adding Monkeys
            var loader2 = new this.$THREE.BufferGeometryLoader()
            loader2.load('static/models/json/suzanne_buffergeometry.json', (geometry) => {
                geometry.computeVertexNormals()
                var material = new this.$THREE.MeshPhongMaterial({
                    specular: 0xffffff,
                    envMap: textureCube,
                    shininess: 50,
                    reflectivity: 1.0,
                    flatShading: true
                })
                var monkeys = 20
                for (var i = 0; i < monkeys; i ++) {
                    var mesh = new this.$THREE.Mesh(geometry, material)
                    mesh.position.z = Math.cos(i / monkeys * Math.PI * 2) * 200
                    mesh.position.y = Math.sin(i / monkeys * Math.PI * 3) * 20
                    mesh.position.x = Math.sin(i / monkeys * Math.PI * 2) * 200
                    mesh.rotation.y = i / monkeys * Math.PI * 2
                    mesh.scale.setScalar(30)
                    this.scene.add(mesh)
                }
            })
            // add balls
            var geometry = new this.$THREE.SphereBufferGeometry(1, 20, 20)
            for (var i = 0; i < 20; i ++) {
                var ballmaterial = new this.$THREE.MeshPhongMaterial({
                    color: 0xffffff * Math.random(),
                    shininess: 0.5,
                    specular: 0xffffff,
                    envMap: textureCube })
                var mesh = new this.$THREE.Mesh(geometry, ballmaterial)
                mesh.position.x = (Math.random() - 0.5) * 200
                mesh.position.y = Math.random() * 50
                mesh.position.z = (Math.random() - 0.5) * 200
                mesh.scale.multiplyScalar(10)
                this.scene.add(mesh)
            }
            // lights
            this.scene.add(new this.$THREE.AmbientLight(0x222222))
            var directionalLight1 = new this.$THREE.DirectionalLight(0xffffff, 2)
            directionalLight1.position.set(2, 1.2, 10).normalize()
            this.scene.add(directionalLight1)
            var directionalLight2 = new this.$THREE.DirectionalLight(0xffffff, 1)
            directionalLight2.position.set(- 2, 1.2, - 10).normalize()
            this.scene.add(directionalLight2)
            this.initPostprocessing()
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            this.container.style.touchAction = 'none'
            this.container.addEventListener('pointermove', this.onPointerMove, false)
            this.effectController = {
                enabled: true,
                jsDepthCalculation: true,
                shaderFocus: false,
                fstop: 2.2,
                maxblur: 1.0,
                showFocus: false,
                focalDepth: 2.8,
                manualdof: false,
                vignetting: false,
                depthblur: false,
                threshold: 0.5,
                gain: 2.0,
                bias: 0.5,
                fringe: 0.7,
                focalLength: 35,
                noise: true,
                pentagon: false,
                dithering: 0.0001
            }
            var matChanger = () => {
                for (var e in this.effectController) {
                    if (e in this.postprocessing.bokeh_uniforms) {
                        this.postprocessing.bokeh_uniforms[ e ].value = this.effectController[ e ]
                    }
                }
                this.postprocessing.enabled = this.effectController.enabled
                this.postprocessing.bokeh_uniforms[ 'znear' ].value = this.camera.near
                this.postprocessing.bokeh_uniforms[ 'zfar' ].value = this.camera.far
                this.camera.setFocalLength(this.effectController.focalLength)
            }
            this.gui = new GUI()
            this.gui.add(this.effectController, 'enabled').onChange(matChanger)
            this.gui.add(this.effectController, 'jsDepthCalculation').onChange(matChanger)
            this.gui.add(this.effectController, 'shaderFocus').onChange(matChanger)
            this.gui.add(this.effectController, 'focalDepth', 0.0, 200.0).listen().onChange(matChanger)
            this.gui.add(this.effectController, 'fstop', 0.1, 22, 0.001).onChange(matChanger)
            this.gui.add(this.effectController, 'maxblur', 0.0, 5.0, 0.025).onChange(matChanger)
            this.gui.add(this.effectController, 'showFocus').onChange(matChanger)
            this.gui.add(this.effectController, 'manualdof').onChange(matChanger)
            this.gui.add(this.effectController, 'vignetting').onChange(matChanger)
            this.gui.add(this.effectController, 'depthblur').onChange(matChanger)
            this.gui.add(this.effectController, 'threshold', 0, 1, 0.001).onChange(matChanger)
            this.gui.add(this.effectController, 'gain', 0, 100, 0.001).onChange(matChanger)
            this.gui.add(this.effectController, 'bias', 0, 3, 0.001).onChange(matChanger)
            this.gui.add(this.effectController, 'fringe', 0, 5, 0.001).onChange(matChanger)
            this.gui.add(this.effectController, 'focalLength', 16, 80, 0.001).onChange(matChanger)
            this.gui.add(this.effectController, 'noise').onChange(matChanger)
            this.gui.add(this.effectController, 'dithering', 0, 0.001, 0.0001).onChange(matChanger)
            this.gui.add(this.effectController, 'pentagon').onChange(matChanger)
            this.gui.add(this.shaderSettings, 'rings', 1, 8).step(1).onChange(this.shaderUpdate)
            this.gui.add(this.shaderSettings, 'samples', 1, 13).step(1).onChange(this.shaderUpdate)
            matChanger()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.postprocessing.rtTextureDepth.setSize((window.innerWidth - 281), window.innerHeight)
            this.postprocessing.rtTextureColor.setSize((window.innerWidth - 281), window.innerHeight)
            this.postprocessing.bokeh_uniforms[ 'textureWidth' ].value = (window.innerWidth - 281)
            this.postprocessing.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.mouse.x = (event.clientX - this.windowHalfX) / this.windowHalfX
            this.mouse.y = - (event.clientY - this.windowHalfY) / this.windowHalfY
            this.postprocessing.bokeh_uniforms[ 'focusCoords' ].value.set(event.clientX / window.innerWidth, 1 - (event.clientY / window.innerHeight))
        },
        initPostprocessing() {
            this.postprocessing.scene = new this.$THREE.Scene()
            this.postprocessing.camera = new this.$THREE.OrthographicCamera(this.$webglInnerWidth / - 2, this.$webglInnerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000)
            this.postprocessing.camera.position.z = 100
            this.postprocessing.scene.add(this.postprocessing.camera)
            var pars = { minFilter: this.$THREE.LinearFilter, magFilter: this.$THREE.LinearFilter, format: this.$THREE.RGBFormat }
            this.postprocessing.rtTextureDepth = new this.$THREE.WebGLRenderTarget(this.$webglInnerWidth, window.innerHeight, pars)
            this.postprocessing.rtTextureColor = new this.$THREE.WebGLRenderTarget(this.$webglInnerWidth, window.innerHeight, pars)
            var bokeh_shader = BokehShader
            this.postprocessing.bokeh_uniforms = this.$THREE.UniformsUtils.clone(bokeh_shader.uniforms)
            this.postprocessing.bokeh_uniforms[ 'tColor' ].value = this.postprocessing.rtTextureColor.texture
            this.postprocessing.bokeh_uniforms[ 'tDepth' ].value = this.postprocessing.rtTextureDepth.texture
            this.postprocessing.bokeh_uniforms[ 'textureWidth' ].value = this.$webglInnerWidth
            this.postprocessing.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight
            this.postprocessing.materialBokeh = new this.$THREE.ShaderMaterial({
                uniforms: this.postprocessing.bokeh_uniforms,
                vertexShader: bokeh_shader.vertexShader,
                fragmentShader: bokeh_shader.fragmentShader,
                defines: {
                    RINGS: this.shaderSettings.rings,
                    SAMPLES: this.shaderSettings.samples
                }
            })
            this.postprocessing.quad = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(this.$webglInnerWidth, window.innerHeight), this.postprocessing.materialBokeh)
            this.postprocessing.quad.position.z = - 500
            this.postprocessing.scene.add(this.postprocessing.quad)
        },
        shaderUpdate() {
            this.postprocessing.materialBokeh.defines.RINGS = this.shaderSettings.rings
            this.postprocessing.materialBokeh.defines.SAMPLES = this.shaderSettings.samples
            this.postprocessing.materialBokeh.needsUpdate = true
        },
        animate() {
            requestAnimationFrame(this.animate, this.renderer.domElement)
            this.render()
            this.stats.update()
        },
        linearize(depth) {
            var zfar = this.camera.far
            var znear = this.camera.near
            return - zfar * znear / (depth * (zfar - znear) - zfar)
        },
        smoothstep(near, far, depth) {
            var x = this.saturate((depth - near) / (far - near))
            return x * x * (3 - 2 * x)
        },
        saturate(x) {
            return Math.max(0, Math.min(1, x))
        },
        render() {
            var time = Date.now() * 0.00015
            this.camera.position.x = Math.cos(time) * 400
            this.camera.position.z = Math.sin(time) * 500
            this.camera.position.y = Math.sin(time / 1.4) * 100
            this.camera.lookAt(this.target)
            this.camera.updateMatrixWorld()
            if (this.effectController.jsDepthCalculation) {
                this.raycaster.setFromCamera(this.mouse, this.camera)
                var intersects = this.raycaster.intersectObjects(this.scene.children, true)
                var targetDistance = (intersects.length > 0) ? intersects[ 0 ].distance : 1000
                this.distance += (targetDistance - this.distance) * 0.03
                var sdistance = this.smoothstep(this.camera.near, this.camera.far, this.distance)
                var ldistance = this.linearize(1 - sdistance)
                this.postprocessing.bokeh_uniforms[ 'focalDepth' ].value = ldistance
                this.effectController[ 'focalDepth' ] = ldistance
            }
            for (var i = 0; i < this.leaves; i ++) {
                var plane = this.planes[ i ]
                plane.rotation.x += plane.rotation.dx
                plane.rotation.y += plane.rotation.dy
                plane.rotation.z += plane.rotation.dz
                plane.position.y -= 2
                plane.position.x += plane.position.dx
                plane.position.z += plane.position.dz
                if (plane.position.y < 0) plane.position.y += 300
            }
            if (this.postprocessing.enabled) {
                this.renderer.clear()
                // render this.scene into texture
                this.renderer.setRenderTarget(this.postprocessing.rtTextureColor)
                this.renderer.clear()
                this.renderer.render(this.scene, this.camera)
                // render depth into texture
                this.scene.overrideMaterial = this.materialDepth
                this.renderer.setRenderTarget(this.postprocessing.rtTextureDepth)
                this.renderer.clear()
                this.renderer.render(this.scene, this.camera)
                this.scene.overrideMaterial = null
                // render bokeh composite
                this.renderer.setRenderTarget(null)
                this.renderer.render(this.postprocessing.scene, this.postprocessing.camera)
            } else {
                this.scene.overrideMaterial = null
                this.renderer.setRenderTarget(null)
                this.renderer.clear()
                this.renderer.render(this.scene, this.camera)
            }
        }
    },
}
</script>

<style scoped>
.webglPostprocessingDof2-container {
    position: relative;
    width: 100%;
}
</style>
