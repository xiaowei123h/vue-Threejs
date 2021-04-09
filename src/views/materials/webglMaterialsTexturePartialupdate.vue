<template>
    <div class="webglMaterialsTexturePartialupdate-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - partial texture update <br/>
			replace parts of an existing texture with all data of another texture
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
            dataTexture: null,
            diffuseMap: null,
			last: 0,
			position: null,
			color: null,
        }
    },
    mounted() {
        this.position = new this.$THREE.Vector2()
        this.color = new this.$THREE.Color()
        this.init()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 0.01, 10)
            this.camera.position.z = 2
            this.scene = new this.$THREE.Scene()
            this.clock = new this.$THREE.Clock()
            var loader = new this.$THREE.TextureLoader()
            this.diffuseMap = loader.load('static/textures/floors/FloorsCheckerboard_S_Diffuse.jpg', this.animate)
            this.diffuseMap.minFilter = this.$THREE.LinearFilter
            this.diffuseMap.generateMipmaps = false
            var geometry = new this.$THREE.PlaneBufferGeometry(2, 2)
            var material = new this.$THREE.MeshBasicMaterial({ map: this.diffuseMap })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            //
            var width = 32
            var height = 32
            var data = new Uint8Array(width * height * 3)
            this.dataTexture = new this.$THREE.DataTexture(data, width, height, this.$THREE.RGBFormat)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsTexturePartialupdate-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var elapsedTime = this.clock.getElapsedTime()
            if (elapsedTime - this.last > 0.1) {
                this.last = elapsedTime
                this.position.x = (32 * this.$THREE.MathUtils.randInt(1, 16)) - 32
                this.position.y = (32 * this.$THREE.MathUtils.randInt(1, 16)) - 32
                // generate new this.color data
                this.updateDataTexture(this.dataTexture)
                // perform copy from src to dest texture to a random this.position
                this.renderer.copyTextureToTexture(this.position, this.dataTexture, this.diffuseMap)
            }
            this.renderer.render(this.scene, this.camera)
        },
        updateDataTexture(texture) {
            var size = texture.image.width * texture.image.height
            var data = texture.image.data
            // generate a random this.color and update texture data
            this.color.setHex(Math.random() * 0xffffff)
            var r = Math.floor(this.color.r * 255)
            var g = Math.floor(this.color.g * 255)
            var b = Math.floor(this.color.b * 255)
            for (var i = 0; i < size; i ++) {
                var stride = i * 3
                data[ stride ] = r
                data[ stride + 1 ] = g
                data[ stride + 2 ] = b
            }
        }
    },
}
</script>

<style scoped>
.webglMaterialsTexturePartialupdate-container {
    position: relative;
    width: 100%;
}
</style>
