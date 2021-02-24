<template>
    <div class="webglGeometryExtrudeSplines-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - spline extrusion examples<br/>
			by <a href="http://www.lab4games.net/zz85/blog" target="_blank" rel="noopener">zz85</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { Curves } from '@/components/jsm/curves/CurveExtras.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            splineCamera: null,
            cameraHelper: null,
            cameraEye: null,
            direction: null,
            direction: null,
            binormal: null,
            normal: null,
            position: null,
            lookAt: null,
            pipeSpline: null,
            sampleClosedSpline: null,
            splines: null,
            parent: null,
            tubeGeometry: null,
            mesh: null,
            params: null,
            material: null,
            wireframeMaterial: null,
            gui: null
        }
    },
    mounted() {
        this.direction = new this.$THREE.Vector3()
        this.binormal = new this.$THREE.Vector3()
        this.normal = new this.$THREE.Vector3()
        this.position = new this.$THREE.Vector3()
        this.lookAt = new this.$THREE.Vector3()
        this.pipeSpline = new this.$THREE.CatmullRomCurve3([
            new this.$THREE.Vector3(0, 10, - 10), new this.$THREE.Vector3(10, 0, - 10),
            new this.$THREE.Vector3(20, 0, 0), new this.$THREE.Vector3(30, 0, 10),
            new this.$THREE.Vector3(30, 0, 20), new this.$THREE.Vector3(20, 0, 30),
            new this.$THREE.Vector3(10, 0, 30), new this.$THREE.Vector3(0, 0, 30),
            new this.$THREE.Vector3(- 10, 10, 30), new this.$THREE.Vector3(- 10, 20, 30),
            new this.$THREE.Vector3(0, 30, 30), new this.$THREE.Vector3(10, 30, 30),
            new this.$THREE.Vector3(20, 30, 15), new this.$THREE.Vector3(10, 30, 10),
            new this.$THREE.Vector3(0, 30, 10), new this.$THREE.Vector3(- 10, 20, 10),
            new this.$THREE.Vector3(- 10, 10, 10), new this.$THREE.Vector3(0, 0, 10),
            new this.$THREE.Vector3(10, - 10, 10), new this.$THREE.Vector3(20, - 15, 10),
            new this.$THREE.Vector3(30, - 15, 10), new this.$THREE.Vector3(40, - 15, 10),
            new this.$THREE.Vector3(50, - 15, 10), new this.$THREE.Vector3(60, 0, 10),
            new this.$THREE.Vector3(70, 0, 0), new this.$THREE.Vector3(80, 0, 0),
            new this.$THREE.Vector3(90, 0, 0), new this.$THREE.Vector3(100, 0, 0)
        ])
        this.sampleClosedSpline = new this.$THREE.CatmullRomCurve3([
            new this.$THREE.Vector3(0, - 40, - 40),
            new this.$THREE.Vector3(0, 40, - 40),
            new this.$THREE.Vector3(0, 140, - 40),
            new this.$THREE.Vector3(0, 40, 40),
            new this.$THREE.Vector3(0, - 40, 40)
        ])
        this.sampleClosedSpline.curveType = 'catmullrom'
        this.sampleClosedSpline.closed = true
        this.splines = {
            GrannyKnot: new Curves.GrannyKnot(),
            HeartCurve: new Curves.HeartCurve(3.5),
            VivianiCurve: new Curves.VivianiCurve(70),
            KnotCurve: new Curves.KnotCurve(),
            HelixCurve: new Curves.HelixCurve(),
            TrefoilKnot: new Curves.TrefoilKnot(),
            TorusKnot: new Curves.TorusKnot(20),
            CinquefoilKnot: new Curves.CinquefoilKnot(20),
            TrefoilPolynomialKnot: new Curves.TrefoilPolynomialKnot(14),
            FigureEightPolynomialKnot: new Curves.FigureEightPolynomialKnot(),
            DecoratedTorusKnot4a: new Curves.DecoratedTorusKnot4a(),
            DecoratedTorusKnot4b: new Curves.DecoratedTorusKnot4b(),
            DecoratedTorusKnot5a: new Curves.DecoratedTorusKnot5a(),
            DecoratedTorusKnot5c: new Curves.DecoratedTorusKnot5c(),
            PipeSpline: this.pipeSpline,
            SampleClosedSpline: this.sampleClosedSpline
        }
        this.params = {
            spline: 'GrannyKnot',
            scale: 4,
            extrusionSegments: 100,
            radiusSegments: 3,
            closed: true,
            animationView: false,
            lookAhead: false,
            cameraHelper: false,
        }
        this.material = new this.$THREE.MeshLambertMaterial({ color: 0xff00ff })
        this.wireframeMaterial = new this.$THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, wireframe: true, transparent: true })
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        addTube() {
            if (this.mesh !== null) {
                this.parent.remove(this.mesh)
                this.mesh.geometry.dispose()
            }
            var extrudePath = this.splines[ this.params.spline ]
            this.tubeGeometry = new this.$THREE.TubeBufferGeometry(extrudePath, this.params.extrusionSegments, 2, this.params.radiusSegments, this.params.closed)
            this.addGeometry(this.tubeGeometry)
            this.setScale()
        },
        setScale() {
            this.mesh.scale.set(this.params.scale, this.params.scale, this.params.scale)
        },
        addGeometry(geometry) {
            // 3D shape
            this.mesh = new this.$THREE.Mesh(geometry, this.material)
            var wireframe = new this.$THREE.Mesh(geometry, this.wireframeMaterial)
            this.mesh.add(wireframe)
            this.parent.add(this.mesh)
        },
        animateCamera() {
            this.cameraHelper.visible = this.params.cameraHelper
            this.cameraEye.visible = this.params.cameraHelper
        },
        init() {
            this.container = document.getElementById('container')
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.01, 10000)
            this.camera.position.set(0, 50, 500)
            // scene
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            // light
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 0, 1)
            this.scene.add(light)
            // tube
            this.parent = new this.$THREE.Object3D()
            this.scene.add(this.parent)
            this.splineCamera = new this.$THREE.PerspectiveCamera(84, this.$webglInnerWidth / window.innerHeight, 0.01, 1000)
            this.parent.add(this.splineCamera)
            this.cameraHelper = new this.$THREE.CameraHelper(this.splineCamera)
            this.scene.add(this.cameraHelper)
            this.addTube()
            // debug this.camera
            this.cameraEye = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(5), new this.$THREE.MeshBasicMaterial({ color: 0xdddddd }))
            this.parent.add(this.cameraEye)
            this.cameraHelper.visible = this.params.cameraHelper
            this.cameraEye.visible = this.params.cameraHelper
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            // stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            // dat.GUI
            this.gui = new GUI({ width: 300 })
            var folderGeometry = this.gui.addFolder('Geometry')
            folderGeometry.add(this.params, 'spline', Object.keys(this.splines)).onChange(() => {
                this.addTube()
            })
            folderGeometry.add(this.params, 'scale', 2, 10).step(2).onChange(() => {
                this.setScale()
            })
            folderGeometry.add(this.params, 'extrusionSegments', 50, 500).step(50).onChange(() => {
                this.addTube()
            })
            folderGeometry.add(this.params, 'radiusSegments', 2, 12).step(1).onChange(() => {
                this.addTube()
            })
            folderGeometry.add(this.params, 'closed').onChange(() => {
                this.addTube()
            })
            folderGeometry.open()
            var folderCamera = this.gui.addFolder('Camera')
            folderCamera.add(this.params, 'animationView').onChange(() => {
                this.animateCamera()
            })
            folderCamera.add(this.params, 'lookAhead').onChange(() => {
                this.animateCamera()
            })
            folderCamera.add(this.params, 'cameraHelper').onChange(() => {
                this.animateCamera()
            })
            folderCamera.open()
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 100
            controls.maxDistance = 2000
            window.addEventListener('resize', this.onWindowResize, false)
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
            // animate camera along spline
            var time = Date.now()
            var looptime = 20 * 1000
            var t = (time % looptime) / looptime
            this.tubeGeometry.parameters.path.getPointAt(t, this.position)
            this.position.multiplyScalar(this.params.scale)
            // interpolation
            var segments = this.tubeGeometry.tangents.length
            var pickt = t * segments
            var pick = Math.floor(pickt)
            var pickNext = (pick + 1) % segments
            this.binormal.subVectors(this.tubeGeometry.binormals[ pickNext ], this.tubeGeometry.binormals[ pick ])
            this.binormal.multiplyScalar(pickt - pick).add(this.tubeGeometry.binormals[ pick ])
            this.tubeGeometry.parameters.path.getTangentAt(t, this.direction)
            var offset = 15
            this.normal.copy(this.binormal).cross(this.direction)
            // we move on a offset on its binormal
            this.position.add(this.normal.clone().multiplyScalar(offset))
            this.splineCamera.position.copy(this.position)
            this.cameraEye.position.copy(this.position)
            // using arclength for stablization in look ahead
            this.tubeGeometry.parameters.path.getPointAt((t + 30 / this.tubeGeometry.parameters.path.getLength()) % 1, this.lookAt)
            this.lookAt.multiplyScalar(this.params.scale)
            // camera orientation 2 - up orientation via normal
            if (! this.params.lookAhead) this.lookAt.copy(this.position).add(this.direction)
            this.splineCamera.matrix.lookAt(this.splineCamera.position, this.lookAt, this.normal)
            this.splineCamera.quaternion.setFromRotationMatrix(this.splineCamera.matrix)
            this.cameraHelper.update()
            this.renderer.render(this.scene, this.params.animationView === true ? this.splineCamera : this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryExtrudeSplines-container {
    width: 100%;
    background-color: #f0f0f0;
	color: #444;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
