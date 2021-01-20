<template>
    <div class="webglGeometrySplineEditor-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - geometry - catmull spline editor
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { TransformControls } from '@/components/jsm/controls/TransformControls.js'
import '@/utils/geometrySplineEditor.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			splineHelperObjects: [],
			splinePointsLength: 4,
			positions: [],
			point: null,
			raycaster: null,
			pointer: null,
			onUpPosition: null,
			onDownPosition: null,
			geometry: null,
			transformControl: null,
			ARC_SEGMENTS: 200,
			splines: {},
            params: null,
            gui: null
        }
    },
    mounted() {
        this.point = new this.$THREE.Vector3()
        this.raycaster = new this.$THREE.Raycaster()
        this.pointer = new this.$THREE.Vector2()
        this.onUpPosition = new this.$THREE.Vector2()
        this.onDownPosition = new this.$THREE.Vector2()
        this.geometry = new this.$THREE.BoxBufferGeometry(20, 20, 20)
        this.ARC_SEGMENTS = 200
        this.splines = {}
        this.params = {
            uniform: true,
            tension: 0.5,
            centripetal: true,
            chordal: true,
            addPoint: this.addPoint,
            removePoint: this.removePoint,
            exportSpline: this.exportSpline
        }
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set(0, 250, 1000)
            this.scene.add(this.camera)
            this.scene.add(new this.$THREE.AmbientLight(0xf0f0f0))
            var light = new this.$THREE.SpotLight(0xffffff, 1.5)
            light.position.set(0, 1500, 200)
            light.angle = Math.PI * 0.2
            light.castShadow = true
            light.shadow.camera.near = 200
            light.shadow.camera.far = 2000
            light.shadow.bias = - 0.000222
            light.shadow.mapSize.width = 1024
            light.shadow.mapSize.height = 1024
            this.scene.add(light)
            var planeGeometry = new this.$THREE.PlaneBufferGeometry(2000, 2000)
            planeGeometry.rotateX(- Math.PI / 2)
            var planeMaterial = new this.$THREE.ShadowMaterial({ opacity: 0.2 })
            var plane = new this.$THREE.Mesh(planeGeometry, planeMaterial)
            plane.position.y = - 200
            plane.receiveShadow = true
            this.scene.add(plane)
            var helper = new this.$THREE.GridHelper(2000, 100)
            helper.position.y = - 199
            helper.material.opacity = 0.25
            helper.material.transparent = true
            this.scene.add(helper)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            this.gui = new GUI()
            this.gui.add(this.params, 'uniform')
            this.gui.add(this.params, 'tension', 0, 1).step(0.01).onChange((value) => {
                this.splines.uniform.tension = value
                this.updateSplineOutline()
            })
            this.gui.add(this.params, 'centripetal')
            this.gui.add(this.params, 'chordal')
            this.gui.add(this.params, 'addPoint')
            this.gui.add(this.params, 'removePoint')
            this.gui.add(this.params, 'exportSpline')
            this.gui.open()
            // Controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.damping = 0.2
            controls.addEventListener('change', this.render)
            this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
            this.transformControl.addEventListener('change', this.render)
            this.transformControl.addEventListener('dragging-changed', (event) => {
                controls.enabled = ! event.value
            })
            this.scene.add(this.transformControl)
            this.transformControl.addEventListener('objectChange', () => {
                this.updateSplineOutline()
            })
            document.addEventListener('pointerdown', this.onPointerDown, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
            document.addEventListener('pointermove', this.onPointerMove, false)
            /*******
             * Curves
             *********/
            for (var i = 0; i < this.splinePointsLength; i ++) {
                this.addSplineObject(this.positions[ i ])
            }
            this.positions.length = 0
            for (var i = 0; i < this.splinePointsLength; i ++) {
                this.positions.push(this.splineHelperObjects[ i ].position)
            }
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3))
            var curve = new this.$THREE.CatmullRomCurve3(this.positions)
            curve.curveType = 'catmullrom'
            curve.mesh = new this.$THREE.Line(geometry.clone(), new this.$THREE.LineBasicMaterial({
                color: 0xff0000,
                opacity: 0.35
            }))
            curve.mesh.castShadow = true
            this.splines.uniform = curve
            curve = new this.$THREE.CatmullRomCurve3(this.positions)
            curve.curveType = 'centripetal'
            curve.mesh = new this.$THREE.Line(geometry.clone(), new this.$THREE.LineBasicMaterial({
                color: 0x00ff00,
                opacity: 0.35
            }))
            curve.mesh.castShadow = true
            this.splines.centripetal = curve
            curve = new this.$THREE.CatmullRomCurve3(this.positions)
            curve.curveType = 'chordal'
            curve.mesh = new this.$THREE.Line(geometry.clone(), new this.$THREE.LineBasicMaterial({
                color: 0x0000ff,
                opacity: 0.35
            }))
            curve.mesh.castShadow = true
            this.splines.chordal = curve
            for (var k in this.splines) {
                var spline = this.splines[ k ]
                this.scene.add(spline.mesh)
            }
            this.load([ new this.$THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
                new this.$THREE.Vector3(- 53.56300074753207, 171.49711742836848, - 14.495472686253045),
                new this.$THREE.Vector3(- 91.40118730204415, 176.4306956436485, - 6.958271935582161),
                new this.$THREE.Vector3(- 383.785318791128, 491.1365363371675, 47.869296953772746) ])
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        addSplineObject(position) {
            var material = new this.$THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
            var object = new this.$THREE.Mesh(this.geometry, material)
            if (position) {
                object.position.copy(position)
            } else {
                object.position.x = Math.random() * 1000 - 500
                object.position.y = Math.random() * 600
                object.position.z = Math.random() * 800 - 400
            }
            object.castShadow = true
            object.receiveShadow = true
            this.scene.add(object)
            this.splineHelperObjects.push(object)
            return object
        },
        addPoint() {
            this.splinePointsLength ++
            this.positions.push(this.addSplineObject().position)
            this.updateSplineOutline()
        },
        removePoint() {
            if (this.splinePointsLength <= 4) {
                return
            }
            var point = this.splineHelperObjects.pop()
            this.splinePointsLength --
            this.positions.pop()
            if (this.transformControl.object === point) this.transformControl.detach()
            this.scene.remove(point)
            this.updateSplineOutline()
        },
        updateSplineOutline() {
            for (var k in this.splines) {
                var spline = this.splines[ k ]
                var splineMesh = spline.mesh
                var position = splineMesh.geometry.attributes.position
                for (var i = 0; i < this.ARC_SEGMENTS; i ++) {
                    var t = i / (this.ARC_SEGMENTS - 1)
                    spline.getPoint(t, this.point)
                    position.setXYZ(i, this.point.x, this.point.y, this.point.z)
                }
                position.needsUpdate = true
            }
        },
        exportSpline() {
            var strplace = []
            for (var i = 0; i < this.splinePointsLength; i ++) {
                var p = this.splineHelperObjects[ i ].position
                strplace.push('new this.$THREE.Vector3({0}, {1}, {2})'.format('new this.$THREE.Vector3({0}, {1}, {2})', p.x, p.y, p.z))
            }
            console.log(strplace.join(',\n'))
            var code = '[' + (strplace.join(',\n\t')) + ']'
            prompt('copy and paste code', code)
        },
        load(new_positions) {
            while (new_positions.length > this.positions.length) {
                this.addPoint()
            }
            while (new_positions.length < this.positions.length) {
                this.removePoint()
            }
            for (var i = 0; i < this.positions.length; i ++) {
                this.positions[ i ].copy(new_positions[ i ])
            }
            this.updateSplineOutline()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.splines.uniform.mesh.visible = this.params.uniform
            this.splines.centripetal.mesh.visible = this.params.centripetal
            this.splines.chordal.mesh.visible = this.params.chordal
            this.renderer.render(this.scene, this.camera)
        },
        onPointerDown(event) {
            this.onDownPosition.x = event.clientX
            this.onDownPosition.y = event.clientY
        },
        onPointerUp() {
            this.onUpPosition.x = event.clientX
            this.onUpPosition.y = event.clientY
            if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) this.transformControl.detach()
        },
        onPointerMove(event) {
            this.pointer.x = (event.clientX / window.innerWidth - 281) * 2 - 1
            this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1
            this.raycaster.setFromCamera(this.pointer, this.camera)
            var intersects = this.raycaster.intersectObjects(this.splineHelperObjects)
            if (intersects.length > 0) {
                var object = intersects[ 0 ].object
                if (object !== this.transformControl.object) {
                    this.transformControl.attach(object)
                }
            }
        }
    }
}
</script>

<style scoped>
.webglGeometrySplineEditor-container {
    width: 100%;
    background-color: #f0f0f0;
}
#info {			
    color: #444;
}
#info a {
    color: #08f;
}
</style>
