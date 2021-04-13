<template>
    <div class="webxrVrPanorama-container">
        
    </div>
</template>

<script>
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
export default {
    data() {
        return {
            camera: null,
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
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.xr.enabled = true
            this.renderer.xr.setReferenceSpaceType('local')
            document.getElementsByClassName('webxrVrPanorama-container')[0].appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrPanorama-container')[0].appendChild(VRButton.createButton(this.renderer))
            //
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.layers.enable(1)
            var geometry = new this.$THREE.BoxBufferGeometry(100, 100, 100)
            geometry.scale(1, 1, - 1)
            var textures = this.getTexturesFromAtlasFile("static/textures/cube/sun_temple_stripe_stereo.jpg", 12)
            var materials = []
            for (var i = 0; i < 6; i ++) {
                materials.push(new this.$THREE.MeshBasicMaterial({ map: textures[ i ] }))
            }
            var skyBox = new this.$THREE.Mesh(geometry, materials)
            skyBox.layers.set(1)
            this.scene.add(skyBox)
            var materialsR = []
            for (var i = 6; i < 12; i ++) {
                materialsR.push(new this.$THREE.MeshBasicMaterial({ map: textures[ i ] }))
            }
            var skyBoxR = new this.$THREE.Mesh(geometry, materialsR)
            skyBoxR.layers.set(2)
            this.scene.add(skyBoxR)
            window.addEventListener('resize', this.onWindowResize, false)
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrPanorama-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrPanorama-container')[0].style.height = 'calc(100vh - 49px)'
            }
        },
        getTexturesFromAtlasFile(atlasImgUrl, tilesNum) {
            var textures = []
            for (var i = 0; i < tilesNum; i ++) {
                textures[ i ] = new this.$THREE.Texture()
            }
            var loader = new this.$THREE.ImageLoader()
            loader.load(atlasImgUrl, (imageObj) => {
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
            })
            return textures
        },
        onWindowResize() {
            if (window.innerWidth >= 640) {
                document.getElementsByClassName('webxrVrPanorama-container')[0].style.height = '100vh'
            } else {
                document.getElementsByClassName('webxrVrPanorama-container')[0].style.height = 'calc(100vh - 49px)'
            }
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrPanorama-container {
    position: relative;
    width: 100%;
}
</style>
