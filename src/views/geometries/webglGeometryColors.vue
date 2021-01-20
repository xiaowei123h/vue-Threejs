<template>
    <div class="webglGeometryColors-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - vertex colors</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            container: null,
            stats: null,
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
        this.windowHalfX = this.$webglInnerWidth/ 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(20, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 1800
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 0, 1)
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
            shadowMesh.position.y = - 250
            shadowMesh.position.x = - 400
            shadowMesh.rotation.x = - Math.PI / 2
            this.scene.add(shadowMesh)
            shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial)
            shadowMesh.position.y = - 250
            shadowMesh.position.x = 400
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
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX)
            this.mouseY = (event.clientY - this.windowHalfY)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * 0.05
            this.camera.lookAt(this.scene.position)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryColors-container {
    width: 100%;
    background-color: #fff;
	color: #444;
}
.webglGeometryColors-container a {
    color: #08f;
}
</style>
