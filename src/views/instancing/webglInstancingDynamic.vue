<template>
    <div class="webglInstancingDynamic-container">
        
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
			mesh: null,
			amount: null,
			count: null,
            dummy: null,
            gui: null,
        }
    },
    mounted() {
        this.amount = parseInt(window.location.search.substr(1)) || 10
        this.count = Math.pow(this.amount, 3)
        this.dummy = new this.$THREE.Object3D()
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(this.amount * 0.9, this.amount * 0.9, this.amount * 0.9)
            this.camera.lookAt(0, 0, 0)
            this.scene = new this.$THREE.Scene()
            var loader = new this.$THREE.BufferGeometryLoader()
            loader.load('static/models/json/suzanne_buffergeometry.json', (geometry) => {
                geometry.computeVertexNormals()
                geometry.scale(0.5, 0.5, 0.5)
                var material = new this.$THREE.MeshNormalMaterial()
                // check overdraw
                // var material = new this.$THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.1, transparent: true })
                this.mesh = new this.$THREE.InstancedMesh(geometry, material, this.count)
                this.mesh.instanceMatrix.setUsage(this.$THREE.DynamicDrawUsage) // will be updated every frame
                this.scene.add(this.mesh)
                //
                this.gui = new GUI()
                this.gui.add(this.mesh, 'count', 0, this.count)
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglInstancingDynamic-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglInstancingDynamic-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
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
            if (this.mesh) {
                var time = Date.now() * 0.001
                this.mesh.rotation.x = Math.sin(time / 4)
                this.mesh.rotation.y = Math.sin(time / 2)
                var i = 0
                var offset = (this.amount - 1) / 2
                for (var x = 0; x < this.amount; x ++) {
                    for (var y = 0; y < this.amount; y ++) {
                        for (var z = 0; z < this.amount; z ++) {
                            this.dummy.position.set(offset - x, offset - y, offset - z)
                            this.dummy.rotation.y = (Math.sin(x / 4 + time) + Math.sin(y / 4 + time) + Math.sin(z / 4 + time))
                            this.dummy.rotation.z = this.dummy.rotation.y * 2
                            this.dummy.updateMatrix()
                            this.mesh.setMatrixAt(i ++, this.dummy.matrix)
                        }
                    }
                }
                this.mesh.instanceMatrix.needsUpdate = true
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInstancingDynamic-container {
    position: relative;
    width: 100%;
}
</style>
