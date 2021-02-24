<template>
    <div class="webglBuffergeometryCompression-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - BufferGeometry Compression<br />
			Octahedron and Quantization encoding methods from Tarek Sherif
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GeometryCompressionUtils } from '@/components/jsm/utils/GeometryCompressionUtils.js'
import { BufferGeometryUtils } from '@/components/jsm/utils/BufferGeometryUtils.js'
import { TeapotBufferGeometry } from '@/components/jsm/geometries/TeapotBufferGeometry.js'
export default {
    data() {
        return {
            statsEnabled: true,
            container: null,
            stats: null,
            gui: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            lights: [],
            data: {
				"model": "Icosahedron",
				"wireframe": false,
				"texture": false,
				"detail": 4,
				"rotationSpeed": 0.1,
				"QuantizePosEncoding": false,
				"NormEncodingMethods": "None", // for normal encodings
				"DefaultUVEncoding": false,
				"totalGPUMemory": "0 bytes"
            },
            memoryDisplay: null,
			// geometry params
			radius: 100,
			// materials
			lineMaterial: null,
			meshMaterial: null,
			// texture
			texture: null,
        }
    },
    mounted() {
        this.lineMaterial = new this.$THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.8 })
        this.meshMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x111111 })
        this.texture = new this.$THREE.TextureLoader().load('static/textures/uv_grid_opengl.jpg')
        this.texture.wrapS = this.$THREE.RepeatWrapping
        this.texture.wrapT = this.$THREE.RepeatWrapping
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            //
            this.container = document.createElement('div')
            document.getElementsByClassName('webglBuffergeometryCompression-container')[0].appendChild(this.container)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.01, 10000000)
            this.camera.position.x = 2 * this.radius
            this.camera.position.y = 2 * this.radius
            this.camera.position.z = 2 * this.radius
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            //
            this.lights[0] = new this.$THREE.PointLight(0xffffff, 1, 0)
            this.lights[1] = new this.$THREE.PointLight(0xffffff, 1, 0)
            this.lights[2] = new this.$THREE.PointLight(0xffffff, 1, 0)

            this.lights[0].position.set(0, 2 * this.radius, 0)
            this.lights[1].position.set(2 * this.radius, - 2 * this.radius, 2 * this.radius)
            this.lights[2].position.set(- 2 * this.radius, - 2 * this.radius, - 2 * this.radius)

            this.scene.add(this.lights[0])
            this.scene.add(this.lights[1])
            this.scene.add(this.lights[2])
            //
            this.scene.add(new this.$THREE.AxesHelper(this.radius * 5))
            //
            var that = this
            var geom = newGeometry(this.data)
            var mesh = new this.$THREE.Mesh(geom, this.meshMaterial)
            var lineSegments = new this.$THREE.LineSegments(new this.$THREE.WireframeGeometry(geom), this.lineMaterial)
            lineSegments.visible = this.data.wireframe
            this.scene.add(mesh)
            this.scene.add(lineSegments)
            //
            this.gui = new GUI()
            this.gui.width = 350
            function newGeometry(data) {
                switch (data.model) {
                    case "Icosahedron":
                        return new that.$THREE.IcosahedronBufferGeometry(that.radius, data.detail)
                    case "Cylinder":
                        return new that.$THREE.CylinderBufferGeometry(that.radius, that.radius, that.radius * 2, data.detail * 6)
                    case "Teapot":
                        return new TeapotBufferGeometry(that.radius, data.detail * 3, true, true, true, true, true)
                    case "TorusKnot":
                        return new that.$THREE.TorusKnotBufferGeometry(that.radius, 10, data.detail * 20, data.detail * 6, 3, 4)
                }
            }
            function generateGeometry() {
                geom = newGeometry(that.data)
                updateGroupGeometry(
                    mesh,
                    lineSegments,
                    geom,
                    that.data)
            }
            // updateLineSegments
            function updateLineSegments() {
                lineSegments.visible = that.data.wireframe
            }
            var folder = this.gui.addFolder('Scene')
            folder.add(this.data, 'model', ["Icosahedron", "Cylinder", "TorusKnot", "Teapot"]).onChange(generateGeometry)
            folder.add(this.data, 'wireframe', false).onChange(updateLineSegments)
            folder.add(this.data, 'texture', false).onChange(generateGeometry)
            folder.add(this.data, 'detail', 1, 8, 1).onChange(generateGeometry)
            folder.add(this.data, 'rotationSpeed', 0, 0.5, 0.1)
            folder.open()

            folder = this.gui.addFolder('Position Compression')
            folder.add(this.data, 'QuantizePosEncoding', false).onChange(generateGeometry)
            folder.open()

            folder = this.gui.addFolder('Normal Compression')
            folder.add(this.data, 'NormEncodingMethods', ["None", "DEFAULT", "OCT1Byte", "OCT2Byte", "ANGLES"]).onChange(generateGeometry)
            folder.open()

            folder = this.gui.addFolder('UV Compression')
            folder.add(this.data, 'DefaultUVEncoding', false).onChange(generateGeometry)
            folder.open()

            folder = this.gui.addFolder('Memory Info')
            folder.open()
            this.memoryDisplay = folder.add(this.data, 'totalGPUMemory', "0 bytes")
            this.computeGPUMemory(mesh)
            //
            if (this.statsEnabled) {
                this.stats = new this.$Stats()
                this.stats.dom.style.left = '280px'
                this.container.appendChild(this.stats.dom)
            }
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        updateGroupGeometry(mesh, lineSegments, geometry, data) {
            if (geometry.isGeometry) {
                geometry = new this.$THREE.BufferGeometry().fromGeometry(geometry)
                console.log('this.$THREE.GeometryCompression: Converted Geometry to BufferGeometry.')
            }
            // dispose first
            lineSegments.geometry.dispose()
            mesh.geometry.dispose()
            lineSegments.geometry = new this.$THREE.WireframeGeometry(geometry)
            mesh.geometry = geometry
            mesh.material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x111111 })
            mesh.material.map = data.texture ? texture : null
            if (data[ "QuantizePosEncoding" ]) {
                GeometryCompressionUtils.compressPositions(mesh)
            }
            if (data[ "NormEncodingMethods" ] !== "None") {
                GeometryCompressionUtils.compressNormals(mesh, data[ "NormEncodingMethods" ])
            }
            if (data[ "DefaultUVEncoding" ]) {
                GeometryCompressionUtils.compressUvs(mesh)
            }
            this.computeGPUMemory(mesh)
        },
        computeGPUMemory(mesh) {
            // Use BufferGeometryUtils to do memory calculation
            this.memoryDisplay.setValue(BufferGeometryUtils.estimateBytesUsed(mesh.geometry) + " bytes")
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryCompression-container {
    width: 100%
}
</style>
