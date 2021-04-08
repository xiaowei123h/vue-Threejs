<template>
    <div class="webxrArCones-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> ar - cones<br/>(Chrome Android 81+)
		</div>
    </div>
</template>

<script>
import { ARButton } from '@/components/jsm/webxr/ARButton.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			controller: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webxrArCones-container')[0].appendChild(container)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.01, 20)
            var light = new this.$THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
            light.position.set(0.5, 1, 0.25)
            this.scene.add(light)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true, alpha: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            container.appendChild(this.renderer.domElement)
            //
            document.getElementsByClassName('webxrArCones-container')[0].appendChild(ARButton.createButton(this.renderer))
            //
            var geometry = new this.$THREE.CylinderBufferGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2)
            var that = this
            function onSelect() {
                var material = new that.$THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() })
                var mesh = new that.$THREE.Mesh(geometry, material)
                mesh.position.set(0, 0, - 0.3).applyMatrix4(that.controller.matrixWorld)
                mesh.quaternion.setFromRotationMatrix(that.controller.matrixWorld)
                that.scene.add(mesh)
            }
            this.controller = this.renderer.xr.getController(0)
            this.controller.addEventListener('select', onSelect)
            this.scene.add(this.controller)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrArCones-container {
    position: relative;
    width: 100%;
    background-color: #000;
}
</style>
