<template>
    <div class="webglMultipleCanvasesCircle-container">
        <div id="container">
            <div id="stage">
                <div id="shape" class="ring backfaces">
                    <canvas id="canvas1" class="ring r1"></canvas>
                    <canvas id="canvas2" class="ring r2"></canvas>
                    <canvas id="canvas3" class="ring r3"></canvas>
                    <canvas id="canvas4" class="ring r4"></canvas>
                    <canvas id="canvas5" class="ring r5"></canvas>
                </div>
            </div>
        </div>

        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - multiple canvases - circle</div>
        <div id="help" gstyle="display: none">
            <div>
            <a href="https://www.google.com/earth/explore/showcase/liquidgalaxy.html">Google's Liquid Galaxy</a> simulator.<br/>
            Here 5 monitors are simulated using 3d css. WebGL is then rendered onto each one.
            </div>
        </div>
    </div>
</template>

<script>
import { View } from '@/utils/webglMultipleCanvasesCircle.js'
export default {
    data() {
        return {
            views: [],
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
            windowHalfX: null,
            windowHalfY: null,
            camera: null,
        }
    },
    mounted() {
        this.windowHalfX = window.innerWidth / 2
		this.windowHalfY = window.innerHeight / 2
		this.init()
		this.animate()
    },
    methods: {
        init() {
			var canvas1 = document.getElementById('canvas1')
			var canvas2 = document.getElementById('canvas2')
			var canvas3 = document.getElementById('canvas3')
			var canvas4 = document.getElementById('canvas4')
			var canvas5 = document.getElementById('canvas5')
			var fudge = 0.45 // I don't know why this is needed :-(
            var rot = 30 * this.$THREE.MathUtils.DEG2RAD
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(200, 300)
			this.views.push(new View(canvas1, rot * - 2 * fudge, this.$THREE, this.scene, this.renderer))
			this.views.push(new View(canvas2, rot * - 1 * fudge, this.$THREE, this.scene, this.renderer))
			this.views.push(new View(canvas3, rot *	0 * fudge, this.$THREE, this.scene, this.renderer))
			this.views.push(new View(canvas4, rot *	1 * fudge, this.$THREE, this.scene, this.renderer))
			this.views.push(new View(canvas5, rot *	2 * fudge, this.$THREE, this.scene, this.renderer))
			//
			var light = new this.$THREE.DirectionalLight(0xffffff)
			light.position.set(0, 0, 1).normalize()
			this.scene.add(light)
			var noof_balls = 51
			// shadow
			var canvas = document.createElement('canvas')
			canvas.width = 128
			canvas.height = 128
			var context = canvas.getContext('2d')
			var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2)
			gradient.addColorStop(0.1, 'rgba(210,210,210,1)')
			gradient.addColorStop(1, 'rgba(255,255,255,1)')
			context.fillStyle = gradient
			context.fillRect(0, 0, canvas.width, canvas.height)
			var shadowTexture = new this.$THREE.CanvasTexture(canvas)
			var shadowMaterial = new this.$THREE.MeshBasicMaterial({ map: shadowTexture })
			var shadowGeo = new this.$THREE.PlaneBufferGeometry(300, 300, 1, 1)
			for (var i = 0; i < noof_balls; i ++) { // create shadows
				var shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial)
				shadowMesh.position.x = - (noof_balls - 1) / 2 * 400 + i * 400
				shadowMesh.position.y = - 250
				shadowMesh.rotation.x = - Math.PI / 2
				this.scene.add(shadowMesh)
			}
			var radius = 200
			var geometry1 = new this.$THREE.IcosahedronBufferGeometry(radius, 1)
			var count = geometry1.attributes.position.count
			geometry1.setAttribute('color', new this.$THREE.BufferAttribute(new Float32Array(count * 3), 3))
			var color = new this.$THREE.Color()
			var positions = geometry1.attributes.position
			var colors = geometry1.attributes.color
			for (var i = 0; i < count; i ++) {
				color.setHSL((positions.getY(i) / radius + 1) / 2, 1.0, 0.5)
				colors.setXYZ(i, color.r, color.g, color.b)
			}
			var material = new this.$THREE.MeshPhongMaterial({
				color: 0xffffff,
				flatShading: true,
				vertexColors: true,
				shininess: 0
			})
			var wireframeMaterial = new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true })
			for (var i = 0; i < noof_balls; i ++) { // create balls
				var mesh = new this.$THREE.Mesh(geometry1, material)
				var wireframe = new this.$THREE.Mesh(geometry1, wireframeMaterial)
				mesh.add(wireframe)
				mesh.position.x = - (noof_balls - 1) / 2 * 400 + i * 400
				mesh.rotation.x = i * 0.5
				this.scene.add(mesh)
			}
			document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        },
        onDocumentMouseMove(event) {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
			this.mouseX = event.clientX - x - this.windowHalfX
			this.mouseY = event.clientY - this.windowHalfY
        },
        animate() {
			for (var i = 0; i < this.views.length; ++ i) {
				this.views[ i ].render(this.mouseX, this.mouseY)
			}
			requestAnimationFrame(this.animate)
		}
    },
}
</script>

<style scoped>
.webglMultipleCanvasesCircle-container {
    position: relative;
    width: 100%;
    background-color: #555;
}
#container {
    width: 100%;
    height: 700px;
    -webkit-perspective: 800px;
    -webkit-perspective-origin: 50% 225px;
    -moz-perspective: 800px;
    -moz-perspective-origin: 50% 225px;
    perspective: 800px;
    perspective-origin: 50% 225px;
}
#stage {
    width: 100%;
    height: 100%;
    -webkit-transform-style: preserve-3d;
    -moz-transform-style: preserve-3d;
    transform-style: preserve-3d;
}
#shape {
    position: relative;
    top: 160px;
    margin: 0 auto;
    height: 200px;
    width: 200px;
    -webkit-transform: translateZ(-0px);
    -webkit-transform-style: preserve-3d;
    -moz-transform: translateZ(-0px);
    -moz-transform-style: preserve-3d;
    transform: translateZ(-0px);
    transform-style: preserve-3d;
}
.ring {
    position: absolute;
    display: block;
    height: 300px;
    width: 200px;
    text-align: center;
    font-family: Times, serif;
    font-size: 124pt;
    color: black;
    background-color: #fff;
}
#shape {
    border: 0px;
    background-color: rgba(255, 255, 255, 0);
}
.ring > .r1 {
    -webkit-transform: rotateY(300deg) translateZ(-380px);
    -moz-transform: rotateY(300deg) translateZ(-380px);
    transform: rotateY(300deg) translateZ(-380px);
}
.ring > .r2 {
    -webkit-transform: rotateY(330deg) translateZ(-380px);
    -moz-transform: rotateY(330deg) translateZ(-380px);
    transform: rotateY(330deg) translateZ(-380px);
}
.ring > .r3 {
    -webkit-transform: rotateY(0deg) translateZ(-380px);
    -moz-transform: rotateY(0deg) translateZ(-380px);
    transform: rotateY(0deg) translateZ(-380px);
}
.ring > .r4 {
    -webkit-transform: rotateY(30deg) translateZ(-380px);
    -moz-transform: rotateY(30deg) translateZ(-380px);
    transform: rotateY(30deg) translateZ(-380px);
}
.ring > .r5 {
    -webkit-transform: rotateY(60deg) translateZ(-380px);
    -moz-transform: rotateY(60deg) translateZ(-380px);
    transform: rotateY(60deg) translateZ(-380px);
}
#info {
    position: absolute;
    top: 0px; width: 100%;
    padding: 5px;
}
#help {
    position: absolute;
    top: 50px; width: 100%;
    text-align: center;
}
#help>div {
    margin: auto;
    padding: 1em;
    background-color: rgba(0,0,0,0.3);
    width: 50%;
}
</style>
