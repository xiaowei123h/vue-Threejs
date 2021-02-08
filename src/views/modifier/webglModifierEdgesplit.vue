<template>
    <div class="webglModifierEdgesplit-container">
        
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OBJLoader } from "@/components/jsm/loaders/OBJLoader.js"
import { BufferGeometryUtils } from "@/components/jsm/utils/BufferGeometryUtils.js"
import { EdgeSplitModifier } from "@/components/jsm/modifiers/EdgeSplitModifier.js"
import { GUI } from "@/components/jsm/libs/dat.gui.module.js"
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            modifier: null,
            mesh: null,
            baseGeometry: null,
			params: {
				smoothShading: true,
				edgeSplit: true,
				cutOffAngle: 20,
            },
            gui: null,
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            var info = document.createElement('div')
            info.style.position = 'absolute'
            info.style.top = '10px'
            info.style.left = '281px'
            info.style.width = '100%'
            info.style.textAlign = 'center'
            info.innerHTML = '<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Edge Split modifier'
            document.getElementsByClassName('webglModifierEdgesplit-container')[0].appendChild(info)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglModifierEdgesplit-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render) // use if there is no animation loop
            controls.enableDamping = true
            controls.dampingFactor = 0.25
            controls.rotateSpeed = 0.35
            controls.minZoom = 1
            this.camera.position.set(0, 0, 4)
            this.scene.add(new this.$THREE.HemisphereLight(0xffffff, 0x444444))
            new OBJLoader().load(
                'static/models/obj/cerberus/Cerberus.obj',
                (group) => {
                    // Retrieve Cerberus vertex positions only
                    var modelGeometry = group.children[ 0 ].geometry
                    modelGeometry.deleteAttribute('normal')
                    modelGeometry.deleteAttribute('uv')
                    this.modifier = new EdgeSplitModifier()
                    this.baseGeometry = modelGeometry
                    this.mesh = new this.$THREE.Mesh(this.getGeometry(), new this.$THREE.MeshStandardMaterial())
                    this.mesh.material.flatShading = ! this.params.smoothShading
                    this.mesh.rotateY(- Math.PI / 2)
                    this.mesh.scale.set(3.5, 3.5, 3.5)
                    this.mesh.translateZ(1.5)
                    this.scene.add(this.mesh)
                    this.render()
                }
            )
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI({ name: "Edge split modifier parameters" })
            this.gui.add(this.params, "smoothShading").onFinishChange(this.updateMesh)
            this.gui.add(this.params, "edgeSplit").onFinishChange(this.updateMesh)
            this.gui.add(this.params, "cutOffAngle").min(0).max(180).onFinishChange(this.updateMesh)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        getGeometry() {
            var geometry
            if (this.params.edgeSplit) {
                geometry = this.modifier.modify(this.baseGeometry, this.params.cutOffAngle * Math.PI / 180)
            } else {
                geometry = BufferGeometryUtils.mergeVertices(this.baseGeometry)
            }
            geometry.computeVertexNormals()
            return geometry
        },
        updateMesh() {
            this.mesh.geometry = this.getGeometry()
            this.mesh.material.flatShading = this.params.smoothShading === false
            this.mesh.material.needsUpdate = true
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglModifierEdgesplit-container {
    width: 100%;
}
</style>
