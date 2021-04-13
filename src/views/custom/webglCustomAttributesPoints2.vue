<template>
    <div class="webglCustomAttributesPoints2-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - custom attributes example - particles - billboards</div>
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
            length1: null,
			WIDTH: null,
			HEIGHT: null
        }
    },
    mounted() {
        this.vertexshader = `
            attribute float size;
			attribute vec3 ca;
			varying vec3 vColor;
			void main() {
				vColor = ca;
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = size * (300.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.fragmentshader = `
            uniform vec3 color;
			uniform sampler2D pointTexture;
			varying vec3 vColor;
			void main() {
				vec4 color = vec4(color * vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
				gl_FragColor = color;
            }`
        this.WIDTH = this.$webglInnerWidth
        this.HEIGHT = window.innerHeight
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.WIDTH / this.HEIGHT, 1, 10000)
            this.camera.position.z = 300
            this.scene = new this.$THREE.Scene()
            var radius = 100, segments = 68, rings = 38
            var vertices1 = new this.$THREE.SphereGeometry(radius, segments, rings).vertices
            var vertices2 = new this.$THREE.BoxGeometry(0.8 * radius, 0.8 * radius, 0.8 * radius, 10, 10, 10).vertices
            this.length1 = vertices1.length
            var vertices = vertices1.concat(vertices2)
            var positions = new Float32Array(vertices.length * 3)
            var colors = new Float32Array(vertices.length * 3)
            var sizes = new Float32Array(vertices.length)
            var color = new this.$THREE.Color()
            for (var i = 0, l = vertices.length; i < l; i ++) {
                var vertex = vertices[i]
                vertex.toArray(positions, i * 3)
                if (i < this.length1) {
                    color.setHSL(0.01 + 0.1 * (i / this.length1), 0.99, (vertex.y + radius) / (4 * radius))
                } else {
                    color.setHSL(0.6, 0.75, 0.25 + vertex.y / (2 * radius))
                }
                color.toArray(colors, i * 3)
                sizes[i] = i < this.length1 ? 10 : 40
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
                    color: { value: new this.$THREE.Color(0xffffff) },
                    pointTexture: { value: texture }
                },
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader,
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
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        sortPoints() {
            var vector = new this.$THREE.Vector3()
            // Model View Projection matrix
            var matrix = new this.$THREE.Matrix4()
            matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
            matrix.multiply(this.sphere.matrixWorld)
            //
            var geometry = this.sphere.geometry
            var index = geometry.getIndex()
            var positions = geometry.getAttribute('position').array
            var length = positions.length / 3
            if (index === null) {
                var array = new Uint16Array(length)
                for (var i = 0; i < length; i ++) {
                    array[i] = i
                }
                index = new this.$THREE.BufferAttribute(array, 1)
                geometry.setIndex(index)
            }
            var sortArray = []
            for (var i = 0; i < length; i ++) {
                vector.fromArray(positions, i * 3)
                vector.applyMatrix4(matrix)
                sortArray.push([vector.z, i])
            }
            function numericalSort(a, b) {
                return b[0] - a[0]
            }
            sortArray.sort(numericalSort)
            var indices = index.array
            for (var i = 0; i < length; i ++) {
                indices[i] = sortArray[i][1]
            }
            geometry.index.needsUpdate = true
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.005
            this.sphere.rotation.y = 0.02 * time
            this.sphere.rotation.z = 0.02 * time
            var geometry = this.sphere.geometry
            var attributes = geometry.attributes
            for (var i = 0; i < attributes.size.array.length; i ++) {
                if (i < this.length1) {
                    attributes.size.array[i] = 16 + 12 * Math.sin(0.1 * i + time)
                }
            }
            attributes.size.needsUpdate = true
            this.sortPoints()
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglCustomAttributesPoints2-container {
    position: relative;
    width: 100%;
}
</style>
