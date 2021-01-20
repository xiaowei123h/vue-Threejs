<template>
    <div class="webglGpgpuProtoplanet-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - <span id="protoplanets"></span> webgl gpgpu debris
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GPUComputationRenderer } from '@/components/jsm/misc/GPUComputationRenderer.js'
export default {
    data() {
        return {
            computeShaderPosition: null,
            computeShaderVelocity: null,
            particleVertexShader: null,
            particleFragmentShader: null,
            gui: null,
            isIE: null,
			isEdge: null,
			WIDTH: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            geometry: null,
			PARTICLES: null,
			gpuCompute: null,
			velocityVariable: null,
			positionVariable: null,
			velocityUniforms: null,
			particleUniforms: null,
			effectController: null,
        }
    },
    mounted() {
        this.computeShaderPosition = `
            #define delta (1.0 / 60.0)
			void main() {
				vec2 uv = gl_FragCoord.xy / resolution.xy;
				vec4 tmpPos = texture2D(texturePosition, uv);
				vec3 pos = tmpPos.xyz;
				vec4 tmpVel = texture2D(textureVelocity, uv);
				vec3 vel = tmpVel.xyz;
				float mass = tmpVel.w;
				if (mass == 0.0) {
					vel = vec3(0.0);
				}
				// Dynamics
				pos += vel * delta;
				gl_FragColor = vec4(pos, 1.0);
            }`
        this.computeShaderVelocity = `
            // For PI declaration:
			#include <common>
			#define delta (1.0 / 60.0)
			uniform float gravityConstant;
			uniform float density;
			const float width = resolution.x;
			const float height = resolution.y;
			float radiusFromMass(float mass) {
				// Calculate radius of a sphere from mass and density
				return pow((3.0 / (4.0 * PI)) * mass / density, 1.0 / 3.0);
			}
			void main()	{
				vec2 uv = gl_FragCoord.xy / resolution.xy;
				float idParticle = uv.y * resolution.x + uv.x;
				vec4 tmpPos = texture2D(texturePosition, uv);
				vec3 pos = tmpPos.xyz;
				vec4 tmpVel = texture2D(textureVelocity, uv);
				vec3 vel = tmpVel.xyz;
				float mass = tmpVel.w;
				if (mass > 0.0) {
					float radius = radiusFromMass(mass);
					vec3 acceleration = vec3(0.0);
					// Gravity interaction
					for (float y = 0.0; y < height; y++) {
						for (float x = 0.0; x < width; x++) {
							vec2 secondParticleCoords = vec2(x + 0.5, y + 0.5) / resolution.xy;
							vec3 pos2 = texture2D(texturePosition, secondParticleCoords).xyz;
							vec4 velTemp2 = texture2D(textureVelocity, secondParticleCoords);
							vec3 vel2 = velTemp2.xyz;
							float mass2 = velTemp2.w;
							float idParticle2 = secondParticleCoords.y * resolution.x + secondParticleCoords.x;
							if (idParticle == idParticle2) {
								continue;
							}
							if (mass2 == 0.0) {
								continue;
							}
							vec3 dPos = pos2 - pos;
							float distance = length(dPos);
							float radius2 = radiusFromMass(mass2);
							if (distance == 0.0) {
								continue;
							}
							// Checks collision
							if (distance < radius + radius2) {
								if (idParticle < idParticle2) {
									// This particle is aggregated by the other
									vel = (vel * mass + vel2 * mass2) / (mass + mass2);
									mass += mass2;
									radius = radiusFromMass(mass);
								}
								else {
									// This particle dies
									mass = 0.0;
									radius = 0.0;
									vel = vec3(0.0);
									break;
								}
							}
							float distanceSq = distance * distance;
							float gravityField = gravityConstant * mass2 / distanceSq;
							gravityField = min(gravityField, 1000.0);
							acceleration += gravityField * normalize(dPos);
						}
						if (mass == 0.0) {
							break;
						}
					}
					// Dynamics
					vel += delta * acceleration;
				}
				gl_FragColor = vec4(vel, mass);
            }`
        this.particleVertexShader = `
            // For PI declaration:
			#include <common>
			uniform sampler2D texturePosition;
			uniform sampler2D textureVelocity;
			uniform float cameraConstant;
			uniform float density;
			varying vec4 vColor;
			float radiusFromMass(float mass) {
				// Calculate radius of a sphere from mass and density
				return pow((3.0 / (4.0 * PI)) * mass / density, 1.0 / 3.0);
			}
			void main() {
				vec4 posTemp = texture2D(texturePosition, uv);
				vec3 pos = posTemp.xyz;
				vec4 velTemp = texture2D(textureVelocity, uv);
				vec3 vel = velTemp.xyz;
				float mass = velTemp.w;
				vColor = vec4(1.0, mass / 250.0, 0.0, 1.0);
				vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
				// Calculate radius of a sphere from mass and density
				//float radius = pow((3.0 / (4.0 * PI)) * mass / density, 1.0 / 3.0);
				float radius = radiusFromMass(mass);
				// Apparent size in pixels
				if (mass == 0.0) {
					gl_PointSize = 0.0;
				}
				else {
					gl_PointSize = radius * cameraConstant / (- mvPosition.z);
				}
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.particleFragmentShader = `
            varying vec4 vColor;
			void main() {
				float f = length(gl_PointCoord - vec2(0.5, 0.5));
				if (f > 0.5) {
					discard;
				}
				gl_FragColor = vColor;
            }`
        this.isIE = /Trident/i.test(navigator.userAgent)
        this.isEdge = /Edge/i.test(navigator.userAgent)
        this.WIDTH = (this.isIE || this.isEdge) ? 4 : 64
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglGpgpuProtoplanet-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 5, 15000)
            this.camera.position.y = 120
            this.camera.position.z = 400
            this.scene = new this.$THREE.Scene()
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 100
            controls.maxDistance = 1000
            this.effectController = {
                // Can be changed dynamically
                gravityConstant: 100.0,
                density: 0.45,
                // Must restart simulation
                radius: 300,
                height: 8,
                exponent: 0.4,
                maxMass: 15.0,
                velocity: 70,
                velocityExponent: 0.2,
                randVelocity: 0.001
            }
            this.initComputeRenderer()
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
            this.initGUI()
            this.initProtoplanets()
            this.dynamicValuesChanger()
        },
        initComputeRenderer() {
            this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer)
            if (this.isSafari()) {
                this.gpuCompute.setDataType(this.$THREE.HalfFloatType)
            }
            var dtPosition = this.gpuCompute.createTexture()
            var dtVelocity = this.gpuCompute.createTexture()
            this.fillTextures(dtPosition, dtVelocity)
            this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", this.computeShaderVelocity, dtVelocity)
            this.positionVariable = this.gpuCompute.addVariable("texturePosition", this.computeShaderPosition, dtPosition)
            this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable])
            this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable])
            this.velocityUniforms = this.velocityVariable.material.uniforms
            this.velocityUniforms["gravityConstant"] = { value: 0.0 }
            this.velocityUniforms["density"] = { value: 0.0 }
            var error = this.gpuCompute.init()
            if (error !== null) {
                console.error(error)
            }
        },
        isSafari() {
            return !! navigator.userAgent.match(/Safari/i) && ! navigator.userAgent.match(/Chrome/i)
        },
        restartSimulation() {
            var dtPosition = this.gpuCompute.createTexture()
            var dtVelocity = this.gpuCompute.createTexture()
            this.fillTextures(dtPosition, dtVelocity)
            this.gpuCompute.renderTexture(dtPosition, this.positionVariable.renderTargets[0])
            this.gpuCompute.renderTexture(dtPosition, this.positionVariable.renderTargets[1])
            this.gpuCompute.renderTexture(dtVelocity, this.velocityVariable.renderTargets[0])
            this.gpuCompute.renderTexture(dtVelocity, this.velocityVariable.renderTargets[1])
        },
        initProtoplanets() {
            this.geometry = new this.$THREE.BufferGeometry()
            var positions = new Float32Array(this.PARTICLES * 3)
            var p = 0
            for (var i = 0; i < this.PARTICLES; i ++) {
                positions[p ++] = (Math.random() * 2 - 1) * this.effectController.radius
                positions[p ++] = 0 //(Math.random() * 2 - 1) * this.effectController.radius
                positions[p ++] = (Math.random() * 2 - 1) * this.effectController.radius
            }
            var uvs = new Float32Array(this.PARTICLES * 2)
            p = 0
            for (var j = 0; j < this.WIDTH; j ++) {
                for (var i = 0; i < this.WIDTH; i ++) {
                    uvs[p ++] = i / (this.WIDTH - 1)
                    uvs[p ++] = j / (this.WIDTH - 1)
                }
            }
            this.geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            this.geometry.setAttribute('uv', new this.$THREE.BufferAttribute(uvs, 2))
            this.particleUniforms = {
                "texturePosition": { value: null },
                "textureVelocity": { value: null },
                "cameraConstant": { value: this.getCameraConstant(this.camera) },
                "density": { value: 0.0 }
            }
            // this.$THREE.ShaderMaterial
            var material = new this.$THREE.ShaderMaterial({
                uniforms: this.particleUniforms,
                vertexShader: this.particleVertexShader,
                fragmentShader: this.particleFragmentShader
            })
            material.extensions.drawBuffers = true
            var particles = new this.$THREE.Points(this.geometry, material)
            particles.matrixAutoUpdate = false
            particles.updateMatrix()
            this.scene.add(particles)
        },
        fillTextures(texturePosition, textureVelocity) {
            var posArray = texturePosition.image.data
            var velArray = textureVelocity.image.data
            var radius = this.effectController.radius
            var height = this.effectController.height
            var exponent = this.effectController.exponent
            var maxMass = this.effectController.maxMass * 1024 / this.PARTICLES
            var maxVel = this.effectController.velocity
            var velExponent = this.effectController.velocityExponent
            var randVel = this.effectController.randVelocity
            for (var k = 0, kl = posArray.length; k < kl; k += 4) {
                // Position
                var x, z, rr
                do {
                    x = (Math.random() * 2 - 1)
                    z = (Math.random() * 2 - 1)
                    rr = x * x + z * z
                } while (rr > 1)
                rr = Math.sqrt(rr)
                var rExp = radius * Math.pow(rr, exponent)
                // Velocity
                var vel = maxVel * Math.pow(rr, velExponent)
                var vx = vel * z + (Math.random() * 2 - 1) * randVel
                var vy = (Math.random() * 2 - 1) * randVel * 0.05
                var vz = - vel * x + (Math.random() * 2 - 1) * randVel
                x *= rExp
                z *= rExp
                var y = (Math.random() * 2 - 1) * height
                var mass = Math.random() * maxMass + 1
                // Fill in texture values
                posArray[k + 0] = x
                posArray[k + 1] = y
                posArray[k + 2] = z
                posArray[k + 3] = 1
                velArray[k + 0] = vx
                velArray[k + 1] = vy
                velArray[k + 2] = vz
                velArray[k + 3] = mass
            }
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.particleUniforms["cameraConstant"].value = this.getCameraConstant(this.camera)
        },
        dynamicValuesChanger() {
            this.velocityUniforms["gravityConstant"].value = this.effectController.gravityConstant
            this.velocityUniforms["density"].value = this.effectController.density
            this.particleUniforms["density"].value = this.effectController.density
        },
        initGUI() {
            var gui = new GUI({ width: 300 })
            var folder1 = gui.addFolder('Dynamic parameters')
            folder1.add(this.effectController, "gravityConstant", 0.0, 1000.0, 0.05).onChange(this.dynamicValuesChanger)
            folder1.add(this.effectController, "density", 0.0, 10.0, 0.001).onChange(this.dynamicValuesChanger)
            var folder2 = gui.addFolder('Static parameters')
            folder2.add(this.effectController, "radius", 10.0, 1000.0, 1.0)
            folder2.add(this.effectController, "height", 0.0, 50.0, 0.01)
            folder2.add(this.effectController, "exponent", 0.0, 2.0, 0.001)
            folder2.add(this.effectController, "maxMass", 1.0, 50.0, 0.1)
            folder2.add(this.effectController, "velocity", 0.0, 150.0, 0.1)
            folder2.add(this.effectController, "velocityExponent", 0.0, 1.0, 0.01)
            folder2.add(this.effectController, "randVelocity", 0.0, 50.0, 0.1)
            var buttonRestart = {
                restartSimulation: () => {
                    this.restartSimulation()
                }
            }
            folder2.add(buttonRestart, 'restartSimulation')
            folder1.open()
            folder2.open()
        },
        getCameraConstant(camera) {
            return window.innerHeight / (Math.tan(this.$THREE.MathUtils.DEG2RAD * 0.5 * camera.fov) / camera.zoom)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.gpuCompute.compute()
            this.particleUniforms["texturePosition"].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture
            this.particleUniforms["textureVelocity"].value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGpgpuProtoplanet-container {
    width: 100%;
}
#warning {
    color: #ff0000;
}
</style>
