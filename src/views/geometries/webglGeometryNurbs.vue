<template>
    <div class="webglGeometryNurbs-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - NURBS curve and surface example
		</div>
    </div>
</template>

<script>
import { NURBSCurve } from '@/components/jsm/curves/NURBSCurve.js'
import { NURBSSurface } from '@/components/jsm/curves/NURBSSurface.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			group: null,
			targetRotation: 0,
			targetRotationOnPointerDown: 0,
			pointerX: 0,
			pointerXOnPointerDown: 0,
			windowHalfX: null,
        }
    },
    mounted() {
        this.windowHalfX = window.innerWidth / 2
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglGeometryNurbs-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000)
            this.camera.position.set(0, 150, 750)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            this.scene.add(new this.$THREE.AmbientLight(0x808080))
            var light = new this.$THREE.DirectionalLight(0xffffff, 1)
            light.position.set(1, 1, 1)
            this.scene.add(light)
            this.group = new this.$THREE.Group()
            this.group.position.y = 50
            this.scene.add(this.group)
            // NURBS curve
            var nurbsControlPoints = []
            var nurbsKnots = []
            var nurbsDegree = 3
            for (var i = 0; i <= nurbsDegree; i ++) {
                nurbsKnots.push(0)
            }
            // for (var i = 0, j = 20; i < j; i ++) {
            //     nurbsControlPoints.push(
            //         new this.$THREE.Vector4(
            //             Math.random() * 400 - 200,
            //             Math.random() * 400,
            //             Math.random() * 400 - 200,
            //             1 // weight of control point: higher means stronger attraction
            //     )
            // )
            //     var knot = (i + 1) / (j - nurbsDegree)
            //     nurbsKnots.push(this.$THREE.MathUtils.clamp(knot, 0, 1))
            // }
            var nurbsCurve = new NURBSCurve(nurbsDegree, nurbsKnots, nurbsControlPoints)
            var nurbsGeometry = new this.$THREE.BufferGeometry()
            nurbsGeometry.setFromPoints(nurbsCurve.getPoints(200))
            var nurbsMaterial = new this.$THREE.LineBasicMaterial({ color: 0x333333 })
            var nurbsLine = new this.$THREE.Line(nurbsGeometry, nurbsMaterial)
            nurbsLine.position.set(200, - 100, 0)
            this.group.add(nurbsLine)
            var nurbsControlPointsGeometry = new this.$THREE.BufferGeometry()
            nurbsControlPointsGeometry.setFromPoints(nurbsCurve.controlPoints)
            var nurbsControlPointsMaterial = new this.$THREE.LineBasicMaterial({ color: 0x333333, opacity: 0.25, transparent: true })
            var nurbsControlPointsLine = new this.$THREE.Line(nurbsControlPointsGeometry, nurbsControlPointsMaterial)
            nurbsControlPointsLine.position.copy(nurbsLine.position)
            this.group.add(nurbsControlPointsLine)
            // NURBS surface
            var nsControlPoints = [
                [
                    new this.$THREE.Vector4(- 200, - 200, 100, 1),
                    new this.$THREE.Vector4(- 200, - 100, - 200, 1),
                    new this.$THREE.Vector4(- 200, 100, 250, 1),
                    new this.$THREE.Vector4(- 200, 200, - 100, 1)
                ],
                [
                    new this.$THREE.Vector4(0, - 200, 0, 1),
                    new this.$THREE.Vector4(0, - 100, - 100, 5),
                    new this.$THREE.Vector4(0, 100, 150, 5),
                    new this.$THREE.Vector4(0, 200, 0, 1)
                ],
                [
                    new this.$THREE.Vector4(200, - 200, - 100, 1),
                    new this.$THREE.Vector4(200, - 100, 200, 1),
                    new this.$THREE.Vector4(200, 100, - 250, 1),
                    new this.$THREE.Vector4(200, 200, 100, 1)
                ]
            ]
            var degree1 = 2
            var degree2 = 3
            var knots1 = [ 0, 0, 0, 1, 1, 1 ]
            var knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ]
            var nurbsSurface = new NURBSSurface(degree1, degree2, knots1, knots2, nsControlPoints)
            var map = new this.$THREE.TextureLoader().load('textures/uv_grid_opengl.jpg')
            map.wrapS = map.wrapT = this.$THREE.RepeatWrapping
            map.anisotropy = 16
            function getSurfacePoint(u, v, target) {
                return nurbsSurface.getPoint(u, v, target)
            }
            var geometry = new this.$THREE.ParametricBufferGeometry(this.getSurfacePoint, 20, 20)
            var material = new this.$THREE.MeshLambertMaterial({ map: map, side: this.$THREE.DoubleSide })
            var object = new this.$THREE.Mesh(geometry, material)
            object.position.set(- 200, 100, 0)
            object.scale.multiplyScalar(1)
            this.group.add(object)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            this.container.style.touchAction = 'none'
            this.container.addEventListener('pointerdown', this.onPointerDown, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerDown(event) {
            if (event.isPrimary === false) return
            this.pointerXOnPointerDown = event.clientX - this.windowHalfX
            this.targetRotationOnPointerDown = targetRotation
            document.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.pointerX = event.clientX - windowHalfX
            this.targetRotation = this.targetRotationOnPointerDown + (this.pointerX - this.pointerXOnPointerDown) * 0.02
        },
        onPointerUp() {
            if (event.isPrimary === false) return
            document.removeEventListener('pointermove', this.onPointerMove)
            document.removeEventListener('pointerup', this.onPointerUp)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.group.rotation.y += (this.targetRotation - this.group.rotation.y) * 0.05
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryNurbs-container {
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
