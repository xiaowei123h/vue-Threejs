<template>
    <div class="webglInteractiveRaycastingPoints-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive - raycasting - points </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            stats: null,
			pointclouds: null,
			raycaster: null,
			intersection: null,
			spheresIndex: 0,
			clock: null,
			toggle: 0,
			mouse: null,
			spheres: [],
			threshold: 0.1,
			pointSize: 0.05,
			width: 80,
			length: 160,
			rotateY: null,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.rotateY = new this.$THREE.Matrix4().makeRotationY(0.005)
        this.init()
        this.animate()
    },
    methods: {
        generatePointCloudGeometry(color, width, length) {
            var geometry = new this.$THREE.BufferGeometry()
            var numPoints = width * length
            var positions = new Float32Array(numPoints * 3)
            var colors = new Float32Array(numPoints * 3)
            var k = 0
            for (var i = 0; i < width; i ++) {
                for (var j = 0; j < length; j ++) {
                    var u = i / width
                    var v = j / length
                    var x = u - 0.5
                    var y = (Math.cos(u * Math.PI * 4) + Math.sin(v * Math.PI * 8)) / 20
                    var z = v - 0.5
                    positions[3 * k] = x
                    positions[3 * k + 1] = y
                    positions[3 * k + 2] = z
                    var intensity = (y + 0.1) * 5
                    colors[3 * k] = color.r * intensity
                    colors[3 * k + 1] = color.g * intensity
                    colors[3 * k + 2] = color.b * intensity
                    k ++
                }
            }
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('color', new this.$THREE.BufferAttribute(colors, 3))
            geometry.computeBoundingBox()
            return geometry
        },
        generatePointcloud(color, width, length) {
            var geometry = this.generatePointCloudGeometry(color, width, length)
            var material = new this.$THREE.PointsMaterial({ size: this.pointSize, vertexColors: true })
            return new this.$THREE.Points(geometry, material)
        },
        generateIndexedPointcloud(color, width, length) {
            var geometry = this.generatePointCloudGeometry(color, width, length)
            var numPoints = width * length
            var indices = new Uint16Array(numPoints)
            var k = 0
            for (var i = 0; i < width; i ++) {
                for (var j = 0; j < length; j ++) {
                    indices[k] = k
                    k ++
                }
            }
            geometry.setIndex(new this.$THREE.BufferAttribute(indices, 1))
            var material = new this.$THREE.PointsMaterial({ size: this.pointSize, vertexColors: true })
            return new this.$THREE.Points(geometry, material)
        },
        generateIndexedWithOffsetPointcloud(color, width, length) {
            var geometry = this.generatePointCloudGeometry(color, width, length)
            var numPoints = width * length
            var indices = new Uint16Array(numPoints)
            var k = 0
            for (var i = 0; i < width; i ++) {
                for (var j = 0; j < length; j ++) {
                    indices[k] = k
                    k ++
                }
            }
            geometry.setIndex(new this.$THREE.BufferAttribute(indices, 1))
            geometry.addGroup(0, indices.length)
            var material = new this.$THREE.PointsMaterial({ size: this.pointSize, vertexColors: true })
            return new this.$THREE.Points(geometry, material)
        },
        init() {
            var container = document.getElementById('container')
            this.scene = new this.$THREE.Scene()
            this.clock = new this.$THREE.Clock()
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set(10, 10, 10)
            this.camera.lookAt(this.scene.position)
            this.camera.updateMatrix()
            //
            var pcBuffer = this.generatePointcloud(new this.$THREE.Color(1, 0, 0), this.width, this.length)
            pcBuffer.scale.set(5, 10, 10)
            pcBuffer.position.set(- 5, 0, 0)
            this.scene.add(pcBuffer)
            var pcIndexed = this.generateIndexedPointcloud(new this.$THREE.Color(0, 1, 0), this.width, this.length)
            pcIndexed.scale.set(5, 10, 10)
            pcIndexed.position.set(0, 0, 0)
            this.scene.add(pcIndexed)
            var pcIndexedOffset = this.generateIndexedWithOffsetPointcloud(new this.$THREE.Color(0, 1, 1), this.width, this.length)
            pcIndexedOffset.scale.set(5, 10, 10)
            pcIndexedOffset.position.set(5, 0, 0)
            this.scene.add(pcIndexedOffset)
            this.pointclouds = [pcBuffer, pcIndexed, pcIndexedOffset]
            //
            var sphereGeometry = new this.$THREE.SphereBufferGeometry(0.1, 32, 32)
            var sphereMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xff0000 })
            for (var i = 0; i < 40; i ++) {
                var sphere = new this.$THREE.Mesh(sphereGeometry, sphereMaterial)
                this.scene.add(sphere)
                this.spheres.push(sphere)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            this.raycaster = new this.$THREE.Raycaster()
            this.raycaster.params.Points.threshold = this.threshold
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
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
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.camera.applyMatrix4(this.rotateY)
            this.camera.updateMatrixWorld()
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersections = this.raycaster.intersectObjects(this.pointclouds)
            this.intersection = (intersections.length) > 0 ? intersections[0] : null
            if (this.toggle > 0.02 && this.intersection !== null) {
                this.spheres[this.spheresIndex].position.copy(this.intersection.point)
                this.spheres[this.spheresIndex].scale.set(1, 1, 1)
                this.spheresIndex = (this.spheresIndex + 1) % this.spheres.length
                this.toggle = 0
            }
            for (var i = 0; i < this.spheres.length; i ++) {
                var sphere = this.spheres[i]
                sphere.scale.multiplyScalar(0.98)
                sphere.scale.clampScalar(0.01, 1)
            }
            this.toggle += this.clock.getDelta()
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInteractiveRaycastingPoints-container {
    position: relative;
    width: 100%;
}
</style>
