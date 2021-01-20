<template>
    <div class="webglInstancingRaycast-container">
        
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from "@/components/jsm/controls/OrbitControls.js"
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
			raycaster: null,
			mouse: null,
            color: null,
            gui: null,
        }
    },
    mounted() {
        this.amount = parseInt(window.location.search.substr(1)) || 10
        this.count = Math.pow(this.amount, 3)
        this.raycaster = new this.$THREE.Raycaster()
        this.mouse = new this.$THREE.Vector2(1, 1)
        this.color = new this.$THREE.Color()
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(this.amount, this.amount, this.amount)
            this.camera.lookAt(0, 0, 0)
            this.scene = new this.$THREE.Scene()
            var light1 = new this.$THREE.HemisphereLight(0xffffff, 0x000088)
            light1.position.set(- 1, 1.5, 1)
            this.scene.add(light1)
            var light2 = new this.$THREE.HemisphereLight(0xffffff, 0x880000, 0.5)
            light2.position.set(- 1, - 1.5, - 1)
            this.scene.add(light2)
            var geometry = new this.$THREE.IcosahedronGeometry(0.5, 3)
            var material = new this.$THREE.MeshPhongMaterial()
            this.mesh = new this.$THREE.InstancedMesh(geometry, material, this.count)
            var i = 0
            var offset = (this.amount - 1) / 2
            var matrix = new this.$THREE.Matrix4()
            for (var x = 0; x < this.amount; x ++) {
                for (var y = 0; y < this.amount; y ++) {
                    for (var z = 0; z < this.amount; z ++) {
                        matrix.setPosition(offset - x, offset - y, offset - z)
                        this.mesh.setMatrixAt(i, matrix)
                        this.mesh.setColorAt(i, this.color)
                        i ++
                    }
                }
            }
            this.scene.add(this.mesh)
            //
            this.gui = new GUI()
            this.gui.add(this.mesh, 'count', 0, this.count)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglInstancingRaycast-container')[0].appendChild(this.renderer.domElement)
            new OrbitControls(this.camera, this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglInstancingRaycast-container')[0].appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('mousemove', this.onMouseMove, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onMouseMove(event) {
            event.preventDefault()
            this.mouse.x = ((event.clientX - 281) / this.$webglInnerWidth) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersection = this.raycaster.intersectObject(this.mesh)
            if (intersection.length > 0) {
                var instanceId = intersection[ 0 ].instanceId
                this.mesh.setColorAt(instanceId, this.color.setHex(Math.random() * 0xffffff))
                this.mesh.instanceColor.needsUpdate = true
            }
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglInstancingRaycast-container {
    width: 100%;
}
</style>
