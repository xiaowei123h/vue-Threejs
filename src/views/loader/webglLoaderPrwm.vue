<template>
    <div class="webglLoaderPrwm-container">
        <div id="info">
			<strong>Models</strong>:
			<a class="model" href="static/models/prwm/faceted-nefertiti.*.prwm">Faceted Nefertiti</a>,
			<a class="model" href="static/models/prwm/smooth-suzanne.*.prwm">Smooth Suzanne</a>,
			<a class="model" href="static/models/prwm/vive-controller.*.prwm">Vive Controller</a>
			<div class="notes">
				The parsing of PRWM file is especially fast when the endianness of the file is the same as the endianness of the client platform.
				The loader will automatically replace the <strong>*</strong> in the model url by either <strong>le</strong> or <strong>be</strong> depending on the client platform's endianness to download the most appropriate file. <a href="https://github.com/kchapelier/PRWM" target="_blank" rel="noopener noreferrer">Specifications and implementations</a><br><br>
				This platform endianness is <strong id="endianness"></strong>.<br>
				See your console for stats.
			</div>
		</div>
    </div>
</template>

<script>
import { PRWMLoader } from '@/components/jsm/loaders/PRWMLoader.js'
export default {
    data() {
        return {
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
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            document.getElementById('endianness').innerHTML = PRWMLoader.isBigEndianPlatform() ? 'big-endian' : 'little-endian'
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderPrwm-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 250
            // scene
            this.scene = new this.$THREE.Scene()
            var ambient = new this.$THREE.AmbientLight(0x101030)
            this.scene.add(ambient)
            var directionalLight = new this.$THREE.DirectionalLight(0xffeedd)
            directionalLight.position.set(0, 0, 1)
            this.scene.add(directionalLight)
            // model
            var loader = new PRWMLoader()
            var material = new this.$THREE.MeshPhongMaterial({})
            var busy = false
            var mesh = null
            var onProgress = function (xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100
                    console.log(Math.round(percentComplete, 2) + '% downloaded')
                    if (xhr.loaded === xhr.total) {
                        console.log('File size: ' + (xhr.total / 1024).toFixed(2) + 'kB')
                        console.timeEnd('Download')
                    }
                }
            }
            var onError = function () {
                busy = false
            }
            var that = this
            function loadGeometry(url) {
                if (busy) return
                busy = true
                if (mesh !== null) {
                    that.scene.remove(mesh)
                    mesh.geometry.dispose()
                }
                console.log('-- Loading', url)
                console.time('Download')
                loader.load(url, function (geometry) {
                    mesh = new that.$THREE.Mesh(geometry, material)
                    mesh.scale.set(50, 50, 50)
                    that.scene.add(mesh)
                    console.log(geometry.index ? 'indexed geometry' : 'non-indexed geometry')
                    console.log('# of vertices: ' + geometry.attributes.position.count)
                    console.log('# of polygons: ' + (geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3))
                    busy = false
                }, onProgress, onError)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            document.querySelectorAll('a.model').forEach(function (anchor) {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault()
                    loadGeometry(anchor.href)
                })
            })
            //
            // * is automatically replaced by 'le' or 'be' depending on the client platform's endianness
            loadGeometry('static/models/prwm/smooth-suzanne.*.prwm')
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth - 281 / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) / 2
            this.mouseY = (event.clientY - this.windowHalfY) / 2
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderPrwm-container {
    position: relative;
    width: 100%;
}
.notes {
    position: fixed;
    text-align: left;
    bottom: 10px;
    font-family: "Arial", "Helvetica Neue", "Helvetica", sans-serif;
}
</style>
