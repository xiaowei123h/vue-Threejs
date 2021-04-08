<template>
    <div class="miscExporterGltf-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - exporter - gltf<br/><br/>
            <el-button type="primary" size="mini" @click="handleExportScene">Export Scene1</el-button>
            <el-button type="primary" size="mini" @click="handleExportScenes">Export Scene1 and this.$THREE.Scene 2</el-button>
            <el-button type="primary" size="mini" @click="handleExportObject">Export Sphere</el-button>
			<el-button type="primary" size="mini" @click="handleExportObj">Export WaltHead</el-button><br/>
			<el-button type="primary" size="mini" @click="handleExportObjects">Export Sphere and Grid</el-button>
			<el-button type="primary" size="mini" @click="handleExportSceneObjects">Export Scene1 and Sphere</el-button>
			<br/><br/>
			<label><input id="option_trs" name="trs" type="checkbox"/>TRS</label>
			<label><input id="option_visible" name="visible" type="checkbox" checked="checked"/>Only Visible</label>
			<label><input id="option_drawrange" name="visible" type="checkbox" checked="checked"/>Truncate drawRange</label><br/>
			<label><input id="option_binary" name="visible" type="checkbox">Binary (<code>.glb</code>)</label>
			<label><input id="option_forcepot" name="visible" type="checkbox">Force POT textures</label>
			<label><input id="option_maxsize" name="maxSize" type="number" value="4096" min="2" max="8192" step="1"> Max texture size</label>

            <button id="export_scene">Export Scene1</button>
		</div>
    </div>
</template>

<script>
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
import { GLTFExporter } from '@/components/jsm/exporters/GLTFExporter.js'
export default {
    data() {
        return {
            link: null,
            container: null,
            camera: null,
            object: null,
            object2: null,
            material: null,
            geometry: null,
            scene1: null,
            scene2: null,
            renderer: null,
            gridHelper: null,
            sphere: null,
            waltHead: null,
        }
    },
    mounted() {
        this.link = document.createElement('a')
        this.link.style.display = 'none'
        document.getElementsByClassName('miscExporterGltf-container')[0].appendChild(this.link) // Firefox workaround, see #6594
        this.init()
        this.animate()
    },
    methods: {
        exportGLTF(input) {
            var gltfExporter = new GLTFExporter()
            var options = {
                trs: document.getElementById('option_trs').checked,
                onlyVisible: document.getElementById('option_visible').checked,
                truncateDrawRange: document.getElementById('option_drawrange').checked,
                binary: document.getElementById('option_binary').checked,
                forcePowerOfTwoTextures: document.getElementById('option_forcepot').checked,
                maxTextureSize: Number(document.getElementById('option_maxsize').value) || Infinity // To prevent NaN value
            }
            console.log('1111')
            console.log(gltfExporter)
            console.log(input)
            gltfExporter.parse(input, function (result) {
                console.log(result)
                // if (result instanceof ArrayBuffer) {
                //     console.log('222222')
                //     this.saveArrayBuffer(result, 'scene.glb')
                // } else {
                //     console.log('33333')
                //     var output = JSON.stringify(result, null, 2)
                //     console.log(output)
                //     this.saveString(output, 'scene.gltf')
                // }
            }, options)
            console.log('4444444')
        },
        handleExportScene() {
            this.exportGLTF(this.scene1)
        },
        handleExportScenes() {
            this.exportGLTF([ this.scene1, this.scene2 ])
        },
        handleExportObject() {
            this.exportGLTF(this.sphere)
        },
        handleExportObj() {
            this.exportGLTF(this.waltHead)
        },
        handleExportObjects() {
            this.exportGLTF([ this.sphere, this.gridHelper ])
        },
        handleExportSceneObjects() {
            this.exportGLTF([ this.scene1, this.gridHelper ])
        },
        save(blob, filename) {
            this.link.href = URL.createObjectURL(blob)
            this.link.download = filename
            this.link.click()
            // URL.revokeObjectURL(url) breaks Firefox...
        },
        saveString(text, filename) {
            this.save(new Blob([ text ], { type: 'text/plain' }), filename)
        },
        saveArrayBuffer(buffer, filename) {
            this.save(new Blob([ buffer ], { type: 'application/octet-stream' }), filename)
        },
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('miscExporterGltf-container')[0].appendChild(this.container)
            this.scene1 = new this.$THREE.Scene()
            this.scene1.name = 'Scene1'
            // ---------------------------------------------------------------------
            // Perspective Camera
            // ---------------------------------------------------------------------
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
            this.camera.position.set(600, 400, 0)
            this.camera.name = "PerspectiveCamera"
            this.scene1.add(this.camera)
            // ---------------------------------------------------------------------
            // Ambient light
            // ---------------------------------------------------------------------
            var ambientLight = new this.$THREE.AmbientLight(0xffffff, 0.2)
            ambientLight.name = 'AmbientLight'
            this.scene1.add(ambientLight)
            // ---------------------------------------------------------------------
            // DirectLight
            // ---------------------------------------------------------------------
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 1)
            dirLight.target.position.set(0, 0, - 1)
            dirLight.add(dirLight.target)
            dirLight.lookAt(- 1, - 1, 0)
            dirLight.name = 'DirectionalLight'
            this.scene1.add(dirLight)
            // ---------------------------------------------------------------------
            // Grid
            // ---------------------------------------------------------------------
            this.gridHelper = new this.$THREE.GridHelper(2000, 20, 0x888888, 0x444444)
            this.gridHelper.position.y = - 50
            this.gridHelper.name = "Grid"
            this.scene1.add(this.gridHelper)
            // ---------------------------------------------------------------------
            // Axes
            // ---------------------------------------------------------------------
            var axes = new this.$THREE.AxesHelper(500)
            axes.name = "AxesHelper"
            this.scene1.add(axes)
            // ---------------------------------------------------------------------
            // Simple geometry with basic material
            // ---------------------------------------------------------------------
            // Icosahedron
            var mapGrid = new this.$THREE.TextureLoader().load('textures/uv_grid_opengl.jpg')
            mapGrid.wrapS = mapGrid.wrapT = this.$THREE.RepeatWrapping
            this.material = new this.$THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: mapGrid
            })
            this.object = new this.$THREE.Mesh(new this.$THREE.IcosahedronBufferGeometry(75, 0), this.material)
            this.object.position.set(- 200, 0, 200)
            this.object.name = 'Icosahedron'
            this.scene1.add(this.object)
            // Octahedron
            this.material = new this.$THREE.MeshBasicMaterial({
                color: 0x0000ff,
                wireframe: true
            })
            this.object = new this.$THREE.Mesh(new this.$THREE.OctahedronBufferGeometry(75, 1), this.material)
            this.object.position.set(0, 0, 200)
            this.object.name = 'Octahedron'
            this.scene1.add(this.object)
            // Tetrahedron
            this.material = new this.$THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.5
            })
            this.object = new this.$THREE.Mesh(new this.$THREE.TetrahedronBufferGeometry(75, 0), this.material)
            this.object.position.set(200, 0, 200)
            this.object.name = 'Tetrahedron'
            this.scene1.add(this.object)
            // ---------------------------------------------------------------------
            // Buffered geometry primitives
            // ---------------------------------------------------------------------
            // Sphere
            this.material = new this.$THREE.MeshStandardMaterial({
                color: 0xffff00,
                metalness: 0.5,
                roughness: 1.0,
                flatShading: true
            })
            this.sphere = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(70, 10, 10), this.material)
            this.sphere.position.set(0, 0, 0)
            this.sphere.name = "Sphere"
            this.scene1.add(this.sphere)
            // Cylinder
            this.material = new this.$THREE.MeshStandardMaterial({
                color: 0xff00ff,
                flatShading: true
            })
            this.object = new this.$THREE.Mesh(new this.$THREE.CylinderBufferGeometry(10, 80, 100), this.material)
            this.object.position.set(200, 0, 0)
            this.object.name = "Cylinder"
            this.scene1.add(this.object)
            // TorusKnot
            this.material = new this.$THREE.MeshStandardMaterial({
                color: 0xff0000,
                roughness: 1
            })
            this.object = new this.$THREE.Mesh(new this.$THREE.TorusKnotBufferGeometry(50, 15, 40, 10), this.material)
            this.object.position.set(- 200, 0, 0)
            this.object.name = "Cylinder"
            this.scene1.add(this.object)
            // ---------------------------------------------------------------------
            // Hierarchy
            // ---------------------------------------------------------------------
            var mapWood = new this.$THREE.TextureLoader().load('textures/hardwood2_diffuse.jpg')
            this.material = new this.$THREE.MeshStandardMaterial({ map: mapWood, side: this.$THREE.DoubleSide })
            this.object = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(40, 100, 100), this.material)
            this.object.position.set(- 200, 0, 400)
            this.object.name = "Cube"
            this.scene1.add(this.object)
            this.object2 = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(40, 40, 40, 2, 2, 2), this.material)
            this.object2.position.set(0, 0, 50)
            this.object2.rotation.set(0, 45, 0)
            this.object2.name = "SubCube"
            this.object.add(this.object2)
            // ---------------------------------------------------------------------
            // Groups
            // ---------------------------------------------------------------------
            var group1 = new this.$THREE.Group()
            group1.name = "Group"
            this.scene1.add(group1)
            var group2 = new this.$THREE.Group()
            group2.name = "subGroup"
            group2.position.set(0, 50, 0)
            group1.add(group2)
            this.object2 = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(30, 30, 30), this.material)
            this.object2.name = "Cube in group"
            this.object2.position.set(0, 0, 400)
            group2.add(this.object2)
            // ---------------------------------------------------------------------
            // this.$THREE.Line Strip
            // ---------------------------------------------------------------------
            this.geometry = new this.$THREE.BufferGeometry()
            var numPoints = 100
            var positions = new Float32Array(numPoints * 3)
            for (var i = 0; i < numPoints; i ++) {
                positions[ i * 3 ] = i
                positions[ i * 3 + 1 ] = Math.sin(i / 2) * 20
                positions[ i * 3 + 2 ] = 0
            }
            this.geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            this.object = new this.$THREE.Line(this.geometry, new this.$THREE.LineBasicMaterial({ color: 0xffff00 }))
            this.object.position.set(- 50, 0, - 200)
            this.scene1.add(this.object)
            // ---------------------------------------------------------------------
            // this.$THREE.Line Loop
            // ---------------------------------------------------------------------
            this.geometry = new this.$THREE.BufferGeometry()
            this.numPoints = 5
            var radius = 70
            this.positions = new Float32Array(this.numPoints * 3)
            for (var i = 0; i < this.numPoints; i ++) {
                var s = i * Math.PI * 2 / this.numPoints
                this.positions[ i * 3 ] = radius * Math.sin(s)
                this.positions[ i * 3 + 1 ] = radius * Math.cos(s)
                this.positions[ i * 3 + 2 ] = 0
            }
            this.geometry.setAttribute('position', new this.$THREE.BufferAttribute(this.positions, 3))
            this.object = new this.$THREE.LineLoop(this.geometry, new this.$THREE.LineBasicMaterial({ color: 0xffff00 }))
            this.object.position.set(0, 0, - 200)
            this.scene1.add(this.object)
            // ---------------------------------------------------------------------
            // Buffer this.geometry truncated (DrawRange)
            // ---------------------------------------------------------------------
            this.geometry = new this.$THREE.BufferGeometry()
            var numElements = 6
            var outOfRange = 3
            this.positions = new Float32Array((numElements + outOfRange) * 3)
            var colors = new Float32Array((numElements + outOfRange) * 3)
            this.positions.set([
                0, 0, 0,
                0, 80, 0,
                80, 0, 0,
                80, 0, 0,
                0, 80, 0,
                80, 80, 0
            ])
            colors.set([
                1, 0, 0,
                1, 0, 0,
                1, 1, 0,
                1, 1, 0,
                0, 0, 1,
                0, 0, 1,
            ])
            this.geometry.setAttribute('position', new this.$THREE.BufferAttribute(this.positions, 3))
            this.geometry.setAttribute('color', new this.$THREE.BufferAttribute(colors, 3))
            this.geometry.setDrawRange(0, numElements)
            this.object = new this.$THREE.Mesh(this.geometry, new this.$THREE.MeshBasicMaterial({ side: this.$THREE.DoubleSide, vertexColors: true }))
            this.object.name = 'Custom buffered truncated'
            this.object.position.set(140, - 40, - 200)
            this.scene1.add(this.object)
            // ---------------------------------------------------------------------
            // this.$THREE.Points
            // ---------------------------------------------------------------------
            this.numPoints = 100
            var pointsArray = new Float32Array(this.numPoints * 3)
            for (var i = 0; i < this.numPoints; i ++) {
                pointsArray[ 3 * i ] = - 50 + Math.random() * 100
                pointsArray[ 3 * i + 1 ] = Math.random() * 100
                pointsArray[ 3 * i + 2 ] = - 50 + Math.random() * 100
            }
            var pointsGeo = new this.$THREE.BufferGeometry()
            pointsGeo.setAttribute('position', new this.$THREE.BufferAttribute(pointsArray, 3))
            var pointsMaterial = new this.$THREE.PointsMaterial({ color: 0xffff00, size: 5 })
            var pointCloud = new this.$THREE.Points(pointsGeo, pointsMaterial)
            pointCloud.name = "Points"
            pointCloud.position.set(- 200, 0, - 200)
            this.scene1.add(pointCloud)
            // ---------------------------------------------------------------------
            // Ortho camera
            // ---------------------------------------------------------------------
            var cameraOrtho = new this.$THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10)
            this.scene1.add(cameraOrtho)
            cameraOrtho.name = 'OrthographicCamera'
            this.material = new this.$THREE.MeshLambertMaterial({
                color: 0xffff00,
                side: this.$THREE.DoubleSide
            })
            this.object = new this.$THREE.Mesh(new this.$THREE.CircleBufferGeometry(50, 20, 0, Math.PI * 2), this.material)
            this.object.position.set(200, 0, - 400)
            this.scene1.add(this.object)
            this.object = new this.$THREE.Mesh(new this.$THREE.RingBufferGeometry(10, 50, 20, 5, 0, Math.PI * 2), this.material)
            this.object.position.set(0, 0, - 400)
            this.scene1.add(this.object)
            this.object = new this.$THREE.Mesh(new this.$THREE.CylinderBufferGeometry(25, 75, 100, 40, 5), this.material)
            this.object.position.set(- 200, 0, - 400)
            this.scene1.add(this.object)
            //
            var points = []
            for (var i = 0; i < 50; i ++) {
                points.push(new this.$THREE.Vector2(Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50, (i - 5) * 2))
            }
            this.object = new this.$THREE.Mesh(new this.$THREE.LatheBufferGeometry(points, 20), this.material)
            this.object.position.set(200, 0, 400)
            this.scene1.add(this.object)
            // ---------------------------------------------------------------------
            // Big red box hidden just for testing `onlyVisible` option
            // ---------------------------------------------------------------------
            this.material = new this.$THREE.MeshBasicMaterial({
                color: 0xff0000
            })
            this.object = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(200, 200, 200), this.material)
            this.object.position.set(0, 0, 0)
            this.object.name = "CubeHidden"
            this.object.visible = false
            this.scene1.add(this.object)
            // ---------------------------------------------------------------------
            //
            //
            var loader = new OBJLoader()
            loader.load('static/models/obj/walt/WaltHead.obj', (obj) => {
                this.waltHead = obj
                this.waltHead.scale.multiplyScalar(1.5)
                this.waltHead.position.set(400, 0, 0)
                this.scene1.add(this.waltHead)
            })
            // ---------------------------------------------------------------------
            // 2nd this.$THREE.Scene
            // ---------------------------------------------------------------------
            this.scene2 = new this.$THREE.Scene()
            this.object = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(100, 100, 100), this.material)
            this.object.position.set(0, 0, 0)
            this.object.name = "Cube2ndScene"
            this.scene2.name = 'Scene2'
            this.scene2.add(this.object)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var timer = Date.now() * 0.0001
            this.camera.position.x = Math.cos(timer) * 800
            this.camera.position.z = Math.sin(timer) * 800
            this.camera.lookAt(this.scene1.position)
            this.renderer.render(this.scene1, this.camera)
        }
    },
}
</script>

<style scoped>
.miscExporterGltf-container {
    width: 100%;
}
</style>
