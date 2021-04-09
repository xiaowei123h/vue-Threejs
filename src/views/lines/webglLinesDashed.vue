<template>
    <div class="webglLinesDashed-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - dashed lines example</div>
		<div id="container"></div>
    </div>
</template>

<script>
import { GeometryUtils } from '@/components/jsm/utils/GeometryUtils.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            stats: null,
			objects: [],
            WIDTH: null,
            HEIGHT: null,
        }
    },
    mounted() {
        this.WIDTH = this.$webglInnerWidth
        this.HEIGHT = window.innerHeight
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 1, 200)
            this.camera.position.z = 150
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x111111)
            this.scene.fog = new this.$THREE.Fog(0x111111, 150, 200)
            var subdivisions = 6
            var recursion = 1
            var points = GeometryUtils.hilbert3D(new this.$THREE.Vector3(0, 0, 0), 25.0, recursion, 0, 1, 2, 3, 4, 5, 6, 7)
            var spline = new this.$THREE.CatmullRomCurve3(points)
            var samples = spline.getPoints(points.length * subdivisions)
            var geometrySpline = new this.$THREE.BufferGeometry().setFromPoints(samples)
            var line = new this.$THREE.Line(geometrySpline, new this.$THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 1, gapSize: 0.5 }))
            line.computeLineDistances()
            this.objects.push(line)
            this.scene.add(line)
            var geometryBox = this.box(50, 50, 50)
            var lineSegments = new this.$THREE.LineSegments(geometryBox, new this.$THREE.LineDashedMaterial({ color: 0xffaa00, dashSize: 3, gapSize: 1 }))
            lineSegments.computeLineDistances()
            this.objects.push(lineSegments)
            this.scene.add(lineSegments)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.WIDTH, this.HEIGHT)
            var container = document.getElementById('container')
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        box(width, height, depth) {
            width = width * 0.5,
            height = height * 0.5,
            depth = depth * 0.5
            var geometry = new this.$THREE.BufferGeometry()
            var position = []
            position.push(
                - width, - height, - depth,
                - width, height, - depth,
                - width, height, - depth,
                width, height, - depth,
                width, height, - depth,
                width, - height, - depth,
                width, - height, - depth,
                - width, - height, - depth,
                - width, - height, depth,
                - width, height, depth,
                - width, height, depth,
                width, height, depth,
                width, height, depth,
                width, - height, depth,
                width, - height, depth,
                - width, - height, depth,
                - width, - height, - depth,
                - width, - height, depth,
                - width, height, - depth,
                - width, height, depth,
                width, height, - depth,
                width, height, depth,
                width, - height, - depth,
                width, - height, depth
            )
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(position, 3))
            return geometry
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.001
            this.scene.traverse(function (object) {
                if (object.isLine) {
                    object.rotation.x = 0.25 * time
                    object.rotation.y = 0.25 * time
                }
            })
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLinesDashed-container {
    position: relative;
    width: 100%;
}
</style>
