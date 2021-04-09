<template>
    <div class="webglPointsWaves-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl particles waves example
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            vertexshader: null,
            fragmentshader: null,
            SEPARATION: 100,
            AMOUNTX: 50,
            AMOUNTY: 50,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            particles: null,
            count: 0,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.vertexshader = `
            attribute float scale;
			void main() {
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = scale * (300.0 / - mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.fragmentshader = `
            uniform vec3 color;
			void main() {
				if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
				gl_FragColor = vec4(color, 1.0);
            }`
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglPointsWaves-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            //
            var numParticles = this.AMOUNTX * this.AMOUNTY
            var positions = new Float32Array(numParticles * 3)
            var scales = new Float32Array(numParticles)
            var i = 0, j = 0
            for (var ix = 0; ix < this.AMOUNTX; ix ++) {
                for (var iy = 0; iy < this.AMOUNTY; iy ++) {
                    positions[ i ] = ix * this.SEPARATION - ((this.AMOUNTX * this.SEPARATION) / 2) // x
                    positions[ i + 1 ] = 0 // y
                    positions[ i + 2 ] = iy * this.SEPARATION - ((this.AMOUNTY * this.SEPARATION) / 2) // z
                    scales[ j ] = 1
                    i += 3
                    j ++
                }
            }
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('scale', new this.$THREE.BufferAttribute(scales, 1))
            var material = new this.$THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new this.$THREE.Color(0xffffff) },
                },
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader
            })
            //
            this.particles = new this.$THREE.Points(geometry, material)
            this.scene.add(this.particles)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            this.container.style.touchAction = 'none'
            this.container.addEventListener('pointermove', this.onPointerMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.mouseX = event.clientX - this.windowHalfX
            this.mouseY = event.clientY - this.windowHalfY
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            var positions = this.particles.geometry.attributes.position.array
            var scales = this.particles.geometry.attributes.scale.array
            var i = 0, j = 0
            for (var ix = 0; ix < this.AMOUNTX; ix ++) {
                for (var iy = 0; iy < this.AMOUNTY; iy ++) {
                    positions[ i + 1 ] = (Math.sin((ix + this.count) * 0.3) * 50) +
                                    (Math.sin((iy + this.count) * 0.5) * 50)
                    scales[ j ] = (Math.sin((ix + this.count) * 0.3) + 1) * 20 +
                                    (Math.sin((iy + this.count) * 0.5) + 1) * 20
                    i += 3
                    j ++
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true
            this.particles.geometry.attributes.scale.needsUpdate = true
            this.renderer.render(this.scene, this.camera)
            this.count += 0.1
        }
    },
}
</script>

<style scoped>
.webglPointsWaves-container {
    position: relative;
    width: 100%;
}
</style>
