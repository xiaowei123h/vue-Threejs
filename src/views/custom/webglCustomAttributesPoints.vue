<template>
    <div class="webglCustomAttributesPoints-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - custom attributes example - particles</div>
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
			sphere: null,
			WIDTH: null,
			HEIGHT: null
        }
    },
    mounted() {
        this.vertexshader = `
            attribute float size;
			attribute vec3 customColor;
			varying vec3 vColor;
			void main() {
				vColor = customColor;
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = size * (300.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.fragmentshader = `
            uniform vec3 color;
			uniform sampler2D pointTexture;
			varying vec3 vColor;
			void main() {
				gl_FragColor = vec4(color * vColor, 1.0);
				gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
            }`
        this.WIDTH = this.$webglInnerWidth
        this.HEIGHT = window.innerHeight
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(40, this.WIDTH / this.HEIGHT, 1, 10000)
            this.camera.position.z = 300
            this.scene = new this.$THREE.Scene()
            var amount = 100000
            var radius = 200
            var positions = new Float32Array(amount * 3)
            var colors = new Float32Array(amount * 3)
            var sizes = new Float32Array(amount)
            var vertex = new this.$THREE.Vector3()
            var color = new this.$THREE.Color(0xffffff)
            for (var i = 0; i < amount; i ++) {
                vertex.x = (Math.random() * 2 - 1) * radius
                vertex.y = (Math.random() * 2 - 1) * radius
                vertex.z = (Math.random() * 2 - 1) * radius
                vertex.toArray(positions, i * 3)
                if (vertex.x < 0) {
                    color.setHSL(0.5 + 0.1 * (i / amount), 0.7, 0.5)
                } else {
                    color.setHSL(0.0 + 0.1 * (i / amount), 0.9, 0.5)
                }
                color.toArray(colors, i * 3)
                sizes[ i ] = 10
            }
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('customColor', new this.$THREE.BufferAttribute(colors, 3))
            geometry.setAttribute('size', new this.$THREE.BufferAttribute(sizes, 1))
            //
            var material = new this.$THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new this.$THREE.Color(0xffffff) },
                    pointTexture: { value: new this.$THREE.TextureLoader().load("static/textures/sprites/spark1.png") }
                },
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader,

                blending: this.$THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            })
            //
            this.sphere = new this.$THREE.Points(geometry, material)
            this.scene.add(this.sphere)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.WIDTH, this.HEIGHT)
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
            var time = Date.now() * 0.005
            this.sphere.rotation.z = 0.01 * time
            var geometry = this.sphere.geometry
            var attributes = geometry.attributes
            for (var i = 0; i < attributes.size.array.length; i ++) {
                attributes.size.array[ i ] = 14 + 13 * Math.sin(0.1 * i + time)
            }
            attributes.size.needsUpdate = true
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglCustomAttributesPoints-container {
    width: 100%;
}
</style>
