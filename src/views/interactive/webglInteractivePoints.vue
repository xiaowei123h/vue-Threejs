<template>
    <div class="webglInteractivePoints-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive - particles</div>
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
			particles: null,
			PARTICLE_SIZE: 20,
            raycaster: null,
            intersects: null,
            mouse: null,
            INTERSECTED: null,
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

				if (gl_FragColor.a < ALPHATEST) discard;

            }`
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 250
            //
            var vertices = new this.$THREE.BoxGeometry(200, 200, 200, 16, 16, 16).vertices
            var positions = new Float32Array(vertices.length * 3)
            var colors = new Float32Array(vertices.length * 3)
            var sizes = new Float32Array(vertices.length)
            var vertex
            var color = new this.$THREE.Color()
            for (var i = 0, l = vertices.length; i < l; i ++) {
                vertex = vertices[i]
                vertex.toArray(positions, i * 3)
                color.setHSL(0.01 + 0.1 * (i / l), 1.0, 0.5)
                color.toArray(colors, i * 3)
                sizes[i] = this.PARTICLE_SIZE * 0.5
            }
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('customColor', new this.$THREE.BufferAttribute(colors, 3))
            geometry.setAttribute('size', new this.$THREE.BufferAttribute(sizes, 1))
            //
            var material = new this.$THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new this.$THREE.Color(0xffffff) },
                    pointTexture: { value: new this.$THREE.TextureLoader().load("static/textures/sprites/disc.png") }
                },
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader,
                alphaTest: 0.9
            })
            //
            this.particles = new this.$THREE.Points(geometry, material)
            this.scene.add(this.particles)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            this.raycaster = new this.$THREE.Raycaster()
            this.mouse = new this.$THREE.Vector2()
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        },
        onDocumentMouseMove(event) {
            event.preventDefault()
            this.mouse.x = ((event.clientX - 281) / (window.innerWidth - 281)) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
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
            this.particles.rotation.x += 0.0005
            this.particles.rotation.y += 0.001
            var geometry = this.particles.geometry
            var attributes = geometry.attributes
            this.raycaster.setFromCamera(this.mouse, this.camera)
            this.intersects = this.raycaster.intersectObject(this.particles)
            if (this.intersects.length > 0) {
                if (this.INTERSECTED != this.intersects[0].index) {
                    attributes.size.array[this.INTERSECTED] = this.PARTICLE_SIZE
                    this.INTERSECTED = this.intersects[0].index
                    attributes.size.array[this.INTERSECTED] = this.PARTICLE_SIZE * 1.25
                    attributes.size.needsUpdate = true
                }
            } else if (this.INTERSECTED !== null) {
                attributes.size.array[this.INTERSECTED] = this.PARTICLE_SIZE
                attributes.size.needsUpdate = true
                this.INTERSECTED = null
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInteractivePoints-container {
    width: 100%;
}
</style>
