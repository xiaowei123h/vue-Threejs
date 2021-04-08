<template>
    <div class="webglLoaderGltfExtensions-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
			<a href="https://github.com/KhronosGroup/glTF" target="_blank" rel="noopener">glTF</a> 2.0 loader<br />
			<div id="description"></div>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { DDSLoader } from '@/components/jsm/loaders/DDSLoader.js'
import { DRACOLoader } from '@/components/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            orbitControls: null,
            camera: null,
            scene: null,
            renderer: null,
            loader: null,
            gltf: null,
            background: null,
            envMap: null,
            mixer: null,
            gui: null,
            extensionControls: null,
			clock: null,
            scenes: null,
            state: null,
        }
    },
    mounted() {
        this.clock = new this.$moduleTHREE.Clock()
        this.scenes = {
            Boombox: {
                name: 'BoomBox (PBR)',
                url: 'static/models/gltf/BoomBox/%s/BoomBox.gltf',
                author: 'Microsoft',
                authorURL: 'https://www.microsoft.com/',
                cameraPos: new this.$moduleTHREE.Vector3(0.02, 0.01, 0.03),
                objectRotation: new this.$moduleTHREE.Euler(0, Math.PI, 0),
                extensions: ['glTF', 'glTF-pbrSpecularGlossiness', 'glTF-Binary', 'glTF-dds'],
                addEnvMap: true
            },
            'Bot Skinned': {
                name: 'Bot Skinned',
                url: 'static/models/gltf/BotSkinned/%s/Bot_Skinned.gltf',
                author: 'MozillaVR',
                authorURL: 'https://vr.mozilla.org/',
                cameraPos: new this.$moduleTHREE.Vector3(0.5, 2, 2),
                center: new this.$moduleTHREE.Vector3(0, 1.2, 0),
                objectRotation: new this.$moduleTHREE.Euler(0, 0, 0),
                addLights: true,
                addGround: true,
                shadows: true,
                extensions: ['glTF-MaterialsUnlit']
            },
            MetalRoughSpheres: {
                name: 'MetalRoughSpheres (PBR)',
                url: 'static/models/gltf/MetalRoughSpheres/%s/MetalRoughSpheres.gltf',
                author: '@emackey',
                authorURL: 'https://twitter.com/emackey',
                cameraPos: new this.$moduleTHREE.Vector3(2, 1, 15),
                objectRotation: new this.$moduleTHREE.Euler(0, 0, 0),
                extensions: ['glTF', 'glTF-Embedded'],
                addEnvMap: true
            },
            'Clearcoat Test': {
                name: 'Clearcoat Test',
                url: 'static/models/gltf/ClearcoatTest/ClearcoatTest.glb',
                author: 'Ed Mackey (Analytical Graphics, Inc.)',
                authorURL: 'https://www.agi.com/',
                cameraPos: new this.$moduleTHREE.Vector3(0, 0, 20),
                extensions: ['glTF'],
                addEnvMap: true
            },
            Duck: {
                name: 'Duck',
                url: 'static/models/gltf/Duck/%s/Duck.gltf',
                author: 'Sony',
                authorURL: 'https://www.playstation.com/en-us/corporate/about/',
                cameraPos: new this.$moduleTHREE.Vector3(0, 3, 5),
                addLights: true,
                addGround: true,
                shadows: true,
                extensions: ['glTF', 'glTF-Embedded', 'glTF-pbrSpecularGlossiness', 'glTF-Binary', 'glTF-Draco']
            },
            Monster: {
                name: 'Monster',
                url: 'static/models/gltf/Monster/%s/Monster.gltf',
                author: '3drt.com',
                authorURL: 'http://www.3drt.com/downloads.htm',
                cameraPos: new this.$moduleTHREE.Vector3(3, 1, 7),
                objectScale: new this.$moduleTHREE.Vector3(0.04, 0.04, 0.04),
                objectPosition: new this.$moduleTHREE.Vector3(0.2, 0.1, 0),
                objectRotation: new this.$moduleTHREE.Euler(0, - 3 * Math.PI / 4, 0),
                animationTime: 3,
                addLights: true,
                shadows: true,
                addGround: true,
                extensions: ['glTF', 'glTF-Embedded', 'glTF-Binary', 'glTF-Draco', 'glTF-lights']
            },
            'Cesium Man': {
                name: 'Cesium Man',
                url: 'static/models/gltf/CesiumMan/%s/CesiumMan.gltf',
                author: 'Cesium',
                authorURL: 'https://cesiumjs.org/',
                cameraPos: new this.$moduleTHREE.Vector3(0, 3, 10),
                objectRotation: new this.$moduleTHREE.Euler(0, 0, 0),
                addLights: true,
                addGround: true,
                shadows: true,
                extensions: ['glTF', 'glTF-Embedded', 'glTF-Binary', 'glTF-Draco']
            },
            'Cesium Milk Truck': {
                name: 'Cesium Milk Truck',
                url: 'static/models/gltf/CesiumMilkTruck/%s/CesiumMilkTruck.gltf',
                author: 'Cesium',
                authorURL: 'https://cesiumjs.org/',
                cameraPos: new this.$moduleTHREE.Vector3(0, 3, 10),
                addLights: true,
                addGround: true,
                shadows: true,
                extensions: ['glTF', 'glTF-Embedded', 'glTF-Binary', 'glTF-Draco']
            },
            'Outlined Box': {
                name: 'Outlined Box',
                url: 'static/models/gltf/OutlinedBox/OutlinedBox.gltf',
                author: '@twittmann',
                authorURL: 'https://github.com/twittmann',
                cameraPos: new this.$moduleTHREE.Vector3(0, 5, 15),
                objectScale: new this.$moduleTHREE.Vector3(0.01, 0.01, 0.01),
                objectRotation: new this.$moduleTHREE.Euler(0, 90, 0),
                addLights: true,
                shadows: true,
                extensions: ['glTF']
            },
        }
        this.state = {
            scene: Object.keys(this.scenes)[0],
            extension: this.scenes[Object.keys(this.scenes)[0]].extensions[0],
            playAnimation: true
        }
        this.onload()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        onload() {
            this.renderer = new this.$moduleTHREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$moduleTHREE.sRGBEncoding
            this.renderer.toneMapping = this.$moduleTHREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 1
            this.renderer.physicallyCorrectLights = true
            document.getElementsByClassName('webglLoaderGltfExtensions-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
            // Load background and generate envMap
            new RGBELoader()
                .setDataType(this.$moduleTHREE.UnsignedByteType)
                .setPath('static/textures/equirectangular/')
                .load('venice_sunset_1k.hdr', (texture) => {
                    this.envMap = pmremGenerator.fromEquirectangular(texture).texture
                    pmremGenerator.dispose()
                    this.background = this.envMap
                    //
                    this.buildGUI()
                    this.initScene(this.scenes[this.state.scene])
                    this.animate()
                })
            var pmremGenerator = new this.$moduleTHREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
        },
        initScene(sceneInfo) {
            var descriptionEl = document.getElementById('description')
            if (sceneInfo.author && sceneInfo.authorURL) {
                descriptionEl.innerHTML = sceneInfo.name + ' by <a href="' + sceneInfo.authorURL + '" target="_blank" rel="noopener">' + sceneInfo.author + '</a>'
            }
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0x222222)
            this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.001, 1000)
            this.scene.add(this.camera)
            var spot1
            if (sceneInfo.addLights) {
                var ambient = new this.$moduleTHREE.AmbientLight(0x222222)
                this.scene.add(ambient)
                var directionalLight = new this.$moduleTHREE.DirectionalLight(0xdddddd, 4)
                directionalLight.position.set(0, 0, 1).normalize()
                this.scene.add(directionalLight)
                spot1 = new this.$moduleTHREE.SpotLight(0xffffff, 1)
                spot1.position.set(5, 10, 5)
                spot1.angle = 0.50
                spot1.penumbra = 0.75
                spot1.intensity = 100
                spot1.decay = 2
                if (sceneInfo.shadows) {
                    spot1.castShadow = true
                    spot1.shadow.bias = 0.0001
                    spot1.shadow.mapSize.width = 2048
                    spot1.shadow.mapSize.height = 2048
                }
                this.scene.add(spot1)
            }
            if (sceneInfo.shadows) {
                this.renderer.shadowMap.enabled = true
                this.renderer.shadowMap.type = this.$moduleTHREE.PCFSoftShadowMap
            }
            // TODO: Reuse existing OrbitControls, GLTFLoaders, and so on
            this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
            if (sceneInfo.addGround) {
                var groundMaterial = new this.$moduleTHREE.MeshPhongMaterial({ color: 0xFFFFFF })
                var ground = new this.$moduleTHREE.Mesh(new this.$moduleTHREE.PlaneBufferGeometry(512, 512), groundMaterial)
                ground.receiveShadow = !! sceneInfo.shadows
                if (sceneInfo.groundPos) {
                    ground.position.copy(sceneInfo.groundPos)
                } else {
                    ground.position.z = - 70
                }
                ground.rotation.x = - Math.PI / 2
                this.scene.add(ground)
            }
            this.loader = new GLTFLoader()
            var dracoLoader = new DRACOLoader()
            dracoLoader.setDecoderPath('static/js/libs/draco/gltf/')
            this.loader.setDRACOLoader(dracoLoader)
            this.loader.setDDSLoader(new DDSLoader())
            var url = sceneInfo.url.replace(/%s/g, this.state.extension)
            if (this.state.extension === 'glTF-Binary') {
                url = url.replace('.gltf', '.glb')
            }
            var loadStartTime = performance.now()
            this.loader.load(url, (data) => {
                this.gltf = data
                var object = this.gltf.scene
                console.info('Load time: ' + (performance.now() - loadStartTime).toFixed(2) + ' ms.')
                if (sceneInfo.cameraPos) {
                    this.camera.position.copy(sceneInfo.cameraPos)
                }
                if (sceneInfo.center) {
                    this.orbitControls.target.copy(sceneInfo.center)
                }
                if (sceneInfo.objectPosition) {
                    object.position.copy(sceneInfo.objectPosition)
                    if (spot1) {
                        spot1.target.position.copy(sceneInfo.objectPosition)
                    }
                }
                if (sceneInfo.objectRotation) {
                    object.rotation.copy(sceneInfo.objectRotation)
                }
                if (sceneInfo.objectScale) {
                    object.scale.copy(sceneInfo.objectScale)
                }
                if (sceneInfo.addEnvMap) {
                    object.traverse((node) => {
                        if (node.material && (node.material.isMeshStandardMaterial ||
                                (node.material.isShaderMaterial && node.material.envMap !== undefined))) {
                            node.material.envMap = this.envMap
                            node.material.envMapIntensity = 1.5 // boombox seems too dark otherwise
                        }
                    })
                    this.scene.background = this.background
                }
                object.traverse((node) => {
                    if (node.isMesh || node.isLight) node.castShadow = true
                })
                var animations = this.gltf.animations
                if (animations && animations.length) {
                    this.mixer = new this.$moduleTHREE.AnimationMixer(object)
                    for (var i = 0; i < animations.length; i ++) {
                        var animation = animations[i]
                        // There's .3333 seconds junk at the tail of the Monster animation that
                        // keeps it from looping cleanly. Clip it at 3 seconds
                        if (sceneInfo.animationTime) {
                            animation.duration = sceneInfo.animationTime
                        }
                        var action = this.mixer.clipAction(animation)
                        if (this.state.playAnimation) action.play()
                    }
                }
                this.scene.add(object)
                this.onWindowResize()
            }, undefined, (error) => {
                console.error(error)
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.mixer) this.mixer.update(this.clock.getDelta())
            this.orbitControls.update()
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        },
        buildGUI() {
            this.gui = new GUI({ width: 330 })
            this.gui.domElement.parentElement.style.zIndex = 101
            var sceneCtrl = this.gui.add(this.state, 'scene', Object.keys(this.scenes))
            sceneCtrl.onChange(this.reload)
            var animCtrl = this.gui.add(this.state, 'playAnimation')
            animCtrl.onChange(this.toggleAnimations)
            this.updateGUI()
        },
        updateGUI() {
            if (this.extensionControls) this.extensionControls.remove()
            var sceneInfo = this.scenes[this.state.scene]
            if (sceneInfo.extensions.indexOf(this.state.extension) === - 1) {
                this.state.extension = sceneInfo.extensions[0]
            }
            this.extensionControls = this.gui.add(this.state, 'extension', sceneInfo.extensions)
            this.extensionControls.onChange(this.reload)
        },
        toggleAnimations() {
            for (var i = 0; i < this.gltf.animations.length; i ++) {
                var clip = this.gltf.animations[i]
                var action = this.mixer.existingAction(clip)
                this.state.playAnimation ? action.play() : action.stop()
            }
        },
        reload() {
            if (this.loader && this.mixer) this.mixer.stopAllAction()
            this.updateGUI()
            this.initScene(this.scenes[this.state.scene])
        }
    }
}
</script>

<style scoped>
.webglLoaderGltfExtensions-container {
    width: 100%;
}
#info {
    margin-left: 35px;
}
</style>
