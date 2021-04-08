<template>
    <div class="webglLoader3dm-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Rhino 3DM loader
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { Rhino3dmLoader } from '@/components/jsm/loaders/3DMLoader.js';
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            container: null,
            controls: null,
            camera: null,
            scene: null,
            renderer: null,
			gui: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.$THREE.Object3D.DefaultUp = new this.$THREE.Vector3(0, 0, 1)
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoader3dm-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(26, - 40, 5)
            this.scene = new this.$THREE.Scene()
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff)
            directionalLight.position.set(0, 0, 2)
            directionalLight.castShadow = true
            directionalLight.intensity = 2
            this.scene.add(directionalLight)
            var loader = new Rhino3dmLoader()
            loader.setLibraryPath('static/jsm/libs/rhino3dm/')
            loader.load('static/models/3dm/Rhino_Logo.3dm', (object) => {
                this.scene.add(object)
                this.initGUI(object.userData.layers)
            })
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(width, height)
            this.container.appendChild(this.renderer.domElement)
            this.controls = new OrbitControls(this.camera, this.container)
            window.addEventListener('resize', this.resize, false)
        },
        resize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        },
        initGUI(layers) {
            var that = this
            this.gui = new GUI({ width: 300 })
            var layersControl = this.gui.addFolder('layers')
            layersControl.open()
            for (var i = 0; i < layers.length; i ++) {
                var layer = layers[ i ]
                layersControl.add(layer, 'visible').name(layer.name).onChange(function (val) {
                    var name = this.object.name
                    that.scene.traverse((child) => {
                        if (child.userData.hasOwnProperty('attributes')) {
                            if ('layerIndex' in child.userData.attributes) {
                                var layerName = layers[ child.userData.attributes.layerIndex ].name
                                if (layerName === name) {
                                    child.visible = val
                                    layer.visible = val
                                }
                            }
                        }
                    })
                })
            }
        }
    }
}
</script>

<style scoped>
.webglLoader3dm-container {
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
