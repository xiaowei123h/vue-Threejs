<template>
    <div class="webglPanoramaCube-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - cube panorama demo
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            controls: null,
			renderer: null,
			scene: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(90, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.z = 0.01
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableZoom = false
            this.controls.enablePan = false
            this.controls.enableDamping = true
            this.controls.rotateSpeed = - 0.25
            var textures = this.getTexturesFromAtlasFile("static/textures/cube/sun_temple_stripe.jpg", 6)
            var materials = []
            for (var i = 0; i < 6; i ++) {
                materials.push(new this.$THREE.MeshBasicMaterial({ map: textures[ i ] }))
            }
            var skyBox = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(1, 1, 1), materials)
            skyBox.geometry.scale(1, 1, - 1)
            this.scene.add(skyBox)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        getTexturesFromAtlasFile(atlasImgUrl, tilesNum) {
            var textures = []
            for (var i = 0; i < tilesNum; i ++) {
                textures[ i ] = new this.$THREE.Texture()
            }
            var imageObj = new Image()
            imageObj.onload = () => {
                var canvas, context
                var tileWidth = imageObj.height
                for (var i = 0; i < textures.length; i ++) {
                    canvas = document.createElement('canvas')
                    context = canvas.getContext('2d')
                    canvas.height = tileWidth
                    canvas.width = tileWidth
                    context.drawImage(imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth)
                    textures[ i ].image = canvas
                    textures[ i ].needsUpdate = true
                }
            }
            imageObj.src = atlasImgUrl
            return textures
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update() // required when damping is enabled
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglPanoramaCube-container {
    width: 100%;
}
</style>
