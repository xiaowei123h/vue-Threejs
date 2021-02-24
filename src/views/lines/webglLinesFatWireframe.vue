<template>
    <div class="webglLinesFatWireframe-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank">three.js</a> - fat lines</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { LineMaterial } from '@/components/jsm/lines/LineMaterial.js'
import { Wireframe } from '@/components/jsm/lines/Wireframe.js'
import { WireframeGeometry2 } from '@/components/jsm/lines/WireframeGeometry2.js'
export default {
    data() {
        return {
            wireframe: null,
            renderer: null,
            scene: null,
            camera: null,
            camera2: null,
            controls: null,
			wireframe1: null,
            matLine: null,
            matLineBasic: null,
            matLineDashed: null,
			stats: null,
			gui: null,
			// viewport
			insetWidth: null,
			insetHeight: null,
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
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setClearColor(0x000000, 0.0)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLinesFatWireframe-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(- 50, 0, 50)
            this.camera2 = new this.$THREE.PerspectiveCamera(40, 1, 1, 1000)
            this.camera2.position.copy(this.camera.position)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 10
            this.controls.maxDistance = 500
            // Wireframe (WireframeGeometry2, LineMaterial)
            var geo = new this.$THREE.IcosahedronBufferGeometry(20, 1)
            var geometry = new WireframeGeometry2(geo)
            this.matLine = new LineMaterial({
                color: 0x4080ff,
                linewidth: 5, // in pixels
                //resolution:  // to be set by renderer, eventually
                dashed: false
            })
            this.wireframe = new Wireframe(geometry, this.matLine)
            this.wireframe.computeLineDistances()
            this.wireframe.scale.set(1, 1, 1)
            this.scene.add(this.wireframe)
            // Line (this.$THREE.WireframeGeometry, this.$THREE.LineBasicMaterial) - rendered with gl.LINE
            geo = new this.$THREE.WireframeGeometry(geo)
            this.matLineBasic = new this.$THREE.LineBasicMaterial({ color: 0x4080ff })
            this.matLineDashed = new this.$THREE.LineDashedMaterial({ scale: 2, dashSize: 1, gapSize: 1 })
            this.wireframe1 = new this.$THREE.LineSegments(geo, this.matLineBasic)
            this.wireframe1.computeLineDistances()
            this.wireframe1.visible = false
            this.scene.add(this.wireframe1)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            this.onWindowResize()
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglLinesFatWireframe-container')[0].appendChild(this.stats.dom)
            this.initGui()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.insetWidth = window.innerHeight / 4 // square
            this.insetHeight = window.innerHeight / 4
            this.camera2.aspect = this.insetWidth / this.insetHeight
            this.camera2.updateProjectionMatrix()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.update()
            // main scene
            this.renderer.setClearColor(0x000000, 0)
            this.renderer.setViewport(0, 0, this.$webglInnerWidth, window.innerHeight)
            // this.renderer will set this eventually
            this.matLine.resolution.set(this.$webglInnerWidth, window.innerHeight) // resolution of the viewport
            this.renderer.render(this.scene, this.camera)
            // inset scene
            this.renderer.setClearColor(0x222222, 1)
            this.renderer.clearDepth() // important!
            this.renderer.setScissorTest(true)
            this.renderer.setScissor(20, 20, this.insetWidth, this.insetHeight)
            this.renderer.setViewport(20, 20, this.insetWidth, this.insetHeight)
            this.camera2.position.copy(this.camera.position)
            this.camera2.quaternion.copy(this.camera.quaternion)
            // this.renderer will set this eventually
            this.matLine.resolution.set(this.insetWidth, this.insetHeight) // resolution of the inset viewport
            this.renderer.render(this.scene, this.camera2)
            this.renderer.setScissorTest(false)
        },
        initGui() {
            this.gui = new GUI()
            var param = {
                'line type': 0,
                'width (px)': 5,
                'dashed': false,
                'dash scale': 1,
                'dash / gap': 1
            }
            this.gui.add(param, 'line type', { 'LineGeometry': 0, 'gl.LINE': 1 }).onChange((val) => {
                switch (val) {
                    case '0':
                        this.wireframe.visible = true
                        this.wireframe1.visible = false
                        break
                    case '1':
                        this.wireframe.visible = false
                        this.wireframe1.visible = true
                        break
                }
            })
            this.gui.add(param, 'width (px)', 1, 10).onChange((val) => {
                this.matLine.linewidth = val
            })
            this.gui.add(param, 'dashed').onChange((val) => {
                this.matLine.dashed = val
                // dashed is implemented as a defines -- not as a uniform. this could be changed.
                // ... or this.$THREE.LineDashedMaterial could be implemented as a separate material
                // temporary hack - renderer should do this eventually
                if (val) this.matLine.defines.USE_DASH = ""; else delete this.matLine.defines.USE_DASH
                this.matLine.needsUpdate = true
                this.wireframe1.material = val ? this.matLineDashed : this.matLineBasic
            })
            this.gui.add(param, 'dash scale', 0.5, 1, 0.1).onChange((val) => {
                this.matLine.dashScale = val
                this.matLineDashed.scale = val
            })
            this.gui.add(param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 }).onChange((val) => {
                switch (val) {
                    case '0':
                        this.matLine.dashSize = 2
                        this.matLine.gapSize = 1
                        this.matLineDashed.dashSize = 2
                        this.matLineDashed.gapSize = 1
                        break
                    case '1':
                        this.matLine.dashSize = 1
                        this.matLine.gapSize = 1
                        this.matLineDashed.dashSize = 1
                        this.matLineDashed.gapSize = 1
                        break
                    case '2':
                        this.matLine.dashSize = 1
                        this.matLine.gapSize = 2
                        this.matLineDashed.dashSize = 1
                        this.matLineDashed.gapSize = 2
                        break
                }
            })
        }
    }
}
</script>

<style scoped>
.webglLinesFatWireframe-container {
    width: 100%;
}
</style>
