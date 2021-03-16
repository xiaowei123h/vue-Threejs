<template>
    <div class="miscExporterDraco-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - exporter - draco<br/><br/>
			<button id="createGeometry">Geometry</button>
			<button id="createBufferGeometry">BufferGeometry</button> |
			<button id="exportFile">Export DRC</button>
		</div>
    </div>
</template>

<script>
import '@/components/js/libs/draco/draco_encoder.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { DRACOExporter } from '@/components/jsm/exporters/DRACOExporter.js'
export default {
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
            exporter: null,
            mesh: null,
            link: null,
        }
    },
    mounted() {
        this.link = document.createElement('a')
        this.link.style.display = 'none'
        document.getElementsByClassName('miscExporterDraco-container')[0].appendChild(this.link)
        this.init()
		this.animate()
    },
    methods: {
        createBufferGeometry() {
            this.scene.remove(this.mesh)
            var geometry = new this.$THREE.TorusKnotBufferGeometry(50, 15, 200, 30)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0x00ff00 })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.mesh.castShadow = true
            this.mesh.position.y = 25
            this.scene.add(this.mesh)
        },
        createGeometry() {
            this.scene.remove(this.mesh)
            var geometry = new this.$THREE.TorusKnotGeometry(50, 15, 200, 30)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0x00ff00 })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.mesh.castShadow = true
            this.mesh.position.y = 25
            this.scene.add(this.mesh)
        },
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(200, 100, 200)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xa0a0a0)
            this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 200, 1000)
            this.exporter = new DRACOExporter()
            //
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 200, 0)
            this.scene.add(hemiLight)
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            directionalLight.position.set(0, 200, 100)
            directionalLight.castShadow = true
            directionalLight.shadow.camera.top = 180
            directionalLight.shadow.camera.bottom = - 100
            directionalLight.shadow.camera.left = - 120
            directionalLight.shadow.camera.right = 120
            this.scene.add(directionalLight)
            // ground
            var ground = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(2000, 2000),
                new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
            )
            ground.rotation.x = - Math.PI / 2
            ground.position.y = - 75
            ground.receiveShadow = true
            this.scene.add(ground)
            var grid = new this.$THREE.GridHelper(2000, 20, 0x000000, 0x000000)
            grid.material.opacity = 0.2
            grid.material.transparent = true
            grid.position.y = - 75
            this.scene.add(grid)
            // export this.mesh
            var geometry = new this.$THREE.TorusKnotBufferGeometry(50, 15, 200, 30)
            var material = new this.$THREE.MeshPhongMaterial({ color: 0x00ff00 })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.mesh.castShadow = true
            this.mesh.position.y = 25
            this.scene.add(this.mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            document.getElementsByClassName('miscExporterDraco-container')[0].appendChild(this.renderer.domElement)
            //
            var controls = new OrbitControls(camera, this.renderer.domElement)
            controls.target.set(0, 25, 0)
            controls.update()
            //
            window.addEventListener('resize', this.onWindowResize, false)
            var createGeometryButton = document.getElementById('createGeometry')
            createGeometryButton.addEventListener('click', createGeometry)
            var createBufferGeometryButton = document.getElementById('createBufferGeometry')
            createBufferGeometryButton.addEventListener('click', createBufferGeometry)
            var exportButton = document.getElementById('exportFile')
            exportButton.addEventListener('click', this.exportFile)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera)
        },
        exportFile() {
            var result = exporter.parse(this.mesh.geometry)
            this.saveArrayBuffer(result, 'file.drc')
        },
        save(blob, filename) {
            this.link.href = URL.createObjectURL(blob)
            this.link.download = filename
            this.link.click()
        },
        saveArrayBuffer(buffer, filename) {
            this.save(new Blob([ buffer ], { type: 'application/octet-stream' }), filename)
        }
    },
}
</script>

<style scoped>
.miscExporterDraco-container {
    width: 100%;
}
#info {
    background-color: #a0a0a0;
    color: #fff;
}

#info a {
    color: #0f0;
}
</style>
