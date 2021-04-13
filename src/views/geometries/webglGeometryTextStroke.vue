<template>
    <div class="webglGeometryTextStroke-container">
        <div id="info">
			<a href="https://this.$threejs.org" target="_blank" rel="noopener">this.$three.js</a> webgl - simple text from json fonts
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { SVGLoader } from '@/components/jsm/loaders/SVGLoader.js'
export default {
    data() {
        return {
            camera: '',
            scene: '',
            renderer: '',
            loader: '',
            geometry: ''
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, (this.$webglInnerWidth) / window.innerHeight, 1, 10000)
            this.camera.position.set(0, - 400, 600)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            this.loader = new this.$THREE.FontLoader()
            var that = this
            this.loader.load('static/fonts/helvetiker_regular.typeface.json', function (font) {
                var color = new that.$THREE.Color(0x006699)
                var matDark = new that.$THREE.MeshBasicMaterial({
                    color: color,
                    side: that.$THREE.DoubleSide
                })
                var matLite = new that.$THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.4,
                    side: that.$THREE.DoubleSide
                })
                var message = "   this.$Three.js\nStroke text."
                var shapes = font.generateShapes(message, 100)
                that.geometry = new that.$THREE.ShapeBufferGeometry(shapes)
                that.geometry.computeBoundingBox()
                var xMid = - 0.5 * (that.geometry.boundingBox.max.x - that.geometry.boundingBox.min.x)
                that.geometry.translate(xMid, 0, 0)
                // make shape ( N.B. edge view not visible )
                var text = new that.$THREE.Mesh(that.geometry, matLite)
                text.position.z =- 150
                that.scene.add(text)
                // make line shape ( N.B. edge view remains visible )
                var holeShapes = []
                for (var i = 0; i < shapes.length; i ++) {
                    var shape = shapes[i]
                    if (shape.holes && shape.holes.length > 0) {
                        for (var j = 0; j < shape.holes.length; j ++) {
                            var hole = shape.holes[j]
                            holeShapes.push(hole)
                        }
                    }
                }
                shapes.push.apply(shapes, holeShapes)
                var style = SVGLoader.getStrokeStyle(5, color.getStyle())
                var strokeText = new that.$THREE.Group()
                for (var i = 0; i < shapes.length; i ++) {
                    var shape = shapes[i]
                    var points = shape.getPoints()
                    var geometry = SVGLoader.pointsToStroke(points, style)
                    geometry.translate(xMid, 0, 0)
                    var strokeMesh = new that.$THREE.Mesh(geometry, matDark)
                    strokeText.add(strokeMesh)
                }
                that.scene.add(strokeText)
            }) //end load function
            this.renderer = new this.$THREE.WebGLRenderer({antialias: true})
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryTextStroke-container')[0].appendChild(this.renderer.domElement)
            // document.body.appendChild(this.renderer.domElement)
            const controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set( 0, 0, 0 )
            controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        animate() {
            requestAnimationFrame(this.animate)
			this.render()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryTextStroke-container {
    position: relative;
    background-color: #f0f0f0;
	color: #444;
}
#info {
    color: #000;
}
#info a {
    color: #08f;
}
</style>
