<template>
    <div class="webgl2BuffergeometryAttributesInteger-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> WebGL 2 - buffergeometry - integer attributes</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            vertexShader: null,
            fragmentShader: null,
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
        }
    },
    mounted() {
        this.vertexShader = `
            in int textureIndex;
			flat out int vIndex; // "flat" indicates that the value will not be interpolated (required for integer attributes)
			out vec2 vUv;
			void main()	{
				vIndex = textureIndex;
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`
        this.fragmentShader = `
            flat in int vIndex;
			in vec2 vUv;
			uniform sampler2D uTextures[ 3 ];
			out vec4 outColor;
			void main()	{
				if (vIndex == 0) outColor = texture(uTextures[ 0 ], vUv);
				else if (vIndex == 1) outColor = texture(uTextures[ 1 ], vUv);
				else if (vIndex == 2) outColor = texture(uTextures[ 2 ], vUv);
            }`
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 3500)
            this.camera.position.z = 2500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.scene.fog = new this.$THREE.Fog(0x050505, 2000, 3500)
            // geometry
            var triangles = 10000
            var geometry = new this.$THREE.BufferGeometry()
            var positions = []
            var uvs = []
            var textureIndices = []
            var n = 800, n2 = n / 2 // triangles spread in the cube
            var d = 50, d2 = d / 2 // individual triangle size
            for (var i = 0; i < triangles; i ++) {
                // positions
                var x = Math.random() * n - n2
                var y = Math.random() * n - n2
                var z = Math.random() * n - n2
                var ax = x + Math.random() * d - d2
                var ay = y + Math.random() * d - d2
                var az = z + Math.random() * d - d2
                var bx = x + Math.random() * d - d2
                var by = y + Math.random() * d - d2
                var bz = z + Math.random() * d - d2
                var cx = x + Math.random() * d - d2
                var cy = y + Math.random() * d - d2
                var cz = z + Math.random() * d - d2
                positions.push(ax, ay, az)
                positions.push(bx, by, bz)
                positions.push(cx, cy, cz)
                // uvs
                uvs.push(0, 0)
                uvs.push(0.5, 1)
                uvs.push(1, 0)
                // texture indices
                var t = i % 3
                textureIndices.push(t, t, t)
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            geometry.setAttribute('uv', new this.$THREE.Float32BufferAttribute(uvs, 2))
            geometry.setAttribute('textureIndex', new this.$THREE.Int32BufferAttribute(textureIndices, 1))
            geometry.computeBoundingSphere()
            // material
            var loader = new this.$THREE.TextureLoader()
            var map1 = loader.load('static/textures/crate.gif')
            var map2 = loader.load('static/textures/floors/FloorsCheckerboard_S_Diffuse.jpg')
            var map3 = loader.load('static/textures/terrain/grasslight-big.jpg')
            var material = new this.$THREE.ShaderMaterial({
                uniforms: {
                    uTextures: {
                        value: [ map1, map2, map3 ]
                    }
                },
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader,
                side: this.$THREE.DoubleSide,
                glslVersion: this.$THREE.GLSL3
            })
            // mesh
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webgl2BuffergeometryAttributesInteger-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var time = Date.now() * 0.001
            this.mesh.rotation.x = time * 0.25
            this.mesh.rotation.y = time * 0.5
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webgl2BuffergeometryAttributesInteger-container {
    position: relative;
    width: 100%;
}
</style>
