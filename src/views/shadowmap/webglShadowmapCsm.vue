<template>
    <div class="webglShadowmapCsm-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - cascaded shadow maps<br>
			by <a href="https://github.com/vHawk" target="_blank" rel="noopener">vHawk</a> (<a href="https://github.com/vHawk/three-csm" target="_blank" rel="noopener">original repository</a>)
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { CSM } from '@/components/jsm/csm/CSM.js'
import { CSMHelper } from '@/components/jsm/csm/CSMHelper.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            orthoCamera: null,
            controls: null,
            csm: null,
            csmHelper: null,
            params: null,
            gui: null,
        }
    },
    mounted() {
        this.params = {
            orthographic: false,
            fade: false,
            far: 1000,
            mode: 'practical',
            lightX: - 1,
            lightY: - 1,
            lightZ: - 1,
            margin: 100,
            lightFar: 5000,
            lightNear: 1,
            autoUpdateHelper: true,
            updateHelper: () => {
                this.csmHelper.update()
            }
        }
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        updateOrthoCamera() {
            var size = this.controls.target.distanceTo(this.camera.position)
            var aspect = this.camera.aspect
            this.orthoCamera.left = size * aspect / - 2
            this.orthoCamera.right = size * aspect / 2
            this.orthoCamera.top = size / 2
            this.orthoCamera.bottom = size / - 2
            this.orthoCamera.position.copy(this.camera.position)
            this.orthoCamera.rotation.copy(this.camera.rotation)
            this.orthoCamera.updateProjectionMatrix()
        },
        init() {
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color('#454e61')
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.1, 5000)
            this.orthoCamera = new this.$THREE.OrthographicCamera()
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglShadowmapCsm-container')[0].appendChild(this.renderer.domElement)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.maxPolarAngle = Math.PI / 2
            this.camera.position.set(60, 60, 0)
            this.controls.target = new this.$THREE.Vector3(- 100, 10, 0)
            this.controls.update()
            var ambientLight = new this.$THREE.AmbientLight(0xffffff, 0.5)
            this.scene.add(ambientLight)
            this.csm = new CSM({
                maxFar: this.params.far,
                cascades: 4,
                mode: this.params.mode,
                parent: this.scene,
                shadowMapSize: 1024,
                lightDirection: new this.$THREE.Vector3(this.params.lightX, this.params.lightY, this.params.lightZ).normalize(),
                camera: this.camera
            })
            this.csmHelper = new CSMHelper(this.csm)
            this.csmHelper.visible = false
            this.scene.add(this.csmHelper)
            var floorMaterial = new this.$THREE.MeshPhongMaterial({ color: '#252a34' })
            this.csm.setupMaterial(floorMaterial)
            var floor = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(10000, 10000, 8, 8), floorMaterial)
            floor.rotation.x = - Math.PI / 2
            floor.castShadow = true
            floor.receiveShadow = true
            this.scene.add(floor)
            var material1 = new this.$THREE.MeshPhongMaterial({ color: '#08d9d6' })
            this.csm.setupMaterial(material1)
            var material2 = new this.$THREE.MeshPhongMaterial({ color: '#ff2e63' })
            this.csm.setupMaterial(material2)
            var geometry = new this.$THREE.BoxBufferGeometry(10, 10, 10)
            for (var i = 0; i < 40; i ++) {
                var cube1 = new this.$THREE.Mesh(geometry, i % 2 === 0 ? material1 : material2)
                cube1.castShadow = true
                cube1.receiveShadow = true
                this.scene.add(cube1)
                cube1.position.set(- i * 25, 20, 30)
                cube1.scale.y = Math.random() * 2 + 6
                var cube2 = new this.$THREE.Mesh(geometry, i % 2 === 0 ? material2 : material1)
                cube2.castShadow = true
                cube2.receiveShadow = true
                this.scene.add(cube2)
                cube2.position.set(- i * 25, 20, - 30)
                cube2.scale.y = Math.random() * 2 + 6
            }
            this.gui = new GUI()
            this.gui.add(this.params, 'orthographic').onChange((value) => {
                this.csm.camera = value ? this.orthoCamera : this.camera
                this.csm.updateFrustums()
            })
            this.gui.add(this.params, 'fade').onChange((value) => {
                this.csm.fade = value
                this.csm.updateFrustums()
            })
            this.gui.add(this.params, 'far', 1, 5000).step(1).name('shadow far').onChange((value) => {
                this.csm.maxFar = value
                this.csm.updateFrustums()
            })
            this.gui.add(this.params, 'mode', [ 'uniform', 'logarithmic', 'practical' ]).name('frustum split mode').onChange((value) => {
                this.csm.mode = value
                this.csm.updateFrustums()
            })
            this.gui.add(this.params, 'lightX', - 1, 1).name('light direction x').onChange((value) => {
                this.csm.lightDirection.x = value
            })
            this.gui.add(this.params, 'lightY', - 1, 1).name('light direction y').onChange((value) => {
                this.csm.lightDirection.y = value
            })
            this.gui.add(this.params, 'lightZ', - 1, 1).name('light direction z').onChange((value) => {
                this.csm.lightDirection.z = value
            })
            this.gui.add(this.params, 'margin', 0, 200).name('light margin').onChange((value) => {
                this.csm.lightMargin = value
            })
            this.gui.add(this.params, 'lightNear', 1, 10000).name('light near').onChange((value) => {
                for (var i = 0; i < this.csm.lights.length; i ++) {
                    this.csm.lights[ i ].shadow.camera.near = value
                    this.csm.lights[ i ].shadow.camera.updateProjectionMatrix()
                }
            })
            this.gui.add(this.params, 'lightFar', 1, 10000).name('light far').onChange((value) => {
                for (var i = 0; i < this.csm.lights.length; i ++) {
                    this.csm.lights[ i ].shadow.camera.far = value
                    this.csm.lights[ i ].shadow.camera.updateProjectionMatrix()
                }
            })
            var helperFolder = this.gui.addFolder('helper')
            helperFolder.add(this.csmHelper, 'visible')
            helperFolder.add(this.csmHelper, 'displayFrustum').onChange(() => {
                this.csmHelper.updateVisibility()
            })
            helperFolder.add(this.csmHelper, 'displayPlanes').onChange(() => {
                this.csmHelper.updateVisibility()
            })
            helperFolder.add(this.csmHelper, 'displayShadowBounds').onChange(() => {
                this.csmHelper.updateVisibility()
            })
            helperFolder.add(this.params, 'autoUpdateHelper').name('auto update')
            helperFolder.add(this.params, 'updateHelper').name('update')
            helperFolder.open()
            window.addEventListener('resize', () => {
                this.$onWindowResize(this.camera, this.renderer)
                this.updateOrthoCamera()
                this.csm.updateFrustums()
            }, false)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.camera.updateMatrixWorld()
            this.csm.update()
            this.controls.update()
            if (this.params.orthographic) {
                this.updateOrthoCamera()
                this.csm.updateFrustums()
                if (this.params.autoUpdateHelper) {
                    this.csmHelper.update()
                }
                this.renderer.render(this.scene, this.orthoCamera)
            } else {
                if (this.params.autoUpdateHelper) {
                    this.csmHelper.update()
                }
                this.renderer.render(this.scene, this.camera)
            }
        }
    },
}
</script>

<style scoped>
.webglShadowmapCsm-container {
    width: 100%;
}
</style>
