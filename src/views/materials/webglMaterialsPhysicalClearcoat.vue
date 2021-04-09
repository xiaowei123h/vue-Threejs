<template>
    <div class="webglMaterialsPhysicalClearcoat-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - materials - clearcoat
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { HDRCubeTextureLoader } from '@/components/jsm/loaders/HDRCubeTextureLoader.js'
import { FlakesTexture } from '@/components/jsm/textures/FlakesTexture.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			particleLight: null,
			group: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsPhysicalClearcoat-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            new HDRCubeTextureLoader()
                .setDataType(this.$THREE.UnsignedByteType)
                .setPath('static/textures/cube/pisaHDR/')
                .load([ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ],
                    (hdrCubeMap) => {
                        var hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap)
                        hdrCubeMap.dispose()
                        pmremGenerator.dispose()
                        var geometry = new this.$THREE.SphereBufferGeometry(80, 64, 32)
                        var textureLoader = new this.$THREE.TextureLoader()
                        var diffuse = textureLoader.load("static/textures/carbon/Carbon.png")
                        diffuse.encoding = this.$THREE.sRGBEncoding
                        diffuse.wrapS = this.$THREE.RepeatWrapping
                        diffuse.wrapT = this.$THREE.RepeatWrapping
                        diffuse.repeat.x = 10
                        diffuse.repeat.y = 10
                        var normalMap = textureLoader.load("static/textures/carbon/Carbon_Normal.png")
                        normalMap.wrapS = this.$THREE.RepeatWrapping
                        normalMap.wrapT = this.$THREE.RepeatWrapping
                        var normalMap2 = textureLoader.load("static/textures/water/Water_1_M_Normal.jpg")
                        var normalMap3 = new this.$THREE.CanvasTexture(new FlakesTexture())
                        normalMap3.wrapS = this.$THREE.RepeatWrapping
                        normalMap3.wrapT = this.$THREE.RepeatWrapping
                        normalMap3.repeat.x = 10
                        normalMap3.repeat.y = 6
                        normalMap3.anisotropy = 16
                        var normalMap4 = textureLoader.load("static/textures/golfball.jpg")
                        var clearcoatNormaMap = textureLoader.load("static/textures/pbr/Scratched_gold/Scratched_gold_01_1K_Normal.png")
                        // car paint
                        var material = new this.$THREE.MeshPhysicalMaterial({
                            clearcoat: 1.0,
                            clearcoatRoughness: 0.1,
                            metalness: 0.9,
                            roughness: 0.5,
                            color: 0x0000ff,
                            normalMap: normalMap3,
                            normalScale: new this.$THREE.Vector2(0.15, 0.15)
                        })
                        var mesh = new this.$THREE.Mesh(geometry, material)
                        mesh.position.x = - 100
                        mesh.position.y = 100
                        this.group.add(mesh)
                        // fibers
                        material = new this.$THREE.MeshPhysicalMaterial({
                            roughness: 0.5,
                            clearcoat: 1.0,
                            clearcoatRoughness: 0.1,
                            map: diffuse,
                            normalMap: normalMap
                        })
                        mesh = new this.$THREE.Mesh(geometry, material)
                        mesh.position.x = 100
                        mesh.position.y = 100
                        this.group.add(mesh)
                        // golf
                        material = new this.$THREE.MeshPhysicalMaterial({
                            metalness: 0.0,
                            roughness: 0.1,
                            clearcoat: 1.0,
                            normalMap: normalMap4,
                            clearcoatNormalMap: clearcoatNormaMap,
                            // y scale is negated to compensate for normal map handedness.
                            clearcoatNormalScale: new this.$THREE.Vector2(2.0, - 2.0)
                        })
                        mesh = new this.$THREE.Mesh(geometry, material)
                        mesh.position.x = - 100
                        mesh.position.y = - 100
                        this.group.add(mesh)
                        // clearcoat + normalmap
                        material = new this.$THREE.MeshPhysicalMaterial({
                            clearcoat: 1.0,
                            metalness: 1.0,
                            color: 0xff0000,
                            normalMap: normalMap2,
                            normalScale: new this.$THREE.Vector2(0.15, 0.15),
                            clearcoatNormalMap: clearcoatNormaMap,
                            // y scale is negated to compensate for normal map handedness.
                            clearcoatNormalScale: new this.$THREE.Vector2(2.0, - 2.0)
                        })
                        mesh = new this.$THREE.Mesh(geometry, material)
                        mesh.position.x = 100
                        mesh.position.y = - 100
                        this.group.add(mesh)
                        //
                        this.scene.background = hdrCubeRenderTarget.texture
                        this.scene.environment = hdrCubeRenderTarget.texture
                    }
            )
            // LIGHTS
            this.particleLight = new this.$THREE.Mesh(
                new this.$THREE.SphereBufferGeometry(4, 8, 8),
                new this.$THREE.MeshBasicMaterial({ color: 0xffffff })
            )
            this.scene.add(this.particleLight)
            this.particleLight.add(new this.$THREE.PointLight(0xffffff, 1))
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.renderer.toneMapping = this.$THREE.ACESFilmicToneMapping
            this.renderer.toneMappingExposure = 1.25
            //
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            //
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            pmremGenerator.compileEquirectangularShader()
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            // EVENTS
            new OrbitControls(this.camera, this.renderer.domElement)
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
            var timer = Date.now() * 0.00025
            this.particleLight.position.x = Math.sin(timer * 7) * 300
            this.particleLight.position.y = Math.cos(timer * 5) * 400
            this.particleLight.position.z = Math.cos(timer * 3) * 300
            for (var i = 0; i < this.group.children.length; i ++) {
                var child = this.group.children[ i ]
                child.rotation.y += 0.005
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsPhysicalClearcoat-container {
    position: relative;
    width: 100%;
}
</style>
