<template>
    <div class="webglInteractiveCubesGpu-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - gpu picking
		</div>
		<div id="container"></div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { BufferGeometryUtils } from '@/components/jsm/utils/BufferGeometryUtils.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            pickingTexture: null,
            pickingScene: null,
			highlightBox: null,
			pickingData: [],
			mouse: null,
			offset: null,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.offset = new this.$THREE.Vector3(10, 10, 10)
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById("container")
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.pickingScene = new this.$THREE.Scene()
            this.pickingTexture = new this.$THREE.WebGLRenderTarget(1, 1)
            this.scene.add(new this.$THREE.AmbientLight(0x555555))
            var light = new this.$THREE.SpotLight(0xffffff, 1.5)
            light.position.set(0, 500, 2000)
            this.scene.add(light)
            var pickingMaterial = new this.$THREE.MeshBasicMaterial({ vertexColors: true })
            var defaultMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, vertexColors: true, shininess: 0	})
            var that = this
            function applyVertexColors(geometry, color) {
                var position = geometry.attributes.position
                var colors = []
                for (var i = 0; i < position.count; i ++) {
                    colors.push(color.r, color.g, color.b)
                }
                geometry.setAttribute('color', new that.$THREE.Float32BufferAttribute(colors, 3))
            }
            var geometriesDrawn = []
            var geometriesPicking = []
            var matrix = new this.$THREE.Matrix4()
            var quaternion = new this.$THREE.Quaternion()
            var color = new this.$THREE.Color()
            for (var i = 0; i < 5000; i ++) {
                var geometry = new this.$THREE.BoxBufferGeometry()
                var position = new this.$THREE.Vector3()
                position.x = Math.random() * 10000 - 5000
                position.y = Math.random() * 6000 - 3000
                position.z = Math.random() * 8000 - 4000
                var rotation = new this.$THREE.Euler()
                rotation.x = Math.random() * 2 * Math.PI
                rotation.y = Math.random() * 2 * Math.PI
                rotation.z = Math.random() * 2 * Math.PI
                var scale = new this.$THREE.Vector3()
                scale.x = Math.random() * 200 + 100
                scale.y = Math.random() * 200 + 100
                scale.z = Math.random() * 200 + 100
                quaternion.setFromEuler(rotation)
                matrix.compose(position, quaternion, scale)
                geometry.applyMatrix4(matrix)
                // give the geometry's vertices a random color, to be displayed
                applyVertexColors(geometry, color.setHex(Math.random() * 0xffffff))
                geometriesDrawn.push(geometry)
                geometry = geometry.clone()
                // give the geometry's vertices a color corresponding to the "id"
                applyVertexColors(geometry, color.setHex(i))
                geometriesPicking.push(geometry)
                this.pickingData[ i ] = {
                    position: position,
                    rotation: rotation,
                    scale: scale
                }
            }
            var objects = new this.$THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geometriesDrawn), defaultMaterial)
            this.scene.add(objects)
            this.pickingScene.add(new this.$THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geometriesPicking), pickingMaterial))
            this.highlightBox = new this.$THREE.Mesh(
                new this.$THREE.BoxBufferGeometry(),
                new this.$THREE.MeshLambertMaterial({ color: 0xffff00 }
            ))
            this.scene.add(this.highlightBox)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.rotateSpeed = 1.0
            this.controls.zoomSpeed = 1.2
            this.controls.panSpeed = 0.8
            this.controls.noZoom = false
            this.controls.noPan = false
            this.controls.staticMoving = true
            this.controls.dynamicDampingFactor = 0.3
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
            this.renderer.domElement.addEventListener('mousemove', this.onMouseMove)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onMouseMove(e) {
            this.mouse.x = e.clientX - 281
            this.mouse.y = e.clientY
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        pick() {
            //render the picking scene off-screen
            // set the view offset to represent just a single pixel under the mouse
            this.camera.setViewOffset(this.renderer.domElement.width, this.renderer.domElement.height, this.mouse.x * window.devicePixelRatio | 0, this.mouse.y * window.devicePixelRatio | 0, 1, 1)
            // render the scene
            this.renderer.setRenderTarget(this.pickingTexture)
            this.renderer.render(this.pickingScene, this.camera)
            // clear the view offset so rendering returns to normal
            this.camera.clearViewOffset()
            //create buffer for reading single pixel
            var pixelBuffer = new Uint8Array(4)
            //read the pixel
            this.renderer.readRenderTargetPixels(this.pickingTexture, 0, 0, 1, 1, pixelBuffer)
            //interpret the pixel as an ID
            var id = (pixelBuffer[ 0 ] << 16) | (pixelBuffer[ 1 ] << 8) | (pixelBuffer[ 2 ])
            var data = this.pickingData[ id ]
            if (data) {
                //move our highlightBox so that it surrounds the picked object
                if (data.position && data.rotation && data.scale) {
                    this.highlightBox.position.copy(data.position)
                    this.highlightBox.rotation.copy(data.rotation)
                    this.highlightBox.scale.copy(data.scale).add(this.offset)
                    this.highlightBox.visible = true
                }
            } else {
                this.highlightBox.visible = false
            }
        },
        render() {
            this.controls.update()
            this.pick()
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInteractiveCubesGpu-container {
    position: relative;
    width: 100%;
    background-color: #fff;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
