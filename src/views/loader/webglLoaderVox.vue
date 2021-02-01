<template>
    <div class="webglLoaderVox-container">
        <div id="info">
		    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - vox loader (<a href="https://ephtracy.github.io/" target="_blank" rel="noopener">Magica Voxel</a>)
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { VOXLoader } from '@/components/jsm/loaders/VOXLoader.js'
export default {
    data() {
        return {
            camera: null,
            controls: null,
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
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.01, 10)
            this.camera.position.set(0.175, 0.075, 0.175)
            this.scene = new this.$THREE.Scene()
            this.scene.add(this.camera)
            // light
            var hemiLight = new this.$THREE.HemisphereLight(0x888888, 0x000000, 1)
            this.scene.add(hemiLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.75)
            dirLight.position.set(1.5, 3, 2.5)
            this.scene.add(dirLight)
            var loader = new VOXLoader()
            loader.load('static/models/vox/monu10.vox', (chunks) => {
                var geometry = new this.$THREE.BoxBufferGeometry(1, 1, 1)
                var material = new this.$THREE.MeshStandardMaterial()
                var color = new this.$THREE.Color()
                var matrix = new this.$THREE.Matrix4()
                for (var i = 0; i < chunks.length; i ++) {
                    var chunk = chunks[ i ]
                    var size = chunk.size
                    var data = chunk.data
                    var palette = chunk.palette
                    // displayPalette(palette)
                    var mesh = new this.$THREE.InstancedMesh(geometry, material, data.length / 4)
                    mesh.scale.setScalar(0.0015)
                    this.scene.add(mesh)
                    for (var j = 0, k = 0; j < data.length; j += 4, k ++) {
                        var x = data[ j + 0 ] - size.x / 2
                        var y = data[ j + 1 ] - size.y / 2
                        var z = data[ j + 2 ] - size.z / 2
                        var c = data[ j + 3 ]
                        var hex = palette[ c ]
                        var r = (hex >> 0 & 0xff) / 0xff
                        var g = (hex >> 8 & 0xff) / 0xff
                        var b = (hex >> 16 & 0xff) / 0xff
                        mesh.setColorAt(k, color.setRGB(r, g, b))
                        mesh.setMatrixAt(k, matrix.setPosition(x, z, - y))
                    }
                }
            })
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderVox-container')[0].appendChild(container)
            container.appendChild(this.renderer.domElement)
            // controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = .1
            this.controls.maxDistance = 0.5
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglLoaderVox-container {
    width: 100%;
}
</style>
