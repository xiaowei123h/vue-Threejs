<template>
    <div class="svgLines-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> svg - lines
		</div>
    </div>
</template>

<script>
import { SVGRenderer } from '@/components/jsm/renderers/SVGRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$moduleTHREE.PerspectiveCamera(33, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.z = 10
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0, 0, 0)
            this.renderer = new SVGRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('svgLines-container')[0].appendChild(this.renderer.domElement)
            //
            var vertices = []
            var divisions = 50
            for (var i = 0; i <= divisions; i ++) {
                var v = (i / divisions) * (Math.PI * 2)
                var x = Math.sin(v)
                var z = Math.cos(v)
                vertices.push(x, 0, z)
            }
            var geometry = new this.$moduleTHREE.BufferGeometry()
            geometry.setAttribute('position', new this.$moduleTHREE.Float32BufferAttribute(vertices, 3))
            //
            for (var i = 1; i <= 3; i ++) {
                var material = new this.$moduleTHREE.LineBasicMaterial({
                    color: Math.random() * 0xffffff,
                    linewidth: 10
                })
                var line = new this.$moduleTHREE.Line(geometry, material)
                line.scale.setScalar(i / 3)
                this.scene.add(line)
            }
            var material = new this.$moduleTHREE.LineDashedMaterial({
                color: 'blue',
                linewidth: 1,
                dashSize: 10,
                gapSize: 10
            })
            var line = new this.$moduleTHREE.Line(geometry, material)
            line.scale.setScalar(2)
            this.scene.add(line)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            var count = 0
            var time = performance.now() / 1000
            this.scene.traverse(function (child) {
                child.rotation.x = count + (time / 3)
                child.rotation.z = count + (time / 4)
                count ++
            })
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        }
    },
}
</script>

<style scoped>
.svgLines-container {
    position: relative;
    width: 100%;
}
svg {
    display: block;
}
</style>
