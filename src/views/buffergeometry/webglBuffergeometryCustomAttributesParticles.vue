<template>
    <div class="webglBuffergeometryCustomAttributesParticles-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry custom attributes - particles</div>
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
            particleSystem: null,
            uniforms: null,
            geometry: null,
			particles: 100000
        }
    },
    mounted() {
        this.vertexshader = `
            attribute float size;
			varying vec3 vColor;
			void main() {
				vColor = color;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_PointSize = size * ( 300.0 / -mvPosition.z );
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.fragmentshader = `
            uniform sampler2D pointTexture;
			varying vec3 vColor;
			void main() {
				gl_FragColor = vec4( vColor, 1.0 );
				gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
            }`
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 300
            this.scene = new this.$THREE.Scene()
            this.uniforms = {
                pointTexture: { value: new this.$THREE.TextureLoader().load("static/textures/sprites/spark1.png") }
            }
            var shaderMaterial = new this.$THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader,
                blending: this.$THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
            })
            var radius = 200
            this.geometry = new this.$THREE.BufferGeometry()
            var positions = []
            var colors = []
            var sizes = []
            var color = new this.$THREE.Color()
            for (var i = 0; i < this.particles; i ++) {
                positions.push((Math.random() * 2 - 1) * radius)
                positions.push((Math.random() * 2 - 1) * radius)
                positions.push((Math.random() * 2 - 1) * radius)
                color.setHSL(i / this.particles, 1.0, 0.5)
                colors.push(color.r, color.g, color.b)
                sizes.push(20)
            }
            this.geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            this.geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            this.geometry.setAttribute('size', new this.$THREE.Float32BufferAttribute(sizes, 1).setUsage(this.$THREE.DynamicDrawUsage))
            this.particleSystem = new this.$THREE.Points(this.geometry, shaderMaterial)
            this.scene.add(this.particleSystem)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            var container = document.getElementById('container')
            container.appendChild(this.renderer.domElement)
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
            var time = Date.now() * 0.005
            this.particleSystem.rotation.z = 0.01 * time
            var sizes = this.geometry.attributes.size.array
            for (var i = 0; i < this.particles; i ++) {
                sizes[i] = 10 * (1 + Math.sin(0.1 * i + time))
            }
            this.geometry.attributes.size.needsUpdate = true
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryCustomAttributesParticles-container {
    position: relative;
    width: 100%;
}
</style>
