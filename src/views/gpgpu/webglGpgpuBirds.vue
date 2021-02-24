<template>
    <div class="webglGpgpuBirds-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl gpgpu birds<br/>
			Move mouse to disturb birds.
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { GPUComputationRenderer } from '@/components/jsm/misc/GPUComputationRenderer.js'
import { BirdGeometry } from '@/utils/webglGpgpuBirds.js'
export default {
    data() {
        return {
            fragmentShaderPosition: null,
            fragmentShaderVelocity: null,
            birdVS: null,
            birdFS: null,
            WIDTH: 32,
            BIRDS: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
            BOUNDS: 800,
            BOUNDS_HALF: null,
			last: null,
			gpuCompute: null,
			velocityVariable: null,
			positionVariable: null,
			positionUniforms: null,
			velocityUniforms: null,
            birdUniforms: null,
            gui: null
        }
    },
    mounted() {
        this.fragmentShaderPosition = `
            uniform float time;
			uniform float delta;
			void main()	{
				vec2 uv = gl_FragCoord.xy / resolution.xy;
				vec4 tmpPos = texture2D(texturePosition, uv);
				vec3 position = tmpPos.xyz;
				vec3 velocity = texture2D(textureVelocity, uv).xyz;
				float phase = tmpPos.w;
				phase = mod((phase + delta +
					length(velocity.xz) * delta * 3. +
					max(velocity.y, 0.0) * delta * 6.), 62.83);
				gl_FragColor = vec4(position + velocity * delta * 15. , phase);
            }`
        this.fragmentShaderVelocity = `
            uniform float time;
			uniform float testing;
			uniform float delta; // about 0.016
			uniform float separationDistance; // 20
			uniform float alignmentDistance; // 40
			uniform float cohesionDistance; //
			uniform float freedomFactor;
			uniform vec3 predator;
			const float width = resolution.x;
			const float height = resolution.y;
			const float PI = 3.141592653589793;
			const float PI_2 = PI * 2.0;
			// const float VISION = PI * 0.55;
			float zoneRadius = 40.0;
			float zoneRadiusSquared = 1600.0;
			float separationThresh = 0.45;
			float alignmentThresh = 0.65;
			const float UPPER_BOUNDS = BOUNDS;
			const float LOWER_BOUNDS = -UPPER_BOUNDS;
			const float SPEED_LIMIT = 9.0;
			float rand(vec2 co){
				return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
			}
			void main() {
				zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
				separationThresh = separationDistance / zoneRadius;
				alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
				zoneRadiusSquared = zoneRadius * zoneRadius;
				vec2 uv = gl_FragCoord.xy / resolution.xy;
				vec3 birdPosition, birdVelocity;
				vec3 selfPosition = texture2D(texturePosition, uv).xyz;
				vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;
				float dist;
				vec3 dir; // direction
				float distSquared;
				float separationSquared = separationDistance * separationDistance;
				float cohesionSquared = cohesionDistance * cohesionDistance;
				float f;
				float percent;
				vec3 velocity = selfVelocity;
				float limit = SPEED_LIMIT;
				dir = predator * UPPER_BOUNDS - selfPosition;
				dir.z = 0.;
				// dir.z *= 0.6;
				dist = length(dir);
				distSquared = dist * dist;
				float preyRadius = 150.0;
				float preyRadiusSq = preyRadius * preyRadius;
				// move birds away from predator
				if (dist < preyRadius) {
					f = (distSquared / preyRadiusSq - 1.0) * delta * 100.;
					velocity += normalize(dir) * f;
					limit += 5.0;
				}
				// if (testing == 0.0) {}
				// if (rand(uv + time) < freedomFactor) {}
				// Attract flocks to the center
				vec3 central = vec3(0., 0., 0.);
				dir = selfPosition - central;
				dist = length(dir);
				dir.y *= 2.5;
				velocity -= normalize(dir) * delta * 5.;
				for (float y = 0.0; y < height; y++) {
					for (float x = 0.0; x < width; x++) {
						vec2 ref = vec2(x + 0.5, y + 0.5) / resolution.xy;
						birdPosition = texture2D(texturePosition, ref).xyz;
						dir = birdPosition - selfPosition;
						dist = length(dir);
						if (dist < 0.0001) continue;
						distSquared = dist * dist;
						if (distSquared > zoneRadiusSquared) continue;
						percent = distSquared / zoneRadiusSquared;
						if (percent < separationThresh) { // low
							// Separation - Move apart for comfort
							f = (separationThresh / percent - 1.0) * delta;
							velocity -= normalize(dir) * f;
						} else if (percent < alignmentThresh) { // high
							// Alignment - fly the same direction
							float threshDelta = alignmentThresh - separationThresh;
							float adjustedPercent = (percent - separationThresh) / threshDelta;
							birdVelocity = texture2D(textureVelocity, ref).xyz;
							f = (0.5 - cos(adjustedPercent * PI_2) * 0.5 + 0.5) * delta;
							velocity += normalize(birdVelocity) * f;
						} else {
							// Attraction / Cohesion - move closer
							float threshDelta = 1.0 - alignmentThresh;
							float adjustedPercent;
							if(threshDelta == 0.) adjustedPercent = 1.;
							else adjustedPercent = (percent - alignmentThresh) / threshDelta;
							f = (0.5 - (cos(adjustedPercent * PI_2) * -0.5 + 0.5)) * delta;
							velocity += normalize(dir) * f;
						}
					}
				}
				// this make tends to fly around than down or up
				// if (velocity.y > 0.) velocity.y *= (1. - 0.2 * delta);
				// Speed Limits
				if (length(velocity) > limit) {
					velocity = normalize(velocity) * limit;
				}
				gl_FragColor = vec4(velocity, 1.0);
            }`
        this.birdVS = `
            attribute vec2 reference;
			attribute float birdVertex;
			attribute vec3 birdColor;
			uniform sampler2D texturePosition;
			uniform sampler2D textureVelocity;
			varying vec4 vColor;
			varying float z;
			uniform float time;
			void main() {
				vec4 tmpPos = texture2D(texturePosition, reference);
				vec3 pos = tmpPos.xyz;
				vec3 velocity = normalize(texture2D(textureVelocity, reference).xyz);
				vec3 newPosition = position;
				if (birdVertex == 4.0 || birdVertex == 7.0) {
					// flap wings
					newPosition.y = sin(tmpPos.w) * 5.;
				}
				newPosition = mat3(modelMatrix) * newPosition;
				velocity.z *= -1.;
				float xz = length(velocity.xz);
				float xyz = 1.;
				float x = sqrt(1. - velocity.y * velocity.y);
				float cosry = velocity.x / xz;
				float sinry = velocity.z / xz;
				float cosrz = x / xyz;
				float sinrz = velocity.y / xyz;
				mat3 maty =  mat3(
					cosry, 0, -sinry,
					0    , 1, 0     ,
					sinry, 0, cosry

				);
				mat3 matz =  mat3(
					cosrz , sinrz, 0,
					-sinrz, cosrz, 0,
					0     , 0    , 1
				);
				newPosition =  maty * matz * newPosition;
				newPosition += pos;
				z = newPosition.z;
				vColor = vec4(birdColor, 1.0);
				gl_Position = projectionMatrix *  viewMatrix  * vec4(newPosition, 1.0);
            }`
        this.birdFS = `
            varying vec4 vColor;
			varying float z;
			uniform vec3 color;
			void main() {
				// Fake colors for now
				float z2 = 0.2 + (1000. - z) / 1000. * vColor.x;
				gl_FragColor = vec4(z2, z2, z2, 1.);

            }`
        this.BIRDS = this.WIDTH * this.WIDTH
        this.windowHalfX = window.innerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.last = performance.now()
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglGpgpuBirds-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000)
            this.camera.position.z = 350
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.scene.fog = new this.$THREE.Fog(0xffffff, 100, 1000)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.initComputeRenderer()
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            this.container.style.touchAction = 'none'
            this.container.addEventListener('pointermove', this.onPointerMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            this.gui = new GUI()
            var effectController = {
                separation: 20.0,
                alignment: 20.0,
                cohesion: 20.0,
                freedom: 0.75
            }
            var valuesChanger = () => {
                this.velocityUniforms["separationDistance"].value = effectController.separation
                this.velocityUniforms["alignmentDistance"].value = effectController.alignment
                this.velocityUniforms["cohesionDistance"].value = effectController.cohesion
                this.velocityUniforms["freedomFactor"].value = effectController.freedom
            }
            valuesChanger()
            this.gui.add(effectController, "separation", 0.0, 100.0, 1.0).onChange(valuesChanger)
            this.gui.add(effectController, "alignment", 0.0, 100, 0.001).onChange(valuesChanger)
            this.gui.add(effectController, "cohesion", 0.0, 100, 0.025).onChange(valuesChanger)
            this.gui.close()
            this.initBirds()
        },
        initComputeRenderer() {
            this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer)
            if (this.isSafari()) {
                this.gpuCompute.setDataType(this.$THREE.HalfFloatType)
            }
            var dtPosition = this.gpuCompute.createTexture()
            var dtVelocity = this.gpuCompute.createTexture()
            this.fillPositionTexture(dtPosition)
            this.fillVelocityTexture(dtVelocity)
            this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", this.fragmentShaderVelocity, dtVelocity)
            this.positionVariable = this.gpuCompute.addVariable("texturePosition", this.fragmentShaderPosition, dtPosition)
            this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable])
            this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable])
            this.positionUniforms = this.positionVariable.material.uniforms
            this.velocityUniforms = this.velocityVariable.material.uniforms
            this.positionUniforms["time"] = { value: 0.0 }
            this.positionUniforms["delta"] = { value: 0.0 }
            this.velocityUniforms["time"] = { value: 1.0 }
            this.velocityUniforms["delta"] = { value: 0.0 }
            this.velocityUniforms["testing"] = { value: 1.0 }
            this.velocityUniforms["separationDistance"] = { value: 1.0 }
            this.velocityUniforms["alignmentDistance"] = { value: 1.0 }
            this.velocityUniforms["cohesionDistance"] = { value: 1.0 }
            this.velocityUniforms["freedomFactor"] = { value: 1.0 }
            this.velocityUniforms["predator"] = { value: new this.$THREE.Vector3() }
            this.velocityVariable.material.defines.BOUNDS = this.BOUNDS.toFixed(2)
            this.velocityVariable.wrapS = this.$THREE.RepeatWrapping
            this.velocityVariable.wrapT = this.$THREE.RepeatWrapping
            this.positionVariable.wrapS = this.$THREE.RepeatWrapping
            this.positionVariable.wrapT = this.$THREE.RepeatWrapping
            var error = this.gpuCompute.init()
            if (error !== null) {
                console.error(error)
            }
        },
        isSafari() {
            return !! navigator.userAgent.match(/Safari/i) && ! navigator.userAgent.match(/Chrome/i)
        },
        initBirds() {
            var geometry = null
            // var geometry = new BirdGeometry(this.$THREE, this.BIRDS, this)
            // For Vertex and Fragment
            this.birdUniforms = {
                "color": { value: new this.$THREE.Color(0xff2200) },
                "texturePosition": { value: null },
                "textureVelocity": { value: null },
                "time": { value: 1.0 },
                "delta": { value: 0.0 }
            }
            // this.$THREE.ShaderMaterial
            var material = new this.$THREE.ShaderMaterial({
                uniforms: this.birdUniforms,
                vertexShader: this.birdVS,
                fragmentShader: this.birdFS,
                side: this.$THREE.DoubleSide

            })
            var birdMesh = new this.$THREE.Mesh(geometry, material)
            this.birdMesh.rotation.y = Math.PI / 2
            this.birdMesh.matrixAutoUpdate = false
            this.birdMesh.updateMatrix()
            this.scene.add(this.birdMesh)
        },
        fillPositionTexture(texture) {
            var theArray = texture.image.data
            for (var k = 0, kl = theArray.length; k < kl; k += 4) {
                var x = Math.random() * this.BOUNDS - this.BOUNDS_HALF
                var y = Math.random() * this.BOUNDS - this.BOUNDS_HALF
                var z = Math.random() * this.BOUNDS - this.BOUNDS_HALF
                theArray[k + 0] = x
                theArray[k + 1] = y
                theArray[k + 2] = z
                theArray[k + 3] = 1
            }
        },
        fillVelocityTexture(texture) {
            var theArray = texture.image.data
            for (var k = 0, kl = theArray.length; k < kl; k += 4) {
                var x = Math.random() - 0.5
                var y = Math.random() - 0.5
                var z = Math.random() - 0.5
                theArray[k + 0] = x * 10
                theArray[k + 1] = y * 10
                theArray[k + 2] = z * 10
                theArray[k + 3] = 1
            }
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.mouseX = event.clientX - this.windowHalfX
            this.mouseY = event.clientY - this.windowHalfY
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var now = performance.now()
            var delta = (now - this.last) / 1000
            if (delta > 1) delta = 1 // safety cap on large deltas
            this.last = now
            this.positionUniforms["time"].value = now
            this.positionUniforms["delta"].value = delta
            this.velocityUniforms["time"].value = now
            this.velocityUniforms["delta"].value = delta
            this.birdUniforms["time"].value = now
            this.birdUniforms["delta"].value = delta
            this.velocityUniforms["predator"].value.set(0.5 * this.mouseX / this.windowHalfX, - 0.5 * this.mouseY / this.windowHalfY, 0)
            this.mouseX = 10000
            this.mouseY = 10000
            this.gpuCompute.compute()
            this.birdUniforms["texturePosition"].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture
            this.birdUniforms["textureVelocity"].value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGpgpuBirds-container {
    width: 100%;
    background-color: #fff;
}
#info {
    color: #444;
}
#info a {
    color:#08f;
}
</style>
