<template>
    <div class="webglGeometryConvex-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - convex geometry</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ConvexBufferGeometry } from '@/components/jsm/geometries/ConvexGeometry.js'
export default {
    data() {
        return {
            group: null,
            camera: null,
            scene: null,
            renderer: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryConvex-container')[0].appendChild(this.renderer.domElement)
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(15, 20, 30)
            this.scene.add(this.camera)
            // controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 20
            controls.maxDistance = 50
            controls.maxPolarAngle = Math.PI / 2
            this.scene.add(new this.$THREE.AmbientLight(0x222222))
            // light
            var light = new this.$THREE.PointLight(0xffffff, 1)
            this.camera.add(light)
            // helper
            this.scene.add(new this.$THREE.AxesHelper(20))
            // textures
            var loader = new this.$THREE.TextureLoader()
            var texture = loader.load('static/textures/sprites/disc.png')
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            // points
            var vertices = new this.$THREE.DodecahedronGeometry(10).vertices
            for (let i = 0; i < vertices.length; i ++) {
                //vertices[ i ].add(randomPoint().multiplyScalar(2)); // wiggle the points
            }
            var pointsMaterial = new this.$THREE.PointsMaterial({
                color: 0x0080ff,
                map: texture,
                size: 1,
                alphaTest: 0.5
            })
            var pointsGeometry = new this.$THREE.BufferGeometry().setFromPoints(vertices)
            var points = new this.$THREE.Points(pointsGeometry, pointsMaterial)
            this.group.add(points)
            // convex hull
            var meshMaterial = new this.$THREE.MeshLambertMaterial({
                color: 0xffffff,
                opacity: 0.5,
                transparent: true
            })
            var meshGeometry = new ConvexBufferGeometry(vertices)
            var mesh1 = new this.$THREE.Mesh(meshGeometry, meshMaterial)
            mesh1.material.side = this.$THREE.BackSide // back faces
            mesh1.renderOrder = 0
            this.group.add(mesh1)
            var mesh2 = new this.$THREE.Mesh(meshGeometry, meshMaterial.clone())
            mesh2.material.side = this.$THREE.FrontSide // front faces
            mesh2.renderOrder = 1
            this.group.add(mesh2)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.group.rotation.y += 0.005
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryConvex-container {
    width: 100%;
}
</style>
