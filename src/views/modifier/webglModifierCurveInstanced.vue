<template>
    <div class="webglModifierCurveInstanced-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - curve modifier - instanced
		</div>
    </div>
</template>

<script>
import { TransformControls } from "@/components/jsm/controls/TransformControls.js"
import { InstancedFlow } from "@/components/jsm/modifiers/CurveModifier.js"
export default {
    data() {
        return {
            ACTION_SELECT: 1,
            ACTION_NONE: 0,
			curveHandles: [],
			mouse: null,
			stats: null,
			scene: null,
            camera: null,
            renderer: null,
            rayCaster: null,
            control: null,
            flow: null,
            action: null,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(
                40,
                window.innerWidth / window.innerHeight,
                1,
                1000
            )
            this.camera.position.set(2, 2, 4)
            this.camera.lookAt(this.scene.position)
            var boxGeometry = new this.$THREE.BoxBufferGeometry(0.1, 0.1, 0.1)
            var boxMaterial = new this.$THREE.MeshBasicMaterial(0x99ff99)
            var curves = [[
                { x: 1, y: - 0.5, z: - 1 },
                { x: 1, y: - 0.5, z: 1 },
                { x: - 1, y: - 0.5, z: 1 },
                { x: - 1, y: - 0.5, z: - 1 },
            ],
            [
                { x: - 1, y: 0.5, z: - 1 },
                { x: - 1, y: 0.5, z: 1 },
                { x: 1, y: 0.5, z: 1 },
                { x: 1, y: 0.5, z: - 1 },
            ]].map((curvePoints) => {
                var curveVertices = curvePoints.map( (handlePos) => {
                    var handle = new this.$THREE.Mesh(boxGeometry, boxMaterial)
                    handle.position.copy(handlePos)
                    this.curveHandles.push(handle)
                    this.scene.add(handle)
                    return handle.position
                })
                var curve = new this.$THREE.CatmullRomCurve3(curveVertices)
                curve.curveType = "centripetal"
                curve.closed = true
                var points = curve.getPoints(50)
                var line = new this.$THREE.LineLoop(
                    new this.$THREE.BufferGeometry().setFromPoints(points),
                    new this.$THREE.LineBasicMaterial({ color: 0x00ff00 })
                )
                this.scene.add(line)
                return {
                    curve,
                    line
                }
            })
            //
            var light = new this.$THREE.DirectionalLight(0xffaa33)
            light.position.set(- 10, 10, 10)
            light.intensity = 1.0
            this.scene.add(light)
            var light2 = new this.$THREE.AmbientLight(0x003973)
            light2.intensity = 1.0
            this.scene.add(light2)
            //
            var loader = new this.$THREE.FontLoader()
            loader.load("static/fonts/helvetiker_regular.typeface.json", (
                font
            ) => {
                var geometry = new this.$THREE.TextBufferGeometry("Hello three.js!", {
                    font: font,
                    size: 0.2,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.02,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5,
                })
                geometry.rotateX(Math.PI)
                var material = new this.$THREE.MeshStandardMaterial({
                    color: 0x99ffff
                })
                var numberOfInstances = 8
                this.flow = new InstancedFlow(numberOfInstances, curves.length, geometry, material)
                curves.forEach(({ curve }, i) => {
                    this.flow.updateCurve(i, curve)
                    this.scene.add(this.flow.object3D)
                })
                for (var i = 0; i < numberOfInstances; i ++) {
                    var curveIndex = i % curves.length
                    this.flow.setCurve(i, curveIndex)
                    this.flow.moveIndividualAlongCurve(i, i * 1 / numberOfInstances)
                    this.flow.object3D.setColorAt(i, new this.$THREE.Color(0xffffff * Math.random()))
                }
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            document.getElementsByClassName('webglModifierCurveInstanced-container')[0].appendChild(this.renderer.domElement)
            this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown, false)
            this.rayCaster = new this.$THREE.Raycaster()
            this.control = new TransformControls(this.camera, this.renderer.domElement)
            this.control.addEventListener("dragging-changed", (event) => {
                if (! event.value) {
                    curves.forEach(function ({ curve, line }, i) {
                        var points = curve.getPoints(50)
                        line.geometry.setFromPoints(points)
                        this.flow.updateCurve(i, curve)
                    })
                }
            })
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglModifierCurveInstanced-container')[0].appendChild(this.stats.dom)
            window.addEventListener("resize", this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerDown(event) {
            this.action = this.ACTION_SELECT
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.action === this.ACTION_SELECT) {
                this.rayCaster.setFromCamera(this.mouse, this.camera)
                this.action = this.ACTION_NONE
                var intersects = this.rayCaster.intersectObjects(this.curveHandles)
                if (intersects.length) {
                    var target = intersects[ 0 ].object
                    this.control.attach(target)
                    this.scene.add(this.control)
                }
            }
            if (this.flow) {
                this.flow.moveAlongCurve(0.001)
            }
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglModifierCurveInstanced-container {
    width: 100%;
}
</style>
