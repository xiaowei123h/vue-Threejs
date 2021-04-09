<template>
    <div class="webglGeometryMinecraft-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - <a href="http://www.minecraft.net/" target="_blank" rel="noopener">minecraft</a> demo. featuring <a href="http://painterlypack.net/" target="_blank" rel="noopener">painterly pack</a><br />(left click: forward, right click: backward)</div>
    </div>
</template>

<script>
import { FirstPersonControls } from '@/components/jsm/controls/FirstPersonControls.js'
import { ImprovedNoise } from '@/components/jsm/math/ImprovedNoise.js'
import { BufferGeometryUtils } from '@/components/jsm/utils/BufferGeometryUtils.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            worldWidth: 128,
            worldDepth: 128,
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
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 20000)
            this.camera.position.y = this.getY(this.worldHalfWidth, this.worldHalfDepth) * 100 + 100
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xbfd1e5)
            // sides
            var matrix = new this.$THREE.Matrix4()
            var pxGeometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            pxGeometry.attributes.uv.array[1] = 0.5
            pxGeometry.attributes.uv.array[3] = 0.5
            pxGeometry.rotateY(Math.PI / 2)
            pxGeometry.translate(50, 0, 0)
            var nxGeometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            nxGeometry.attributes.uv.array[1] = 0.5
            nxGeometry.attributes.uv.array[3] = 0.5
            nxGeometry.rotateY(- Math.PI / 2)
            nxGeometry.translate(- 50, 0, 0)
            var pyGeometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            pyGeometry.attributes.uv.array[5] = 0.5
            pyGeometry.attributes.uv.array[7] = 0.5
            pyGeometry.rotateX(- Math.PI / 2)
            pyGeometry.translate(0, 50, 0)
            var pzGeometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            pzGeometry.attributes.uv.array[1] = 0.5
            pzGeometry.attributes.uv.array[3] = 0.5
            pzGeometry.translate(0, 0, 50)
            var nzGeometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            nzGeometry.attributes.uv.array[1] = 0.5
            nzGeometry.attributes.uv.array[3] = 0.5
            nzGeometry.rotateY(Math.PI)
            nzGeometry.translate(0, 0, - 50)
            //
            var geometries = []
            for (let z = 0; z < this.worldDepth; z ++) {
                for (let x = 0; x < this.worldWidth; x ++) {
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
                    geometries.push(pyGeometry.clone().applyMatrix4(matrix))
                    if ((px !== h && px !== h + 1) || x === 0) {
                        geometries.push(pxGeometry.clone().applyMatrix4(matrix))
                    }
                    if ((nx !== h && nx !== h + 1) || x === this.worldWidth - 1) {
                        geometries.push(nxGeometry.clone().applyMatrix4(matrix))
                    }
                    if ((pz !== h && pz !== h + 1) || z === this.worldDepth - 1) {
                        geometries.push(pzGeometry.clone().applyMatrix4(matrix))
                    }
                    if ((nz !== h && nz !== h + 1) || z === 0) {
                        geometries.push(nzGeometry.clone().applyMatrix4(matrix))
                    }
                }
            }
            var geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
            geometry.computeBoundingSphere()
            var texture = new this.$THREE.TextureLoader().load('static/textures/minecraft/atlas.png')
            texture.magFilter = this.$THREE.NearestFilter
            var mesh = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ map: texture, side: this.$THREE.DoubleSide }))
            this.scene.add(mesh)
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc)
            this.scene.add(ambientLight)
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 2)
            directionalLight.position.set(1, 1, 0.5).normalize()
            this.scene.add(directionalLight)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)
            this.controls.movementSpeed = 1000
            this.controls.lookSpeed = 0.125
            this.controls.lookVertical = true
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
            let quality = 2
            for (let j = 0; j < 4; j ++) {
                if (j === 0) for (let i = 0; i < size; i ++) data[i] = 0
                for (let i = 0; i < size; i ++) {
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
.webglGeometryMinecraft-container {
    position: relative;
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
