<template>
    <div class="webglMaterialsWireframe-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl wireframe demo
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            vertexShader: null,
            fragmentShader: null,
            API: {
				widthFactor: 1
			},
            renderer: null,
            scene: null,
            camera: null,
            mesh1: null,
            mesh2: null,
            gui: null,
        }
    },
    mounted() {
        this.vertexShader = `
            attribute vec3 center;
			varying vec3 vCenter;
			void main() {
				vCenter = center;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`
        this.fragmentShader = `
            uniform float widthFactor;
			varying vec3 vCenter;
			float edgeFactorTri() {
				vec3 d = fwidth(vCenter.xyz);
				vec3 a3 = smoothstep(vec3(0.0), d * widthFactor, vCenter.xyz);
				return min(min(a3.x, a3.y), a3.z);
			}
			void main() {
				if (edgeFactorTri() > 0.99) discard;
				gl_FragColor = gl_FrontFacing ? vec4(0.9, 0.9, 1.0, 1.0) : vec4(0.4, 0.4, 0.5, 1.0);
            }`
        this.init()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsWireframe-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 500)
            this.camera.position.z = 150
            new this.$THREE.BufferGeometryLoader().load('static/models/json/WaltHeadLo_buffergeometry.json', (geometry) => {
                // on the left
                var material1 = new this.$THREE.MeshBasicMaterial({
                    color: 0xe0e0ff,
                    wireframe: true
                })
                this.mesh1 = new this.$THREE.Mesh(geometry, material1)
                this.mesh1.position.set(- 40, 0, 0)
                this.scene.add(this.mesh1)
                // on the right
                var uniforms = { 'widthFactor': { value: this.API.widthFactor } }
                var material2 = new this.$THREE.ShaderMaterial({
                    uniforms: uniforms,
                    vertexShader: this.vertexShader,
                    fragmentShader: this.fragmentShader,
                    side: this.$THREE.DoubleSide
                })
                material2.extensions.derivatives = true
                geometry.deleteAttribute('normal')
                geometry.deleteAttribute('uv')
                this.setupAttributes(geometry)
                this.mesh2 = new this.$THREE.Mesh(geometry, material2)
                this.mesh2.position.set(40, 0, 0)
                this.scene.add(this.mesh2)
                //
                this.animate()
            })
            //
            this.gui = new GUI()
            this.gui.add(this.API, 'widthFactor', 0.4, 4).onChange(() => {
                this.mesh2.material.uniforms.widthFactor.value = this.API.widthFactor
            })
            this.gui.open()
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        setupAttributes(geometry) {
            var vectors = [
                new this.$THREE.Vector3(1, 0, 0),
                new this.$THREE.Vector3(0, 1, 0),
                new this.$THREE.Vector3(0, 0, 1)
            ]
            var position = geometry.attributes.position
            var centers = new Float32Array(position.count * 3)
            for (var i = 0, l = position.count; i < l; i ++) {
                vectors[ i % 3 ].toArray(centers, i * 3);
            }
            geometry.setAttribute('center', new this.$THREE.BufferAttribute(centers, 3))
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.mesh1.rotation.y += 0.01
            this.mesh2.rotation.y += 0.01
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsWireframe-container {
    width: 100%;
}
</style>
