import { TrackballControls } from "@/components/jsm/controls/TrackballControls.js"
import { VertexNormalsHelper } from "@/components/jsm/helpers/VertexNormalsHelper.js"
import { MTLLoader } from "@/components/jsm/loaders/MTLLoader.js"
import { MtlObjBridge } from "@/components/jsm/loaders/obj2/bridge/MtlObjBridge.js"
import { OBJLoader2 } from "@/components/jsm/loaders/OBJLoader2.js"
import { OBJLoader2Parallel } from "@/components/jsm/loaders/OBJLoader2Parallel.js"
import { LoadedMeshUserOverride } from "@/components/jsm/loaders/obj2/shared/MeshReceiver.js"
import { CompressedPixelFormat } from "three"
export function WWOBJLoader2Example(elementToBindTo, THREE) {
    this.renderer = null
    this.canvas = elementToBindTo
    this.aspectRatio = 1
    this.recalcAspectRatio()
    this.THREE = THREE
    this.scene = null
    this.cameraDefaults = {
        posCamera: new this.THREE.Vector3(0.0, 175.0, 500.0),
        posCameraTarget: new this.THREE.Vector3(0, 0, 0),
        near: 0.1,
        far: 10000,
        fov: 45
    }
    this.camera = null
    this.cameraTarget = this.cameraDefaults.posCameraTarget
    this.controls = null
    this.flatShading = false
    this.doubleSide = false
    this.useJsmWorker = false
    this.loadCount = 6
    this.cube = null
    this.pivot = null
}

WWOBJLoader2Example.prototype = {
    constructor: WWOBJLoader2Example,
    initGL: function () {
        this.renderer = new this.THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            autoClear: true
        })
        this.renderer.setClearColor(0x050505)
        this.scene = new this.THREE.Scene()
        this.camera = new this.THREE.PerspectiveCamera(this.cameraDefaults.fov, this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far)
        this.resetCamera()
        this.controls = new TrackballControls(this.camera, this.renderer.domElement)
        const ambientLight = new this.THREE.AmbientLight(0x404040)
        const directionalLight1 = new this.THREE.DirectionalLight(0xC0C090)
        const directionalLight2 = new this.THREE.DirectionalLight(0xC0C090)
        directionalLight1.position.set(- 100, - 50, 100)
        directionalLight2.position.set(100, 50, - 100)
        this.scene.add(directionalLight1)
        this.scene.add(directionalLight2)
        this.scene.add(ambientLight)
        const helper = new this.THREE.GridHelper(1200, 60, 0xFF4444, 0x404040)
        this.scene.add(helper)
        const geometry = new this.THREE.BoxBufferGeometry(10, 10, 10)
        const material = new this.THREE.MeshNormalMaterial()
        this.cube = new this.THREE.Mesh(geometry, material)
        this.cube.position.set(0, 0, 0)
        this.scene.add(this.cube)
        this.pivot = new this.THREE.Object3D()
        this.pivot.name = 'Pivot'
        this.scene.add(this.pivot)
    },
    useParseMain: function () {
        const modelName = 'female02'
        this._reportProgress({ detail: { text: 'Loading: ' + modelName } })
        const objLoader2 = new OBJLoader2()
            .setModelName(modelName)
        const scope = this
        function onLoadMtl(mtlParseResult) {
            objLoader2.addMaterials(MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult), true)
            const fileLoader = new scope.THREE.FileLoader()
            fileLoader.setPath('')
            fileLoader.setResponseType('arraybuffer')
            fileLoader.load('static/models/obj/female02/female02.obj',
                function (content) {
                    const local = new scope.THREE.Object3D()
                    local.name = 'Pivot_female02'
                    local.position.set(75, 0, 0)
                    scope.pivot.add(local)
                    local.add(objLoader2.parse(content))
                    scope._reportProgress({ detail: { text: 'Loading of ' + modelName + ' completed: OBJLoader2#pase: Parsing completed' } })
                    scope.finalize()
                }
        )
        }
        const mtlLoader = new MTLLoader()
        mtlLoader.load('static/models/obj/female02/female02.mtl', onLoadMtl)
    },
    useParseParallel: function () {
        const modelName = 'female02_vertex'
        this._reportProgress({ detail: { text: 'Loading: ' + modelName } })
        const local = new this.THREE.Object3D()
        local.name = 'Pivot_female02_vertex'
        local.position.set(- 75, 0, 0)
        this.pivot.add(local)
        const scope = this
        function callbackOnLoad(object3d, message) {
            local.add(object3d)
            scope._reportProgress({ detail: { text: 'Loading of ' + modelName + ' completed: ' + message } })
            scope.finalize()
        }
        const materials = {
            tester: new this.THREE.MeshStandardMaterial()
        }
        const objLoader2Parallel = new OBJLoader2Parallel()
            .setModelName(modelName)
            .setJsmWorker(this.useJsmWorker, new URL(OBJLoader2Parallel.DEFAULT_JSM_WORKER_PATH, window.location.href))
            .setCallbackOnLoad(callbackOnLoad)
            .addMaterials(materials, true)
        const fileLoader = new this.THREE.FileLoader()
        fileLoader.setPath('')
        fileLoader.setResponseType('arraybuffer')
        fileLoader.load('static/models/obj/female02/female02_vertex_colors.obj',
            function (content) {
                objLoader2Parallel.parse(content)
            }
    )
    },
    useLoadMain: function () {
        const modelName = 'male02'
        this._reportProgress({ detail: { text: 'Loading: ' + modelName } })
        const objLoader2 = new OBJLoader2()
            .setModelName(modelName)
            .setUseIndices(true)
        const scope = this
        function callbackOnLoad(object3d, message) {
            const local = new scope.THREE.Object3D()
            local.name = 'Pivot_male02'
            local.position.set(0, 0, - 75)
            scope.pivot.add(local)
            local.add(object3d)
            scope._reportProgress({ detail: { text: 'Loading of ' + modelName + ' completed: ' + message } })
            scope.finalize()
        }
        function onLoadMtl(mtlParseResult) {
            objLoader2.addMaterials(MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult), true)
            objLoader2.load('static/models/obj/male02/male02.obj', callbackOnLoad, null, null, null)
        }
        const mtlLoader = new MTLLoader()
        mtlLoader.load('static/models/obj/male02/male02.mtl', onLoadMtl)
    },
    useLoadParallel: function () {
        const modelName = 'WaltHead'
        this._reportProgress({ detail: { text: 'Loading: ' + modelName } })
        const local = new this.THREE.Object3D()
        local.name = 'Pivot_WaltHead'
        local.position.set(- 175, 50, 0)
        const scale = 0.5
        local.scale.set(scale, scale, scale)
        this.pivot.add(local)
        const objLoader2Parallel = new OBJLoader2Parallel()
            .setModelName(modelName)
            .setJsmWorker(this.useJsmWorker, new URL(OBJLoader2Parallel.DEFAULT_JSM_WORKER_PATH, window.location.href))
        const scope = this
        function callbackOnLoad(object3d, message) {
            local.add(object3d)
            scope._reportProgress({ detail: { text: 'Loading of ' + modelName + ' completed: ' + message } })
            scope.finalize()
        }
        function onLoadMtl(mtlParseResult) {
            objLoader2Parallel.addMaterials(MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult), true)
            objLoader2Parallel.load('static/models/obj/walt/WaltHead.obj', callbackOnLoad)
        }
        const mtlLoader = new MTLLoader()
        mtlLoader.load('static/models/obj/walt/WaltHead.mtl', onLoadMtl)
    },
    useLoadMainFallback: function () {
        const local = new this.THREE.Object3D()
        local.name = 'Pivot_Cerberus'
        local.position.set(0, 0, 100)
        const scale = 50
        local.scale.set(scale, scale, scale)
        this.pivot.add(local)
        const objLoader2Parallel = new OBJLoader2Parallel()
            .setModelName(local.name)
            .setExecuteParallel(false)
        const scope = this
        function callbackOnLoad(object3d, message) {
            local.add(object3d)
            scope._reportProgress({ detail: { text: 'Loading of ' + objLoader2Parallel.modelName + ' completed: ' + message } })
            scope.finalize()
        }
        objLoader2Parallel.load('static/models/obj/cerberus/Cerberus.obj', callbackOnLoad)
    },
    useLoadParallelMeshAlter: function () {
        const local = new this.THREE.Object3D()
        local.position.set(175, - 100, 0)
        local.name = 'Pivot_ninjaHead'
        this.pivot.add(local)
        const objLoader2Parallel = new OBJLoader2Parallel()
            .setModelName(local.name)
            .setJsmWorker(this.useJsmWorker, new URL(OBJLoader2Parallel.DEFAULT_JSM_WORKER_PATH, window.location.href))
            .setBaseObject3d(local)
        // Configure WorkerExecutionSupport to not disregard worker after execution
        objLoader2Parallel.getWorkerExecutionSupport().setTerminateWorkerOnLoad(false)
        const scope = this
        function callbackMeshAlter(event) {
            const override = new LoadedMeshUserOverride(false, true)
            const mesh = new scope.THREE.Mesh(event.detail.bufferGeometry, event.detail.material)
            mesh.name = event.detail.meshName
            const helper = new VertexNormalsHelper(mesh, 2, 0x00ff00)
            helper.name = 'VertexNormalsHelper'
            override.addMesh(mesh)
            override.addMesh(helper)
            return override
        }
        objLoader2Parallel.setCallbackOnMeshAlter(callbackMeshAlter)
        function callbackOnLoad(object3d, message) {
            scope._reportProgress({ detail: { text: 'Loading of ' + objLoader2Parallel.modelName + ' completed: ' + message } })
            scope.finalize()
        }
        objLoader2Parallel.load('static/models/obj/ninja/ninjaHead_Low.obj', callbackOnLoad)
    },
    finalize: function () {
        this.loadCount --
        if (this.loadCount === 0) {
            this._reportProgress({ detail: { text: '' } })
        }
    },
    _reportProgress: function (event) {
        let output = ''
        if (event.detail !== null && event.detail !== undefined && event.detail.text) {
            output = event.detail.text
        }
        console.log('Progress: ' + output)
        document.getElementById('feedback').innerHTML = output
    },
    resizeDisplayGL: function () {
        this.controls.handleResize()
        this.recalcAspectRatio()
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false)
        this.updateCamera()
    },
    recalcAspectRatio: function () {
        this.aspectRatio = (this.canvas.offsetHeight === 0) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight
    },
    resetCamera: function () {
        this.camera.position.copy(this.cameraDefaults.posCamera)
        this.cameraTarget.copy(this.cameraDefaults.posCameraTarget)
        this.updateCamera()
    },
    updateCamera: function () {
        this.camera.aspect = this.aspectRatio
        this.camera.lookAt(this.cameraTarget)
        this.camera.updateProjectionMatrix()
    },
    render: function () {
        if (! this.renderer.autoClear) this.renderer.clear()
        this.controls.update()
        this.cube.rotation.x += 0.05
        this.cube.rotation.y += 0.05
        this.renderer.render(this.scene, this.camera)
    },
    alterShading: function () {
        const scope = this
        scope.flatShading = ! scope.flatShading
        console.log(scope.flatShading ? 'Enabling flat shading' : 'Enabling smooth shading')
        scope.traversalFunction = function (material) {
            material.flatShading = scope.flatShading
            material.needsUpdate = true
        }
        function scopeTraverse(object3d) {
            scope.traverseScene(object3d)
        }
        scope.pivot.traverse(scopeTraverse)
    },
    alterDouble: function () {
        const scope = this
        scope.doubleSide = ! scope.doubleSide
        console.log(scope.doubleSide ? 'Enabling THREE.DoubleSide materials' : 'Enabling THREE.FrontSide materials')
        scope.traversalFunction = function (material) {
            material.side = scope.doubleSide ? scope.THREE.DoubleSide : scope.THREE.FrontSide
        }
        function scopeTraverse(object3d) {
            scope.traverseScene(object3d)
        }
        scope.pivot.traverse(scopeTraverse)
    },
    traverseScene: function (object3d) {
        if (Array.isArray(object3d.material)) {
            const materials = object3d.material.materials
            for (const name in materials) {
                if (materials.hasOwnProperty(name))	this.traversalFunction(materials[ name ])
            }
        } else if (object3d.material) {
            this.traversalFunction(object3d.material)
        }
    },
    executeLoading: function () {
        // Load a file with OBJLoader2.parse on main
        this.useParseMain()
        // Load a file with OBJLoader2Parallel.parse in parallel in worker
        this.useParseParallel()
        // Load a file with OBJLoader.load on main
        this.useLoadMain()
        // Load a file with OBJLoader2Parallel.load in parallel in worker
        this.useLoadParallel()
        // Load a file with OBJLoader2Parallel.load on main with fallback to OBJLoader2.parse
        this.useLoadMainFallback()
        // Load a file with OBJLoader2Parallel.load in parallel in worker and add normals during onMeshAlter
        this.useLoadParallelMeshAlter()
    }
}

export default { WWOBJLoader2Example }