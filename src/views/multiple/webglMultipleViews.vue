<template>
    <div class="webglMultipleViews-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - multiple views - webgl</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            stats: null,
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
            windowWidth: null,
            windowHeight: null,
			views: null,
        }
    },
    mounted() {
        this.views = [
            {
                left: 0,
                bottom: 0,
                width: 0.5,
                height: 1.0,
                background: new this.$THREE.Color(0.5, 0.5, 0.7),
                eye: [ 0, 300, 1800 ],
                up: [ 0, 1, 0 ],
                fov: 30,
                updateCamera: (camera, scene, mouseX) => {
                    camera.position.x += mouseX * 0.05;
                    camera.position.x = Math.max(Math.min(camera.position.x, 2000), - 2000);
                    camera.lookAt(scene.position);
                }
            },
            {
                left: 0.5,
                bottom: 0,
                width: 0.5,
                height: 0.5,
                background: new this.$THREE.Color(0.7, 0.5, 0.5),
                eye: [ 0, 1800, 0 ],
                up: [ 0, 0, 1 ],
                fov: 45,
                updateCamera: (camera, scene, mouseX) => {
                    camera.position.x -= mouseX * 0.05;
                    camera.position.x = Math.max(Math.min(camera.position.x, 2000), - 2000);
                    camera.lookAt(camera.position.clone().setY(0));
                }
            },
            {
                left: 0.5,
                bottom: 0.5,
                width: 0.5,
                height: 0.5,
                background: new this.$THREE.Color(0.5, 0.7, 0.7),
                eye: [ 1400, 800, 1400 ],
                up: [ 0, 1, 0 ],
                fov: 60,
                updateCamera: (camera, scene, mouseX) => {
                    camera.position.y -= mouseX * 0.05;
                    camera.position.y = Math.max(Math.min(camera.position.y, 1600), - 1600);
                    camera.lookAt(scene.position);
                }
            }
        ]
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            for (var ii = 0; ii < this.views.length; ++ ii) {
                var view = this.views[ ii ]
                var camera = new this.$THREE.PerspectiveCamera(view.fov, this.$webglInnerWidth / window.innerHeight, 1, 10000)
                camera.position.fromArray(view.eye)
                camera.up.fromArray(view.up)
                view.camera = camera
            }
            this.scene = new this.$THREE.Scene()
            var light = new this.$THREE.DirectionalLight(0xffffff)
            light.position.set(0, 0, 1)
            this.scene.add(light)
            // shadow
            var canvas = document.createElement('canvas')
            canvas.width = 128
            canvas.height = 128
            var context = canvas.getContext('2d')
            var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2)
            gradient.addColorStop(0.1, 'rgba(0,0,0,0.15)')
            gradient.addColorStop(1, 'rgba(0,0,0,0)')
            context.fillStyle = gradient
            context.fillRect(0, 0, canvas.width, canvas.height)
            var shadowTexture = new this.$THREE.CanvasTexture(canvas)
            var shadowMaterial = new this.$THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true })
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
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$statsPosition(this.stats)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowWidth / 2)
            this.mouseY = (event.clientY - this.windowHeight / 2)
        },
        updateSize() {
            if (this.windowWidth != this.$webglInnerWidth || this.windowHeight != window.innerHeight) {
                this.windowWidth = this.$webglInnerWidth
                this.windowHeight = window.innerHeight
                this.renderer.setSize(this.windowWidth, this.windowHeight)
            }
        },
        animate() {
            this.render()
            this.stats.update()
            requestAnimationFrame(this.animate)
        },
        render() {
            this.updateSize()
            for (var ii = 0; ii < this.views.length; ++ ii) {
                var view = this.views[ ii ]
                var camera = view.camera
                view.updateCamera(camera, this.scene, this.mouseX, this.mouseY)
                var left = Math.floor(this.windowWidth * view.left)
                var bottom = Math.floor(this.windowHeight * view.bottom)
                var width = Math.floor(this.windowWidth * view.width)
                var height = Math.floor(this.windowHeight * view.height)
                this.renderer.setViewport(left, bottom, width, height)
                this.renderer.setScissor(left, bottom, width, height)
                this.renderer.setScissorTest(true)
                this.renderer.setClearColor(view.background)
                camera.aspect = width / height
                camera.updateProjectionMatrix()
                this.renderer.render(this.scene, camera)
            }
        }
    },
}
</script>

<style scoped>
.webglMultipleViews-container {
    position: relative;
    width: 100%;
}
</style>
