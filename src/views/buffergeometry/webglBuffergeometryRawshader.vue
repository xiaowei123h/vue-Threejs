<template>
    <div class="webglBuffergeometryRawshader-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - raw shader demo</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            vertexShader: null,
            fragmentShader: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.vertexShader = `
            precision mediump float;
			precision mediump int;
			uniform mat4 modelViewMatrix; // optional
			uniform mat4 projectionMatrix; // optional
			attribute vec3 position;
			attribute vec4 color;
			varying vec3 vPosition;
			varying vec4 vColor;
			void main()	{
				vPosition = position;
				vColor = color;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`
        this.fragmentShader = `
            precision mediump float;
			precision mediump int;
			uniform float time;
			varying vec3 vPosition;
			varying vec4 vColor;
			void main()	{
				vec4 color = vec4( vColor );
				color.r += sin( vPosition.x * 10.0 + time ) * 0.5;
				gl_FragColor = color;
            }`
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 10)
            this.camera.position.z = 2
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x101010)
            // geometry
            // nr of triangles with 3 vertices per triangle
            var vertexCount = 200 * 3
            var geometry = new this.$THREE.BufferGeometry()
            var positions = []
            var colors = []
            for (var i = 0; i < vertexCount; i ++) {
                // adding x,y,z
                positions.push(Math.random() - 0.5)
                positions.push(Math.random() - 0.5)
                positions.push(Math.random() - 0.5)
                // adding r,g,b,a
                colors.push(Math.random() * 255)
                colors.push(Math.random() * 255)
                colors.push(Math.random() * 255)
                colors.push(Math.random() * 255)
            }
            var positionAttribute = new this.$THREE.Float32BufferAttribute(positions, 3)
            var colorAttribute = new this.$THREE.Uint8BufferAttribute(colors, 4)
            colorAttribute.normalized = true // this will map the buffer values to 0.0f - +1.0f in the shader
            geometry.setAttribute('position', positionAttribute)
            geometry.setAttribute('color', colorAttribute)
            // material
            var material = new this.$THREE.RawShaderMaterial({
                uniforms: {
                    time: { value: 1.0 }
                },
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader,
                side: this.$THREE.DoubleSide,
                transparent: true
            })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
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
            var time = performance.now()
            var object = this.scene.children[ 0 ]
            object.rotation.y = time * 0.0005
            object.material.uniforms.time.value = time * 0.005
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryRawshader-container {
    width: 100%;
}
</style>
