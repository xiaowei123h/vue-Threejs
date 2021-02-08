<template>
    <div class="webglModifierSubdivision-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - subdivision modifier<br/ >
			Original Geometry: <span id="original-vertex-count"></span> vertices and <span id="original-face-count"></span> faces<br/ >
			Smooth Geometry: <span id="smooth-vertex-count"></span> vertices and <span id="smooth-face-count"></span> faces<br/ >
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { SubdivisionModifier } from '@/components/jsm/modifiers/SubdivisionModifier.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            smoothMesh: null,
            wireframe: null,
			smoothMaterial: null,
			wireframeMaterial: null,
			faceIndices: [ 'a', 'b', 'c' ],
			params: {
				subdivisions: 2
            },
            gui: null
        }
    },
    mounted() {
        this.smoothMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, vertexColors: true })
        this.wireframeMaterial = new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, opacity: 0.15, transparent: true })
        this.init()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 500)
            this.camera.position.z = 100
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            var light = new this.$THREE.PointLight(0xffffff, 1.5)
            light.position.set(1000, 1000, 2000)
            this.scene.add(light)
            var loader = new this.$THREE.BufferGeometryLoader()
            loader.load('static/models/json/WaltHeadLo_buffergeometry.json', (bufferGeometry) => {
                // converting to legacy this.$THREE.Geometry because SubdivisionModifier only returns this.$THREE.Geometry
                var geometry = new this.$THREE.Geometry().fromBufferGeometry(bufferGeometry)
                geometry.mergeVertices()
                var material = new this.$THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true })
                var mesh = new this.$THREE.Mesh(bufferGeometry, material)
                this.scene.add(mesh)
                this.gui = new GUI()
                this.gui.add(this.params, 'subdivisions', 0, 3).step(1).onChange((subdivisions) => {
                    this.subdivide(geometry, subdivisions)
                })
                //
                this.subdivide(geometry, this.params.subdivisions)
                this.animate()
            });
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglModifierSubdivision-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglModifierSubdivision-container')[0].appendChild(this.stats.dom)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 50
            controls.maxDistance = 400
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.smoothMesh = new this.$THREE.Mesh(undefined, this.smoothMaterial)
            this.wireframe = new this.$THREE.Mesh(undefined, this.wireframeMaterial)
            this.scene.add(this.smoothMesh, this.wireframe)
        },
        subdivide(geometry, subdivisions) {
            var modifier = new SubdivisionModifier(subdivisions)
            var smoothGeometry = modifier.modify(geometry)
            // colorify faces
            for (var i = 0; i < smoothGeometry.faces.length; i ++) {
                var face = smoothGeometry.faces[ i ]
                for (var j = 0; j < 3; j ++) {
                    var vertexIndex = face[ this.faceIndices[ j ] ]
                    var vertex = smoothGeometry.vertices[ vertexIndex ]
                    var hue = (vertex.y / 200) + 0.5
                    var color = new this.$THREE.Color().setHSL(hue, 1, 0.5)
                    face.vertexColors[ j ] = color
                }
            }
            // convert to this.$THREE.BufferGeometry
            if (this.smoothMesh.geometry) this.smoothMesh.geometry.dispose()
            this.smoothMesh.geometry = new this.$THREE.BufferGeometry().fromGeometry(smoothGeometry)
            this.wireframe.geometry = this.smoothMesh.geometry
            //
            this.updateUI(geometry, smoothGeometry)
        },
        updateUI(originalGeometry, smoothGeometry) {
            document.getElementById('original-vertex-count').textContent = originalGeometry.vertices.length
            document.getElementById('original-face-count').textContent = originalGeometry.faces.length
            document.getElementById('smooth-vertex-count').textContent = smoothGeometry.vertices.length
            document.getElementById('smooth-face-count').textContent = smoothGeometry.faces.length
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
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglModifierSubdivision-container {
    width: 100%;
}
#info {
    background-color: #f0f0f0;
    color: #444;
}
#info a {
    color: #08f;
}
</style>
