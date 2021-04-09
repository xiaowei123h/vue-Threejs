<template>
    <div class="webglGeometryExtrudeShapes-container">
        
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            controls: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var info = document.createElement('div')
            info.style.position = 'absolute'
            info.style.top = '10px'
            info.style.width = 'calc(100%-281px)'
            info.style.textAlign = 'center'
            info.style.color = '#fff'
            info.style.link = '#f80'
            info.innerHTML = '<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - geometry extrude shapes'
            document.getElementsByClassName('webglGeometryExtrudeShapes-container')[0].appendChild(info)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryExtrudeShapes-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x222222)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 500)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 200
            this.controls.maxDistance = 500
            this.scene.add(new this.$THREE.AmbientLight(0x222222))
            var light = new this.$THREE.PointLight(0xffffff)
            light.position.copy(this.camera.position)
            this.scene.add(light)
            //
            var closedSpline = new this.$THREE.CatmullRomCurve3([
                new this.$THREE.Vector3(- 60, - 100, 60),
                new this.$THREE.Vector3(- 60, 20, 60),
                new this.$THREE.Vector3(- 60, 120, 60),
                new this.$THREE.Vector3(60, 20, - 60),
                new this.$THREE.Vector3(60, - 100, - 60)
            ])
            closedSpline.curveType = 'catmullrom'
            closedSpline.closed = true
            var extrudeSettings1 = {
                steps: 100,
                bevelEnabled: false,
                extrudePath: closedSpline
            }
            var pts1 = [], count = 3
            for (var i = 0; i < count; i ++) {
                var l = 20
                var a = 2 * i / count * Math.PI
                pts1.push(new this.$THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l))
            }
            var shape1 = new this.$THREE.Shape(pts1)
            var geometry1 = new this.$THREE.ExtrudeBufferGeometry(shape1, extrudeSettings1)
            var material1 = new this.$THREE.MeshLambertMaterial({ color: 0xb00000, wireframe: false })
            var mesh1 = new this.$THREE.Mesh(geometry1, material1)
            this.scene.add(mesh1)
            //
            var randomPoints = []
            for (var i = 0; i < 10; i ++) {
                randomPoints.push(new this.$THREE.Vector3((i - 4.5) * 50, this.$THREE.MathUtils.randFloat(- 50, 50), this.$THREE.MathUtils.randFloat(- 50, 50)))
            }
            var randomSpline = new this.$THREE.CatmullRomCurve3(randomPoints)
            //
            var extrudeSettings2 = {
                steps: 200,
                bevelEnabled: false,
                extrudePath: randomSpline
            }
            var pts2 = [], numPts = 5
            for (var i = 0; i < numPts * 2; i ++) {
                var l = i % 2 == 1 ? 10 : 20
                var a = i / numPts * Math.PI
                pts2.push(new this.$THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l))
            }
            var shape2 = new this.$THREE.Shape(pts2)
            var geometry2 = new this.$THREE.ExtrudeBufferGeometry(shape2, extrudeSettings2)
            var material2 = new this.$THREE.MeshLambertMaterial({ color: 0xff8000, wireframe: false })
            var mesh2 = new this.$THREE.Mesh(geometry2, material2)
            this.scene.add(mesh2)
            //
            var materials = [ material1, material2 ]
            var extrudeSettings3 = {
                depth: 20,
                steps: 1,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            }
            var geometry3 = new this.$THREE.ExtrudeBufferGeometry(shape2, extrudeSettings3)
            var mesh3 = new this.$THREE.Mesh(geometry3, materials)
            mesh3.position.set(50, 100, 50)
            this.scene.add(mesh3)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglGeometryExtrudeShapes-container {
    position: relative;
    width: 100%;
    background-color: #222;
}
.webglGeometryExtrudeShapes-container a {
    color: #f80;
}
</style>
