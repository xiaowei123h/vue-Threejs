<template>
    <div class="webglSimpleGi-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - simple global illumination (<a href="http://www.iquilezles.org/www/articles/simplegi/simplegi.htm">article</a>)
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { SimpleGI } from '@/utils/webglSimpleGi.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        // HACK:
        this.$THREE.Mesh.prototype.clone = function () {
            var newMaterial = (this.material.isMaterial) ? this.material.clone() : this.material.slice()
            return new this.constructor(this.geometry.clone(), newMaterial).copy(this)
        }
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.z = 4
            this.scene = new this.$THREE.Scene()
            // torus knot
            var torusGeometry = new this.$THREE.TorusKnotBufferGeometry(0.75, 0.3, 128, 32, 1)
            var material = new this.$THREE.MeshBasicMaterial({ vertexColors: true })
            var torusKnot = new this.$THREE.Mesh(torusGeometry, material)
            this.scene.add(torusKnot)
            // room
            var materials = []
            for (var i = 0; i < 8; i ++) {
                materials.push(new this.$THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: this.$THREE.BackSide }))
            }
            var boxGeometry = new this.$THREE.BoxBufferGeometry(3, 3, 3)
            var box = new this.$THREE.Mesh(boxGeometry, materials)
            this.scene.add(box)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglSimpleGi-container')[0].appendChild(this.renderer.domElement)
            new SimpleGI(this.renderer, this.scene, this.$THREE)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 1
            controls.maxDistance = 10
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglSimpleGi-container {
    position: relative;
    width: 100%;
}
</style>
