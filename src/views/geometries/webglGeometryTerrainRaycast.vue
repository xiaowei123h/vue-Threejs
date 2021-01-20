<template>
    <div class="webglGeometryTerrainRaycast-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl terrain raycasting demo</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ImprovedNoise } from '@/components/jsm/math/ImprovedNoise.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            mesh: null,
            texture: null,
            worldWidth: 256,
            worldDepth: 256,
            worldHalfWidth: null,
            worldHalfDepth: null,
			helper: null,
			raycaster: null,
			mouse: null,
        }
    },
    mounted() {
        this.worldHalfWidth = this.worldWidth / 2
        this.worldHalfDepth = this.worldDepth / 2;
        this.raycaster = new this.$THREE.Raycaster()
        this.mouse = new this.$THREE.Vector2()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.container.innerHTML = ""
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xbfd1e5)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 10, 20000)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 1000
            this.controls.maxDistance = 10000
            this.controls.maxPolarAngle = Math.PI / 2
            //
            var data = this.generateHeight(this.worldWidth, this.worldDepth)
            this.controls.target.y = data[ this.worldHalfWidth + this.worldHalfDepth * this.worldWidth ] + 500
            this.camera.position.y = this.controls.target.y + 2000
            this.camera.position.x = 2000
            this.controls.update()
            var geometry = new this.$THREE.PlaneBufferGeometry(7500, 7500, this.worldWidth - 1, this.worldDepth - 1)
            geometry.rotateX(- Math.PI / 2)
            var vertices = geometry.attributes.position.array
            for (var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3) {
                vertices[ j + 1 ] = data[ i ] * 10;
            }
            geometry.computeFaceNormals() // needed for helper
            //
            this.texture = new this.$THREE.CanvasTexture(this.generateTexture(data, this.worldWidth, this.worldDepth))
            this.texture.wrapS = this.$THREE.ClampToEdgeWrapping
            this.texture.wrapT = this.$THREE.ClampToEdgeWrapping
            this.mesh = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ map: this.texture }))
            this.scene.add(this.mesh)
            var geometryHelper = new this.$THREE.ConeBufferGeometry(20, 100, 3)
            geometryHelper.translate(0, 50, 0)
            geometryHelper.rotateX(Math.PI / 2)
            this.helper = new this.$THREE.Mesh(geometryHelper, new this.$THREE.MeshNormalMaterial())
            this.scene.add(this.helper)
            this.container.addEventListener('mousemove', this.onMouseMove, false)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        generateHeight(width, height) {
            var size = width * height, data = new Uint8Array(size),
                perlin = new ImprovedNoise(), z = Math.random() * 100
            var quality = 1
            for (var j = 0; j < 4; j ++) {
                for (var i = 0; i < size; i ++) {
                    var x = i % width, y = ~ ~ (i / width)
                    data[ i ] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75)
                }
                quality *= 5
            }
            return data
        },
        generateTexture(data, width, height) {
            // bake lighting into texture
            var context, image, imageData, shade
            var vector3 = new this.$THREE.Vector3(0, 0, 0)
            var sun = new this.$THREE.Vector3(1, 1, 1)
            sun.normalize()
            var canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            context = canvas.getContext('2d')
            context.fillStyle = '#000'
            context.fillRect(0, 0, width, height)
            image = context.getImageData(0, 0, canvas.width, canvas.height)
            imageData = image.data
            for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++) {
                vector3.x = data[ j - 2 ] - data[ j + 2 ]
                vector3.y = 2
                vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ]
                vector3.normalize()
                shade = vector3.dot(sun)
                imageData[ i ] = (96 + shade * 128) * (0.5 + data[ j ] * 0.007)
                imageData[ i + 1 ] = (32 + shade * 96) * (0.5 + data[ j ] * 0.007)
                imageData[ i + 2 ] = (shade * 96) * (0.5 + data[ j ] * 0.007)
            }
            context.putImageData(image, 0, 0)
            // Scaled 4x
            var canvasScaled = document.createElement('canvas')
            canvasScaled.width = width * 4
            canvasScaled.height = height * 4
            context = canvasScaled.getContext('2d')
            context.scale(4, 4)
            context.drawImage(canvas, 0, 0)
            image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height)
            imageData = image.data
            for (var i = 0, l = imageData.length; i < l; i += 4) {
                var v = ~ ~ (Math.random() * 5)
                imageData[ i ] += v
                imageData[ i + 1 ] += v
                imageData[ i + 2 ] += v
            }
            context.putImageData(image, 0, 0)
            return canvasScaled
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        },
        onMouseMove(event) {
            this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1
            this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1
            this.raycaster.setFromCamera(this.mouse, this.camera)
            // See if the ray from the camera into the world hits one of our meshes
            var intersects = this.raycaster.intersectObject(this.mesh)
            // Toggle rotation bool for meshes that we clicked
            if (intersects.length > 0) {
                this.helper.position.set(0, 0, 0)
                this.helper.lookAt(intersects[ 0 ].face.normal)
                this.helper.position.copy(intersects[ 0 ].point)
            }
        }
    }
}
</script>

<style scoped>
.webglGeometryTerrainRaycast-container {
    width: 100%;
    background-color: #bfd1e5;
}
#info {		
    color: #61443e;
}
#info a {
    color: #a06851;
}
</style>
