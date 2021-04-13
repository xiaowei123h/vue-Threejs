<template>
    <div class="webglMultipleRenderers-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - multiple renderers</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer1: null,
            renderer2: null,
            mesh1: null,
            mesh2: null,
            mesh3: null,
			color: null,
        }
    },
    mounted() {
        this.color = new this.$THREE.Color()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(20, this.$webglInnerWidth / (window.innerHeight / 2), 1, 10000)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            var light1 = new this.$THREE.DirectionalLight(0xffffff)
            light1.position.set(0, 0, 1)
            this.scene.add(light1)
            var light2 = new this.$THREE.DirectionalLight(0xffff00, 0.75)
            light2.position.set(0, 0, - 1)
            this.scene.add(light2)
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
            var positions1 = geometry1.attributes.position
            var positions2 = geometry2.attributes.position
            var positions3 = geometry3.attributes.position
            var colors1 = geometry1.attributes.color
            var colors2 = geometry2.attributes.color
            var colors3 = geometry3.attributes.color
            for (var i = 0; i < count; i ++) {
                this.color.setHSL((positions1.getY(i) / radius + 1) / 2, 1.0, 0.5)
                colors1.setXYZ(i, this.color.r, this.color.g, this.color.b)
                this.color.setHSL(0, (positions2.getY(i) / radius + 1) / 2, 0.5)
                colors2.setXYZ(i, this.color.r, this.color.g, this.color.b)
                this.color.setRGB(1, 0.8 - (positions3.getY(i) / radius + 1) / 2, 0)
                colors3.setXYZ(i, this.color.r, this.color.g, this.color.b)
            }
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: true,
                vertexColors: true,
                shininess: 0
            })
            var wireframeMaterial = new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true })
            this.mesh1 = new this.$THREE.Mesh(geometry1, material)
            this.mesh1.position.x = - 400
            this.mesh1.rotation.x = - 1.87
            this.scene.add(this.mesh1)
            var wireframe1 = new this.$THREE.Mesh(geometry1, wireframeMaterial)
            this.mesh1.add(wireframe1)
            this.mesh2 = new this.$THREE.Mesh(geometry2, material)
            this.mesh2.position.x = 400
            this.scene.add(this.mesh2)
            var wireframe2 = new this.$THREE.Mesh(geometry2, wireframeMaterial)
            this.mesh2.add(wireframe2)
            this.mesh3 = new this.$THREE.Mesh(geometry3, material)
            this.scene.add(this.mesh3)
            var wireframe3 = new this.$THREE.Mesh(geometry3, wireframeMaterial)
            this.mesh3.add(wireframe3)
            //
            this.renderer1 = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer1.setPixelRatio(window.devicePixelRatio)
            this.renderer1.setSize(this.$webglInnerWidth, window.innerHeight / 2)
            document.getElementsByClassName('webglMultipleRenderers-container')[0].appendChild(this.renderer1.domElement)
            this.renderer2 = new this.$THREE.WebGLRenderer()
            this.renderer2.setPixelRatio(window.devicePixelRatio)
            this.renderer2.setSize(this.$webglInnerWidth, window.innerHeight / 2)
            document.getElementsByClassName('webglMultipleRenderers-container')[0].appendChild(this.renderer2.domElement)
        },
        animate() {
            requestAnimationFrame(this.animate)
            // update this.scene
            this.mesh1.rotation.z += Math.PI / 500
            this.mesh2.rotation.z += Math.PI / 500
            this.mesh3.rotation.z += Math.PI / 500
            var position = new this.$THREE.Vector3()
            var color = new this.$THREE.Color()
            var time = performance.now() / 500
            var positions = this.mesh3.geometry.attributes.position
            var colors = this.mesh3.geometry.attributes.color
            for (var i = 0, l = positions.count; i < l; i ++) {
                position.fromArray(positions.array, i * 3)
                color.setRGB(1, Math.sin(time + position.x), Math.cos(time * 2.123 + position.x))
                colors.setXYZ(i, color.r, color.g, color.b)
            }
            colors.needsUpdate = true
            //
            time = performance.now() / 2000
            this.camera.position.x = Math.sin(time) * 1800
            this.camera.position.z = Math.cos(time) * 1800
            this.camera.lookAt(this.scene.position)
            this.renderer1.render(this.scene, this.camera)
            this.renderer2.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMultipleRenderers-container {
    position: relative;
    width: 100%;
}
#info {
    background-color: #fff;
    color: #444;
}
#info a {
    color: #08f;
}
</style>
