<template>
    <div class="webglModifierTessellation-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - modifier tessellation</div>
		<div id="container"></div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { TessellateModifier } from '@/components/jsm/modifiers/TessellateModifier.js'
export default {
    data() {
        return {
            vertexshader: null,
            fragmentshader: null,
            renderer: null,
            scene: null,
            camera: null,
            stats: null,
			controls: null,
            mesh: null,
            uniforms: null,
			WIDTH: null,
			HEIGHT: null,
			loader: null,
        }
    },
    mounted() {
        this.vertexshader = `
            uniform float amplitude;

			attribute vec3 customColor;
			attribute vec3 displacement;

			varying vec3 vNormal;
			varying vec3 vColor;

			void main() {

				vNormal = normal;
				vColor = customColor;

				vec3 newPosition = position + normal * amplitude * displacement;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

			}`
        this.fragmentshader = `
            varying vec3 vNormal;
			varying vec3 vColor;

			void main() {

				const float ambient = 0.4;

				vec3 light = vec3( 1.0 );
				light = normalize( light );

				float directional = max( dot( vNormal, light ), 0.0 );

				gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );

			}`
        this.WIDTH = window.innerWidth
        this.HEIGHT = window.innerHeight
        this.loader = new this.$THREE.FontLoader()
        this.loader.load('static/fonts/helvetiker_bold.typeface.json', (font) => {
            this.init(font)
            this.animate()
        })
    },
    methods: {
        init(font) {
            this.camera = new this.$THREE.PerspectiveCamera(40, this.WIDTH / this.HEIGHT, 1, 10000)
            this.camera.position.set(- 100, 100, 200)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            //
            var geometry = new this.$THREE.TextGeometry("THREE.JS", {
                font: font,
                size: 40,
                height: 5,
                curveSegments: 3,
                bevelThickness: 2,
                bevelSize: 1,
                bevelEnabled: true
            })
            console.log(geometry)
            geometry.center()
            var tessellateModifier = new TessellateModifier(8, 6)
            geometry = tessellateModifier.modify(geometry)
            //
            geometry = new this.$THREE.BufferGeometry().fromGeometry(geometry)
            var numFaces = geometry.attributes.position.count / 3
            var colors = new Float32Array(numFaces * 3 * 3)
            var displacement = new Float32Array(numFaces * 3 * 3)
            var color = new this.$THREE.Color()
            for (var f = 0; f < numFaces; f ++) {
                var index = 9 * f
                var h = 0.2 * Math.random()
                var s = 0.5 + 0.5 * Math.random()
                var l = 0.5 + 0.5 * Math.random()
                color.setHSL(h, s, l)
                var d = 10 * (0.5 - Math.random())
                for (var i = 0; i < 3; i ++) {
                    colors[ index + (3 * i) ] = color.r
                    colors[ index + (3 * i) + 1 ] = color.g
                    colors[ index + (3 * i) + 2 ] = color.b
                    displacement[ index + (3 * i) ] = d
                    displacement[ index + (3 * i) + 1 ] = d
                    displacement[ index + (3 * i) + 2 ] = d
                }
            }
            geometry.setAttribute('customColor', new this.$THREE.BufferAttribute(colors, 3))
            geometry.setAttribute('displacement', new this.$THREE.BufferAttribute(displacement, 3))
            //
            this.uniforms = {
                amplitude: { value: 0.0 }
            }
            var shaderMaterial = new this.$THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader
            })
            //
            this.mesh = new this.$THREE.Mesh(geometry, shaderMaterial)
            this.scene.add(this.mesh)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.WIDTH, this.HEIGHT)
            var container = document.getElementById('container')
            container.appendChild(this.renderer.domElement)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.001
            this.uniforms.amplitude.value = 1.0 + Math.sin(time * 0.5)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglModifierTessellation-container {
    position: relative;
    width: 100%;
}
</style>
