<template>
    <div class="webglGeometries-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - geometries</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.y = 400
            this.scene = new this.$THREE.Scene()
            var object
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            this.scene.add(this.camera)
            var map = new this.$THREE.TextureLoader().load('static/textures/uv_grid_opengl.jpg')
            map.wrapS = map.wrapT = this.$THREE.RepeatWrapping
            map.anisotropy = 16
            var material = new this.$THREE.MeshPhongMaterial({ map: map, side: this.$THREE.DoubleSide })
            //
            object = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(75, 20, 10), material)
            object.position.set(- 300, 0, 200)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.IcosahedronBufferGeometry(75, 1), material)
            object.position.set(- 100, 0, 200)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.OctahedronBufferGeometry(75, 2), material)
            object.position.set(100, 0, 200)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.TetrahedronBufferGeometry(75, 0), material)
            object.position.set(300, 0, 200)
            this.scene.add(object)
            //
            object = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(100, 100, 4, 4), material)
            object.position.set(- 300, 0, 0)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(100, 100, 100, 4, 4, 4), material)
            object.position.set(- 100, 0, 0)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.CircleBufferGeometry(50, 20, 0, Math.PI * 2), material)
            object.position.set(100, 0, 0)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.RingBufferGeometry(10, 50, 20, 5, 0, Math.PI * 2), material)
            object.position.set(300, 0, 0)
            this.scene.add(object)
            //
            object = new this.$THREE.Mesh(new this.$THREE.CylinderBufferGeometry(25, 75, 100, 40, 5), material)
            object.position.set(- 300, 0, - 200)
            this.scene.add(object)
            var points = []
            for (var i = 0; i < 50; i ++) {
                points.push(new this.$THREE.Vector2(Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50, (i - 5) * 2))
            }
            object = new this.$THREE.Mesh(new this.$THREE.LatheBufferGeometry(points, 20), material)
            object.position.set(- 100, 0, - 200)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.TorusBufferGeometry(50, 20, 20, 20), material)
            object.position.set(100, 0, - 200)
            this.scene.add(object)
            object = new this.$THREE.Mesh(new this.$THREE.TorusKnotBufferGeometry(50, 10, 50, 20), material)
            object.position.set(300, 0, - 200)
            this.scene.add(object)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometries-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglGeometries-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var timer = Date.now() * 0.0001
            this.camera.position.x = Math.cos(timer) * 800
            this.camera.position.z = Math.sin(timer) * 800
            this.camera.lookAt(this.scene.position)
            this.scene.traverse(function (object) {
                if (object.isMesh === true) {
                    object.rotation.x = timer * 5
                    object.rotation.y = timer * 2.5
                }
            })
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometries-container {
    width: 100%;
}
</style>
