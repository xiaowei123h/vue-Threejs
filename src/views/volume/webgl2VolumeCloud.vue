<template>
    <div class="webgl2VolumeCloud-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl2 - volume - cloud
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ImprovedNoise } from '@/components/jsm/math/ImprovedNoise.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { WEBGL } from '@/components/jsm/WebGL.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            mesh: null,
            gui: null,
        }
    },
    mounted() {
        if (WEBGL.isWebGL2Available() === false) {
            document.getElementsByClassName('webgl2VolumeCloud-container')[0].appendChild(WEBGL.getWebGL2ErrorMessage());
        }
        this.init();
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('webgl2VolumeCloud-container')[0].appendChild(this.renderer.domElement);
            this.scene = new this.$THREE.Scene();
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 100);
            this.camera.position.set(0, 0, 1.5);
            new OrbitControls(this.camera, this.renderer.domElement);
            // Sky
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 32;
            var context = canvas.getContext('2d');
            var gradient = context.createLinearGradient(0, 0, 0, 32);
            gradient.addColorStop(0.0, '#014a84');
            gradient.addColorStop(0.5, '#0561a0');
            gradient.addColorStop(1.0, '#437ab6');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 1, 32);
            var sky = new this.$THREE.Mesh(
                new this.$THREE.SphereBufferGeometry(10),
                new this.$THREE.MeshBasicMaterial({ map: new this.$THREE.CanvasTexture(canvas), side: this.$THREE.BackSide })
            );
            this.scene.add(sky);
            // Texture
            var size = 128;
            var data = new Uint8Array(size * size * size);
            var i = 0;
            var scale = 0.05;
            var perlin = new ImprovedNoise();
            var vector = new this.$THREE.Vector3();
            for (var z = 0; z < size; z ++) {
                for (var y = 0; y < size; y ++) {
                    for (var x = 0; x < size; x ++) {
                        var d = 1.0 - vector.set(x, y, z).subScalar(size / 2).divideScalar(size).length();
                        data[ i ] = (128 + 128 * perlin.noise(x * scale / 1.5, y * scale, z * scale / 1.5)) * d * d;
                        i ++;
                    }
                }
            }
            var texture = new this.$THREE.DataTexture3D(data, size, size, size);
            texture.format = this.$THREE.RedFormat;
            texture.minFilter = this.$THREE.LinearFilter;
            texture.magFilter = this.$THREE.LinearFilter;
            texture.unpackAlignment = 1;
            // Material
            var vertexShader = /* glsl */`
                in vec3 position;
                uniform mat4 modelMatrix;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform vec3 cameraPos;
                out vec3 vOrigin;
                out vec3 vDirection;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPos, 1.0)).xyz;
                    vDirection = position - vOrigin;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `;
            var fragmentShader = /* glsl */`
                precision highp float;
                precision highp sampler3D;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                in vec3 vOrigin;
                in vec3 vDirection;
                out vec4 color;
                uniform vec3 base;
                uniform sampler3D map;
                uniform float threshold;
                uniform float range;
                uniform float opacity;
                uniform float steps;
                uniform float frame;
                uint wang_hash(uint seed)
                {
                        seed = (seed ^ 61u) ^ (seed >> 16u);
                        seed *= 9u;
                        seed = seed ^ (seed >> 4u);
                        seed *= 0x27d4eb2du;
                        seed = seed ^ (seed >> 15u);
                        return seed;
                }
                float randomFloat(inout uint seed)
                {
                        return float(wang_hash(seed)) / 4294967296.;
                }
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
                float shading(vec3 coord) {
                    float step = 0.01;
                    return sample1(coord + vec3(- step)) - sample1(coord + vec3(step));
                }
                void main(){
                    vec3 rayDir = normalize(vDirection);
                    vec2 bounds = hitBox(vOrigin, rayDir);
                    if (bounds.x > bounds.y) discard;
                    bounds.x = max(bounds.x, 0.0);
                    vec3 p = vOrigin + bounds.x * rayDir;
                    vec3 inc = 1.0 / abs(rayDir);
                    float delta = min(inc.x, min(inc.y, inc.z));
                    delta /= steps;
                    // Jitter
                    // Nice little seed from
                    // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
                    uint seed = uint(gl_FragCoord.x) * uint(1973) + uint(gl_FragCoord.y) * uint(9277) + uint(frame) * uint(26699);
                    vec3 size = vec3(textureSize(map, 0));
                    float randNum = randomFloat(seed) * 2.0 - 1.0;
                    p += rayDir * randNum * (1.0 / size);
                    //
                    vec4 ac = vec4(base, 0.0);
                    for (float t = bounds.x; t < bounds.y; t += delta) {
                        float d = sample1(p + 0.5);
                        d = smoothstep(threshold - range, threshold + range, d) * opacity;
                        float col = shading(p + 0.5) * 3.0 + ((p.x + p.y) * 0.25) + 0.2;
                        ac.rgb += (1.0 - ac.a) * d * col;
                        ac.a += (1.0 - ac.a) * d;
                        if (ac.a >= 0.95) break;
                        p += rayDir * delta;
                    }
                    color = ac;
                    if (color.a == 0.0) discard;
                }
            `;
            var geometry = new this.$THREE.BoxBufferGeometry(1, 1, 1);
            var material = new this.$THREE.RawShaderMaterial({
                glslVersion: this.$THREE.GLSL3,
                uniforms: {
                    base: { value: new this.$THREE.Color(0x798aa0) },
                    map: { value: texture },
                    cameraPos: { value: new this.$THREE.Vector3() },
                    threshold: { value: 0.25 },
                    opacity: { value: 0.25 },
                    range: { value: 0.1 },
                    steps: { value: 100 },
                    frame: { value: 0 }
                },
                vertexShader,
                fragmentShader,
                side: this.$THREE.BackSide,
                transparent: true
            });
            this.mesh = new this.$THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);
            //
            var parameters = {
                threshold: 0.25,
                opacity: 0.25,
                range: 0.1,
                steps: 100
            };
            function update() {
                material.uniforms.threshold.value = parameters.threshold;
                material.uniforms.opacity.value = parameters.opacity;
                material.uniforms.range.value = parameters.range;
                material.uniforms.steps.value = parameters.steps;
            }
            this.gui = new GUI();
            this.gui.add(parameters, 'threshold', 0, 1, 0.01).onChange(update);
            this.gui.add(parameters, 'opacity', 0, 1, 0.01).onChange(update);
            this.gui.add(parameters, 'range', 0, 1, 0.01).onChange(update);
            this.gui.add(parameters, 'steps', 0, 200, 1).onChange(update);
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.mesh.material.uniforms.cameraPos.value.copy(this.camera.position);
            this.mesh.rotation.y = - performance.now() / 7500;
            this.mesh.material.uniforms.frame.value ++;
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webgl2VolumeCloud-container {
    position: relative;
    width: 100%;
}
</style>
