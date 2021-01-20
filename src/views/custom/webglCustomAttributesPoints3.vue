<template>
    <div class="webglCustomAttributesPoints2-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - custom attributes example - billboards - alphatest</div>
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
            object: null,
            vertices1: null,
			WIDTH: null,
			HEIGHT: null
        }
    },
    mounted() {
        this.vertexshader = `
            attribute float size;
			attribute vec4 ca;
			varying vec4 vColor;
			void main() {
				vColor = ca;
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = size * (150.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
			}`
        this.fragmentshader = `
            uniform vec3 color;
			uniform sampler2D pointTexture;

			varying vec4 vColor;

			void main() {

				vec4 outColor = texture2D( pointTexture, gl_PointCoord );

				if ( outColor.a < 0.5 ) discard;

				gl_FragColor = outColor * vec4( color * vColor.xyz, 1.0 );

				float depth = gl_FragCoord.z / gl_FragCoord.w;
				const vec3 fogColor = vec3( 0.0 );

				float fogFactor = smoothstep( 200.0, 600.0, depth );
				gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

			}`
        this.WIDTH = this.$webglInnerWidth
        this.HEIGHT = window.innerHeight
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(40, this.WIDTH / this.HEIGHT, 1, 10000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            var radius = 100
            var inner = 0.6 * radius
            var vertices = []
            for (var i = 0; i < 100000; i ++) {
                var vertex = new this.$THREE.Vector3()
                vertex.x = Math.random() * 2 - 1
                vertex.y = Math.random() * 2 - 1
                vertex.z = Math.random() * 2 - 1
                vertex.multiplyScalar(radius)
                if ((vertex.x > inner || vertex.x < - inner) ||
                        (vertex.y > inner || vertex.y < - inner) ||
                        (vertex.z > inner || vertex.z < - inner))
                    vertices.push(vertex)
            }
            this.vertices1 = vertices.length
            radius = 200
            var geometry2 = new this.$THREE.BoxGeometry(radius, 0.1 * radius, 0.1 * radius, 50, 5, 5)
            var matrix = new this.$THREE.Matrix4()
            var position = new this.$THREE.Vector3()
            var rotation = new this.$THREE.Euler()
            var quaternion = new this.$THREE.Quaternion()
            var scale = new this.$THREE.Vector3(1, 1, 1)
            function addGeo(geo, x, y, z, ry) {
                position.set(x, y, z)
                rotation.set(0, ry, 0)
                matrix.compose(position, quaternion.setFromEuler(rotation), scale)
                for (var i = 0, l = geo.vertices.length; i < l; i ++) {
                    var vertex = geo.vertices[ i ]
                    vertices.push(vertex.clone().applyMatrix4(matrix))
                }
            }
            // side 1
            addGeo(geometry2, 0, 110, 110, 0)
            addGeo(geometry2, 0, 110, - 110, 0)
            addGeo(geometry2, 0, - 110, 110, 0)
            addGeo(geometry2, 0, - 110, - 110, 0)
            // side 2
            addGeo(geometry2, 110, 110, 0, Math.PI / 2)
            addGeo(geometry2, 110, - 110, 0, Math.PI / 2)
            addGeo(geometry2, - 110, 110, 0, Math.PI / 2)
            addGeo(geometry2, - 110, - 110, 0, Math.PI / 2)
            // corner edges
            var geometry3 = new this.$THREE.BoxGeometry(0.1 * radius, radius * 1.2, 0.1 * radius, 5, 60, 5)
            addGeo(geometry3, 110, 0, 110, 0)
            addGeo(geometry3, 110, 0, - 110, 0)
            addGeo(geometry3, - 110, 0, 110, 0)
            addGeo(geometry3, - 110, 0, - 110, 0)
            var positions = new Float32Array(vertices.length * 3)
            var colors = new Float32Array(vertices.length * 3)
            var sizes = new Float32Array(vertices.length)
            var color = new this.$THREE.Color()
            for (var i = 0; i < vertices.length; i ++) {
                var vertex = vertices[ i ]
                vertex.toArray(positions, i * 3)
                if (i < this.vertices1) {
                    color.setHSL(0.5 + 0.2 * (i / this.vertices1), 1, 0.5)
                } else {
                    color.setHSL(0.1, 1, 0.5)
                }
                color.toArray(colors, i * 3)
                sizes[ i ] = i < this.vertices1 ? 10 : 40
            }
            
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('size', new this.$THREE.BufferAttribute(sizes, 1))
            geometry.setAttribute('ca', new this.$THREE.BufferAttribute(colors, 3))
            //
            var texture = new this.$THREE.TextureLoader().load("static/textures/sprites/disc.png")
            texture.wrapS = this.$THREE.RepeatWrapping
            texture.wrapT = this.$THREE.RepeatWrapping
            var material = new this.$THREE.ShaderMaterial({
                uniforms: {
                    amplitude: { value: 1.0 },
                    color: { value: new this.$THREE.Color(0xffffff) },
                    pointTexture: { value: texture }
                },
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader
            })
            //
            this.object = new this.$THREE.Points(geometry, material)
            this.scene.add(this.object)
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
            var time = Date.now() * 0.01
            this.object.rotation.y = this.object.rotation.z = 0.02 * time
            var geometry = this.object.geometry
            var attributes = geometry.attributes
            for (var i = 0; i < attributes.size.array.length; i ++) {
                if (i < this.vertices1) {
                    attributes.size.array[i] = Math.max(0, 26 + 32 * Math.sin(0.1 * i + 0.6 * time))
                }
            }
            attributes.size.needsUpdate = true
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglCustomAttributesPoints2-contianer {
    width: 100%;
}
</style>
