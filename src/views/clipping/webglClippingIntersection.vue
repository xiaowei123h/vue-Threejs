<template>
    <div class="webglClippingIntersection-container">
        
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			params: {
				clipIntersection: true,
				planeConstant: 0,
				showHelpers: false
			},
            clipPlanes: [],
            gui: null
        }
    },
    mounted() {
        this.clipPlanes = [
            new this.$THREE.Plane(new this.$THREE.Vector3(1, 0, 0), 0),
            new this.$THREE.Plane(new this.$THREE.Vector3(0, - 1, 0), 0),
            new this.$THREE.Plane(new this.$THREE.Vector3(0, 0, - 1), 0)
        ]
        this.init()
        this.render()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.localClippingEnabled = true
            document.getElementsByClassName('webglClippingIntersection-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 200)
            this.camera.position.set(- 1.5, 2.5, 3.0)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render) // use only if there is no animation loop
            controls.minDistance = 1
            controls.maxDistance = 10
            controls.enablePan = false
            var light = new this.$THREE.HemisphereLight(0xffffff, 0x080808, 1.5)
            light.position.set(- 1.25, 1, 1.25)
            this.scene.add(light)
            // var helper = new this.$THREE.CameraHelper(light.shadow.camera)
            // this.scene.add(helper)
            //
            var group = new this.$THREE.Group()
            for (var i = 1; i <= 30; i += 2) {
                var geometry = new this.$THREE.SphereBufferGeometry(i / 30, 48, 24)
                var material = new this.$THREE.MeshLambertMaterial({
                    color: new this.$THREE.Color().setHSL(Math.random(), 0.5, 0.5),
                    side: this.$THREE.DoubleSide,
                    clippingPlanes: this.clipPlanes,
                    clipIntersection: this.params.clipIntersection
                })
                group.add(new this.$THREE.Mesh(geometry, material))
            }
            this.scene.add(group)
            // helpers
            var helpers = new this.$THREE.Group()
            helpers.add(new this.$THREE.PlaneHelper(this.clipPlanes[ 0 ], 2, 0xff0000))
            helpers.add(new this.$THREE.PlaneHelper(this.clipPlanes[ 1 ], 2, 0x00ff00))
            helpers.add(new this.$THREE.PlaneHelper(this.clipPlanes[ 2 ], 2, 0x0000ff))
            helpers.visible = false
            this.scene.add(helpers)
            // gui
            this.gui = new GUI()
            this.gui.add(this.params, 'clipIntersection').name('clip intersection').onChange((value) => {
                var children = group.children
                for (var i = 0; i < children.length; i ++) {
                    children[ i ].material.clipIntersection = value
                }
                this.render()
            });
            this.gui.add(this.params, 'planeConstant', - 1, 1).step(0.01).name('plane varant').onChange((value) => {
                for (var j = 0; j < this.clipPlanes.length; j ++) {
                    this.clipPlanes[ j ].varant = value
                }
                this.render()
            })
            this.gui.add(this.params, 'showHelpers').name('show helpers').onChange((value) => {
                helpers.visible = value
                this.render()
            })
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglClippingIntersection-container {
    position: relative;
    width: 100%;
}
</style>
