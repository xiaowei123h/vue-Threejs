<template>
    <div class="webglBuffergeometrySelectiveDraw-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> buffergeometry - selective - draw
			<div id="title"></div>
			<div id="ui"><a href="#" id="hideLines">CULL SOME LINES</a> - <a href="#" id="showAllLines">SHOW ALL LINES</a></div>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            vertexshader: null,
            fragmentshader: null,
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            geometry: null,
            mesh: null,
			numLat: 100,
			numLng: 200,
			numLinesCulled: 0
        }
    },
    mounted() {
        this.vertexshader = `
            attribute float visible;
            varying float vVisible;
            attribute vec3 vertColor;
            varying vec3 vColor;

            void main() {

                vColor = vertColor;
                vVisible = visible;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

            }`
        this.fragmentshader = `
            varying float vVisible;
            varying vec3 vColor;

            void main() {

                if ( vVisible > 0.0 ) {

                    gl_FragColor = vec4( vColor, 1.0 );

                } else {

                    discard;

                }

            }`
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglBuffergeometrySelectiveDraw-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.01, 10)
            this.camera.position.z = 3.5
            this.scene.add(new this.$THREE.AmbientLight(0x444444))
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglBuffergeometrySelectiveDraw-container')[0].appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
            this.addLines(1.0)
            var hideLinesButton = document.getElementById('hideLines')
            hideLinesButton.addEventListener('click', this.hideLines)
            var showAllLinesButton = document.getElementById('showAllLines')
            showAllLinesButton.addEventListener('click', this.showAllLines)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        addLines(radius) {
            this.geometry = new this.$THREE.BufferGeometry()
            var linePositions = new Float32Array(this.numLat * this.numLng * 3 * 2)
            var lineColors = new Float32Array(this.numLat * this.numLng * 3 * 2)
            var visible = new Float32Array(this.numLat * this.numLng * 2)
            for (var i = 0; i < this.numLat; ++ i) {
                for (var j = 0; j < this.numLng; ++ j) {
                    var lat = (Math.random() * Math.PI) / 50.0 + i / this.numLat * Math.PI
                    var lng = (Math.random() * Math.PI) / 50.0 + j / this.numLng * 2 * Math.PI
                    var index = i * this.numLng + j
                    linePositions[index * 6 + 0] = 0
                    linePositions[index * 6 + 1] = 0
                    linePositions[index * 6 + 2] = 0
                    linePositions[index * 6 + 3] = radius * Math.sin(lat) * Math.cos(lng)
                    linePositions[index * 6 + 4] = radius * Math.cos(lat)
                    linePositions[index * 6 + 5] = radius * Math.sin(lat) * Math.sin(lng)
                    var color = new this.$THREE.Color(0xffffff)
                    color.setHSL(lat / Math.PI, 1.0, 0.2)
                    lineColors[index * 6 + 0] = color.r
                    lineColors[index * 6 + 1] = color.g
                    lineColors[index * 6 + 2] = color.b
                    color.setHSL(lat / Math.PI, 1.0, 0.7)
                    lineColors[index * 6 + 3] = color.r
                    lineColors[index * 6 + 4] = color.g
                    lineColors[index * 6 + 5] = color.b
                    // non-0 is visible
                    visible[index * 2 + 0] = 1.0
                    visible[index * 2 + 1] = 1.0
                }
            }
            this.geometry.setAttribute('position', new this.$THREE.BufferAttribute(linePositions, 3))
            this.geometry.setAttribute('vertColor', new this.$THREE.BufferAttribute(lineColors, 3))
            this.geometry.setAttribute('visible', new this.$THREE.BufferAttribute(visible, 1))
            this.geometry.computeBoundingSphere()
            var shaderMaterial = new this.$THREE.ShaderMaterial({
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader
            })
            this.mesh = new this.$THREE.LineSegments(this.geometry, shaderMaterial)
            this.scene.add(this.mesh)
            this.updateCount()
        },
        updateCount() {
            var str = '1 draw call, ' + this.numLat * this.numLng + ' lines, ' + this.numLinesCulled + ' culled (<a target="_blank" href="http://callum.com">author</a>)'
            document.getElementById('title').innerHTML = str.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        hideLines() {
            for(var i = 0; i < this.geometry.attributes.visible.array.length; i += 2) {
                if (Math.random() > 0.75) {
                    if (this.geometry.attributes.visible.array[i + 0]) {
                        ++ numLinesCulled
                    }
                    this.geometry.attributes.visible.array[i + 0] = 0
                    this.geometry.attributes.visible.array[i + 1] = 0
                }
            }
            this.geometry.attributes.visible.needsUpdate = true
            this.updateCount()
        },
        showAllLines() {
            this.numLinesCulled = 0
            for ( var i = 0; i < this.geometry.attributes.visible.array.length; i += 2 ) {
                this.geometry.attributes.visible.array[i + 0] = 1
                this.geometry.attributes.visible.array[i + 1] = 1
            }
            this.geometry.attributes.visible.needsUpdate = true
            this.updateCount()
        },
        animate() {
            requestAnimationFrame(this.animate)
            var time = Date.now() * 0.001
            this.mesh.rotation.x = time * 0.25
            this.mesh.rotation.y = time * 0.5
            this.stats.update()
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometrySelectiveDraw-container {
    position: relative;
    width: 100%;
}
</style>
