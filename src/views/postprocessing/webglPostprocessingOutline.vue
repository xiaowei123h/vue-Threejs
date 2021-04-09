<template>
    <div class="webglPostprocessingOutline-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Outline Pass by <a href="http://eduperiment.com" target="_blank" rel="noopener">Prashant Sharma</a> and <a href="https://clara.io" target="_blank" rel="noopener">Ben Houston</a><br/><br/>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { OutlinePass } from '@/components/jsm/postprocessing/OutlinePass.js'
import { FXAAShader } from '@/components/jsm/shaders/FXAAShader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            composer: null,
            effectFXAA: null,
            outlinePass: null,
			selectedObjects: [],
			raycaster: null,
			mouse: null,
			obj3d: null,
			group: null,
			params: {
				edgeStrength: 3.0,
				edgeGlow: 0.0,
				edgeThickness: 1.0,
				pulsePeriod: 0,
				rotate: false,
				usePatternTexture: false
			},
			// Init gui
			gui: null,
        }
    },
    mounted() {
        this.raycaster = new this.$THREE.Raycaster()
        this.mouse = new this.$THREE.Vector2()
        this.obj3d = new this.$THREE.Object3D()
        this.group = new this.$THREE.Group()
        this.gui = new GUI({ width: 300 })
        this.gui.add(this.params, 'edgeStrength', 0.01, 10).onChange((value) => {
            this.outlinePass.edgeStrength = Number(value)
        })
        this.gui.add(this.params, 'edgeGlow', 0.0, 1).onChange((value) => {
            this.outlinePass.edgeGlow = Number(value)
        })
        this.gui.add(this.params, 'edgeThickness', 1, 4).onChange((value) => {
            this.outlinePass.edgeThickness = Number(value)
        })
        this.gui.add(this.params, 'pulsePeriod', 0.0, 5).onChange((value) => {
            this.outlinePass.pulsePeriod = Number(value)
        })
        this.gui.add(this.params, 'rotate')
        this.gui.add(this.params, 'usePatternTexture').onChange((value) => {
            this.outlinePass.usePatternTexture = value
        })
        function Configuration() {
            this.visibleEdgeColor = '#ffffff'
            this.hiddenEdgeColor = '#190a05'
        }
        var conf = new Configuration()
        this.gui.addColor(conf, 'visibleEdgeColor').onChange((value) => {
            this.outlinePass.visibleEdgeColor.set(value)
        })
        this.gui.addColor(conf, 'hiddenEdgeColor').onChange((value) => {
            this.outlinePass.hiddenEdgeColor.set(value)
        })
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
       init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglPostprocessingOutline-container')[0].appendChild(this.container)
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.shadowMap.enabled = true
            // todo - support pixelRatio in this demo
            this.renderer.setSize(width, height)
            document.getElementsByClassName('webglPostprocessingOutline-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(45, width / height, 0.1, 100)
            this.camera.position.set(0, 0, 8)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 5
            this.controls.maxDistance = 20
            this.controls.enablePan = false
            this.controls.enableDamping = true
            this.controls.dampingFactor = 0.05
            //
            this.scene.add(new this.$THREE.AmbientLight(0xaaaaaa, 0.2))
            var light = new this.$THREE.DirectionalLight(0xddffdd, 0.6)
            light.position.set(1, 1, 1)
            light.castShadow = true
            light.shadow.mapSize.width = 1024
            light.shadow.mapSize.height = 1024
            var d = 10
            light.shadow.camera.left = - d
            light.shadow.camera.right = d
            light.shadow.camera.top = d
            light.shadow.camera.bottom = - d
            light.shadow.camera.far = 1000
            this.scene.add(light)
            // model
            var manager = new this.$THREE.LoadingManager()
            manager.onProgress = (item, loaded, total) => {
                console.log(item, loaded, total)
            }
            var loader = new OBJLoader(manager)
            loader.load('static/models/obj/tree.obj', (object) => {
                var scale = 1.0
                object.traverse((child) => {
                    if (child instanceof this.$THREE.Mesh) {
                        child.geometry.center()
                        child.geometry.computeBoundingSphere()
                        scale = 0.2 * child.geometry.boundingSphere.radius
                        var phongMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, shininess: 5 })
                        child.material = phongMaterial
                        child.receiveShadow = true
                        child.castShadow = true
                    }
                })
                object.position.y = 1
                object.scale.divideScalar(scale)
                this.obj3d.add(object)
            })
            this.scene.add(this.group)
            this.group.add(this.obj3d)
            //
            var geometry = new this.$THREE.SphereBufferGeometry(3, 48, 24)
            for (var i = 0; i < 20; i ++) {
                var material = new this.$THREE.MeshLambertMaterial()
                material.color.setHSL(Math.random(), 1.0, 0.3)
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 4 - 2
                mesh.position.y = Math.random() * 4 - 2
                mesh.position.z = Math.random() * 4 - 2
                mesh.receiveShadow = true
                mesh.castShadow = true
                mesh.scale.multiplyScalar(Math.random() * 0.3 + 0.1)
                this.group.add(mesh)

            }
            var floorMaterial = new this.$THREE.MeshLambertMaterial({ side: this.$THREE.DoubleSide })
            var floorGeometry = new this.$THREE.PlaneBufferGeometry(12, 12)
            var floorMesh = new this.$THREE.Mesh(floorGeometry, floorMaterial)
            floorMesh.rotation.x -= Math.PI * 0.5
            floorMesh.position.y -= 1.5
            this.group.add(floorMesh)
            floorMesh.receiveShadow = true
            var torusGeometry = new this.$THREE.TorusBufferGeometry(1, 0.3, 16, 100)
            var torusMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xffaaff })
            var torus = new this.$THREE.Mesh(torusGeometry, torusMaterial)
            torus.position.z = - 4
            this.group.add(torus)
            torus.receiveShadow = true
            torus.castShadow = true
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            // postprocessing
            this.composer = new EffectComposer(this.renderer)
            var renderPass = new RenderPass(this.scene, this.camera)
            this.composer.addPass(renderPass)
            this.outlinePass = new OutlinePass(new this.$THREE.Vector2(this.$webglInnerWidth, window.innerHeight), this.scene, this.camera)
            this.composer.addPass(this.outlinePass)
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load('static/textures/tri_pattern.jpg', (texture) => {
                this.outlinePass.patternTexture = texture
                texture.wrapS = this.$THREE.RepeatWrapping
                texture.wrapT = this.$THREE.RepeatWrapping
            })
            this.effectFXAA = new ShaderPass(FXAAShader)
            this.effectFXAA.uniforms[ 'resolution' ].value.set(1 / this.$webglInnerWidth, 1 / window.innerHeight)
            this.composer.addPass(this.effectFXAA)
            window.addEventListener('resize', this.onWindowResize, false)
            this.renderer.domElement.style.touchAction = 'none'
            this.renderer.domElement.addEventListener('pointermove', onPointerMove, false)
            var that = this
            function onPointerMove(event) {
                if (event.isPrimary === false) return
                that.mouse.x = (event.clientX / this.$webglInnerWidth) * 2 - 1
                that.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
                checkIntersection()
            }
            function addSelectedObject(object) {
                that.selectedObjects = []
                that.selectedObjects.push(object)
            }
            function checkIntersection() {
                that.raycaster.setFromCamera(that.mouse, that.camera)
                var intersects = that.raycaster.intersectObject(that.scene, true)
                if (intersects.length > 0) {
                    var selectedObject = intersects[ 0 ].object
                    addSelectedObject(selectedObject)
                    that.outlinePass.selectedObjects = that.selectedObjects
                } else {
                    // outlinePass.selectedObjects = []
                }
            }
        },
        onWindowResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.composer.setSize(width, height)
            this.effectFXAA.uniforms[ 'resolution' ].value.set(1 / window.innerWidth - 281, 1 / window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            var timer = performance.now()
            if (this.params.rotate) {
                this.group.rotation.y = timer * 0.0001
            }
            this.controls.update()
            this.composer.render()
            this.stats.end()
        }
    },
}
</script>

<style scoped>
.webglPostprocessingOutline-container {
    position: relative;
    width: 100%;
}
</style>
