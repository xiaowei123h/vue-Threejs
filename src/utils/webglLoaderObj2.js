import { TrackballControls } from "@/components/jsm/controls/TrackballControls.js"
import { MTLLoader } from "@/components/jsm/loaders/MTLLoader.js"
import { OBJLoader2 } from "@/components/jsm/loaders/OBJLoader2.js"
import { MtlObjBridge } from "@/components/jsm/loaders/obj2/bridge/MtlObjBridge.js"
export function OBJLoader2Example(elementToBindTo, THREE) {
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
}

OBJLoader2Example.prototype = {
    constructor: OBJLoader2Example,
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
    },
    initContent: function () {
        const modelName = 'female02'
        this._reportProgress({ detail: { text: 'Loading: ' + modelName } })
        const scope = this
        const objLoader2 = new OBJLoader2()
        const callbackOnLoad = function (object3d) {
            scope.scene.add(object3d)
            console.log('Loading complete: ' + modelName)
            scope._reportProgress({ detail: { text: '' } })
        }
        const onLoadMtl = function (mtlParseResult) {
            objLoader2.setModelName(modelName)
            objLoader2.setLogging(true, true)
            objLoader2.addMaterials(MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult), true)
            objLoader2.load('static/models/obj/female02/female02.obj', callbackOnLoad, null, null, null)
        }
        const mtlLoader = new MTLLoader()
        mtlLoader.load('static/models/obj/female02/female02.mtl', onLoadMtl)
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
        this.renderer.render(this.scene, this.camera)
    }
}

export default { OBJLoader2Example }
