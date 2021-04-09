<template>
    <div class="webglMaterialsGrass-container">
        
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
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 75, 100)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x003300)
            var geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            var texture = new this.$THREE.CanvasTexture(this.generateTexture())
            for (var i = 0; i < 15; i ++) {
                var material = new this.$THREE.MeshBasicMaterial({
                    color: new this.$THREE.Color().setHSL(0.3, 0.75, (i / 15) * 0.4 + 0.1),
                    map: texture,
                    depthTest: false,
                    depthWrite: false,
                    transparent: true
                })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.y = i * 0.25
                mesh.rotation.x = - Math.PI / 2
                this.scene.add(mesh)
            }
            this.scene.children.reverse()
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsGrass-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        generateTexture() {
            var canvas = document.createElement('canvas')
            canvas.width = 512
            canvas.height = 512
            var context = canvas.getContext('2d')
            for (var i = 0; i < 20000; i ++) {
                context.fillStyle = 'hsl(0,0%,' + (Math.random() * 50 + 50) + '%)'
                context.beginPath()
                context.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true)
                context.fill()
            }
            context.globalAlpha = 0.075
            context.globalCompositeOperation = 'lighter'
            return canvas
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var time = Date.now() / 6000
            this.camera.position.x = 80 * Math.cos(time)
            this.camera.position.z = 80 * Math.sin(time)
            this.camera.lookAt(this.scene.position)
            for (var i = 0, l = this.scene.children.length; i < l; i ++) {
                var mesh = this.scene.children[ i ]
                mesh.position.x = Math.sin(time * 4) * i * i * 0.005
                mesh.position.z = Math.cos(time * 6) * i * i * 0.005
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsGrass-container {
    position: relative;
    width: 100%;
}
</style>
