<template>
    <div class="webglGeometriesParametric-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - parametric geometries</div>
    </div>
</template>

<script>
import { Curves } from '@/components/jsm/curves/CurveExtras.js'
import { ParametricGeometries } from '@/components/jsm/geometries/ParametricGeometries.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.y = 400
            this.scene = new this.$THREE.Scene()
            //
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            this.scene.add(this.camera)
            //
            var map = new this.$THREE.TextureLoader().load('static/textures/uv_grid_opengl.jpg')
            map.wrapS = map.wrapT = this.$THREE.RepeatWrapping
            map.anisotropy = 16
            var material = new this.$THREE.MeshPhongMaterial({ map: map, side: this.$THREE.DoubleSide })
            //
            var geometry, object
            geometry = new this.$THREE.ParametricBufferGeometry(ParametricGeometries.plane(100, 100), 10, 10)
            geometry.center()
            object = new this.$THREE.Mesh(geometry, material)
            object.position.set(- 200, 0, 200)
            this.scene.add(object)
            geometry = new this.$THREE.ParametricBufferGeometry(ParametricGeometries.klein, 20, 20)
            object = new this.$THREE.Mesh(geometry, material)
            object.position.set(0, 0, 200)
            object.scale.multiplyScalar(5)
            this.scene.add(object)
            geometry = new this.$THREE.ParametricBufferGeometry(ParametricGeometries.mobius, 20, 20)
            object = new this.$THREE.Mesh(geometry, material)
            object.position.set(200, 0, 200)
            object.scale.multiplyScalar(30)
            this.scene.add(object)
            //
            var GrannyKnot = new Curves.GrannyKnot()
            var torus = new ParametricGeometries.TorusKnotGeometry(50, 10, 50, 20, 2, 3)
            var sphere = new ParametricGeometries.SphereGeometry(50, 20, 10)
            var tube = new ParametricGeometries.TubeGeometry(GrannyKnot, 100, 3, 8, true)
            torus = new this.$THREE.BufferGeometry().fromGeometry(torus)
            sphere = new this.$THREE.BufferGeometry().fromGeometry(sphere)
            tube = new this.$THREE.BufferGeometry().fromGeometry(tube)
            object = new this.$THREE.Mesh(torus, material)
            object.position.set(- 200, 0, - 200)
            this.scene.add(object)
            object = new this.$THREE.Mesh(sphere, material)
            object.position.set(0, 0, - 200)
            this.scene.add(object)
            object = new this.$THREE.Mesh(tube, material)
            object.position.set(200, 0, - 200)
            object.scale.multiplyScalar(2)
            this.scene.add(object)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
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
            var timer = Date.now() * 0.0001
            this.camera.position.x = Math.cos(timer) * 800
            this.camera.position.z = Math.sin(timer) * 800
            this.camera.lookAt(this.scene.position)
            this.scene.traverse((object) => {
                if (object.isMesh === true) {
                    object.rotation.x = timer * 5
                    object.rotation.y = timer * 2.5
                }
            })
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometriesParametric-container {
    width: 100%;
}
</style>
