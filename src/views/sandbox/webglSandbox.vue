<template>
    <div class="webglSandbox-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - sandbox</div>
    </div>
</template>

<script>
import { BasicShader } from '@/components/jsm/shaders/BasicShader.js'
export default {
    data() {
        return {
            statsEnabled: true,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.init()
		this.animate() 
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglSandbox-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 20000)
            this.camera.position.z = 3200
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.Fog(0x000000, 1, 20000)
            var light = new this.$THREE.PointLight(0xffffff)
            this.scene.add(light)
            var shader = BasicShader
            var uniforms = shader.uniforms
            var vertexShader = shader.vertexShader
            var fragmentShader = shader.fragmentShader
            var texture1 = new this.$THREE.CanvasTexture(this.generateTexture(0, 0.5, 1), this.$THREE.UVMapping)
            var texture2 = new this.$THREE.TextureLoader().load('static/textures/land_ocean_ice_cloud_2048.jpg')
            var materials = [
                new this.$THREE.MeshNormalMaterial(),
                new this.$THREE.MeshDepthMaterial(),
                new this.$THREE.MeshBasicMaterial({ color: 0x0066ff, blending: this.$THREE.AdditiveBlending, transparent: true, depthWrite: false }),
                new this.$THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true }),
                new this.$THREE.MeshBasicMaterial({ map: texture1, fog: false }),
                new this.$THREE.MeshBasicMaterial({ map: texture2 }),
                new this.$THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader, transparent: true }),
                new this.$THREE.MeshLambertMaterial({ map: texture2 }),
                new this.$THREE.MeshLambertMaterial({ color: 0xdddddd }),
                new this.$THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30, flatShading: true }),
                new this.$THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30 })
            ]
            var geometry = new this.$THREE.SphereBufferGeometry(50, 32, 16)
            for (var i = 0; i < 5000; i ++) {
                // random order
                //var index = Math.floor(Math.random() * materials.length);
                // sort by material / geometry
                var index = Math.floor((i / 5000) * materials.length)
                var material = materials[ index ]
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.x = Math.random() * 10000 - 5000
                mesh.position.y = Math.random() * 10000 - 5000
                mesh.position.z = Math.random() * 10000 - 5000
                //mesh.rotation.x = Math.random() * 360 * (Math.PI / 180)
                mesh.rotation.y = Math.random() * 2 * Math.PI
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 4 + 1
                this.scene.add(mesh)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            if (this.statsEnabled) {
                this.stats = new this.$Stats()
                this.stats.dom.style.left = '280px'
                this.container.appendChild(this.stats.dom)
            }
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        generateTexture(r, g, b) {
            var canvas = document.createElement('canvas')
            canvas.width = 256
            canvas.height = 256
            var context = canvas.getContext('2d')
            var image = context.getImageData(0, 0, 256, 256)
            var x = 0, y = 0, p
            for (var i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++) {
                x = j % 256
                y = x == 0 ? y + 1 : y
                p = Math.floor(x ^ y)
                image.data[ i ] = ~ ~ p * r
                image.data[ i + 1 ] = ~ ~ p * g
                image.data[ i + 2 ] = ~ ~ p * b
                image.data[ i + 3 ] = 255
            }
            context.putImageData(image, 0, 0)
            return canvas
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) * 10
            this.mouseY = (event.clientY - this.windowHalfY) * 10
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            if (this.statsEnabled) this.stats.update()
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglSandbox-container {
    width: 100%;
}
</style>
