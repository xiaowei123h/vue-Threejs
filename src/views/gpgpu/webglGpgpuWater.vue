<template>
    <div class="webglGpgpuWater-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - <span id="waterSize"></span> webgl gpgpu water<br/>
			Move mouse to disturb water.<br>
			Press mouse button to orbit around. 'W' key toggles wireframe.
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { GPUComputationRenderer } from '@/components/jsm/misc/GPUComputationRenderer.js'
import { SimplexNoise } from '@/components/jsm/math/SimplexNoise.js'
export default {
    data() {
        return {
            heightmapFragmentShader: null,
            smoothFragmentShader: null,
            readWaterLevelFragmentShader: null,
            waterVertexShader: null,
            gui: null,
            WIDTH: 128,
			// Water size in system units
			BOUNDS: 512,
			BOUNDS_HALF: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			mouseMoved: false,
			mouseCoords: null,
			raycaster: null,
			waterMesh: null,
			meshRay: null,
			gpuCompute: null,
			heightmapVariable: null,
			waterUniforms: null,
			smoothShader: null,
			readWaterLevelShader: null,
			readWaterLevelRenderTarget: null,
			readWaterLevelImage: null,
			waterNormal: null,
			NUM_SPHERES: 5,
			spheres: [],
			spheresEnabled: true,
			simplex: null,
        }
    },
    mounted() {
        this.heightmapFragmentShader = `
            #include <common>
			uniform vec2 mousePos;
			uniform float mouseSize;
			uniform float viscosityConstant;
			uniform float heightCompensation;
			void main()	{
				vec2 cellSize = 1.0 / resolution.xy;
				vec2 uv = gl_FragCoord.xy * cellSize;
				// heightmapValue.x == height from previous frame
				// heightmapValue.y == height from penultimate frame
				// heightmapValue.z, heightmapValue.w not used
				vec4 heightmapValue = texture2D(heightmap, uv);
				// Get neighbours
				vec4 north = texture2D(heightmap, uv + vec2(0.0, cellSize.y));
				vec4 south = texture2D(heightmap, uv + vec2(0.0, - cellSize.y));
				vec4 east = texture2D(heightmap, uv + vec2(cellSize.x, 0.0));
				vec4 west = texture2D(heightmap, uv + vec2(- cellSize.x, 0.0));
				// https://web.archive.org/web/20080618181901/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm
				float newHeight = ((north.x + south.x + east.x + west.x) * 0.5 - heightmapValue.y) * viscosityConstant;
				// Mouse influence
				float mousePhase = clamp(length((uv - vec2(0.5)) * BOUNDS - vec2(mousePos.x, - mousePos.y)) * PI / mouseSize, 0.0, PI);
				newHeight += (cos(mousePhase) + 1.0) * 0.28;
				heightmapValue.y = heightmapValue.x;
				heightmapValue.x = newHeight;
				gl_FragColor = heightmapValue;
            }`
        this.smoothFragmentShader = `
            uniform sampler2D smoothTexture;
			void main()	{
				vec2 cellSize = 1.0 / resolution.xy;
				vec2 uv = gl_FragCoord.xy * cellSize;
				// Computes the mean of texel and 4 neighbours
				vec4 textureValue = texture2D(smoothTexture, uv);
				textureValue += texture2D(smoothTexture, uv + vec2(0.0, cellSize.y));
				textureValue += texture2D(smoothTexture, uv + vec2(0.0, - cellSize.y));
				textureValue += texture2D(smoothTexture, uv + vec2(cellSize.x, 0.0));
				textureValue += texture2D(smoothTexture, uv + vec2(- cellSize.x, 0.0));
				textureValue /= 5.0;
				gl_FragColor = textureValue;
            }`
        this.readWaterLevelFragmentShader = `
            uniform vec2 point1;
			uniform sampler2D levelTexture;
			// Integer to float conversion from https://stackoverflow.com/questions/17981163/webgl-read-pixels-from-floating-point-render-target
			float shift_right(float v, float amt) {
				v = floor(v) + 0.5;
				return floor(v / exp2(amt));
			}
			float shift_left(float v, float amt) {
				return floor(v * exp2(amt) + 0.5);
			}
			float mask_last(float v, float bits) {
				return mod(v, shift_left(1.0, bits));
			}
			float extract_bits(float num, float from, float to) {
				from = floor(from + 0.5); to = floor(to + 0.5);
				return mask_last(shift_right(num, from), to - from);
			}
			vec4 encode_float(float val) {
				if (val == 0.0) return vec4(0, 0, 0, 0);
				float sign = val > 0.0 ? 0.0 : 1.0;
				val = abs(val);
				float exponent = floor(log2(val));
				float biased_exponent = exponent + 127.0;
				float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;
				float t = biased_exponent / 2.0;
				float last_bit_of_biased_exponent = fract(t) * 2.0;
				float remaining_bits_of_biased_exponent = floor(t);
				float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;
				float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;
				float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;
				float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;
				return vec4(byte4, byte3, byte2, byte1);
			}
			void main()	{
				vec2 cellSize = 1.0 / resolution.xy;
				float waterLevel = texture2D(levelTexture, point1).x;
				vec2 normal = vec2(
					(texture2D(levelTexture, point1 + vec2(- cellSize.x, 0)).x - texture2D(levelTexture, point1 + vec2(cellSize.x, 0)).x) * WIDTH / BOUNDS,
					(texture2D(levelTexture, point1 + vec2(0, - cellSize.y)).x - texture2D(levelTexture, point1 + vec2(0, cellSize.y)).x) * WIDTH / BOUNDS);
				if (gl_FragCoord.x < 1.5) {
					gl_FragColor = encode_float(waterLevel);
				} else if (gl_FragCoord.x < 2.5) {
					gl_FragColor = encode_float(normal.x);
				} else if (gl_FragCoord.x < 3.5) {
					gl_FragColor = encode_float(normal.y);
				} else {
					gl_FragColor = encode_float(0.0);
				}
            }`
        this.waterVertexShader = `
            uniform sampler2D heightmap;
			#define PHONG
			varying vec3 vViewPosition;
			#ifndef FLAT_SHADED
				varying vec3 vNormal;
			#endif
			#include <common>
			#include <uv_pars_vertex>
			#include <uv2_pars_vertex>
			#include <displacementmap_pars_vertex>
			#include <envmap_pars_vertex>
			#include <color_pars_vertex>
			#include <morphtarget_pars_vertex>
			#include <skinning_pars_vertex>
			#include <shadowmap_pars_vertex>
			#include <logdepthbuf_pars_vertex>
			#include <clipping_planes_pars_vertex>
			void main() {
				vec2 cellSize = vec2(1.0 / WIDTH, 1.0 / WIDTH);
				#include <uv_vertex>
				#include <uv2_vertex>
				#include <color_vertex>
				// # include <beginnormal_vertex>
				// Compute normal from heightmap
				vec3 objectNormal = vec3(
					(texture2D(heightmap, uv + vec2(- cellSize.x, 0)).x - texture2D(heightmap, uv + vec2(cellSize.x, 0)).x) * WIDTH / BOUNDS,
					(texture2D(heightmap, uv + vec2(0, - cellSize.y)).x - texture2D(heightmap, uv + vec2(0, cellSize.y)).x) * WIDTH / BOUNDS,
					1.0);
				//<beginnormal_vertex>
				#include <morphnormal_vertex>
				#include <skinbase_vertex>
				#include <skinnormal_vertex>
				#include <defaultnormal_vertex>
			#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
				vNormal = normalize(transformedNormal);
			#endif
				//# include <begin_vertex>
				float heightValue = texture2D(heightmap, uv).x;
				vec3 transformed = vec3(position.x, position.y, heightValue);
				//<begin_vertex>
				#include <morphtarget_vertex>
				#include <skinning_vertex>
				#include <displacementmap_vertex>
				#include <project_vertex>
				#include <logdepthbuf_vertex>
				#include <clipping_planes_vertex>
				vViewPosition = - mvPosition.xyz;
				#include <worldpos_vertex>
				#include <envmap_vertex>
				#include <shadowmap_vertex>
            }`
        this.BOUNDS_HALF = this.BOUNDS * 0.5
        this.mouseCoords = new this.$THREE.Vector2()
        this.raycaster = new this.$THREE.Raycaster()
        this.waterNormal = new this.$THREE.Vector3()
        this.simplex = new SimplexNoise()
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglGpgpuWater-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 3000)
            this.camera.position.set(0, 200, 350)
            this.camera.lookAt(0, 0, 0)
            this.scene = new this.$THREE.Scene()
            var sun = new this.$THREE.DirectionalLight(0xFFFFFF, 1.0)
            sun.position.set(300, 400, 175)
            this.scene.add(sun)
            var sun2 = new this.$THREE.DirectionalLight(0x40A040, 0.6)
            sun2.position.set(- 100, 350, - 200)
            this.scene.add(sun2)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            this.container.style.touchAction = 'none'
            this.container.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('keydown', (event) => {
                // W Pressed: Toggle wireframe
                if (event.keyCode === 87) {
                    this.waterMesh.material.wireframe = ! this.waterMesh.material.wireframe
                    this.waterMesh.material.needsUpdate = true
                }
            }, false)
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI()
            var effectController = {
                mouseSize: 20.0,
                viscosity: 0.98,
                spheresEnabled: this.spheresEnabled
            }
            var valuesChanger = () => {
                this.heightmapVariable.material.uniforms["mouseSize"].value = effectController.mouseSize
                this.heightmapVariable.material.uniforms["viscosityConstant"].value = effectController.viscosity
                this.spheresEnabled = effectController.spheresEnabled
                for (var i = 0; i < this.NUM_SPHERES; i ++) {
                    if (this.spheres[i]) {
                        this.spheres[i].visible = this.spheresEnabled
                    }
                }
            }
            this.gui.add(effectController, "mouseSize", 1.0, 100.0, 1.0).onChange(valuesChanger)
            this.gui.add(effectController, "viscosity", 0.9, 0.999, 0.001).onChange(valuesChanger)
            this.gui.add(effectController, "spheresEnabled", 0, 1, 1).onChange(valuesChanger)
            var buttonSmooth = {
                smoothWater: () => {
                    this.smoothWater()
                }
            }
            this.gui.add(buttonSmooth, 'smoothWater')
            this.initWater()
            this.createSpheres()
            valuesChanger()
        },
        initWater() {
            var materialColor = 0x0040C0
            var geometry = new this.$THREE.PlaneBufferGeometry(this.BOUNDS, this.BOUNDS, this.WIDTH - 1, this.WIDTH - 1)
            // material: make a this.$THREE.ShaderMaterial clone of this.$THREE.MeshPhongMaterial, with customized vertex shader
            var material = new this.$THREE.ShaderMaterial({
                uniforms: this.$THREE.UniformsUtils.merge([
                    this.$THREE.ShaderLib['phong'].uniforms,
                    {
                        "heightmap": { value: null }
                    }
            ]),
                vertexShader: this.waterVertexShader,
                fragmentShader: this.$THREE.ShaderChunk['meshphong_frag']
            })
            material.lights = true
            // Material attributes from this.$THREE.MeshPhongMaterial
            material.color = new this.$THREE.Color(materialColor)
            material.specular = new this.$THREE.Color(0x111111)
            material.shininess = 50
            // Sets the uniforms with the material values
            material.uniforms["diffuse"].value = material.color
            material.uniforms["specular"].value = material.specular
            material.uniforms["shininess"].value = Math.max(material.shininess, 1e-4)
            material.uniforms["opacity"].value = material.opacity
            // Defines
            material.defines.WIDTH = this.WIDTH.toFixed(1)
            material.defines.BOUNDS = this.BOUNDS.toFixed(1)
            this.waterUniforms = material.uniforms
            this.waterMesh = new this.$THREE.Mesh(geometry, material)
            this.waterMesh.rotation.x = - Math.PI / 2
            this.waterMesh.matrixAutoUpdate = false
            this.waterMesh.updateMatrix()
            this.scene.add(this.waterMesh)
            // this.$THREE.Mesh just for mouse raycasting
            var geometryRay = new this.$THREE.PlaneBufferGeometry(this.BOUNDS, this.BOUNDS, 1, 1)
            this.meshRay = new this.$THREE.Mesh(geometryRay, new this.$THREE.MeshBasicMaterial({ color: 0xFFFFFF, visible: false }))
            this.meshRay.rotation.x = - Math.PI / 2
            this.meshRay.matrixAutoUpdate = false
            this.meshRay.updateMatrix()
            this.scene.add(this.meshRay)
            // Creates the gpu computation class and sets it up
            this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer)
            if (this.isSafari()) {
                this.gpuCompute.setDataType(this.$THREE.HalfFloatType)
            }
            var heightmap0 = this.gpuCompute.createTexture()
            this.fillTexture(heightmap0)
            this.heightmapVariable = this.gpuCompute.addVariable("heightmap", this.heightmapFragmentShader, heightmap0)
            this.gpuCompute.setVariableDependencies(this.heightmapVariable, [this.heightmapVariable])
            this.heightmapVariable.material.uniforms["mousePos"] = { value: new this.$THREE.Vector2(10000, 10000) }
            this.heightmapVariable.material.uniforms["mouseSize"] = { value: 20.0 }
            this.heightmapVariable.material.uniforms["viscosityConstant"] = { value: 0.98 }
            this.heightmapVariable.material.uniforms["heightCompensation"] = { value: 0 }
            this.heightmapVariable.material.defines.BOUNDS = this.BOUNDS.toFixed(1)
            var error = this.gpuCompute.init()
            if (error !== null) {
                console.error(error)
            }
            // Create compute shader to smooth the water surface and velocity
            this.smoothShader = this.gpuCompute.createShaderMaterial(this.smoothFragmentShader, { smoothTexture: { value: null } })
            // Create compute shader to read water level
            this.readWaterLevelShader = this.gpuCompute.createShaderMaterial(this.readWaterLevelFragmentShader, {
                point1: { value: new this.$THREE.Vector2() },
                levelTexture: { value: null }
            })
            this.readWaterLevelShader.defines.WIDTH = this.WIDTH.toFixed(1)
            this.readWaterLevelShader.defines.BOUNDS = this.BOUNDS.toFixed(1)
            // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
            this.readWaterLevelImage = new Uint8Array(4 * 1 * 4)
            this.readWaterLevelRenderTarget = new this.$THREE.WebGLRenderTarget(4, 1, {
                wrapS: this.$THREE.ClampToEdgeWrapping,
                wrapT: this.$THREE.ClampToEdgeWrapping,
                minFilter: this.$THREE.NearestFilter,
                magFilter: this.$THREE.NearestFilter,
                format: this.$THREE.RGBAFormat,
                type: this.$THREE.UnsignedByteType,
                depthBuffer: false
            })
        },
        isSafari() {
            return !! navigator.userAgent.match(/Safari/i) && ! navigator.userAgent.match(/Chrome/i)
        },
        fillTexture(texture) {
            var waterMaxHeight = 10
            var that = this
            function noise(x, y) {
                var multR = waterMaxHeight
                var mult = 0.025
                var r = 0
                for (var i = 0; i < 15; i ++) {
                    r += multR * that.simplex.noise(x * mult, y * mult)
                    multR *= 0.53 + 0.025 * i
                    mult *= 1.25
                }
                return r
            }
            var pixels = texture.image.data
            var p = 0
            for (var j = 0; j < this.WIDTH; j ++) {
                for (var i = 0; i < this.WIDTH; i ++) {
                    var x = i * 128 / this.WIDTH
                    var y = j * 128 / this.WIDTH
                    pixels[p + 0] = noise(x, y)
                    pixels[p + 1] = pixels[p + 0]
                    pixels[p + 2] = 0
                    pixels[p + 3] = 1
                    p += 4
                }
            }
        },
        smoothWater() {
            var currentRenderTarget = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable)
            var alternateRenderTarget = this.gpuCompute.getAlternateRenderTarget(this.heightmapVariable)
            for (var i = 0; i < 10; i ++) {
                this.smoothShader.uniforms["smoothTexture"].value = currentRenderTarget.texture
                this.gpuCompute.doRenderTarget(this.smoothShader, alternateRenderTarget)
                this.smoothShader.uniforms["smoothTexture"].value = alternateRenderTarget.texture
                this.gpuCompute.doRenderTarget(this.smoothShader, currentRenderTarget)
            }
        },
        createSpheres() {
            var sphereTemplate = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(4, 24, 12), new this.$THREE.MeshPhongMaterial({ color: 0xFFFF00 }))
            for (var i = 0; i < this.NUM_SPHERES; i ++) {
                var sphere = sphereTemplate
                if (i < this.NUM_SPHERES - 1) {
                    sphere = sphereTemplate.clone()
                }
                sphere.position.x = (Math.random() - 0.5) * this.BOUNDS * 0.7
                sphere.position.z = (Math.random() - 0.5) * this.BOUNDS * 0.7
                sphere.userData.velocity = new this.$THREE.Vector3()
                this.scene.add(sphere)
                this.spheres[i] = sphere
            }

        },
        sphereDynamics() {
            var currentRenderTarget = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable)
            this.readWaterLevelShader.uniforms["levelTexture"].value = currentRenderTarget.texture
            for (var i = 0; i < this.NUM_SPHERES; i ++) {
                var sphere = this.spheres[i]
                if (sphere) {
                    // Read water level and orientation
                    var u = 0.5 * sphere.position.x / this.BOUNDS_HALF + 0.5
                    var v = 1 - (0.5 * sphere.position.z / this.BOUNDS_HALF + 0.5)
                    this.readWaterLevelShader.uniforms["point1"].value.set(u, v)
                    this.gpuCompute.doRenderTarget(this.readWaterLevelShader, this.readWaterLevelRenderTarget)
                    this.renderer.readRenderTargetPixels(this.readWaterLevelRenderTarget, 0, 0, 4, 1, this.readWaterLevelImage)
                    var pixels = new Float32Array(this.readWaterLevelImage.buffer)
                    // Get orientation
                    this.waterNormal.set(pixels[1], 0, - pixels[2])
                    var pos = sphere.position
                    // Set height
                    pos.y = pixels[0]
                    // Move sphere
                    this.waterNormal.multiplyScalar(0.1)
                    sphere.userData.velocity.add(this.waterNormal)
                    sphere.userData.velocity.multiplyScalar(0.998)
                    pos.add(sphere.userData.velocity)
                    if (pos.x < - this.BOUNDS_HALF) {
                        pos.x = - this.BOUNDS_HALF + 0.001
                        sphere.userData.velocity.x *= - 0.3
                    } else if (pos.x > this.BOUNDS_HALF) {
                        pos.x = this.BOUNDS_HALF - 0.001
                        sphere.userData.velocity.x *= - 0.3
                    }
                    if (pos.z < - this.BOUNDS_HALF) {
                        pos.z = - this.BOUNDS_HALF + 0.001
                        sphere.userData.velocity.z *= - 0.3
                    } else if (pos.z > this.BOUNDS_HALF) {
                        pos.z = this.BOUNDS_HALF - 0.001
                        sphere.userData.velocity.z *= - 0.3
                    }
                }
            }
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        setMouseCoords(x, y) {
            this.mouseCoords.set((x / this.renderer.domElement.clientWidth) * 2 - 1, - (y / this.renderer.domElement.clientHeight) * 2 + 1)
            this.mouseMoved = true
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.setMouseCoords(event.clientX, event.clientY)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            // Set uniforms: mouse interaction
            var uniforms = this.heightmapVariable.material.uniforms
            if (this.mouseMoved) {
                this.raycaster.setFromCamera(this.mouseCoords, this.camera)
                var intersects = this.raycaster.intersectObject(this.meshRay)
                if (intersects.length > 0) {
                    var point = intersects[ 0 ].point
                    uniforms[ "mousePos" ].value.set(point.x, point.z)
                } else {
                    uniforms[ "mousePos" ].value.set(10000, 10000)
                }
                this.mouseMoved = false
            } else {
                uniforms[ "mousePos" ].value.set(10000, 10000)
            }
            // Do the gpu computation
            this.gpuCompute.compute()
            if (this.spheresEnabled) {
                this.sphereDynamics()
            }
            // Get compute output in custom uniform
            this.waterUniforms["heightmap"].value = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable).texture
            // Render
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGpgpuWater-container {
    width: 100%;
}
</style>
