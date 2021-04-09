<template>
    <div class="webglGeometryNormals-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - geometry - normals</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { VertexNormalsHelper } from '@/components/jsm/helpers/VertexNormalsHelper.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            gui: null,
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
            geometry: null,
            geometries: null,
            options: null,
            material: null,
        }
    },
    mounted() {
        this.geometries = [
            new this.$THREE.BoxBufferGeometry(200, 200, 200, 2, 2, 2),
            new this.$THREE.CircleBufferGeometry(200, 32),
            new this.$THREE.CylinderBufferGeometry(75, 75, 200, 8, 8),
            new this.$THREE.IcosahedronBufferGeometry(100, 1),
            new this.$THREE.OctahedronBufferGeometry(200, 0),
            new this.$THREE.PlaneBufferGeometry(200, 200, 4, 4),
            new this.$THREE.RingBufferGeometry(32, 64, 16),
            new this.$THREE.SphereBufferGeometry(100, 12, 12),
            new this.$THREE.TorusBufferGeometry(64, 16, 12, 12),
            new this.$THREE.TorusKnotBufferGeometry(64, 16)
        ]
        this.options = {
            Geometry: 0
        }
        this.material = new this.$THREE.MeshBasicMaterial({ color: 0xfefefe, wireframe: true, opacity: 0.5 })
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        addMesh() {
            if (this.mesh !== null) {
                this.scene.remove(this.mesh)
                this.geometry.dispose()
            }
            this.geometry = this.geometries[ this.options.Geometry ]
            // scale geometry to a uniform size
            this.geometry.computeBoundingSphere()
            var scaleFactor = 160 / this.geometry.boundingSphere.radius
            this.geometry.scale(scaleFactor, scaleFactor, scaleFactor)
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.scene.add(this.mesh)
            var vertexNormalsHelper = new VertexNormalsHelper(this.mesh, 10)
            this.mesh.add(vertexNormalsHelper)
        },
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.addMesh()
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            //
            var geometries = {
                BoxBufferGeometry: 0,
                CircleBufferGeometry: 1,
                CylinderBufferGeometry: 2,
                IcosahedronBufferGeometry: 3,
                OctahedronBufferGeometry: 4,
                PlaneBufferGeometry: 5,
                RingBufferGeometry: 6,
                SphereBufferGeometry: 7,
                TorusBufferGeometry: 8,
                TorusKnotBufferGeometry: 9
            }
            this.gui = new GUI({ width: 350 })
            this.gui.add(this.options, 'Geometry', geometries).onChange(() => {
                this.addMesh()
            })
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enableZoom = false
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
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryNormals-container {
    position: relative;
    width: 100%;
}
</style>
