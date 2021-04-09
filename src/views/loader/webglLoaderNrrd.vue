<template>
    <div class="webglLoaderNrrd-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
			NRRD format loader test
		</div>
		<div id="inset"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { NRRDLoader } from '@/components/jsm/loaders/NRRDLoader.js'
import { VTKLoader } from '@/components/jsm/loaders/VTKLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            container2: null,
            renderer2: null,
            camera2: null,
            axes2: null,
            scene2: null,
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
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.01, 1e10)
            this.camera.position.z = 300
            this.scene = new this.$THREE.Scene()
            this.scene.add(this.camera)
            // light
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x000000, 1)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            dirLight.position.set(200, 200, 200)
            this.scene.add(dirLight)
            var loader = new NRRDLoader()
            loader.load("static/models/nrrd/I.nrrd", (volume) => {
                //box helper to see the extend of the volume
                var geometry = new this.$THREE.BoxBufferGeometry(volume.xLength, volume.yLength, volume.zLength)
                var material = new this.$THREE.MeshBasicMaterial({ color: 0x00ff00 })
                var cube = new this.$THREE.Mesh(geometry, material)
                cube.visible = false
                var box = new this.$THREE.BoxHelper(cube)
                this.scene.add(box)
                box.applyMatrix4(volume.matrix)
                this.scene.add(cube)
                //z plane
                var sliceZ = volume.extractSlice('z', Math.floor(volume.RASDimensions[ 2 ] / 4))
                this.scene.add(sliceZ.mesh)
                //y plane
                var sliceY = volume.extractSlice('y', Math.floor(volume.RASDimensions[ 1 ] / 2))
                this.scene.add(sliceY.mesh)
                //x plane
                var sliceX = volume.extractSlice('x', Math.floor(volume.RASDimensions[ 0 ] / 2))
                this.scene.add(sliceX.mesh)
                this.gui.add(sliceX, "index", 0, volume.RASDimensions[ 0 ], 1).name("indexX").onChange(() => {
                    sliceX.repaint.call(sliceX)
                })
                this.gui.add(sliceY, "index", 0, volume.RASDimensions[ 1 ], 1).name("indexY").onChange(() => {
                    sliceY.repaint.call(sliceY)
                })
                this.gui.add(sliceZ, "index", 0, volume.RASDimensions[ 2 ], 1).name("indexZ").onChange(() => {
                    sliceZ.repaint.call(sliceZ)
                })
                this.gui.add(volume, "lowerThreshold", volume.min, volume.max, 1).name("Lower Threshold").onChange(() => {
                    volume.repaintAllSlices()
                })
                this.gui.add(volume, "upperThreshold", volume.min, volume.max, 1).name("Upper Threshold").onChange(() => {
                    volume.repaintAllSlices()
                })
                this.gui.add(volume, "windowLow", volume.min, volume.max, 1).name("Window Low").onChange(() => {
                    volume.repaintAllSlices()
                })
                this.gui.add(volume, "windowHigh", volume.min, volume.max, 1).name("Window High").onChange(() => {
                    volume.repaintAllSlices()
                })
            })
            var vtkmaterial = new this.$THREE.MeshLambertMaterial({ wireframe: false, morphTargets: false, side: this.$THREE.DoubleSide, color: 0xff0000 })
            var vtkloader = new VTKLoader()
            vtkloader.load("static/models/vtk/liver.vtk", (geometry) => {
                geometry.computeVertexNormals()
                var mesh = new this.$THREE.Mesh(geometry, vtkmaterial)
                this.scene.add(mesh)
                var visibilityControl = {
                    visible: true
                }
                this.gui.add(visibilityControl, "visible").name("Model Visible").onChange(() => {
                    mesh.visible = visibilityControl.visible
                    this.renderer.render(this.scene, this.camera)
                })
            })
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderNrrd-container')[0].appendChild(this.container)
            this.container.appendChild(this.renderer.domElement)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 100
            this.controls.maxDistance = 500
            this.controls.rotateSpeed = 5.0
            this.controls.zoomSpeed = 5
            this.controls.panSpeed = 2
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            this.gui = new GUI()
            this.setupInset()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.controls.handleResize()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            //copy position of the camera into inset
            this.camera2.position.copy(this.camera.position)
            this.camera2.position.sub(this.controls.target)
            this.camera2.position.setLength(300)
            this.camera2.lookAt(this.scene2.position)
            this.renderer.render(this.scene, this.camera)
            this.renderer2.render(this.scene2, this.camera2)
            this.stats.update()
        },
        setupInset() {
            var insetWidth = 150, insetHeight = 150
            this.container2 = document.getElementById('inset')
            this.container2.width = insetWidth
            this.container2.height = insetHeight
            // this.renderer
            this.renderer2 = new this.$THREE.WebGLRenderer({ alpha: true })
            this.renderer2.setClearColor(0x000000, 0)
            this.renderer2.setSize(insetWidth, insetHeight)
            this.container2.appendChild(this.renderer2.domElement)
            // this.scene
            this.scene2 = new this.$THREE.Scene()
            // camera
            this.camera2 = new this.$THREE.PerspectiveCamera(50, insetWidth / insetHeight, 1, 1000)
            this.camera2.up = this.camera.up // important!
            // axes
            this.axes2 = new this.$THREE.AxesHelper(100)
            this.scene2.add(this.axes2)
        }
    }
}
</script>

<style scoped>
.webglLoaderNrrd-container {
    position: relative;
    width: 100%;
}
#inset {
    width: 150px;
    height: 150px;
    background-color: transparent; /* or transparent; will show through only if renderer alpha: true */
    border: none; /* or none; */
    margin: 0;
    padding: 0px;
    position: absolute;
    left: 20px;
    bottom: 20px;
    z-index: 100;
}
</style>
