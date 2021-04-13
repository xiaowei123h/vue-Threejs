<template>
    <div class="webglMaterialsTextureFilters-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - texture filtering example<br/>
			painting by <a href="http://en.wikipedia.org/wiki/Basket_of_Fruit_%28Caravaggio%29">Caravaggio</a>
		</div>

		<div id="lbl_left" class="lbl">
		Floor <span class="g">(128x128)</span><br/>
		mag: <span class="c">Linear</span><br/>
		min: <span class="c">LinearMipmapLinear</span><br/>
		<br/>
		Painting <span class="g">(748x600)</span><br/>
		mag: <span class="c">Linear</span><br/>
		min: <span class="c">Linear</span>
		</div>

		<div id="lbl_right" class="lbl">
		Floor <br/>
		mag: <span class="c">Nearest</span><br/>
		min: <span class="c">Nearest</span><br/>
		<br/>
		Painting <br/>
		mag: <span class="c">Nearest</span><br/>
		min: <span class="c">Nearest</span>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
			container: null,
            camera: null,
            scene: null,scene2: null,renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsTextureFilters-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(35, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 5000)
            this.camera.position.z = 1500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x000000)
            this.scene.fog = new this.$THREE.Fog(0x000000, 1500, 4000)
            this.scene2 = new this.$THREE.Scene()
            this.scene2.background = new this.$THREE.Color(0x000000)
            this.scene2.fog = new this.$THREE.Fog(0x000000, 1500, 4000)
            // GROUND
            var imageCanvas = document.createElement("canvas")
            var context = imageCanvas.getContext("2d")
            imageCanvas.width = imageCanvas.height = 128
            context.fillStyle = "#444"
            context.fillRect(0, 0, 128, 128)
            context.fillStyle = "#fff"
            context.fillRect(0, 0, 64, 64)
            context.fillRect(64, 64, 64, 64)
            var textureCanvas = new this.$THREE.CanvasTexture(imageCanvas)
            textureCanvas.repeat.set(1000, 1000)
            textureCanvas.wrapS = this.$THREE.RepeatWrapping
            textureCanvas.wrapT = this.$THREE.RepeatWrapping
            var textureCanvas2 = textureCanvas.clone()
            textureCanvas2.magFilter = this.$THREE.NearestFilter
            textureCanvas2.minFilter = this.$THREE.NearestFilter
            var	materialCanvas = new this.$THREE.MeshBasicMaterial({ map: textureCanvas })
            var materialCanvas2 = new this.$THREE.MeshBasicMaterial({ color: 0xffccaa, map: textureCanvas2 })
            var geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            var meshCanvas = new this.$THREE.Mesh(geometry, materialCanvas)
            meshCanvas.rotation.x = - Math.PI / 2
            meshCanvas.scale.set(1000, 1000, 1000)
            var meshCanvas2 = new this.$THREE.Mesh(geometry, materialCanvas2)
            meshCanvas2.rotation.x = - Math.PI / 2
            meshCanvas2.scale.set(1000, 1000, 1000)
            var that = this
            // PAINTING
            var callbackPainting = function () {
                var image = texturePainting.image
                texturePainting2.image = image
                texturePainting2.needsUpdate = true
                that.scene.add(meshCanvas)
                that.scene2.add(meshCanvas2)
                var geometry = new that.$THREE.PlaneBufferGeometry(100, 100)
                var mesh = new that.$THREE.Mesh(geometry, materialPainting)
                var mesh2 = new that.$THREE.Mesh(geometry, materialPainting2)
                addPainting(that.scene, mesh)
                addPainting(that.scene2, mesh2)
                function addPainting(zscene, zmesh) {
                    zmesh.scale.x = image.width / 100
                    zmesh.scale.y = image.height / 100
                    zscene.add(zmesh)
                    var meshFrame = new that.$THREE.Mesh(geometry, new that.$THREE.MeshBasicMaterial({ color: 0x000000 }))
                    meshFrame.position.z = - 10.0
                    meshFrame.scale.x = 1.1 * image.width / 100
                    meshFrame.scale.y = 1.1 * image.height / 100
                    zscene.add(meshFrame)
                    var meshShadow = new that.$THREE.Mesh(geometry, new that.$THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.75, transparent: true }))
                    meshShadow.position.y = - 1.1 * image.height / 2
                    meshShadow.position.z = - 1.1 * image.height / 2
                    meshShadow.rotation.x = - Math.PI / 2
                    meshShadow.scale.x = 1.1 * image.width / 100
                    meshShadow.scale.y = 1.1 * image.height / 100
                    zscene.add(meshShadow)
                    var floorHeight = - 1.117 * image.height / 2
                    meshCanvas.position.y = meshCanvas2.position.y = floorHeight
                }
            }
            var texturePainting = new this.$THREE.TextureLoader().load("static/textures/758px-Canestra_di_frutta_(Caravaggio).jpg", callbackPainting)
            var texturePainting2 = new this.$THREE.Texture()
            var materialPainting = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, map: texturePainting })
            var materialPainting2 = new this.$THREE.MeshBasicMaterial({ color: 0xffccaa, map: texturePainting2 })
            texturePainting2.minFilter = texturePainting2.magFilter = this.$THREE.NearestFilter
            texturePainting.minFilter = texturePainting.magFilter = this.$THREE.LinearFilter
            texturePainting.mapping = this.$THREE.UVMapping
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.renderer.autoClear = false
            this.renderer.domElement.style.position = "relative"
            this.container.appendChild(this.renderer.domElement)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onDocumentMouseMove(event) {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.mouseX = (event.clientX - x - this.windowHalfX)
            this.mouseY = (event.clientY - this.windowHalfY)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- (this.mouseY - 200) - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.clear()
            this.renderer.setScissorTest(true)
            this.renderer.setScissor(0, 0, this.SCREEN_WIDTH / 2 - 2, this.SCREEN_HEIGHT)
            this.renderer.render(this.scene, this.camera)
            this.renderer.setScissor(this.SCREEN_WIDTH / 2, 0, this.SCREEN_WIDTH / 2 - 2, this.SCREEN_HEIGHT)
            this.renderer.render(this.scene2, this.camera)
            this.renderer.setScissorTest(false)
        }
    },
}
</script>

<style scoped>
.webglMaterialsTextureFilters-container {
    position: relative;
    width: 100%;
}
.lbl { color:#fff; font-size:16px; font-weight:bold; position: absolute; bottom:0px; z-index:100; text-shadow:#000 1px 1px 1px; background-color:rgba(0,0,0,0.85); padding:1em }
#lbl_left { text-align:left; left:0px }
#lbl_right { text-align:left; right:0px }

.g { color:#aaa }
.c { color:#fa0 }
</style>
