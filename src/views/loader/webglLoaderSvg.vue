<template>
    <div class="webglLoaderSvg-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - SVGLoader
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { SVGLoader } from '@/components/jsm/loaders/SVGLoader.js'
export default {
    data() {
        return {
            renderer: null,
            stats: null,
            scene: null,
            camera: null,
            gui: null,
            guiData: null,
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
            var container = document.getElementById('container')
            //
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 200)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.screenSpacePanning = true
            //
            this.stats = new this.$Stats()
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            this.guiData = {
                currentURL: 'static/models/svg/tiger.svg',
                drawFillShapes: true,
                drawStrokes: true,
                fillShapesWireframe: false,
                strokesWireframe: false
            }
            this.loadSVG(this.guiData.currentURL)
            this.createGUI()
        },
        createGUI() {
            if (this.gui) this.gui.destroy()
            this.gui = new GUI({ width: 350 })
            this.gui.add(this.guiData, 'currentURL', {
                "Tiger": 'static/models/svg/tiger.svg',
                "Three.js": 'static/models/svg/threejs.svg',
                "Joins and caps": 'static/models/svg/lineJoinsAndCaps.svg',
                "Hexagon": 'static/models/svg/hexagon.svg',
                "Test 1": 'static/models/svg/tests/1.svg',
                "Test 2": 'static/models/svg/tests/2.svg',
                "Test 3": 'static/models/svg/tests/3.svg',
                "Test 4": 'static/models/svg/tests/4.svg',
                "Test 5": 'static/models/svg/tests/5.svg',
                "Test 6": 'static/models/svg/tests/6.svg',
                "Test 7": 'static/models/svg/tests/7.svg',
                "Test 8": 'static/models/svg/tests/8.svg',
                "Units": 'static/models/svg/tests/units.svg',
                "Defs": 'static/models/svg/tests/testDefs/Svg-defs.svg',
                "Defs2": 'static/models/svg/tests/testDefs/Svg-defs2.svg',
                "Defs3": 'static/models/svg/tests/testDefs/Wave-defs.svg',
                "Defs4": 'static/models/svg/tests/testDefs/defs4.svg',
                "Zero Radius": 'static/models/svg/zero-radius.svg'
            }).name('SVG File').onChange(update)
            this.gui.add(this.guiData, 'drawStrokes').name('Draw strokes').onChange(update)
            this.gui.add(this.guiData, 'drawFillShapes').name('Draw fill shapes').onChange(update)
            this.gui.add(this.guiData, 'strokesWireframe').name('Wireframe strokes').onChange(update)
            this.gui.add(this.guiData, 'fillShapesWireframe').name('Wireframe fill shapes').onChange(update)
            function update() {
                this.loadSVG(this.guiData.currentURL)
            }
        },
        loadSVG(url) {
            //
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xb0b0b0)
            //
            var helper = new this.$THREE.GridHelper(160, 10)
            helper.rotation.x = Math.PI / 2
            this.scene.add(helper)
            //
            var loader = new SVGLoader()
            loader.load(url, (data) => {
                var paths = data.paths
                var group = new this.$THREE.Group()
                group.scale.multiplyScalar(0.25)
                group.position.x = - 70
                group.position.y = 70
                group.scale.y *= - 1
                for (var i = 0; i < paths.length; i ++) {
                    var path = paths[ i ]
                    var fillColor = path.userData.style.fill
                    if (this.guiData.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
                        var material = new this.$THREE.MeshBasicMaterial({
                            color: new this.$THREE.Color().setStyle(fillColor),
                            opacity: path.userData.style.fillOpacity,
                            transparent: path.userData.style.fillOpacity < 1,
                            side: this.$THREE.DoubleSide,
                            depthWrite: false,
                            wireframe: this.guiData.fillShapesWireframe
                        })
                        var shapes = path.toShapes(true)
                        for (var j = 0; j < shapes.length; j ++) {
                            var shape = shapes[ j ]
                            var geometry = new this.$THREE.ShapeBufferGeometry(shape)
                            var mesh = new this.$THREE.Mesh(geometry, material)
                            group.add(mesh)
                        }
                    }
                    var strokeColor = path.userData.style.stroke
                    if (this.guiData.drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
                        var material = new this.$THREE.MeshBasicMaterial({
                            color: new this.$THREE.Color().setStyle(strokeColor),
                            opacity: path.userData.style.strokeOpacity,
                            transparent: path.userData.style.strokeOpacity < 1,
                            side: this.$THREE.DoubleSide,
                            depthWrite: false,
                            wireframe: this.guiData.strokesWireframe
                        })
                        for (var j = 0, jl = path.subPaths.length; j < jl; j ++) {
                            var subPath = path.subPaths[ j ]
                            var geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style)
                            if (geometry) {
                                var mesh = new this.$THREE.Mesh(geometry, material)
                                group.add(mesh)
                            }
                        }
                    }
                }
                this.scene.add(group)
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderSvg-container {
    width: 100%;
    background-color: #b0b0b0;
}
</style>
