<template>
    <div class="webglCustomAttributes-container">
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
            sphere: null,
            uniforms: null,
            displacement: null,
            noise: null,
        }
    },
    mounted() {
        this.vertexshader = `
            uniform float amplitude;

			attribute float displacement;

			varying vec3 vNormal;
			varying vec2 vUv;

			void main() {

				vNormal = normal;
				vUv = ( 0.5 + amplitude ) * uv + vec2( amplitude );

				vec3 newPosition = position + amplitude * normal * vec3( displacement );
				gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

			}`
        this.fragmentshader = `
            varying vec3 vNormal;
			varying vec2 vUv;

			uniform vec3 color;
			uniform sampler2D colorTexture;

			void main() {

				vec3 light = vec3( 0.5, 0.2, 1.0 );
				light = normalize( light );

				float dProd = dot( vNormal, light ) * 0.5 + 0.5;

				vec4 tcolor = texture2D( colorTexture, vUv );
				vec4 gray = vec4( vec3( tcolor.r * 0.3 + tcolor.g * 0.59 + tcolor.b * 0.11 ), 1.0 );

				gl_FragColor = gray * vec4( vec3( dProd ) * vec3( color ), 1.0 );

			}`
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(30, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 300
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.uniforms = {
                "amplitude": { value: 1.0 },
                "color": { value: new this.$THREE.Color(0xff2200) },
                "colorTexture": { value: new this.$THREE.TextureLoader().load("static/textures/water.jpg") }
            }
            this.uniforms[ "colorTexture" ].value.wrapS = this.uniforms[ "colorTexture" ].value.wrapT = this.$THREE.RepeatWrapping
            var shaderMaterial = new this.$THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader
            })
            var radius = 50, segments = 128, rings = 64
            var geometry = new this.$THREE.SphereBufferGeometry(radius, segments, rings)
            this.displacement = new Float32Array(geometry.attributes.position.count)
            this.noise = new Float32Array(geometry.attributes.position.count)
            for (var i = 0; i < this.displacement.length; i ++) {
                this.noise[ i ] = Math.random() * 5
            }
            geometry.setAttribute('displacement', new this.$THREE.BufferAttribute(this.displacement, 1))
            this.sphere = new this.$THREE.Mesh(geometry, shaderMaterial)
            // this.sphere.material.side = this.$THREE.DoubleSide
            this.scene.add(this.sphere)
            this.renderer = new this.$THREE.WebGLRenderer()
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
            var time = Date.now() * 0.01
            this.sphere.rotation.y = this.sphere.rotation.z = 0.01 * time
            this.uniforms[ "amplitude" ].value = 2.5 * Math.sin(this.sphere.rotation.y * 0.125)
            this.uniforms[ "color" ].value.offsetHSL(0.0005, 0, 0)
            for (var i = 0; i < this.displacement.length; i ++) {
                this.displacement[ i ] = Math.sin(0.1 * i + time)
                this.noise[ i ] += 0.5 * (0.5 - Math.random())
                this.noise[ i ] = this.$THREE.MathUtils.clamp(this.noise[ i ], - 5, 5)
                this.displacement[ i ] += this.noise[ i ]
            }
            this.sphere.geometry.attributes.displacement.needsUpdate = true
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglCustomAttributes-container {
    width: 100%;
}
</style>
