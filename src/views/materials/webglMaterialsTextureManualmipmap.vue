<template>
    <div class="webglMaterialsTextureManualmipmap-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - texture manual mipmapping example<br/>
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
		min: <span class="c">NearestMipmapNearestFilter</span><br/>
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
            scene1: null,
            scene2: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = window.innerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.windowHalfX = window.innerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglMaterialsTextureManualmipmap-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(35, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 5000)
            this.camera.position.z = 1500
            this.scene1 = new this.$THREE.Scene()
            this.scene1.background = new this.$THREE.Color(0x000000)
            this.scene1.fog = new this.$THREE.Fog(0x000000, 1500, 4000)
            this.scene2 = new this.$THREE.Scene()
            this.scene2.background = new this.$THREE.Color(0x000000)
            this.scene2.fog = new this.$THREE.Fog(0x000000, 1500, 4000)
            // GROUND
            function mipmap(size, color) {
                var imageCanvas = document.createElement("canvas")
                var context = imageCanvas.getContext("2d")
                imageCanvas.width = imageCanvas.height = size
                context.fillStyle = "#444"
                context.fillRect(0, 0, size, size)
                context.fillStyle = color
                context.fillRect(0, 0, size / 2, size / 2)
                context.fillRect(size / 2, size / 2, size / 2, size / 2)
                return imageCanvas
            }
            var canvas = mipmap(128, '#f00')
            var textureCanvas1 = new this.$THREE.CanvasTexture(canvas)
            textureCanvas1.mipmaps[ 0 ] = canvas
            textureCanvas1.mipmaps[ 1 ] = mipmap(64, '#0f0')
            textureCanvas1.mipmaps[ 2 ] = mipmap(32, '#00f')
            textureCanvas1.mipmaps[ 3 ] = mipmap(16, '#400')
            textureCanvas1.mipmaps[ 4 ] = mipmap(8, '#040')
            textureCanvas1.mipmaps[ 5 ] = mipmap(4, '#004')
            textureCanvas1.mipmaps[ 6 ] = mipmap(2, '#044')
            textureCanvas1.mipmaps[ 7 ] = mipmap(1, '#404')
            textureCanvas1.repeat.set(1000, 1000)
            textureCanvas1.wrapS = this.$THREE.RepeatWrapping
            textureCanvas1.wrapT = this.$THREE.RepeatWrapping
            var textureCanvas2 = textureCanvas1.clone()
            textureCanvas2.magFilter = this.$THREE.NearestFilter
            textureCanvas2.minFilter = this.$THREE.NearestMipmapNearestFilter
            var materialCanvas1 = new this.$THREE.MeshBasicMaterial({ map: textureCanvas1 })
            var materialCanvas2 = new this.$THREE.MeshBasicMaterial({ color: 0xffccaa, map: textureCanvas2 })
            var geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            var meshCanvas1 = new this.$THREE.Mesh(geometry, materialCanvas1)
            meshCanvas1.rotation.x = - Math.PI / 2
            meshCanvas1.scale.set(1000, 1000, 1000)
            var meshCanvas2 = new this.$THREE.Mesh(geometry, materialCanvas2)
            meshCanvas2.rotation.x = - Math.PI / 2
            meshCanvas2.scale.set(1000, 1000, 1000)
            // PAINTING
            var callbackPainting = () => {
                var image = texturePainting1.image
                texturePainting2.image = image
                texturePainting2.needsUpdate = true
                this.scene1.add(meshCanvas1)
                this.scene2.add(meshCanvas2)
                var geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
                var mesh1 = new this.$THREE.Mesh(geometry, materialPainting1)
                var mesh2 = new this.$THREE.Mesh(geometry, materialPainting2)
                addPainting(this.scene1, mesh1)
                addPainting(this.scene2, mesh2)
                function addPainting(zscene, zmesh) {
                    zmesh.scale.x = image.width / 100
                    zmesh.scale.y = image.height / 100
                    zscene.add(zmesh)
                    var meshFrame = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ color: 0x000000 }))
                    meshFrame.position.z = - 10.0
                    meshFrame.scale.x = 1.1 * image.width / 100
                    meshFrame.scale.y = 1.1 * image.height / 100
                    zscene.add(meshFrame)
                    var meshShadow = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.75, transparent: true }))
                    meshShadow.position.y = - 1.1 * image.height / 2
                    meshShadow.position.z = - 1.1 * image.height / 2
                    meshShadow.rotation.x = - Math.PI / 2
                    meshShadow.scale.x = 1.1 * image.width / 100
                    meshShadow.scale.y = 1.1 * image.height / 100
                    zscene.add(meshShadow)
                    var floorHeight = - 1.117 * image.height / 2
                    meshCanvas1.position.y = meshCanvas2.position.y = floorHeight
                }
            };
            var texturePainting1 = new this.$THREE.TextureLoader().load("static/textures/758px-Canestra_di_frutta_(Caravaggio).jpg", callbackPainting)
            var texturePainting2 = new this.$THREE.Texture()
            var materialPainting1 = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, map: texturePainting1 })
            var materialPainting2 = new this.$THREE.MeshBasicMaterial({ color: 0xffccaa, map: texturePainting2 })
            texturePainting2.minFilter = texturePainting2.magFilter = this.$THREE.NearestFilter
            texturePainting1.minFilter = texturePainting1.magFilter = this.$THREE.LinearFilter
            texturePainting1.mapping = this.$THREE.UVMapping
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
            this.mouseX = (event.clientX - this.windowHalfX)
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
            this.camera.lookAt(this.scene1.position)
            this.renderer.clear()
            this.renderer.setScissorTest(true)
            this.renderer.setScissor(0, 0, this.SCREEN_WIDTH / 2 - 2, this.SCREEN_HEIGHT)
            this.renderer.render(this.scene1, this.camera)
            this.renderer.setScissor(this.SCREEN_WIDTH / 2, 0, this.SCREEN_WIDTH / 2 - 2, this.SCREEN_HEIGHT)
            this.renderer.render(this.scene2, this.camera)
            this.renderer.setScissorTest(false)
        }
    },
}
</script>

<style scoped>
.webglMaterialsTextureManualmipmap-container {
    width: 100%;
}
.lbl { color:#fff; font-size:16px; font-weight:bold; position: absolute; bottom:0px; z-index:100; text-shadow:#000 1px 1px 1px; background-color:rgba(0,0,0,0.85); padding:1em }
#lbl_left { text-align:left; left:0px }
#lbl_right { text-align:left; right:0px }

.g { color:#aaa }
.c { color:#fa0 }
</style>
