<template>
    <div class="webglGeometryMinecraftAo-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - <a href="http://www.minecraft.net/" target="_blank" rel="noopener">minecraft</a> demo [ambient occlusion]. featuring <a href="http://painterlypack.net/" target="_blank" rel="noopener">painterly pack</a><br />(left click: forward, right click: backward)
		</div>
    </div>
</template>

<script>
import { FirstPersonControls } from '@/components/jsm/controls/FirstPersonControls.js'
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
            worldWidth: 200,
            worldDepth: 200,
			worldHalfWidth: null,
			worldHalfDepth: null,
			data: null,
			clock: null,
        }
    },
    mounted() {
        this.worldHalfWidth = this.worldWidth / 2
        this.worldHalfDepth = this.worldDepth / 2
        this.data = this.generateHeight(this.worldWidth, this.worldDepth)
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 20000)
            this.camera.position.y = this.getY(this.worldHalfWidth, this.worldHalfDepth) * 100 + 100
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.scene.fog = new this.$THREE.FogExp2(0xffffff, 0.00015)
            // sides
            var light = new this.$THREE.Color(0xffffff)
            var shadow = new this.$THREE.Color(0x505050)
            var matrix = new this.$THREE.Matrix4()
            var pxGeometry = new this.$THREE.PlaneGeometry(100, 100)
            pxGeometry.faces[0].vertexColors = [light, shadow, light]
            pxGeometry.faces[1].vertexColors = [shadow, shadow, light]
            pxGeometry.faceVertexUvs[0][0][0].y = 0.5
            pxGeometry.faceVertexUvs[0][0][2].y = 0.5
            pxGeometry.faceVertexUvs[0][1][2].y = 0.5
            pxGeometry.rotateY(Math.PI / 2)
            pxGeometry.translate(50, 0, 0)
            var nxGeometry = new this.$THREE.PlaneGeometry(100, 100)
            nxGeometry.faces[0].vertexColors = [light, shadow, light]
            nxGeometry.faces[1].vertexColors = [shadow, shadow, light]
            nxGeometry.faceVertexUvs[0][0][0].y = 0.5
            nxGeometry.faceVertexUvs[0][0][2].y = 0.5
            nxGeometry.faceVertexUvs[0][1][2].y = 0.5
            nxGeometry.rotateY(- Math.PI / 2)
            nxGeometry.translate(- 50, 0, 0)
            var pyGeometry = new this.$THREE.PlaneGeometry(100, 100)
            pyGeometry.faces[0].vertexColors = [light, light, light]
            pyGeometry.faces[1].vertexColors = [light, light, light]
            pyGeometry.faceVertexUvs[0][0][1].y = 0.5
            pyGeometry.faceVertexUvs[0][1][0].y = 0.5
            pyGeometry.faceVertexUvs[0][1][1].y = 0.5
            pyGeometry.rotateX(- Math.PI / 2)
            pyGeometry.translate(0, 50, 0)
            var py2Geometry = new this.$THREE.PlaneGeometry(100, 100)
            py2Geometry.faces[0].vertexColors = [light, light, light]
            py2Geometry.faces[1].vertexColors = [light, light, light]
            py2Geometry.faceVertexUvs[0][0][1].y = 0.5
            py2Geometry.faceVertexUvs[0][1][0].y = 0.5
            py2Geometry.faceVertexUvs[0][1][1].y = 0.5
            py2Geometry.rotateX(- Math.PI / 2)
            py2Geometry.rotateY(Math.PI / 2)
            py2Geometry.translate(0, 50, 0)
            var pzGeometry = new this.$THREE.PlaneGeometry(100, 100)
            pzGeometry.faces[0].vertexColors = [light, shadow, light]
            pzGeometry.faces[1].vertexColors = [shadow, shadow, light]
            pzGeometry.faceVertexUvs[0][0][0].y = 0.5
            pzGeometry.faceVertexUvs[0][0][2].y = 0.5
            pzGeometry.faceVertexUvs[0][1][2].y = 0.5
            pzGeometry.translate(0, 0, 50)
            var nzGeometry = new this.$THREE.PlaneGeometry(100, 100)
            nzGeometry.faces[0].vertexColors = [light, shadow, light]
            nzGeometry.faces[1].vertexColors = [shadow, shadow, light]
            nzGeometry.faceVertexUvs[0][0][0].y = 0.5
            nzGeometry.faceVertexUvs[0][0][2].y = 0.5
            nzGeometry.faceVertexUvs[0][1][2].y = 0.5
            nzGeometry.rotateY(Math.PI)
            nzGeometry.translate(0, 0, - 50)
            //
            var geometry = new this.$THREE.Geometry()
            for (var z = 0; z < this.worldDepth; z ++) {
                for (var x = 0; x < this.worldWidth; x ++) {
                    var h = this.getY(x, z)
                    matrix.makeTranslation(
                        x * 100 - this.worldHalfWidth * 100,
                        h * 100,
                        z * 100 - this.worldHalfDepth * 100
                )
                    var px = this.getY(x + 1, z)
                    var nx = this.getY(x - 1, z)
                    var pz = this.getY(x, z + 1)
                    var nz = this.getY(x, z - 1)
                    var pxpz = this.getY(x + 1, z + 1)
                    var nxpz = this.getY(x - 1, z + 1)
                    var pxnz = this.getY(x + 1, z - 1)
                    var nxnz = this.getY(x - 1, z - 1)
                    var a = nx > h || nz > h || nxnz > h ? 0 : 1
                    var b = nx > h || pz > h || nxpz > h ? 0 : 1
                    var c = px > h || pz > h || pxpz > h ? 0 : 1
                    var d = px > h || nz > h || pxnz > h ? 0 : 1
                    if (a + c > b + d) {
                        var colors = py2Geometry.faces[0].vertexColors
                        colors[0] = b === 0 ? shadow : light
                        colors[1] = c === 0 ? shadow : light
                        colors[2] = a === 0 ? shadow : light
                        colors = py2Geometry.faces[1].vertexColors
                        colors[0] = c === 0 ? shadow : light
                        colors[1] = d === 0 ? shadow : light
                        colors[2] = a === 0 ? shadow : light
                        geometry.merge(py2Geometry, matrix)
                    } else {
                        var colors = pyGeometry.faces[0].vertexColors
                        colors[0] = a === 0 ? shadow : light
                        colors[1] = b === 0 ? shadow : light
                        colors[2] = d === 0 ? shadow : light
                        colors = pyGeometry.faces[1].vertexColors
                        colors[0] = b === 0 ? shadow : light
                        colors[1] = c === 0 ? shadow : light
                        colors[2] = d === 0 ? shadow : light
                        geometry.merge(pyGeometry, matrix)
                    }
                    if ((px != h && px != h + 1) || x == 0) {
                        var colors = pxGeometry.faces[0].vertexColors
                        colors[0] = pxpz > px && x > 0 ? shadow : light
                        colors[2] = pxnz > px && x > 0 ? shadow : light
                        colors = pxGeometry.faces[1].vertexColors
                        colors[2] = pxnz > px && x > 0 ? shadow : light
                        geometry.merge(pxGeometry, matrix)
                    }
                    if ((nx != h && nx != h + 1) || x == this.worldWidth - 1) {
                        var colors = nxGeometry.faces[0].vertexColors
                        colors[0] = nxnz > nx && x < this.worldWidth - 1 ? shadow : light
                        colors[2] = nxpz > nx && x < this.worldWidth - 1 ? shadow : light
                        colors = nxGeometry.faces[1].vertexColors
                        colors[2] = nxpz > nx && x < this.worldWidth - 1 ? shadow : light
                        geometry.merge(nxGeometry, matrix)
                    }
                    if ((pz != h && pz != h + 1) || z == this.worldDepth - 1) {
                        var colors = pzGeometry.faces[0].vertexColors
                        colors[0] = nxpz > pz && z < this.worldDepth - 1 ? shadow : light
                        colors[2] = pxpz > pz && z < this.worldDepth - 1 ? shadow : light
                        colors = pzGeometry.faces[1].vertexColors
                        colors[2] = pxpz > pz && z < this.worldDepth - 1 ? shadow : light
                        geometry.merge(pzGeometry, matrix)
                    }
                    if ((nz != h && nz != h + 1) || z == 0) {
                        var colors = nzGeometry.faces[0].vertexColors
                        colors[0] = pxnz > nz && z > 0 ? shadow : light
                        colors[2] = nxnz > nz && z > 0 ? shadow : light
                        colors = nzGeometry.faces[1].vertexColors
                        colors[2] = nxnz > nz && z > 0 ? shadow : light
                        geometry.merge(nzGeometry, matrix)
                    }
                }
            }
            geometry = new this.$THREE.BufferGeometry().fromGeometry(geometry)
            var texture = new this.$THREE.TextureLoader().load('static/textures/minecraft/atlas.png')
            texture.magFilter = this.$THREE.NearestFilter
            texture.minFilter = this.$THREE.LinearMipmapLinearFilter
            var mesh = new this.$THREE.Mesh(
                geometry,
                new this.$THREE.MeshLambertMaterial({ map: texture, vertexColors: true, side: this.$THREE.DoubleSide })
        )
            this.scene.add(mesh)
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc)
            this.scene.add(ambientLight)
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 2)
            directionalLight.position.set(1, 1, 0.5).normalize()
            this.scene.add(directionalLight)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)
            this.controls.movementSpeed = 1000
            this.controls.lookSpeed = 0.125
            this.controls.lookVertical = true
            this.controls.varrainVertical = true
            this.controls.verticalMin = 1.1
            this.controls.verticalMax = 2.2
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.controls.handleResize()
        },
        generateHeight(width, height) {
            var data = [], perlin = new ImprovedNoise(),
                size = width * height, z = Math.random() * 100
            var quality = 2
            for (var j = 0; j < 4; j ++) {
                if (j == 0) for (var i = 0; i < size; i ++) data[i] = 0
                for (var i = 0; i < size; i ++) {
                    var x = i % width, y = (i / width) | 0
                    data[i] += perlin.noise(x / quality, y / quality, z) * quality
                }
                quality *= 4
            }
            return data
        },
        getY(x, z) {
            return (this.data[x + z * this.worldWidth] * 0.2) | 0
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.controls.update(this.clock.getDelta())
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryMinecraftAo-container {
    position: relative;
    width: 100%;
    background-color: #fff;
}
#info {
    color: #61443e;
}
#info a {
    color: #a06851;
}
</style>
