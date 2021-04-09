<template>
    <div class="webglMaterialsVariationsToon-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Toon Material Variantions with OutlineEffect</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OutlineEffect } from '@/components/jsm/effects/OutlineEffect.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            effect: null,
			particleLight: null,
			loader: null,
        }
    },
    mounted() {
        this.loader = new this.$THREE.FontLoader()
        this.loader.load('static/fonts/gentilis_regular.typeface.json', (font) => {
            this.init(font)
            this.animate()
        })
    },
    methods: {
        init(font) {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsVariationsToon-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 2500)
            this.camera.position.set(0.0, 400, 400 * 3.5)
            //
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x444488)
            // Materials
            var cubeWidth = 400
            var numberOfSphersPerSide = 5
            var sphereRadius = (cubeWidth / numberOfSphersPerSide) * 0.8 * 0.5
            var stepSize = 1.0 / numberOfSphersPerSide
            var geometry = new this.$THREE.SphereBufferGeometry(sphereRadius, 32, 16)
            for (var alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex ++) {
                var colors = new Uint8Array(alphaIndex + 2)
                for (var c = 0; c <= colors.length; c ++) {
                    colors[ c ] = (c / colors.length) * 256
                }
                var gradientMap = new this.$THREE.DataTexture(colors, colors.length, 1, this.$THREE.LuminanceFormat)
                gradientMap.minFilter = this.$THREE.NearestFilter
                gradientMap.magFilter = this.$THREE.NearestFilter
                gradientMap.generateMipmaps = false
                for (var beta = 0; beta <= 1.0; beta += stepSize) {
                    for (var gamma = 0; gamma <= 1.0; gamma += stepSize) {
                        // basic monochromatic energy preservation
                        var diffuseColor = new this.$THREE.Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1).multiplyScalar(1 - beta * 0.2)
                        var material = new this.$THREE.MeshToonMaterial({
                            color: diffuseColor,
                            gradientMap: gradientMap
                        })
                        var mesh = new this.$THREE.Mesh(geometry, material)
                        mesh.position.x = alpha * 400 - 200
                        mesh.position.y = beta * 400 - 200
                        mesh.position.z = gamma * 400 - 200
                        this.scene.add(mesh)
                    }
                }
            }
            var that = this
            function addLabel(name, location) {
                var textGeo = new that.$THREE.TextBufferGeometry(name, {
                    font: font,
                    size: 20,
                    height: 1,
                    curveSegments: 1
                })
                var textMaterial = new that.$THREE.MeshBasicMaterial()
                var textMesh = new that.$THREE.Mesh(textGeo, textMaterial)
                textMesh.position.copy(location)
                that.scene.add(textMesh)
            }
            addLabel("-gradientMap", new this.$THREE.Vector3(- 350, 0, 0))
            addLabel("+gradientMap", new this.$THREE.Vector3(350, 0, 0))
            addLabel("-diffuse", new this.$THREE.Vector3(0, 0, - 300))
            addLabel("+diffuse", new this.$THREE.Vector3(0, 0, 300))
            this.particleLight = new this.$THREE.Mesh(
                new this.$THREE.SphereBufferGeometry(4, 8, 8),
                new this.$THREE.MeshBasicMaterial({ color: 0xffffff })
            )
            this.scene.add(this.particleLight)
            // Lights
            this.scene.add(new this.$THREE.AmbientLight(0x888888))
            var pointLight = new this.$THREE.PointLight(0xffffff, 2, 800)
            this.particleLight.add(pointLight)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.effect = new OutlineEffect(this.renderer)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 200
            controls.maxDistance = 2000
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            var timer = Date.now() * 0.00025
            this.particleLight.position.x = Math.sin(timer * 7) * 300
            this.particleLight.position.y = Math.cos(timer * 5) * 400
            this.particleLight.position.z = Math.cos(timer * 3) * 300
            this.effect.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsVariationsToon-container {
    position: relative;
    width: 100%;
}
</style>
