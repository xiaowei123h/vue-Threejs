<template>
    <div class="webglCustomAttributesLines-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - custom attributes example</div>
		<div id="container"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            vertexshader: null,
            fragmentshader: null,
            renderer: null,
            scene: null,
            camera: null,
            stats: null,
            line: null,
            uniforms: null,
			loader: null,
        }
    },
    mounted() {
        this.vertexshader = `
            uniform float amplitude;
			attribute vec3 displacement;
			attribute vec3 customColor;
			varying vec3 vColor;
			void main() {
				vec3 newPosition = position + amplitude * displacement;
				vColor = customColor;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }`
        this.fragmentshader = `
            uniform vec3 color;
			uniform float opacity;
			varying vec3 vColor;
			void main() {
				gl_FragColor = vec4(vColor * color, opacity);
            }`
        this.loader = new this.$THREE.FontLoader()
        var that = this
        this.loader.load('static/fonts/helvetiker_bold.typeface.json', (font) => {
            that.init(font)
            that.animate()
        })
    },
    methods: {
        init(font) {
            this.camera = new this.$THREE.PerspectiveCamera(30, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 400
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.uniforms = {
                amplitude: { value: 5.0 },
                opacity: { value: 0.3 },
                color: { value: new this.$THREE.Color(0xffffff) }
            }
            var shaderMaterial = new this.$THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader,
                blending: this.$THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            })
            var geometry = new this.$THREE.TextBufferGeometry('three.js', {
                font: font,
                size: 50,
                height: 15,
                curveSegments: 10,
                bevelThickness: 5,
                bevelSize: 1.5,
                bevelEnabled: true,
                bevelSegments: 10,
            })
            geometry.center()
            var count = geometry.attributes.position.count
            var displacement = new this.$THREE.Float32BufferAttribute(count * 3, 3)
            geometry.setAttribute('displacement', displacement)
            var customColor = new this.$THREE.Float32BufferAttribute(count * 3, 3)
            geometry.setAttribute('customColor', customColor)
            var color = new this.$THREE.Color(0xffffff)
            for (var i = 0, l = customColor.count; i < l; i ++) {
                color.setHSL(i / l, 0.5, 0.5)
                color.toArray(customColor.array, i * customColor.itemSize)
            }
            this.line = new this.$THREE.Line(geometry, shaderMaterial)
            this.line.rotation.x = 0.2
            this.scene.add(this.line)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            var container = document.getElementById('container')
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
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
            var time = Date.now() * 0.001
            this.line.rotation.y = 0.25 * time
            this.uniforms.amplitude.value = Math.sin(0.5 * time)
            this.uniforms.color.value.offsetHSL(0.0005, 0, 0)
            var attributes = this.line.geometry.attributes
            var array = attributes.displacement.array
            for (var i = 0, l = array.length; i < l; i += 3) {
                array[ i ] += 0.3 * (0.5 - Math.random())
                array[ i + 1 ] += 0.3 * (0.5 - Math.random())
                array[ i + 2 ] += 0.3 * (0.5 - Math.random())
            }
            attributes.displacement.needsUpdate = true
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglCustomAttributesLines-container {
    width: 100%;
}
</style>
