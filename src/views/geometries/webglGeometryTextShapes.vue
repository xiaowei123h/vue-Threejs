<template>
    <div class="webglGeometryTextShapes-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - simple text from json fonts
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: '',
            scene: '',
            renderer: '',
            loader: ''
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
                var color = 0x006699
                var matDark = new that.$THREE.LineBasicMaterial({
                    color: color,
                    side: that.$THREE.DoubleSide
                })
                var matLite = new that.$THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.4,
                    side: that.$THREE.DoubleSide
                })
                var message = "   Three.js\nSimple text."
                var shapes = font.generateShapes(message, 100)
                geometry = new that.$THREE.ShapeBufferGeometry(shapes)
                geometry.computeBoundingBox()
                var xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
                geometry.translate(xMid, 0, 0)
                // make shape ( N.B. edge view not visible )
                var text = new that.$THREE.Mesh(geometry, matLite)
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
                var lineText = new that.$THREE.Object3D()
                for (var i = 0; i < shapes.length; i ++) {
                    var shape = shapes[i]
                    var points = shape.getPoints()
                    var geometry = new that.$THREE.BufferGeometry().setFromPoints(points)
                    geometry.translate(xMid, 0, 0)
                    var lineMesh = new that.$THREE.Line(geometry, matDark)
                    lineText.add(lineMesh)
                }
                that.scene.add(lineText)
            }) //end load function
            this.renderer = new this.$THREE.WebGLRenderer({antialias: true})
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryTextShapes-container')[0].appendChild(this.renderer.domElement)
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
.webglGeometryTextShapes-container {
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
