<template>
    <div class="webglMaterialsChannels-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - <span id="description">Normal, Depth, DepthRGBA, DepthRGBAUnpacked, Materials</span><br/>
			by <a href="https://Clara.io">Ben Houston</a>. ninja head from <a href="https://gpuopen.com/archive/gamescgi/amd-gpu-meshmapper/" target="_blank" rel="noopener">AMD GPU MeshMapper</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			params: {
				material: 'normal',
				camera: 'perspective',
				side: 'double'
			},
			sides: {
				'front': this.$THREE.FrontSide,
				'back': this.$THREE.BackSide,
				'double': this.$THREE.DoubleSide
			},
            cameraOrtho: null,
            cameraPerspective: null,
            controlsOrtho: null,
            controlsPerspective: null,
            mesh: null,
            materialStandard: null,
            materialDepthBasic: null,
            materialDepthRGBA: null,
            materialNormal: null,
			SCALE: 2.436143, // from original model
            BIAS: - 0.428408, // from original model
            gui: null,
        }
    },
    mounted() {
        this.init()
        this.animate()
        this.initGui()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        initGui() {
            this.gui = new GUI()
            this.gui.add(this.params, 'material', [ 'standard', 'normal', 'depthBasic', 'depthRGBA' ])
            this.gui.add(this.params, 'camera', [ 'perspective', 'ortho' ])
            this.gui.add(this.params, 'side', [ 'front', 'back', 'double' ])
        },
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsChannels-container')[0].appendChild(container)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            this.scene = new this.$THREE.Scene()
            var aspect = this.$webglInnerWidth / window.innerHeight
            this.cameraPerspective = new this.$THREE.PerspectiveCamera(45, aspect, 500, 3000)
            this.cameraPerspective.position.z = 1500
            this.scene.add(this.cameraPerspective)
            var height = 500
            this.cameraOrtho = new this.$THREE.OrthographicCamera(- height * aspect, height * aspect, height, - height, 1000, 2500)
            this.cameraOrtho.position.z = 1500
            this.scene.add(this.cameraOrtho)
            this.camera = this.cameraPerspective
            this.controlsPerspective = new OrbitControls(this.cameraPerspective, this.renderer.domElement)
            this.controlsPerspective.minDistance = 1000
            this.controlsPerspective.maxDistance = 2400
            this.controlsPerspective.enablePan = false
            this.controlsPerspective.enableDamping = true
            this.controlsOrtho = new OrbitControls(this.cameraOrtho, this.renderer.domElement)
            this.controlsOrtho.minZoom = 0.5
            this.controlsOrtho.maxZoom = 1.5
            this.controlsOrtho.enablePan = false
            this.controlsOrtho.enableDamping = true
            // lights
            var ambientLight = new this.$THREE.AmbientLight(0xffffff, 0.1)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xff0000, 0.5)
            pointLight.position.z = 2500
            this.scene.add(pointLight)
            var pointLight2 = new this.$THREE.PointLight(0xff6666, 1)
            this.camera.add(pointLight2)
            var pointLight3 = new this.$THREE.PointLight(0x0000ff, 0.5)
            pointLight3.position.x = - 1000
            pointLight3.position.z = 1000
            this.scene.add(pointLight3)
            // textures
            var textureLoader = new this.$THREE.TextureLoader()
            var normalMap = textureLoader.load("static/models/obj/ninja/normal.png")
            var aoMap = textureLoader.load("static/models/obj/ninja/ao.jpg")
            var displacementMap = textureLoader.load("static/models/obj/ninja/displacement.jpg")
            // material
            this.materialStandard = new this.$THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.5,
                roughness: 0.6,
                displacementMap: displacementMap,
                displacementScale: this.SCALE,
                displacementBias: this.BIAS,
                aoMap: aoMap,
                normalMap: normalMap,
                normalScale: new this.$THREE.Vector2(1, - 1),
                //flatShading: true,
                side: this.$THREE.DoubleSide
            })
            this.materialDepthBasic = new this.$THREE.MeshDepthMaterial({
                depthPacking: this.$THREE.BasicDepthPacking,
                displacementMap: displacementMap,
                displacementScale: this.SCALE,
                displacementBias: this.BIAS,
                side: this.$THREE.DoubleSide
            })
            this.materialDepthRGBA = new this.$THREE.MeshDepthMaterial({
                depthPacking: this.$THREE.RGBADepthPacking,
                displacementMap: displacementMap,
                displacementScale: this.SCALE,
                displacementBias: this.BIAS,
                side: this.$THREE.DoubleSide
            })
            this.materialNormal = new this.$THREE.MeshNormalMaterial({
                displacementMap: displacementMap,
                displacementScale: this.SCALE,
                displacementBias: this.BIAS,
                normalMap: normalMap,
                normalScale: new this.$THREE.Vector2(1, - 1),
                //flatShading: true,
                side: this.$THREE.DoubleSide
            })
            //
            var loader = new OBJLoader()
            loader.load("static/models/obj/ninja/ninjaHead_Low.obj", (group) => {
                var geometry = group.children[ 0 ].geometry
                geometry.attributes.uv2 = geometry.attributes.uv
                geometry.center()
                this.mesh = new this.$THREE.Mesh(geometry, this.materialNormal)
                this.mesh.scale.multiplyScalar(25)
                this.scene.add(this.mesh)
            })
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            var aspect = (window.innerWidth - 281) / window.innerHeight
            this.camera.aspect = aspect
            this.camera.left = - height * aspect
            this.camera.right = height * aspect
            this.camera.top = height
            this.camera.bottom = - height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(width, height)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            if (this.mesh) {
                var material = this.mesh.material
                switch (this.params.material) {
                    case 'standard': material = this.materialStandard; break
                    case 'depthBasic': material = this.materialDepthBasic; break
                    case 'depthRGBA': material = this.materialDepthRGBA; break
                    case 'normal': material = this.materialNormal; break
                }
                if (this.sides[ this.params.side ] !== material.side) {
                    switch (this.params.side) {
                        case 'front': material.side = this.$THREE.FrontSide; break
                        case 'back': material.side = this.$THREE.BackSide; break
                        case 'double': material.side = this.$THREE.DoubleSide; break
                    }
                    material.needsUpdate = true
                }
                this.mesh.material = material
            }
            switch (this.params.camera) {
                case 'perspective':
                    this.camera = this.cameraPerspective
                    break
                case 'ortho':
                    this.camera = this.cameraOrtho
                    break
            }
            this.controlsPerspective.update()
            this.controlsOrtho.update() // must update both controls for damping to complete
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsChannels-container {
    width: 100%;
}
</style>
