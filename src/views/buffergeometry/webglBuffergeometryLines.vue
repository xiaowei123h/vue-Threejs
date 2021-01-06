<template>
    <div class="webglBuffergeometryLines-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry - lines</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            clock: null,
            camera: null,
            scene: null,
            renderer: null,
			line: null,
			segments: 10000,
			r: 800,
			t: 0,
			params: {
				morphTargets: false
            },
            gui: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            //
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 1, 4000)
            this.camera.position.z = 2750
            this.scene = new this.$THREE.Scene()
            this.clock = new this.$THREE.Clock()
            var geometry = new this.$THREE.BufferGeometry()
            var material = new this.$THREE.LineBasicMaterial({ vertexColors: true, morphTargets: true })
            var positions = []
            var colors = []
            for (var i = 0; i < this.segments; i ++) {
                var x = Math.random() * this.r - this.r / 2
                var y = Math.random() * this.r - this.r / 2
                var z = Math.random() * this.r - this.r / 2
                // positions
                positions.push(x, y, z)
                // colors
                colors.push((x / this.r) + 0.5)
                colors.push((y / this.r) + 0.5)
                colors.push((z / this.r) + 0.5)
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
            geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
            this.generateMorphTargets(geometry)
            geometry.computeBoundingSphere()
            this.line = new this.$THREE.Line(geometry, material)
            this.scene.add(this.line)
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            this.gui = new GUI()
            this.gui.add(this.params, 'morphTargets')
            this.gui.open()
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        generateMorphTargets(geometry) {
            var data = []
            for (var i = 0; i < this.segments; i ++) {
                var x = Math.random() * this.r - this.r / 2
                var y = Math.random() * this.r - this.r / 2
                var z = Math.random() * this.r - this.r / 2
                data.push(x, y, z)
            }
            var morphTarget = new this.$THREE.Float32BufferAttribute(data, 3)
            morphTarget.name = 'target1'
            geometry.morphAttributes.position = [ morphTarget ]
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var delta = this.clock.getDelta()
            var time = this.clock.getElapsedTime()
            this.line.rotation.x = time * 0.25
            this.line.rotation.y = time * 0.5
            if (this.params.morphTargets) {
                this.t += delta * 0.5
                this.line.morphTargetInfluences[ 0 ] = Math.abs(Math.sin(this.t))
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryLines-container {
    width: 100%;
}
</style>
