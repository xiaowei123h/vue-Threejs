<template>
    <div class="webgl2MaterialsTexture2darray-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - 2D Texture array<br />
			Scanned head data by
			<a href="https://www.codeproject.com/Articles/352270/Getting-started-with-Volume-Rendering" target="_blank" rel="noopener">Divine Augustine</a><br />
			licensed under
			<a href="https://www.codeproject.com/info/cpol10.aspx" target="_blank" rel="noopener">CPOL</a>
		</div>
    </div>
</template>

<script>
import { JSZip } from '@/components/jsm/libs/jszip.module.min.js'
import { WEBGL } from '@/components/jsm/WebGL.js'
export default {
    data() {
        return {
            vs: null,
            fs: null,
            camera: null,
            scene: null,
            mesh: null,
            renderer: null,
            stats: null,
			planeWidth: 50,
			planeHeight: 50,
			depthStep: 0.4,
        }
    },
    mounted() {
        this.vs = `
            uniform vec2 size;
            out vec2 vUv;
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                // Convert position.xy to 1.0-0.0
                vUv.xy = position.xy / size + 0.5;
                vUv.y = 1.0 - vUv.y; // original data is upside down
            }`
        this.fs = `
            precision highp float;
            precision highp int;
            precision highp sampler2DArray;
            uniform sampler2DArray diffuse;
            in vec2 vUv;
            uniform int depth;
            out vec4 outColor;
            void main() {
                vec4 color = texture(diffuse, vec3(vUv, depth));
                // lighten a bit
                outColor = vec4(color.rrr * 1.5, 1.0);
            }`
        if (WEBGL.isWebGL2Available() === false) {
            document.getElementsByClassName('webgl2MaterialsTexture2darray-container')[0].appendChild(WEBGL.getWebGL2ErrorMessage())
        }
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webgl2MaterialsTexture2darray-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.1, 2000)
            this.camera.position.z = 70
            this.scene = new this.$THREE.Scene()
            // width 256, height 256, depth 109, 8-bit, zip archived raw data
            new this.$THREE.FileLoader()
                .setResponseType('arraybuffer')
                .load('static/textures/3d/head256x256x109.zip', (data) => {
                    var zip = new JSZip(data)
                    var array = zip.files[ 'head256x256x109' ].asUint8Array()
                    var texture = new this.$THREE.DataTexture2DArray(array, 256, 256, 109)
                    texture.format = this.$THREE.RedFormat
                    texture.type = this.$THREE.UnsignedByteType
                    var material = new this.$THREE.ShaderMaterial({
                        uniforms: {
                            diffuse: { value: texture },
                            depth: { value: 55 },
                            size: { value: new this.$THREE.Vector2(this.planeWidth, this.planeHeight) }
                        },
                        vertexShader: this.vs,
                        fragmentShader: this.fs,
                        glslVersion: this.$THREE.GLSL3
                    })
                    var geometry = new this.$THREE.PlaneBufferGeometry(this.planeWidth, this.planeHeight)
                    this.mesh = new this.$THREE.Mesh(geometry, material)
                    this.scene.add(this.mesh)
                })
            // 2D Texture array is available on WebGL 2.0
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            if (this.mesh) {
                var value = this.mesh.material.uniforms[ "depth" ].value
                value += this.depthStep
                if (value > 109.0 || value < 0.0) {
                    if (value > 1.0) value = 109.0 * 2.0 - value
                    if (value < 0.0) value = - value
                    this.depthStep = - this.depthStep
                }
                this.mesh.material.uniforms[ "depth" ].value = value
            }
            this.render()
            this.stats.update()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webgl2MaterialsTexture2darray-container {
    position: relative;
    width: 100%;
}
</style>
