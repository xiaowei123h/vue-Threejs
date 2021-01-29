<template>
    <div class="webglLoaderLdraw-container">
        <div id="info">
		    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - LDrawLoader
		</div>
        <!-- LDraw.org CC BY 2.0 Parts Library attribution -->
		<div style="display: block; position: absolute; bottom: 8px; left: 8px; width: 160px; padding: 10px; background-color: #F3F7F8;">
			<center>
				<a href="http://www.ldraw.org"><img style="width: 145px" src="models/ldraw/ldraw_org_logo/Stamp145.png"></a>
				<br />
				<a href="http://www.ldraw.org/">This software uses the LDraw Parts Library</a>
			</center>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { LDrawLoader } from '@/components/jsm/loaders/LDrawLoader.js'
export default {
    data() {
        return {
            container: null,
            progressBarDiv: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            gui: null,
            guiData: null,
            model: null,
            textureCube: null,
			envMapActivated: false,
			ldrawPath: null,
			modelFileList: null,
        }
    },
    mounted() {
        this.ldrawPath = 'static/models/ldraw/officialLibrary/'
        this.modelFileList = {
            'Car': 'static/models/car.ldr_Packed.mpd',
            'Lunar Vehicle': 'static/models/1621-1-LunarMPVVehicle.mpd_Packed.mpd',
            'Radar Truck': 'static/models/889-1-RadarTruck.mpd_Packed.mpd',
            'Trailer': 'static/models/4838-1-MiniVehicles.mpd_Packed.mpd',
            'Bulldozer': 'static/models/4915-1-MiniConstruction.mpd_Packed.mpd',
            'Helicopter': 'static/models/4918-1-MiniFlyers.mpd_Packed.mpd',
            'Plane': 'static/models/5935-1-IslandHopper.mpd_Packed.mpd',
            'Lighthouse': 'static/models/30023-1-Lighthouse.ldr_Packed.mpd',
            'X-Wing mini': 'static/models/30051-1-X-wingFighter-Mini.mpd_Packed.mpd',
            'AT-ST mini': 'static/models/30054-1-AT-ST-Mini.mpd_Packed.mpd',
            'AT-AT mini': 'static/models/4489-1-AT-AT-Mini.mpd_Packed.mpd',
            'Shuttle': 'static/models/4494-1-Imperial Shuttle-Mini.mpd_Packed.mpd',
            'TIE Interceptor': 'static/models/6965-1-TIEIntercep_4h4MXk5.mpd_Packed.mpd',
            'Star fighter': 'static/models/6966-1-JediStarfighter-Mini.mpd_Packed.mpd',
            'X-Wing': 'static/models/7140-1-X-wingFighter.mpd_Packed.mpd',
            'AT-ST': 'static/models/10174-1-ImperialAT-ST-UCS.mpd_Packed.mpd'
        }
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderLdraw-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set(150, 200, 250)
            // scene
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xdeebed)
            var ambientLight = new this.$THREE.AmbientLight(0xdeebed, 0.4)
            this.scene.add(ambientLight)
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 1)
            directionalLight.position.set(- 1000, 1200, 1500)
            this.scene.add(directionalLight)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            //
            this.guiData = {
                modelFileName: this.modelFileList[ 'Car' ],
                envMapActivated: false,
                separateObjects: false,
                displayLines: true,
                conditionalLines: true,
                smoothNormals: true,
                varructionStep: 0,
                noConstructionSteps: "No steps."
            }
            window.addEventListener('resize', this.onWindowResize, false)
            this.progressBarDiv = document.createElement('div')
            this.progressBarDiv.innerText = "Loading..."
            this.progressBarDiv.style.fontSize = "3em"
            this.progressBarDiv.style.color = "#888"
            this.progressBarDiv.style.display = "block"
            this.progressBarDiv.style.position = "absolute"
            this.progressBarDiv.style.top = "50%"
            this.progressBarDiv.style.width = "100%"
            this.progressBarDiv.style.textAlign = "center"
            // load materials and then the model
            this.reloadObject(true)
        },
        updateObjectsVisibility() {
            this.model.traverse(c => {
                if (c.isLineSegments) {
                    if (c.isConditionalLine) {
                        c.visible = this.guiData.conditionalLines
                    } else {
                        c.visible = this.guiData.displayLines
                    }
                } else if (c.isGroup) {
                    // Hide objects with varruction step > gui setting
                    c.visible = c.userData.varructionStep <= this.guiData.varructionStep
                }
            })
        },
        reloadObject(resetCamera) {
            if (this.model) {
                this.scene.remove(this.model)
            }
            this.model = null
            this.updateProgressBar(0)
            this.showProgressBar()
            var lDrawLoader = new LDrawLoader()
            lDrawLoader.separateObjects = this.guiData.separateObjects
            lDrawLoader.smoothNormals = this.guiData.smoothNormals
            lDrawLoader
                .setPath(this.ldrawPath)
                .load(this.guiData.modelFileName, (group2) => {
                    if (this.model) {
                        this.scene.remove(this.model)
                    }
                    this.model = group2
                    // Convert from LDraw coordinates: rotate 180 degrees around OX
                    this.model.rotation.x = Math.PI
                    this.scene.add(this.model)
                    // Adjust materials
                    var materials = lDrawLoader.materials
                    if (this.envMapActivated) {
                        if (! this.textureCube) {
                            // Envmap texture
                            var r = "static/textures/cube/Bridge2/"
                            var urls = [ r + "posx.jpg", r + "negx.jpg",
                                r + "posy.jpg", r + "negy.jpg",
                                r + "posz.jpg", r + "negz.jpg" ]
                            this.textureCube = new this.$THREE.CubeTextureLoader().load(urls)
                            this.textureCube.mapping = this.$THREE.CubeReflectionMapping
                        }
                        for (let i = 0, n = materials.length; i < n; i ++) {
                            var material = materials[ i ]
                            if (material.userData.canHaveEnvMap) {
                                material.envMap = this.textureCube
                            }
                        }
                    }
                    this.guiData.varructionStep = this.model.userData.numConstructionSteps - 1
                    this.updateObjectsVisibility()
                    // Adjust this.camera and light
                    var bbox = new this.$THREE.Box3().setFromObject(this.model)
                    var size = bbox.getSize(new this.$THREE.Vector3())
                    var radius = Math.max(size.x, Math.max(size.y, size.z)) * 0.5
                    if (resetCamera) {
                        this.controls.target0.copy(bbox.getCenter(new this.$THREE.Vector3()))
                        this.controls.position0.set(- 2.3, 2, 2).multiplyScalar(radius).add(this.controls.target0)
                        this.controls.reset()
                    }
                    this.createGUI()
                    this.hideProgressBar()
                }, this.onProgress, this.onError)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        createGUI() {
            if (this.gui) {
                this.gui.destroy()
            }
            this.gui = new GUI()
            this.gui.add(this.guiData, 'modelFileName', this.modelFileList).name('Model').onFinishChange(() => {
                this.reloadObject(true)
            })
            this.gui.add(this.guiData, 'separateObjects').name('Separate Objects').onChange(() => {
                this.reloadObject(false)
            })
            if (this.guiData.separateObjects) {
                if (model.userData.numConstructionSteps > 1) {
                    this.gui.add(this.guiData, 'varructionStep', 0, model.userData.numConstructionSteps - 1).step(1).name('Construction step').onChange(this.updateObjectsVisibility)
                } else {
                    this.gui.add(this.guiData, 'noConstructionSteps').name('Construction step').onChange(this.updateObjectsVisibility)
                }
            }
            var that = this
            this.gui.add(this.guiData, 'this.').name('Env. map').onChange(function changeEnvMap(value) {
                that.envMapActivated = value
                that.reloadObject(false)
            })
            this.gui.add(this.guiData, 'smoothNormals').name('Smooth Normals').onChange(function changeNormals() {
                that.reloadObject(false)
            })
            this.gui.add(this.guiData, 'displayLines').name('Display Lines').onChange(this.updateObjectsVisibility)
            this.gui.add(this.guiData, 'conditionalLines').name('Conditional Lines').onChange(this.updateObjectsVisibility)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        },
        onProgress(xhr) {
            if (xhr.lengthComputable) {
                this.updateProgressBar(xhr.loaded / xhr.total)
                console.log(Math.round(xhr.loaded / xhr.total * 100, 2) + '% downloaded')
            }
        },
        onError() {
            var message = "Error loading model"
            this.progressBarDiv.innerText = message
            console.log(message)
        },
        showProgressBar() {
            document.getElementsByClassName('webglLoaderLdraw-container')[0].appendChild(this.progressBarDiv)
        },
        hideProgressBar() {
            document.getElementsByClassName('webglLoaderLdraw-container')[0].removeChild(this.progressBarDiv)
        },
        updateProgressBar(fraction) {
            this.progressBarDiv.innerText = 'Loading... ' + Math.round(fraction * 100, 2) + '%'
        }
    }
}
</script>

<style scoped>
.webglLoaderLdraw-container {
    width: 100%;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
