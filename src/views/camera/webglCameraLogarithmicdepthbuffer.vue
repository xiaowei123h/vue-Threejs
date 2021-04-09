<template>
    <div class="webglCameraLogarithmicdepthbuffer-container">
        <div id="container">
			<div id="container_normal"><h2 class="renderer_label">normal z-buffer</h2></div>
			<div id="container_logzbuf"><h2 class="renderer_label">logarithmic z-buffer</h2></div>
			<div id="renderer_border"></div>
		</div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - cameras - logarithmic depth buffer<br/>
			mousewheel to dolly out
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 1 micrometer to 100 billion light years in one scene, with 1 unit: 1 meter?  preposterous!  and yet...
            NEAR: 1e-6,
            FAR: 1e27,
			SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
            screensplit: .25,
            screensplit_right: 0,
			mouse: [.5, .5],
            zoompos: -100,
            minzoomspeed: .015,
			zoomspeed: null,
            container: null,
            border: null,
            stats: null,
			objects: {},
			// Generate a number of text labels, from 1µm in size up to 100,000,000 light years
			// Try to use some descriptive real-world examples of objects at each scale
			labeldata: [
				{ size: .01, scale: 0.0001, label: "microscopic (1µm)" }, // FIXME - triangulating text fails at this size, so we scale instead
				{ size: .01, scale: 0.1, label: "minuscule (1mm)" },
				{ size: .01, scale: 1.0, label: "tiny (1cm)" },
				{ size: 1, scale: 1.0, label: "child-sized (1m)" },
				{ size: 10, scale: 1.0, label: "tree-sized (10m)" },
				{ size: 100, scale: 1.0, label: "building-sized (100m)" },
				{ size: 1000, scale: 1.0, label: "medium (1km)" },
				{ size: 10000, scale: 1.0, label: "city-sized (10km)" },
				{ size: 3400000, scale: 1.0, label: "moon-sized (3,400 Km)" },
				{ size: 12000000, scale: 1.0, label: "planet-sized (12,000 km)" },
				{ size: 1400000000, scale: 1.0, label: "sun-sized (1,400,000 km)" },
				{ size: 7.47e12, scale: 1.0, label: "solar system-sized (50Au)" },
				{ size: 9.4605284e15, scale: 1.0, label: "gargantuan (1 light year)" },
				{ size: 3.08567758e16, scale: 1.0, label: "ludicrous (1 parsec)" },
				{ size: 1e19, scale: 1.0, label: "mind boggling (1000 light years)" }
			],
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.zoomspeed = this.minzoomspeed
        this.init()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            var loader = new this.$THREE.FontLoader()
            var that = this
            loader.load('static/fonts/helvetiker_regular.typeface.json', (font) => {
                var scene = that.initScene(font)
                // Initialize two copies of the same scene, one with normal z-buffer and one with logarithmic z-buffer
                that.objects.normal = that.initView(scene, 'normal', false)
                that.objects.logzbuf = that.initView(scene, 'logzbuf', true)
                that.animate()
            })
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            // Resize border allows the user to easily compare effects of logarithmic depth buffer over the whole scene
            this.border = document.getElementById('renderer_border')
            this.border.addEventListener('pointerdown', this.onBorderPointerDown)
            window.addEventListener('mousemove', this.onMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('wheel', this.onMouseWheel, false)
        },
        initView(scene, name, logDepthBuf) {
            var framecontainer = document.getElementById('container_' + name)
            var camera = new this.$THREE.PerspectiveCamera(50, this.screensplit * this.SCREEN_WIDTH / this.SCREEN_HEIGHT, this.NEAR, this.FAR)
            scene.add(camera)
            var renderer = new this.$THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: logDepthBuf })
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT)
            renderer.domElement.style.position = "relative"
            renderer.domElement.id = 'renderer_' + name
            framecontainer.appendChild(renderer.domElement)
            return { container: framecontainer, renderer: renderer, scene: scene, camera: camera }
        },
        initScene(font) {
            var scene = new this.$THREE.Scene()
            scene.add(new this.$THREE.AmbientLight(0x222222))
            var light = new this.$THREE.DirectionalLight(0xffffff, 1)
            light.position.set(100, 100, 100)
            scene.add(light)
            var materialargs = {
                color: 0xffffff,
                specular: 0x050505,
                shininess: 50,
                emissive: 0x000000
            }
            var geometry = new this.$THREE.SphereBufferGeometry(0.5, 24, 12)
            for (var i = 0; i < this.labeldata.length; i ++) {
                var scale = this.labeldata[i].scale || 1
                var labelgeo = new this.$THREE.TextBufferGeometry(this.labeldata[i].label, {
                    font: font,
                    size: this.labeldata[i].size,
                    height: this.labeldata[i].size / 2
                })
                labelgeo.computeBoundingSphere()
                // center text
                labelgeo.translate(- labelgeo.boundingSphere.radius, 0, 0)
                materialargs.color = new this.$THREE.Color().setHSL(Math.random(), 0.5, 0.5)
                var material = new this.$THREE.MeshPhongMaterial(materialargs)
                var group = new this.$THREE.Group()
                group.position.z = - this.labeldata[i].size * scale
                scene.add(group)
                var textmesh = new this.$THREE.Mesh(labelgeo, material)
                textmesh.scale.set(scale, scale, scale)
                textmesh.position.z = - this.labeldata[i].size * scale
                textmesh.position.y = this.labeldata[i].size / 4 * scale
                group.add(textmesh)
                var dotmesh = new this.$THREE.Mesh(geometry, material)
                dotmesh.position.y = - this.labeldata[i].size / 4 * scale
                dotmesh.scale.multiplyScalar(this.labeldata[i].size * scale)
                group.add(dotmesh)
            }
            return scene
        },
        updateRendererSizes() {
            // Recalculate size for both renderers when screen size or split location changes
            this.SCREEN_WIDTH = this.$webglInnerWidth
            this.SCREEN_HEIGHT = window.innerHeight
            this.screensplit_right = 1 - this.screensplit
            this.objects.normal.renderer.setSize(this.screensplit * this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.objects.normal.camera.aspect = this.screensplit * this.SCREEN_WIDTH / this.SCREEN_HEIGHT
            this.objects.normal.camera.updateProjectionMatrix()
            this.objects.normal.camera.setViewOffset(this.SCREEN_WIDTH, this.SCREEN_HEIGHT, 0, 0, this.SCREEN_WIDTH * this.screensplit, this.SCREEN_HEIGHT)
            this.objects.normal.container.style.width = (this.screensplit * 100) + '%'
            this.objects.logzbuf.renderer.setSize(this.screensplit_right * this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.objects.logzbuf.camera.aspect = this.screensplit_right * this.SCREEN_WIDTH / this.SCREEN_HEIGHT
            this.objects.logzbuf.camera.updateProjectionMatrix()
            this.objects.logzbuf.camera.setViewOffset(this.SCREEN_WIDTH, this.SCREEN_HEIGHT, this.SCREEN_WIDTH * this.screensplit, 0, this.SCREEN_WIDTH * this.screensplit_right, this.SCREEN_HEIGHT)
            this.objects.logzbuf.container.style.width = (this.screensplit_right * 100) + '%'
            this.border.style.left = (this.screensplit * 100) + "%"
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            // Put some limits on zooming
            var minzoom = this.labeldata[0].size * this.labeldata[0].scale * 1
            var maxzoom = this.labeldata[this.labeldata.length - 1].size * this.labeldata[this.labeldata.length - 1].scale * 100
            var damping = (Math.abs(this.zoomspeed) > this.minzoomspeed ? .95 : 1.0)
            // Zoom out faster the further out you go
            var zoom = this.$THREE.MathUtils.clamp(Math.pow(Math.E, this.zoompos), minzoom, maxzoom)
            this.zoompos = Math.log(zoom)
            // Slow down quickly at the zoom limits
            if ((zoom == minzoom && this.zoomspeed < 0) || (zoom == maxzoom && this.zoomspeed > 0)) {
                damping = .85
            }
            this.zoompos += this.zoomspeed
            this.zoomspeed *= damping
            this.objects.normal.camera.position.x = Math.sin(.5 * Math.PI * (this.mouse[0] - .5)) * zoom
            this.objects.normal.camera.position.y = Math.sin(.25 * Math.PI * (this.mouse[1] - .5)) * zoom
            this.objects.normal.camera.position.z = Math.cos(.5 * Math.PI * (this.mouse[0] - .5)) * zoom
            this.objects.normal.camera.lookAt(this.objects.normal.scene.position)
            // Clone camera settings across both scenes
            this.objects.logzbuf.camera.position.copy(this.objects.normal.camera.position)
            this.objects.logzbuf.camera.quaternion.copy(this.objects.normal.camera.quaternion)
            // Update renderer sizes if the split has changed
            if (this.screensplit_right != 1 - this.screensplit) {
                this.updateRendererSizes()
            }
            this.objects.normal.renderer.render(this.objects.normal.scene, this.objects.normal.camera)
            this.objects.logzbuf.renderer.render(this.objects.logzbuf.scene, this.objects.logzbuf.camera)
            this.stats.update()
        },
        onWindowResize() {
            this.updateRendererSizes()
            this.$statsPosition(this.stats)
        },
        onBorderPointerDown() {
            // activate draggable window resizing bar
            window.addEventListener("pointermove", this.onBorderPointerMove)
            window.addEventListener("pointerup", this.onBorderPointerUp)
        },
        onBorderPointerMove(ev) {
            this.screensplit = Math.max(0, Math.min(1, (ev.clientX - 281) / this.$webglInnerWidth))
        },
        onBorderPointerUp() {
            window.removeEventListener("pointermove", this.onBorderPointerMove)
            window.removeEventListener("pointerup", this.onBorderPointerUp)
        },
        onMouseMove(ev) {
            this.mouse[0] = (ev.clientX - 281) / this.$webglInnerWidth
            this.mouse[1] = ev.clientY / window.innerHeight
        },
        onMouseWheel(ev) {
            var amount = ev.deltaY
            if (amount === 0) return
            var dir = amount / Math.abs(amount)
            this.zoomspeed = dir / 10
            // Slow down default zoom speed after user starts zooming, to give them more control
            this.minzoomspeed = 0.001
        }
    }
}
</script>

<style scoped>
.webglCameraLogarithmicdepthbuffer-this {
    position: relative;
    width: 100%;
    touch-action: none;
}
.renderer_label {
    position: absolute;
    bottom: 1em;
    width: 100%;
    color: white;
    z-index: 10;
    display: block;
    text-align: center;
}

#container {
    display: flex;
}

#container_normal {
    width: 50%;
    display: inline-block;
    position: relative;
}

#container_logzbuf {
    width: 50%;
    display: inline-block;
    position: relative;
}

#renderer_border {
    position: absolute;
    top: 0;
    left: 68% !important;
    bottom: 0;
    width: 2px;
    z-index: 10;
    opacity: .8;
    background: #ccc;
    border: 1px inset #ccc;
    cursor: col-resize;
}
#info {
    margin-left: 0;
}
</style>
