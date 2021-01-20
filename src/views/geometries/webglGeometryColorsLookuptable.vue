<template>
    <div class="webglGeometryColorsLookuptable-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - lookup table<br/>
			vertex color values from a range of data values
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Lut } from '@/components/jsm/math/Lut.js'
export default {
    data() {
        return {
            container: null,
            perpCamera: null,
            orthoCamera: null,
            renderer: null,
            lut: null,
            mesh: null,
            sprite: null,
            scene: null,
            uiScene: null,
            params: null,
            gui: null
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.uiScene = new this.$THREE.Scene()
            this.lut = new Lut()
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            this.perpCamera = new this.$THREE.PerspectiveCamera(60, width / height, 1, 100)
            this.perpCamera.position.set(0, 0, 10)
            this.scene.add(this.perpCamera)
            this.orthoCamera = new this.$THREE.OrthographicCamera(- 1, 1, 1, - 1, 1, 2)
            this.orthoCamera.position.set(0.5, 0, 1)
            this.sprite = new this.$THREE.Sprite(new this.$THREE.SpriteMaterial({
                map: new this.$THREE.CanvasTexture(this.lut.createCanvas())
            }))
            this.sprite.scale.x = 0.125
            this.uiScene.add(this.sprite)
            this.mesh = new this.$THREE.Mesh(undefined, new this.$THREE.MeshLambertMaterial({
                side: this.$THREE.DoubleSide,
                color: 0xF5F5F5,
                vertexColors: true
            }))
            this.scene.add(this.mesh)
            this.params	= {
                colorMap: 'rainbow',
            }
            this.loadModel()
            var pointLight = new this.$THREE.PointLight(0xffffff, 1)
            this.perpCamera.add(pointLight)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.autoClear = false
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(width, height)
            this.container.appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
            var controls = new OrbitControls(this.perpCamera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            this.gui = new GUI()
            this.gui.add(this.params, 'colorMap', [ 'rainbow', 'cooltowarm', 'blackbody', 'grayscale' ]).onChange(() => {
                this.updateColors()
                this.render()
            })
        },
        onWindowResize() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.perpCamera.aspect = width / height
            this.perpCamera.updateProjectionMatrix()
            this.renderer.setSize(width, height)
            this.render()
        },
        render() {
            this.renderer.clear()
            this.renderer.render(this.scene, this.perpCamera)
            this.renderer.render(this.uiScene, this.orthoCamera)
        },
        loadModel() {
            var loader = new this.$THREE.BufferGeometryLoader()
            loader.load('static/models/json/pressure.json', (geometry) => {
                geometry.center()
                geometry.computeVertexNormals()
                // default color attribute
                var colors = []
                for (var i = 0, n = geometry.attributes.position.count; i < n; ++ i) {
                    colors.push(1, 1, 1)
                }
                geometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors, 3))
                this.mesh.geometry = geometry
                this.updateColors()
                this.render()
            })
        },
        updateColors() {
            this.lut.setColorMap(this.params.colorMap)
            this.lut.setMax(2000)
            this.lut.setMin(0)
            var geometry = this.mesh.geometry
            var pressures = geometry.attributes.pressure
            var colors = geometry.attributes.color
            for (var i = 0; i < pressures.array.length; i ++) {
                var colorValue = pressures.array[ i ]
                var color = this.lut.getColor(colorValue)
                if (color === undefined) {
                    console.log('Unable to determine color for value:', colorValue)
                } else {
                    colors.setXYZ(i, color.r, color.g, color.b)
                }
            }
            colors.needsUpdate = true
            var map = this.sprite.material.map
            this.lut.updateCanvas(map.image)
            map.needsUpdate = true
        }
    }
}
</script>

<style scoped>
.webglGeometryColorsLookuptable-container{
    width: 100%;
    background-color: #fff;
	color: #444;
}
.webglGeometryColorsLookuptable-container a {
    color: red;
}
</style>
