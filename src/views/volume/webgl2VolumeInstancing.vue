<template>
    <div class="webgl2VolumeInstancing-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl2 - volume - instancing
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { VOXLoader } from '@/components/jsm/loaders/VOXLoader.js'
import { WEBGL } from '@/components/jsm/WebGL.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
			controls: null,
        }
    },
    mounted() {
        if (WEBGL.isWebGL2Available() === false) {
            document.getElementsByClassName('webgl2VolumeInstancing-container')[0].appendChild(WEBGL.getWebGL2ErrorMessage())
        }
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webgl2VolumeInstancing-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 1000)
            this.camera.position.set(0, 0, 4)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.autoRotate = true
            this.controls.autoRotateSpeed = - 1.0
            this.controls.enableDamping = true
            // Material
            var vertexShader = /* glsl */`
                in vec3 position;
                in mat4 instanceMatrix;
                uniform mat4 modelMatrix;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform vec3 cameraPos;
                out vec3 vOrigin;
                out vec3 vDirection;
                void main() {
                    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
                    vOrigin = vec3(inverse(instanceMatrix * modelMatrix) * vec4(cameraPos, 1.0)).xyz;
                    vDirection = position - vOrigin;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `
            var fragmentShader = /* glsl */`
                precision highp float;
                precision highp sampler3D;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                in vec3 vOrigin;
                in vec3 vDirection;
                out vec4 color;
                uniform sampler3D map;
                uniform float threshold;
                uniform float steps;
                vec2 hitBox(vec3 orig, vec3 dir) {
                    const vec3 box_min = vec3(- 0.5);
                    const vec3 box_max = vec3(0.5);
                    vec3 inv_dir = 1.0 / dir;
                    vec3 tmin_tmp = (box_min - orig) * inv_dir;
                    vec3 tmax_tmp = (box_max - orig) * inv_dir;
                    vec3 tmin = min(tmin_tmp, tmax_tmp);
                    vec3 tmax = max(tmin_tmp, tmax_tmp);
                    float t0 = max(tmin.x, max(tmin.y, tmin.z));
                    float t1 = min(tmax.x, min(tmax.y, tmax.z));
                    return vec2(t0, t1);
                }
                float sample1(vec3 p) {
                    return texture(map, p).r;
                }
                #define epsilon .0001
                vec3 normal(vec3 coord) {
                    if (coord.x < epsilon) return vec3(1.0, 0.0, 0.0);
                    if (coord.y < epsilon) return vec3(0.0, 1.0, 0.0);
                    if (coord.z < epsilon) return vec3(0.0, 0.0, 1.0);
                    if (coord.x > 1.0 - epsilon) return vec3(- 1.0, 0.0, 0.0);
                    if (coord.y > 1.0 - epsilon) return vec3(0.0, - 1.0, 0.0);
                    if (coord.z > 1.0 - epsilon) return vec3(0.0, 0.0, - 1.0);
                    float step = 0.01;
                    float x = sample1(coord + vec3(- step, 0.0, 0.0)) - sample1(coord + vec3(step, 0.0, 0.0));
                    float y = sample1(coord + vec3(0.0, - step, 0.0)) - sample1(coord + vec3(0.0, step, 0.0));
                    float z = sample1(coord + vec3(0.0, 0.0, - step)) - sample1(coord + vec3(0.0, 0.0, step));
                    return normalize(vec3(x, y, z));
                }
                void main(){
                    vec3 rayDir = normalize(vDirection);
                    vec2 bounds = hitBox(vOrigin, rayDir);
                    if (bounds.x > bounds.y) discard;
                    bounds.x = max(bounds.x, 0.0);
                    vec3 p = vOrigin + bounds.x * rayDir;
                    vec3 inc = 1.0 / abs(rayDir);
                    float delta = min(inc.x, min(inc.y, inc.z));
                    delta /= 50.0;
                    for (float t = bounds.x; t < bounds.y; t += delta) {
                        float d = sample1(p + 0.5);
                        if (d > 0.5) {
                            color.rgb = p * 2.0; // normal(p + 0.5); // * 0.5 + (p * 1.5 + 0.25);
                            color.a = 1.;
                            break;
                        }
                        p += rayDir * delta;
                    }
                    if (color.a == 0.0) discard;
                }
            `
            var loader = new VOXLoader()
            loader.load('static/models/vox/menger.vox', (chunks) => {
                for (var i = 0; i < chunks.length; i ++) {
                    var chunk = chunks[ i ]
                    var data = chunk.data
                    var size = chunk.size
                    var array = new Uint8Array(size.x * size.y * size.z);
                    for (var j = 0, k = 0; j < data.length; j += 4, k ++) {
                        var x = data[ j + 0 ]
                        var y = data[ j + 1 ]
                        var z = data[ j + 2 ]
                        var index = x + (y * size.x) + (z * size.x * size.y)
                        array[ index ] = 255.0
                    }
                    var texture = new this.$THREE.DataTexture3D(array, size.x, size.y, size.z)
                    texture.format = this.$THREE.RedFormat
                    texture.minFilter = this.$THREE.NearestFilter
                    texture.magFilter = this.$THREE.LinearFilter
                    texture.unpackAlignment = 1
                    var geometry = new this.$THREE.BoxBufferGeometry(1, 1, 1)
                    var material = new this.$THREE.RawShaderMaterial({
                        glslVersion: this.$THREE.GLSL3,
                        uniforms: {
                            map: { value: texture },
                            cameraPos: { value: new this.$THREE.Vector3() }
                        },
                        vertexShader,
                        fragmentShader,
                        side: this.$THREE.BackSide
                    })
                    var mesh = new this.$THREE.InstancedMesh(geometry, material, 100000)
                    mesh.onBeforeRender = () => {
                        material.uniforms.cameraPos.value.copy(this.camera.position)
                    }
                    var transform = new this.$THREE.Object3D()
                    for (let i = 0; i < mesh.count; i ++) {
                        transform.position.random().subScalar(0.5).multiplyScalar(150)
                        transform.rotation.x = Math.random() * Math.PI
                        transform.rotation.y = Math.random() * Math.PI
                        transform.rotation.z = Math.random() * Math.PI
                        transform.updateMatrix()
                        mesh.setMatrixAt(i, transform.matrix)
                    }
                    this.scene.add(mesh)
                }
            })
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webgl2VolumeInstancing-container {
    width: 100%;
}
</style>
