<template>
    <div class="webglPanoramaEquirectangular-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js webgl</a> - equirectangular panorama demo. photo by <a href="http://www.flickr.com/photos/jonragnarsson/2294472375/" target="_blank" rel="noopener">Jón Ragnarsson</a>.<br />
			drag equirectangular texture into the page.
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
			isUserInteracting: false,
            onPointerDownMouseX: 0,
            onPointerDownMouseY: 0,
            lon: 0,
            onPointerDownLon: 0,
            lat: 0,
            onPointerDownLat: 0,
            phi: 0,
            theta: 0,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 1100)
            this.camera.target = new this.$THREE.Vector3(0, 0, 0)
            this.scene = new this.$THREE.Scene()
            var geometry = new this.$THREE.SphereBufferGeometry(500, 60, 40)
            // invert the geometry on the x-axis so that all of the faces point inward
            geometry.scale(- 1, 1, 1)
            var texture = new this.$THREE.TextureLoader().load('static/textures/2294472375_24a3b8ef46_o.jpg')
            var material = new this.$THREE.MeshBasicMaterial({ map: texture })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            container.style.touchAction = 'none'
            container.addEventListener('pointerdown', this.onPointerDown, false)
            document.addEventListener('wheel', this.onDocumentMouseWheel, false)
            //
            document.addEventListener('dragover', (event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'copy'
            }, false)
            document.addEventListener('dragenter', () => {
                document.getElementsByClassName('webglPanoramaEquirectangular-container')[0].style.opacity = 0.5
            }, false)
            document.addEventListener('dragleave', () => {
                document.getElementsByClassName('webglPanoramaEquirectangular-container')[0].style.opacity = 1
            }, false)
            document.addEventListener('drop', (event) => {
                event.preventDefault()
                var reader = new FileReader()
                reader.addEventListener('load', (event) => {
                    material.map.image.src = event.target.result
                    material.map.needsUpdate = true
                }, false)
                reader.readAsDataURL(event.dataTransfer.files[ 0 ])
                document.getElementsByClassName('webglPanoramaEquirectangular-container')[0].style.opacity = 1
            }, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerDown(event) {
            if (event.isPrimary === false) return
            this.isUserInteracting = true
            this.onPointerDownMouseX = event.clientX
            this.onPointerDownMouseY = event.clientY
            this.onPointerDownLon = this.lon
            this.onPointerDownLat = this.lat
            document.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.lon = (this.onPointerDownMouseX - event.clientX) * 0.1 + this.onPointerDownLon
            this.lat = (event.clientY - this.onPointerDownMouseY) * 0.1 + this.onPointerDownLat
        },
        onPointerUp() {
            if (event.isPrimary === false) return
            this.isUserInteracting = false
            document.removeEventListener('pointermove', this.onPointerMove)
            document.removeEventListener('pointerup', this.onPointerUp)
        },
        onDocumentMouseWheel(event) {
            var fov = this.camera.fov + event.deltaY * 0.05
            this.camera.fov = this.$THREE.MathUtils.clamp(fov, 10, 75)
            this.camera.updateProjectionMatrix()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.update()
        },
        update() {
            if (this.isUserInteracting === false) {
                this.lon += 0.1
            }
            this.lat = Math.max(- 85, Math.min(85, this.lat))
            this.phi = this.$THREE.MathUtils.degToRad(90 - this.lat)
            this.theta = this.$THREE.MathUtils.degToRad(this.lon)
            this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta)
            this.camera.target.y = 500 * Math.cos(this.phi)
            this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta)
            this.camera.lookAt(this.camera.target)
            /*
            // distortion
            this.camera.position.copy(this.camera.target).negate()
            */
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglPanoramaEquirectangular-container {
    position: relative;
    width: 100%;
}
</style>
