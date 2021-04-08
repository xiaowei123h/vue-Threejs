<template>
    <div class="webxrArPaint-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> ar - paint<br/>(Chrome Android 81+)
		</div>
    </div>
</template>

<script>
import { TubePainter } from '@/components/jsm/misc/TubePainter.js'
import { ARButton } from '@/components/jsm/webxr/ARButton.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            controller: null,
            painter: null,
			cursor: null,
        }
    },
    mounted() {
        this.cursor = new this.$THREE.Vector3()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrArPaint-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.01, 20)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true, alpha: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            //
            document.getElementsByClassName('webxrArPaint-container')[0].appendChild(ARButton.createButton(this.renderer))
            // model
            var light = new this.$THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
            light.position.set(0, 1, 0)
            this.scene.add(light)
            //
            this.painter = new TubePainter()
            this.painter.setSize(0.4)
            this.painter.mesh.material.side = this.$THREE.DoubleSide
            this.scene.add(this.painter.mesh)
            //
            var that = this
            function onSelectStart() {
                that.userData.isSelecting = true
                that.userData.skipFrames = 2
            }
            function onSelectEnd() {
                that.userData.isSelecting = false
            }
            this.controller = this.renderer.xr.getController(0)
            this.controller.addEventListener('selectstart', onSelectStart)
            this.controller.addEventListener('selectend', onSelectEnd)
            this.controller.userData.skipFrames = 0
            this.scene.add(this.controller)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        handleController(controller) {
            var userData = controller.userData
            this.cursor.set(0, 0, - 0.2).applyMatrix4(controller.matrixWorld)
            if (userData.isSelecting === true) {
                if (userData.skipFrames >= 0) {
                    // TODO(mrdoob) Revisit this
                    userData.skipFrames --
                    this.painter.moveTo(this.cursor)
                } else {
                    this.painter.lineTo(this.cursor)
                    this.painter.update()
                }
            }
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.handleController(this.controller)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrArPaint-container {
    position: relative;
    width: 100%;
    background-color: #000;
}
</style>
