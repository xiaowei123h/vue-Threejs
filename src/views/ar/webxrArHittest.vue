<template>
    <div class="webxrArHittest-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> ar - hit test<br/>(Chrome Android 81+)
		</div>
    </div>
</template>

<script>
import { ARButton } from '@/components/jsm/webxr/ARButton.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
			controller: null,
			reticle: null,
			hitTestSource: null,
			hitTestSourceRequested: false,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webxrArHittest-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20)
            var light = new this.$THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
            light.position.set(0.5, 1, 0.25)
            this.scene.add(light)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true, alpha: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            this.container.appendChild(this.renderer.domElement)
            //
            document.getElementsByClassName('webxrArHittest-container')[0].appendChild(ARButton.createButton(this.renderer, { requiredFeatures: [ 'hit-test' ] }))
            //
            var geometry = new this.$THREE.CylinderBufferGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0)
            var that = this
            function onSelect() {
                if (that.reticle.visible) {
                    var material = new that.$THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() })
                    var mesh = new that.$THREE.Mesh(geometry, material)
                    mesh.position.setFromMatrixPosition(that.reticle.matrix)
                    mesh.scale.y = Math.random() * 2 + 1
                    that.scene.add(mesh)
                }
            }
            this.controller = this.renderer.xr.getController(0)
            this.controller.addEventListener('select', onSelect)
            this.scene.add(this.controller)
            this.reticle = new this.$THREE.Mesh(
                new this.$THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
                new this.$THREE.MeshBasicMaterial()
            )
            this.reticle.matrixAutoUpdate = false
            this.reticle.visible = false
            this.scene.add(this.reticle)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render(timestamp, frame) {
            if (frame) {
                var referenceSpace = this.renderer.xr.getReferenceSpace()
                var session = this.renderer.xr.getSession()
                if (this.hitTestSourceRequested === false) {
                    session.requestReferenceSpace('viewer').then((referenceSpace) => {
                        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                            this.hitTestSource = source
                        })
                    })
                    session.addEventListener('end', () => {
                        this.hitTestSourceRequested = false
                        this.hitTestSource = null
                    })
                    this.hitTestSourceRequested = true
                }
                if (this.hitTestSource) {
                    var hitTestResults = frame.getHitTestResults(this.hitTestSource)
                    if (hitTestResults.length) {
                        var hit = hitTestResults[ 0 ]
                        this.reticle.visible = true
                        this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix)
                    } else {
                        this.reticle.visible = false
                    }
                }
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrArHittest-container {
    width: 100%;
}
</style>
