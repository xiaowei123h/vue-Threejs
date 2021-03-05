<template>
    <div class="webglVideoPanoramaEquirectangular-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - video panorama
		</div>

		<div id="container"></div>

		<video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
			<source src="static/textures/pano.webm">
			<source src="static/textures/pano.mp4">
		</video>
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
            lon: 0,
            lat: 0,
            phi: 0,
            theta: 0,
            onPointerDownPointerX: 0,
            onPointerDownPointerY: 0,
            onPointerDownLon: 0,
            onPointerDownLat: 0,
			distance: 50,
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
            var video = document.getElementById('video')
            video.play()
            var texture = new this.$THREE.VideoTexture(video)
            var material = new this.$THREE.MeshBasicMaterial({ map: texture })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            document.addEventListener('pointerdown', this.onPointerDown, false)
            document.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerDown(event) {
            this.isUserInteracting = true
            this.onPointerDownPointerX = event.clientX
            this.onPointerDownPointerY = event.clientY
            this.onPointerDownLon = this.lon
            this.onPointerDownLat = this.lat
        },
        onPointerMove(event) {
            if (this.isUserInteracting === true) {
                this.lon = (this.onPointerDownPointerX - event.clientX) * 0.1 + this.onPointerDownLon
                this.lat = (this.onPointerDownPointerY - event.clientY) * 0.1 + this.onPointerDownLat
            }
        },
        onPointerUp() {
            this.isUserInteracting = false
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.update()
        },
        update() {
            this.lat = Math.max(- 85, Math.min(85, this.lat))
            this.phi = this.$THREE.MathUtils.degToRad(90 - this.lat)
            this.theta = this.$THREE.MathUtils.degToRad(this.lon)
            this.camera.position.x = this.distance * Math.sin(this.phi) * Math.cos(this.theta)
            this.camera.position.y = this.distance * Math.cos(this.phi)
            this.camera.position.z = this.distance * Math.sin(this.phi) * Math.sin(this.theta)
            this.camera.lookAt(this.camera.target)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglVideoPanoramaEquirectangular-container {
    width: 100%;
    touch-action: none;
}
</style>
