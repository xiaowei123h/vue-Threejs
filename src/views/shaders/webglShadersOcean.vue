<template>
    <div class="webglShadersOcean-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl ocean
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Water } from '@/components/jsm/objects/Water.js'
import { Sky } from '@/components/jsm/objects/Sky.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            water: null,
            sun: null,
            mesh: null,
            gui: null
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            //
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(55, this.$webglInnerWidth / window.innerHeight, 1, 20000)
            this.camera.position.set(30, 30, 100)
            //
            this.sun = new this.$THREE.Vector3()
            // Water
            var waterGeometry = new this.$THREE.PlaneBufferGeometry(10000, 10000)
            this.water = new Water(
                waterGeometry,
                {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: new this.$THREE.TextureLoader().load('static/textures/waternormals.jpg', (texture) => {
                        texture.wrapS = texture.wrapT = this.$THREE.RepeatWrapping
                    }),
                    alpha: 1.0,
                    sunDirection: new this.$THREE.Vector3(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
                    distortionScale: 3.7,
                    fog: this.scene.fog !== undefined
                }
            )
            this.water.rotation.x = - Math.PI / 2
            this.scene.add(this.water)
            // Skybox
            var sky = new Sky()
            sky.scale.setScalar(10000)
            this.scene.add(sky)
            var skyUniforms = sky.material.uniforms
            skyUniforms[ 'turbidity' ].value = 10
            skyUniforms[ 'rayleigh' ].value = 2
            skyUniforms[ 'mieCoefficient' ].value = 0.005
            skyUniforms[ 'mieDirectionalG' ].value = 0.8
            var parameters = {
                inclination: 0.49,
                azimuth: 0.205
            }
            var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
            var that = this
            function updateSun() {
                var theta = Math.PI * (parameters.inclination - 0.5)
                var phi = 2 * Math.PI * (parameters.azimuth - 0.5)
                that.sun.x = Math.cos(phi)
                that.sun.y = Math.sin(phi) * Math.sin(theta)
                that.sun.z = Math.sin(phi) * Math.cos(theta)
                sky.material.uniforms[ 'sunPosition' ].value.copy(that.sun)
                that.water.material.uniforms[ 'sunDirection' ].value.copy(that.sun).normalize()
                that.scene.environment = pmremGenerator.fromScene(sky).texture
            }
            updateSun()
            //
            var geometry = new this.$THREE.BoxBufferGeometry(30, 30, 30)
            var material = new this.$THREE.MeshStandardMaterial({ roughness: 0 })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            //
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.maxPolarAngle = Math.PI * 0.495
            this.controls.target.set(0, 10, 0)
            this.controls.minDistance = 40.0
            this.controls.maxDistance = 200.0
            this.controls.update()
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            // GUI
            this.gui = new GUI()
            var folderSky = this.gui.addFolder('Sky')
            folderSky.add(parameters, 'inclination', 0, 0.5, 0.0001).onChange(this.updateSun)
            folderSky.add(parameters, 'azimuth', 0, 1, 0.0001).onChange(this.updateSun)
            folderSky.open()
            var waterUniforms = this.water.material.uniforms
            var folderWater = this.gui.addFolder('Water')
            folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale')
            folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size')
            folderWater.add(waterUniforms.alpha, 'value', 0.9, 1, .001).name('alpha')
            folderWater.open()
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = performance.now() * 0.001
            this.mesh.position.y = Math.sin(time) * 20 + 5
            this.mesh.rotation.x = time * 0.5
            this.mesh.rotation.z = time * 0.51
            this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglShadersOcean-container {
    width: 100%;
}
</style>