<template>
    <div class="webglRaymarchingReflect-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl raymarching example<br/>
			reflect by <a href="https://github.com/gam0022" target="_blank" rel="noopener">gam0022</a> (<a href="http://qiita.com/gam0022/items/03699a07e4a4b5f2d41f" target="_blank" rel="noopener">article</a>)
		</div>
		<div id="container">
			<canvas id="canvas"></canvas>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            fragmentShader: null,
            vertexShader: null,
            dolly: null,
            camera: null,
            scene: null,
            renderer: null,
            geometry: null,
            material: null,
            mesh: null,
            stats: null,
            clock: null,
			canvas: null,
            config: null,
            gui: null,
        }
    },
    mounted() {
        this.fragmentShader = `
            precision highp float;
			uniform vec2 resolution;
			uniform mat4 viewMatrix;
			uniform vec3 cameraPosition;
			uniform mat4 cameraWorldMatrix;
			uniform mat4 cameraProjectionMatrixInverse;
			const float EPS = 0.01;
			const float OFFSET = EPS * 100.0;
			const vec3 lightDir = vec3(-0.48666426339228763, 0.8111071056538127, -0.3244428422615251);
			// distance functions
			vec3 opRep(vec3 p, float interval) {
				vec2 q = mod(p.xz, interval) - interval * 0.5;
				return vec3(q.x, p.y, q.y);
			}
			float sphereDist(vec3 p, float r) {
				return length(opRep(p, 3.0)) - r;
			}
			float floorDist(vec3 p){
				return dot(p, vec3(0.0, 1.0, 0.0)) + 1.0;
			}
			vec4 minVec4(vec4 a, vec4 b) {
				return (a.a < b.a) ? a : b;
			}
			float checkeredPattern(vec3 p) {
				float u = 1.0 - floor(mod(p.x, 2.0));
				float v = 1.0 - floor(mod(p.z, 2.0));
				if ((u == 1.0 && v < 1.0) || (u < 1.0 && v == 1.0)) {
					return 0.2;
				} else {
					return 1.0;
				}
			}
			vec3 hsv2rgb(vec3 c) {
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			float sceneDist(vec3 p) {
				return min(
					sphereDist(p, 1.0),
					floorDist(p)
				);
			}
			vec4 sceneColor(vec3 p) {
				return minVec4(
					// 3 * 6 / 2 = 9
					vec4(hsv2rgb(vec3((p.z + p.x) / 9.0, 1.0, 1.0)), sphereDist(p, 1.0)),
					vec4(vec3(0.5) * checkeredPattern(p), floorDist(p))
				);
			}
			vec3 getNormal(vec3 p) {
				return normalize(vec3(
					sceneDist(p + vec3(EPS, 0.0, 0.0)) - sceneDist(p + vec3(-EPS, 0.0, 0.0)),
					sceneDist(p + vec3(0.0, EPS, 0.0)) - sceneDist(p + vec3(0.0, -EPS, 0.0)),
					sceneDist(p + vec3(0.0, 0.0, EPS)) - sceneDist(p + vec3(0.0, 0.0, -EPS))
				));
			}
			float getShadow(vec3 ro, vec3 rd) {
				float h = 0.0;
				float c = 0.0;
				float r = 1.0;
				float shadowCoef = 0.5;
				for (float t = 0.0; t < 50.0; t++) {
					h = sceneDist(ro + rd * c);
					if (h < EPS) return shadowCoef;
					r = min(r, h * 16.0 / c);
					c += h;
				}
				return 1.0 - shadowCoef + r * shadowCoef;
			}
			vec3 getRayColor(vec3 origin, vec3 ray, out vec3 pos, out vec3 normal, out bool hit) {
				// marching loop
				float dist;
				float depth = 0.0;
				pos = origin;
				for (int i = 0; i < 64; i++){
					dist = sceneDist(pos);
					depth += dist;
					pos = origin + depth * ray;
					if (abs(dist) < EPS) break;
				}
				// hit check and calc color
				vec3 color;
				if (abs(dist) < EPS) {
					normal = getNormal(pos);
					float diffuse = clamp(dot(lightDir, normal), 0.1, 1.0);
					float specular = pow(clamp(dot(reflect(lightDir, normal), ray), 0.0, 1.0), 10.0);
					float shadow = getShadow(pos + normal * OFFSET, lightDir);
					color = (sceneColor(pos).rgb * diffuse + vec3(0.8) * specular) * max(0.5, shadow);
					hit = true;
				} else {
					color = vec3(0.0);
				}
				return color - pow(clamp(0.05 * depth, 0.0, 0.6), 2.0);
			}
			void main(void) {
				// screen position
				vec2 screenPos = (gl_FragCoord.xy * 2.0 - resolution) / resolution;
				// ray direction in normalized device coordinate
				vec4 ndcRay = vec4(screenPos.xy, 1.0, 1.0);
				// convert ray direction from normalized device coordinate to world coordinate
				vec3 ray = (cameraWorldMatrix * cameraProjectionMatrixInverse * ndcRay).xyz;
				ray = normalize(ray);
				// camera position
				vec3 cPos = cameraPosition;
				// cast ray
				vec3 color = vec3(0.0);
				vec3 pos, normal;
				bool hit;
				float alpha = 1.0;
				for (int i = 0; i < 3; i++) {
					color += alpha * getRayColor(cPos, ray, pos, normal, hit);
					alpha *= 0.3;
					ray = normalize(reflect(ray, normal));
					cPos = pos + normal * OFFSET;
					if (!hit) break;
				}
				gl_FragColor = vec4(color, 1.0);
            }`
        this.vertexShader = `
            attribute vec3 position;
			void main(void) {
				gl_Position = vec4(position, 1.0);
            }`
        this.canvas = document.querySelector('#canvas')
        this.config = {
            saveImage: () => {
                this.renderer.render(this.scene, this.camera)
                window.open(this.canvas.toDataURL())
            },
            resolution: '512'
        }
        this.init()
		this.render()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ canvas: this.canvas })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.config.resolution, this.config.resolution)
            window.addEventListener('resize', this.onWindowResize)
            // this.$THREE.Scene
            this.scene = new this.$THREE.Scene()
            this.dolly = new this.$THREE.Group()
            this.scene.add(this.dolly)
            this.clock = new this.$THREE.Clock()
            this.camera = new this.$THREE.PerspectiveCamera(60, this.canvas.width / this.canvas.height, 1, 2000)
            this.camera.position.z = 4
            this.dolly.add(this.camera)
            this.geometry = new this.$THREE.PlaneBufferGeometry(2.0, 2.0)
            this.material = new this.$THREE.RawShaderMaterial({
                uniforms: {
                    resolution: { value: new this.$THREE.Vector2(this.canvas.width, this.canvas.height) },
                    cameraWorldMatrix: { value: this.camera.matrixWorld },
                    cameraProjectionMatrixInverse: { value: new this.$THREE.Matrix4().copy(this.camera.projectionMatrixInverse) }
                },
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader
            })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.mesh.frustumCulled = false
            this.scene.add(this.mesh)
            // Controls
            var controls = new OrbitControls(this.camera, this.canvas)
            controls.enableZoom = false
            // GUI
            this.gui = new GUI()
            this.gui.add(this.config, 'saveImage').name('Save Image')
            this.gui.add(this.config, 'resolution', [ '256', '512', '800', 'full' ]).name('Resolution').onChange(this.onWindowResize)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglRaymarchingReflect-container')[0].appendChild(this.stats.dom)
        },
        onWindowResize() {
            if (this.config.resolution === 'full') {
                this.renderer.setSize(window.innerWidth - 281, window.innerHeight)
            } else {
                this.renderer.setSize(this.config.resolution, this.config.resolution)
            }
            this.camera.aspect = this.canvas.width / this.canvas.height
            this.camera.updateProjectionMatrix()
            this.material.uniforms.resolution.value.set(this.canvas.width, this.canvas.height)
            this.material.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)
        },
        render() {
            this.stats.begin()
            var elapsedTime = this.clock.getElapsedTime()
            this.dolly.position.z = - elapsedTime
            this.renderer.render(this.scene, this.camera)
            this.stats.end()
            requestAnimationFrame(this.render)
        }
    },
}
</script>

<style scoped>
.webglRaymarchingReflect-container {
    width: 100%;
}
#container {
    width: 100%;
    /* height: 100%; */
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
