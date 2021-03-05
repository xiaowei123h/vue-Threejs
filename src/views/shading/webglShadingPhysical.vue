<template>
    <div class="webglShadingPhysical-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl physically based shading testbed
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			mesh: null,
			controls: null,
			cubeCamera: null,
            sunLight: null,
            pointLight: null,
            ambientLight: null,
			mixer: null,
			clock: null,
            gui: null,
            shadowCameraHelper: null,
			shadowConfig: {
				shadowCameraVisible: false,
				shadowCameraNear: 750,
				shadowCameraFar: 4000,
				shadowBias: - 0.0002
			},
        }
    },
    mounted() {
        this.init()
        this.animate()
        this.clock = new this.$THREE.Clock()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglShadingPhysical-container')[0].appendChild(container)
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 2, 10000)
            this.camera.position.set(500, 400, 1200)
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.Fog(0, 1000, 10000)
            // CUBE CAMERA
            var cubeRenderTarget = new this.$THREE.WebGLCubeRenderTarget(128, {
                format: this.$THREE.RGBFormat,
                generateMipmaps: true,
                minFilter: this.$THREE.LinearMipmapLinearFilter,
                encoding: this.$THREE.sRGBEncoding
            })
            this.cubeCamera = new this.$THREE.CubeCamera(1, 10000, cubeRenderTarget)
            // TEXTURES
            var textureLoader = new this.$THREE.TextureLoader()
            var textureSquares = textureLoader.load("static/textures/patterns/bright_squares256.png")
            textureSquares.repeat.set(50, 50)
            textureSquares.wrapS = textureSquares.wrapT = this.$THREE.RepeatWrapping
            textureSquares.magFilter = this.$THREE.NearestFilter
            textureSquares.encoding = this.$THREE.sRGBEncoding
            var textureNoiseColor = textureLoader.load("static/textures/disturb.jpg")
            textureNoiseColor.repeat.set(1, 1)
            textureNoiseColor.wrapS = textureNoiseColor.wrapT = this.$THREE.RepeatWrapping
            textureNoiseColor.encoding = this.$THREE.sRGBEncoding
            var textureLava = textureLoader.load("static/textures/lava/lavatile.jpg")
            textureLava.repeat.set(6, 2)
            textureLava.wrapS = textureLava.wrapT = this.$THREE.RepeatWrapping
            textureLava.encoding = this.$THREE.sRGBEncoding
            // GROUND
            var groundMaterial = new this.$THREE.MeshPhongMaterial({
                shininess: 80,
                color: 0xffffff,
                specular: 0xffffff,
                map: textureSquares
            })
            var planeGeometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            var ground = new this.$THREE.Mesh(planeGeometry, groundMaterial)
            ground.position.set(0, 0, 0)
            ground.rotation.x = - Math.PI / 2
            ground.scale.set(1000, 1000, 1000)
            ground.receiveShadow = true
            this.scene.add(ground)
            // MATERIALS
            var materialLambert = new this.$THREE.MeshPhongMaterial({ shininess: 50, color: 0xffffff, map: textureNoiseColor })
            var materialPhong = new this.$THREE.MeshPhongMaterial({ shininess: 50, color: 0xffffff, specular: 0x999999, map: textureLava })
            var materialPhongCube = new this.$THREE.MeshPhongMaterial({ shininess: 50, color: 0xffffff, specular: 0x999999, envMap: cubeRenderTarget.texture })
            // OBJECTS
            var sphereGeometry = new this.$THREE.SphereBufferGeometry(100, 64, 32)
            var torusGeometry = new this.$THREE.TorusBufferGeometry(240, 60, 32, 64)
            var cubeGeometry = new this.$THREE.BoxBufferGeometry(150, 150, 150)
            var that = this
            addObject(torusGeometry, materialPhong, 0, 100, 0, 0)
            addObject(cubeGeometry, materialLambert, 350, 75, 300, 0)
            this.mesh = addObject(sphereGeometry, materialPhongCube, 350, 100, - 350, 0)
            this.mesh.add(this.cubeCamera)
            function addObjectColor(geometry, color, x, y, z, ry) {
                var material = new that.$THREE.MeshPhongMaterial({ color: 0xffffff })
                return addObject(geometry, material, x, y, z, ry)
            }
            function addObject(geometry, material, x, y, z, ry) {
                var tmpMesh = new that.$THREE.Mesh(geometry, material)
                tmpMesh.material.color.offsetHSL(0.1, - 0.1, 0)
                tmpMesh.position.set(x, y, z)
                tmpMesh.rotation.y = ry
                tmpMesh.castShadow = true
                tmpMesh.receiveShadow = true
                that.scene.add(tmpMesh)
                return tmpMesh
            }
            var bigCube = new this.$THREE.BoxBufferGeometry(50, 500, 50)
            var midCube = new this.$THREE.BoxBufferGeometry(50, 200, 50)
            var smallCube = new this.$THREE.BoxBufferGeometry(100, 100, 100)
            addObjectColor(bigCube, 0xff0000, - 500, 250, 0, 0)
            addObjectColor(smallCube, 0xff0000, - 500, 50, - 150, 0)
            addObjectColor(midCube, 0x00ff00, 500, 100, 0, 0)
            addObjectColor(smallCube, 0x00ff00, 500, 50, - 150, 0)
            addObjectColor(midCube, 0x0000ff, 0, 100, - 500, 0)
            addObjectColor(smallCube, 0x0000ff, - 150, 50, - 500, 0)
            addObjectColor(midCube, 0xff00ff, 0, 100, 500, 0)
            addObjectColor(smallCube, 0xff00ff, - 150, 50, 500, 0)
            addObjectColor(new this.$THREE.BoxBufferGeometry(500, 10, 10), 0xffff00, 0, 600, 0, Math.PI / 4)
            addObjectColor(new this.$THREE.BoxBufferGeometry(250, 10, 10), 0xffff00, 0, 600, 0, 0)
            addObjectColor(new this.$THREE.SphereBufferGeometry(100, 32, 26), 0xffffff, - 300, 100, 300, 0)
            // MORPHS
            var loader = new GLTFLoader()
            loader.load("static/models/gltf/SittingBox.glb", (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                this.mixer = new this.$THREE.AnimationMixer(mesh)
                this.mixer.clipAction(gltf.animations[ 0 ]).setDuration(10).play()
                var s = 200
                mesh.scale.set(s, s, s)
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
            })
            // LIGHTS
            this.ambientLight = new this.$THREE.AmbientLight(0x3f2806)
            this.scene.add(this.ambientLight)
            this.pointLight = new this.$THREE.PointLight(0xffaa00, 1, 5000)
            this.scene.add(this.pointLight)
            this.sunLight = new this.$THREE.DirectionalLight(0xffffff, 0.3)
            this.sunLight.position.set(1000, 2000, 1000)
            this.sunLight.castShadow = true
            this.sunLight.shadow.camera.top = 750
            this.sunLight.shadow.camera.bottom = - 750
            this.sunLight.shadow.camera.left = - 750
            this.sunLight.shadow.camera.right = 750
            this.sunLight.shadow.camera.near = this.shadowConfig.shadowCameraNear
            this.sunLight.shadow.camera.far = this.shadowConfig.shadowCameraFar
            this.sunLight.shadow.mapSize.set(1024, 1024)
            this.sunLight.shadow.bias = this.shadowConfig.shadowBias
            this.scene.add(this.sunLight)
            // SHADOW CAMERA HELPER
            this.shadowCameraHelper = new this.$THREE.CameraHelper(this.sunLight.shadow.camera)
            this.shadowCameraHelper.visible = this.shadowConfig.shadowCameraVisible
            this.scene.add(this.shadowCameraHelper)
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            //
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.target.set(0, 120, 0)
            this.controls.rotateSpeed = 1.0
            this.controls.zoomSpeed = 1.2
            this.controls.panSpeed = 0.8
            this.controls.staticMoving = true
            this.controls.keys = [ 65, 83, 68 ]
            // STATS
            this.stats = new this.$Stats()
            container.appendChild(this.stats.dom)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
            // GUI
            this.gui = new GUI({ width: 400 })
            // SHADOW
            var shadowGUI = this.gui.addFolder("Shadow")
            shadowGUI.add(this.shadowConfig, 'shadowCameraVisible').onChange(() => {
                this.shadowCameraHelper.visible = this.shadowConfig.shadowCameraVisible
            })
            shadowGUI.add(this.shadowConfig, 'shadowCameraNear', 1, 1500).onChange(() => {
                this.sunLight.shadow.camera.near = this.shadowConfig.shadowCameraNear
                this.sunLight.shadow.camera.updateProjectionMatrix()
                this.shadowCameraHelper.update()
            })
            shadowGUI.add(this.shadowConfig, 'shadowCameraFar', 1501, 5000).onChange(() => {
                this.sunLight.shadow.camera.far = this.shadowConfig.shadowCameraFar
                this.sunLight.shadow.camera.updateProjectionMatrix()
                this.shadowCameraHelper.update()
            })
            shadowGUI.add(this.shadowConfig, 'shadowBias', - 0.01, 0.01).onChange(() => {
                this.sunLight.shadow.bias = this.shadowConfig.shadowBias
            })
            shadowGUI.open()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.controls.handleResize()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            // update
            var delta = this.clock.getDelta()
            this.controls.update()
            if (this.mixer) {
                this.mixer.update(delta)
            }
            // render cube map
            this.mesh.visible = false
            this.cubeCamera.update(this.renderer, this.scene)
            this.mesh.visible = true
            // render this.scene
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglShadingPhysical-container {
    width: 100%;
}
</style>
