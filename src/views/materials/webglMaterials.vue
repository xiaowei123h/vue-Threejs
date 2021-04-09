<template>
    <div class="webglMaterials-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl materials
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			pointLight: null,
            objects: [],
            materials: [],
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglMaterials-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.set(0, 200, 800)
            this.scene = new this.$THREE.Scene()
            // Grid
            var helper = new this.$THREE.GridHelper(1000, 40, 0x303030, 0x303030)
            helper.position.y = - 75
            this.scene.add(helper)
            // Materials
            var texture = new this.$THREE.Texture(this.generateTexture())
            texture.needsUpdate = true
            this.materials.push(new this.$THREE.MeshLambertMaterial({ map: texture, transparent: true }))
            this.materials.push(new this.$THREE.MeshLambertMaterial({ color: 0xdddddd }))
            this.materials.push(new this.$THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30, flatShading: true }))
            this.materials.push(new this.$THREE.MeshNormalMaterial())
            this.materials.push(new this.$THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, blending: this.$THREE.AdditiveBlending }))
            this.materials.push(new this.$THREE.MeshLambertMaterial({ color: 0xdddddd }))
            this.materials.push(new this.$THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30, map: texture, transparent: true }))
            this.materials.push(new this.$THREE.MeshNormalMaterial({ flatShading: true }))
            this.materials.push(new this.$THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true }))
            this.materials.push(new this.$THREE.MeshDepthMaterial())
            this.materials.push(new this.$THREE.MeshLambertMaterial({ color: 0x666666, emissive: 0xff0000 }))
            this.materials.push(new this.$THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x666666, emissive: 0xff0000, shininess: 10, opacity: 0.9, transparent: true }))
            this.materials.push(new this.$THREE.MeshBasicMaterial({ map: texture, transparent: true }))
            // Spheres geometry
            var geometry = new this.$THREE.SphereBufferGeometry(70, 32, 16)
            for (let i = 0, l = this.materials.length; i < l; i ++) {
                this.addMesh(geometry, this.materials[ i ])
            }
            // Lights
            this.scene.add(new this.$THREE.AmbientLight(0x111111))
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff, 0.125)
            directionalLight.position.x = Math.random() - 0.5
            directionalLight.position.y = Math.random() - 0.5
            directionalLight.position.z = Math.random() - 0.5
            directionalLight.position.normalize()
            this.scene.add(directionalLight)
            this.pointLight = new this.$THREE.PointLight(0xffffff, 1)
            this.scene.add(this.pointLight)
            this.pointLight.add(new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(4, 8, 8), new this.$THREE.MeshBasicMaterial({ color: 0xffffff })))
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        addMesh(geometry, material) {
            var mesh = new this.$THREE.Mesh(geometry, material)
            mesh.position.x = (this.objects.length % 4) * 200 - 400
            mesh.position.z = Math.floor(this.objects.length / 4) * 200 - 200
            mesh.rotation.x = Math.random() * 200 - 100
            mesh.rotation.y = Math.random() * 200 - 100
            mesh.rotation.z = Math.random() * 200 - 100
            this.objects.push(mesh)
            this.scene.add(mesh)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        generateTexture() {
            var canvas = document.createElement('canvas')
            canvas.width = 256
            canvas.height = 256
            var context = canvas.getContext('2d')
            var image = context.getImageData(0, 0, 256, 256)
            var x = 0, y = 0
            for (var i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++) {
                x = j % 256
                y = (x === 0) ? y + 1 : y
                image.data[ i ] = 255
                image.data[ i + 1 ] = 255
                image.data[ i + 2 ] = 255
                image.data[ i + 3 ] = Math.floor(x ^ y)
            }
            context.putImageData(image, 0, 0)
            return canvas
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var timer = 0.0001 * Date.now()
            this.camera.position.x = Math.cos(timer) * 1000
            this.camera.position.z = Math.sin(timer) * 1000
            this.camera.lookAt(this.scene.position)
            for (var i = 0, l = this.objects.length; i < l; i ++) {
                var object = this.objects[ i ];
                object.rotation.x += 0.01;
                object.rotation.y += 0.005;
            }
            this.materials[ this.materials.length - 2 ].emissive.setHSL(0.54, 1, 0.35 * (0.5 + 0.5 * Math.sin(35 * timer)))
            this.materials[ this.materials.length - 3 ].emissive.setHSL(0.04, 1, 0.35 * (0.5 + 0.5 * Math.cos(35 * timer)))
            this.pointLight.position.x = Math.sin(timer * 7) * 300
            this.pointLight.position.y = Math.cos(timer * 5) * 400
            this.pointLight.position.z = Math.cos(timer * 3) * 300
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterials-container {
    position: relative;
    width: 100%;
}
</style>
