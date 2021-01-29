<template>
    <div class="webglLinesFat-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank">three.js</a> - fat lines</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Line2 } from '@/components/jsm/lines/Line2.js'
import { LineMaterial } from '@/components/jsm/lines/LineMaterial.js'
import { LineGeometry } from '@/components/jsm/lines/LineGeometry.js'
import { GeometryUtils } from '@/components/jsm/utils/GeometryUtils.js'
export default {
    data() {
        return {
            line: null,
            renderer: null,
            scene: null,
            camera: null,
            camera2: null,
            controls: null,
			line1: null,
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
        this.gui.hide()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setClearColor(0x000000, 0.0)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLinesFat-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(- 40, 0, 60)
            this.camera2 = new this.$THREE.PerspectiveCamera(40, 1, 1, 1000)
            this.camera2.position.copy(this.camera.position)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 10
            this.controls.maxDistance = 500
            // Position and this.$THREE.Color Data
            var positions = []
            var colors = []
            var points = GeometryUtils.hilbert3D(new this.$THREE.Vector3(0, 0, 0), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7)
            var spline = new this.$THREE.CatmullRomCurve3(points)
            var divisions = Math.round(12 * points.length)
            var point = new this.$THREE.Vector3()
            var color = new this.$THREE.Color()
            for (var i = 0, l = divisions; i < l; i ++) {
                var t = i / l
                spline.getPoint(t, point)
                positions.push(point.x, point.y, point.z)
                color.setHSL(t, 1.0, 0.5)
                colors.push(color.r, color.g, color.b)
            }
            // Line2 (LineGeometry, LineMaterial)
            var geometry = new LineGeometry()
            geometry.setPositions(positions)
            geometry.setColors(colors)
            this.matLine = new LineMaterial({
                color: 0xffffff,
                linewidth: 5, // in pixels
                vertexColors: true,
                //resolution:  // to be set by renderer, eventually
                dashed: false
            })
            this.line = new Line2(geometry, this.matLine)
            this.line.computeLineDistances()
            this.line.scale.set(1, 1, 1)
            this.scene.add(this.line)
            // this.$THREE.Line (this.$THREE.BufferGeometry, this.$THREE.LineBasicMaterial) - rendered with gl.LINE_STRIP
            var geo = new this.$THREE.BufferGeometry()
            geo.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            geo.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            this.matLineBasic = new this.$THREE.LineBasicMaterial({ vertexColors: true })
            this.matLineDashed = new this.$THREE.LineDashedMaterial({ vertexColors: true, scale: 2, dashSize: 1, gapSize: 1 })
            this.line1 = new this.$THREE.Line(geo, this.matLineBasic)
            this.line1.computeLineDistances()
            this.line1.visible = false
            this.scene.add(this.line1)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            this.onWindowResize()
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglLinesFat-container')[0].appendChild(this.stats.dom)
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
            // inset this.scene
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
                        this.line.visible = true
                        this.line1.visible = false
                        break
                    case '1':
                        this.line.visible = false
                        this.line1.visible = true
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
                this.line1.material = val ? this.matLineDashed : this.matLineBasic
            })
            this.gui.add(param, 'dash scale', 0.5, 2, 0.1).onChange((val) => {
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
.webglLinesFat-container {
    width: 100%;
}
</style>
