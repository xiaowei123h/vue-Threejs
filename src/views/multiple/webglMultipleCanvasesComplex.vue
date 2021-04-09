<template>
    <div class="webglMultipleCanvasesComplex-container">
        <div id="container">
			<canvas id="canvas1"></canvas>
			<canvas id="canvas2"></canvas>
			<canvas id="canvas3"></canvas>
		</div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - multiple canvases - complex</div>
    </div>
</template>

<script>
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
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        View(canvas, fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight, THREE, scene, renderer) {
            canvas.width = viewWidth * window.devicePixelRatio
            canvas.height = viewHeight * window.devicePixelRatio
            var context = canvas.getContext('2d')
            var camera = new THREE.PerspectiveCamera(20, viewWidth / viewHeight, 1, 10000)
            camera.setViewOffset(fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight)
            camera.position.z = 1800
            this.render = (mouseX, mouseY) => {
                camera.position.x += (mouseX - camera.position.x) * 0.05
                camera.position.y += (- mouseY - camera.position.y) * 0.05
                camera.lookAt(scene.position)
                renderer.setViewport(0, fullHeight - viewHeight, viewWidth, viewHeight)
                renderer.render(scene, camera)
                context.drawImage(renderer.domElement, 0, 0)
            }
        },
        init() {
            var canvas1 = document.getElementById('canvas1')
            var canvas2 = document.getElementById('canvas2')
            var canvas3 = document.getElementById('canvas3')
            var fullWidth = 550
            var fullHeight = 600
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(fullWidth, fullHeight)
            this.views.push(new this.View(canvas1, fullWidth, fullHeight, 0, 0, canvas1.clientWidth, canvas1.clientHeight, this.$THREE, this.scene, this.renderer))
            this.views.push(new this.View(canvas2, fullWidth, fullHeight, 150, 200, canvas2.clientWidth, canvas2.clientHeight, this.$THREE, this.scene, this.renderer))
            this.views.push(new this.View(canvas3, fullWidth, fullHeight, 75, 300, canvas3.clientWidth, canvas3.clientHeight, this.$THREE, this.scene, this.renderer))
            //
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 0, 1).normalize()
            this.scene.add(light)
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
            var shadowMesh
            shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial)
            shadowMesh.position.y = - 250
            shadowMesh.rotation.x = - Math.PI / 2
            this.scene.add(shadowMesh)
            shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial)
            shadowMesh.position.x = - 400
            shadowMesh.position.y = - 250
            shadowMesh.rotation.x = - Math.PI / 2
            this.scene.add(shadowMesh)
            shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial)
            shadowMesh.position.x = 400
            shadowMesh.position.y = - 250
            shadowMesh.rotation.x = - Math.PI / 2
            this.scene.add(shadowMesh)
            var radius = 200
            var geometry1 = new this.$THREE.IcosahedronBufferGeometry(radius, 1)
            var count = geometry1.attributes.position.count
            geometry1.setAttribute('color', new this.$THREE.BufferAttribute(new Float32Array(count * 3), 3))
            var geometry2 = geometry1.clone()
            var geometry3 = geometry1.clone()
            var color = new this.$THREE.Color()
            var positions1 = geometry1.attributes.position
            var positions2 = geometry2.attributes.position
            var positions3 = geometry3.attributes.position
            var colors1 = geometry1.attributes.color
            var colors2 = geometry2.attributes.color
            var colors3 = geometry3.attributes.color
            for (var i = 0; i < count; i ++) {
                color.setHSL((positions1.getY(i) / radius + 1) / 2, 1.0, 0.5)
                colors1.setXYZ(i, color.r, color.g, color.b)
                color.setHSL(0, (positions2.getY(i) / radius + 1) / 2, 0.5)
                colors2.setXYZ(i, color.r, color.g, color.b)
                color.setRGB(1, 0.8 - (positions3.getY(i) / radius + 1) / 2, 0)
                colors3.setXYZ(i, color.r, color.g, color.b)
            }
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: true,
                vertexColors: true,
                shininess: 0
            })
            var wireframeMaterial = new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true })
            var mesh = new this.$THREE.Mesh(geometry1, material)
            var wireframe = new this.$THREE.Mesh(geometry1, wireframeMaterial)
            mesh.add(wireframe)
            mesh.position.x = - 400
            mesh.rotation.x = - 1.87
            this.scene.add(mesh)
            mesh = new this.$THREE.Mesh(geometry2, material)
            wireframe = new this.$THREE.Mesh(geometry2, wireframeMaterial)
            mesh.add(wireframe)
            mesh.position.x = 400
            this.scene.add(mesh)
            mesh = new this.$THREE.Mesh(geometry3, material)
            wireframe = new this.$THREE.Mesh(geometry3, wireframeMaterial)
            mesh.add(wireframe)
            this.scene.add(mesh)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
        },
        onDocumentMouseMove(event) {
            this.mouseX = event.clientX - this.windowHalfX
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
.webglMultipleCanvasesComplex-container {
    position: relative;
    width: 100%;
    background-color: #fff;
}
#info {
    color: #444;
    margin-left: 0;
}
#info a {
    color: #08f;
}
#canvas1, #canvas2, #canvas3 {
    position: relative;
    display: block;
    outline: 1px solid red;
}
#canvas1 {
    width: 300px;
    height: 200px;
}
#canvas2 {
    width: 400px;
    height: 100px;
    left: 150px;
}
#canvas3 {
    width: 200px;
    height: 300px;
    left: 75px;
}
</style>
