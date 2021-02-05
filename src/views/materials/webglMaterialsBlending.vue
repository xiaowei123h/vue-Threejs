<template>
    <div class="webglMaterialsBlending-container">
        
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			mapBg: null,
			textureLoader: null,
        }
    },
    mounted() {
        this.textureLoader = new this.$THREE.TextureLoader()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 600
            // SCENE
            this.scene = new this.$THREE.Scene()
            // BACKGROUND
            var canvas = document.createElement('canvas')
            var ctx = canvas.getContext('2d')
            canvas.width = canvas.height = 128
            ctx.fillStyle = '#ddd'
            ctx.fillRect(0, 0, 128, 128)
            ctx.fillStyle = '#555'
            ctx.fillRect(0, 0, 64, 64)
            ctx.fillStyle = '#999'
            ctx.fillRect(32, 32, 32, 32)
            ctx.fillStyle = '#555'
            ctx.fillRect(64, 64, 64, 64)
            ctx.fillStyle = '#777'
            ctx.fillRect(96, 96, 32, 32)
            this.mapBg = new this.$THREE.CanvasTexture(canvas)
            this.mapBg.wrapS = this.mapBg.wrapT = this.$THREE.RepeatWrapping
            this.mapBg.repeat.set(128, 64)
            /*
            var this.mapBg = textureLoader.load('textures/disturb.jpg')
            this.mapBg.wrapS = this.mapBg.wrapT = this.$THREE.RepeatWrapping
            this.mapBg.repeat.set(8, 4)
            */
            var materialBg = new this.$THREE.MeshBasicMaterial({ map: this.mapBg })
            var meshBg = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(4000, 2000), materialBg)
            meshBg.position.set(0, 0, - 1)
            this.scene.add(meshBg)
            // OBJECTS
            var blendings = [
                { name: 'No', varant: this.$THREE.NoBlending },
                { name: 'Normal', varant: this.$THREE.NormalBlending },
                { name: 'Additive', varant: this.$THREE.AdditiveBlending },
                { name: 'Subtractive', varant: this.$THREE.SubtractiveBlending },
                { name: 'Multiply', varant: this.$THREE.MultiplyBlending }
            ]
            var map0 = this.textureLoader.load('static/textures/uv_grid_opengl.jpg')
            var map1 = this.textureLoader.load('static/textures/sprite0.jpg')
            var map2 = this.textureLoader.load('static/textures/sprite0.png')
            var map3 = this.textureLoader.load('static/textures/lensflare/lensflare0.png')
            var map4 = this.textureLoader.load('static/textures/lensflare/lensflare0_alpha.png')
            var geo1 = new this.$THREE.PlaneBufferGeometry(100, 100)
            var geo2 = new this.$THREE.PlaneBufferGeometry(100, 25)
            var that = this
            addImageRow(map0, 300)
            addImageRow(map1, 150)
            addImageRow(map2, 0)
            addImageRow(map3, - 150)
            addImageRow(map4, - 300)
            function addImageRow(map, y) {
                for (var i = 0; i < blendings.length; i ++) {
                    var blending = blendings[ i ]
                    var material = new that.$THREE.MeshBasicMaterial({ map: map })
                    material.transparent = true
                    material.blending = blending.varant
                    var x = (i - blendings.length / 2) * 110
                    var z = 0
                    var mesh = new that.$THREE.Mesh(geo1, material)
                    mesh.position.set(x, y, z)
                    that.scene.add(mesh)
                    mesh = new that.$THREE.Mesh(geo2, that.generateLabelMaterial(blending.name))
                    mesh.position.set(x, y - 75, z)
                    that.scene.add(mesh)
                }
            }
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsBlending-container')[0].appendChild(this.renderer.domElement)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        generateLabelMaterial(text) {
            var canvas = document.createElement('canvas')
            var ctx = canvas.getContext('2d')
            canvas.width = 128
            canvas.height = 32
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'
            ctx.fillRect(0, 0, 128, 32)
            ctx.fillStyle = 'white'
            ctx.font = '12pt arial bold'
            ctx.fillText(text, 10, 22)
            var map = new this.$THREE.CanvasTexture(canvas)
            var material = new this.$THREE.MeshBasicMaterial({ map: map, transparent: true })
            return material
        },
        animate() {
            requestAnimationFrame(this.animate)
            var time = Date.now() * 0.00025
            var ox = (time * - 0.01 * this.mapBg.repeat.x) % 1
            var oy = (time * - 0.01 * this.mapBg.repeat.y) % 1
            this.mapBg.offset.set(ox, oy)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsBlending-container {
    width: 100%;
    margin: 0px;
    background-color: #000000;
    overflow: hidden;
}
</style>
