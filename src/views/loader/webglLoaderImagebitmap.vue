<template>
    <div class="webglLoaderImagebitmap-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Texture loader using ImageBitmap
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
            group: null,
            cubes: null,
            geometry: null,
        }
    },
    mounted() {
        this.geometry = new this.$THREE.BoxBufferGeometry(1, 1, 1)
        this.init()
		this.animate()
    },
    methods: {
        addImageBitmap() {
            new this.$THREE.ImageBitmapLoader()
                .setOptions({ imageOrientation: 'none' })
                .load('static/textures/planets/earth_atmos_2048.jpg?' + performance.now(), (imageBitmap) => {
                    var texture = new this.$THREE.CanvasTexture(imageBitmap)
                    var material = new this.$THREE.MeshBasicMaterial({ map: texture })
                    /* ImageBitmap should be disposed when done with it
                        Can't be done until it's actually uploaded to WebGLTexture */
                    // imageBitmap.close()
                    addCube(material)
                }, (p) => {
                    console.log(p)
                }, (e) => {
                    console.log(e)
                })
        },
        addImage() {
            new this.$THREE.ImageLoader()
                .setCrossOrigin('*')
                .load('static/textures/planets/earth_atmos_2048.jpg?' + performance.now(), (image) => {
                    var texture = new this.$THREE.CanvasTexture(image)
                    var material = new this.$THREE.MeshBasicMaterial({ color: 0xff8888, map: texture })
                    this.addCube(material)
                })
        },
        addCube(material) {
            var cube = new this.$THREE.Mesh(this.geometry, material)
            cube.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
            cube.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI)
            this.cubes.add(cube)
        },
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderImagebitmap-container')[0].appendChild(container)
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(30, this.$webglInnerWidth / window.innerHeight, 1, 1500)
            this.camera.position.set(0, 4, 7)
            this.camera.lookAt(0, 0, 0)
            // SCENE
            this.scene = new this.$THREE.Scene()
            //
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            this.group.add(new this.$THREE.GridHelper(4, 12, 0x888888, 0x444444))
            this.cubes = new this.$THREE.Group()
            this.group.add(this.cubes)
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            // TESTS
            setTimeout(this.addImage, 300)
            setTimeout(this.addImage, 600)
            setTimeout(this.addImage, 900)
            setTimeout(this.addImageBitmap, 1300)
            setTimeout(this.addImageBitmap, 1600)
            setTimeout(this.addImageBitmap, 1900)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.group.rotation.y = performance.now() / 3000
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        }
    }
}
</script>

<style scoped>
.webglLoaderImagebitmap-container {
    width: 100%;
}
</style>
