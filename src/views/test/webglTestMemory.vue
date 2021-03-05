<template>
    <div class="webglTestMemory-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - memory test I
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
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglTestMemory-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 200
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
        },
        createImage() {
            var canvas = document.createElement('canvas')
            canvas.width = 256
            canvas.height = 256
            var context = canvas.getContext('2d')
            context.fillStyle = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')'
            context.fillRect(0, 0, 256, 256)
            return canvas
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var geometry = new this.$THREE.SphereBufferGeometry(50, Math.random() * 64, Math.random() * 32)
            var texture = new this.$THREE.CanvasTexture(this.createImage())
            var material = new this.$THREE.MeshBasicMaterial({ map: texture, wireframe: true })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            this.renderer.render(this.scene, this.camera)
            this.scene.remove(mesh)
            // clean up
            geometry.dispose()
            material.dispose()
            texture.dispose()
        }
    },
}
</script>

<style scoped>
.webglTestMemory-container {
    width: 100%;
}
#info {
    background-color: #fff;
    color: #000;
}
#info a {
    color: #08f;
}
</style>
