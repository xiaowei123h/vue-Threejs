<template>
    <div class="webglInteractiveVoxelpainter-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - voxel painter - webgl<br>
			<strong>click</strong>: add voxel, <strong>shift + click</strong>: remove voxel
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
			plane: null,
            mouse: null,
            raycaster: null,
            isShiftDown: false,
            rollOverMesh: null,
            rollOverMaterial: null,
            cubeGeo: null,
            cubeMaterial: null,
			objects: []
        }
    },
    mounted() {
        this.init()
		this.render()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set(500, 800, 1300)
            this.camera.lookAt(0, 0, 0)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            // roll-over helpers
            var rollOverGeo = new this.$THREE.BoxBufferGeometry(50, 50, 50)
            this.rollOverMaterial = new this.$THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true })
            this.rollOverMesh = new this.$THREE.Mesh(rollOverGeo, this.rollOverMaterial)
            this.scene.add(this.rollOverMesh)
            // cubes
            this.cubeGeo = new this.$THREE.BoxBufferGeometry(50, 50, 50)
            this.cubeMaterial = new this.$THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new this.$THREE.TextureLoader().load('textures/square-outline-textured.png') })
            // grid
            var gridHelper = new this.$THREE.GridHelper(1000, 20)
            this.scene.add(gridHelper)
            //
            this.raycaster = new this.$THREE.Raycaster()
            this.mouse = new this.$THREE.Vector2()
            var geometry = new this.$THREE.PlaneBufferGeometry(1000, 1000)
            geometry.rotateX(- Math.PI / 2)
            this.plane = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ visible: false }))
            this.scene.add(this.plane)
            this.objects.push(this.plane)
            // lights
            var ambientLight = new this.$THREE.AmbientLight(0x606060)
            this.scene.add(ambientLight)
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff)
            directionalLight.position.set(1, 0.75, 0.5).normalize()
            this.scene.add(directionalLight)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglInteractiveVoxelpainter-container')[0].appendChild(this.renderer.domElement)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            document.addEventListener('mousedown', this.onDocumentMouseDown, false)
            document.addEventListener('keydown', this.onDocumentKeyDown, false)
            document.addEventListener('keyup', this.onDocumentKeyUp, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            var x, y
            if (window.innerWidth >= 640) {
                x = 281
                y = 0
            } else {
                x = 0
                y = 49
            }
            event.preventDefault()
            this.mouse.set(((event.clientX - x) / (window.innerWidth - x)) * 2 - 1, - ((event.clientY - y) / window.innerHeight) * 2 + 1)
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObjects(this.objects)
            if (intersects.length > 0) {
                var intersect = intersects[ 0 ]
                this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal)
                this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
            }
            this.render()
        },
        onDocumentMouseDown(event) {
            var x, y
            if (window.innerWidth >= 640) {
                x = 281
                y = 0
            } else {
                x = 0
                y = 49
            }
            event.preventDefault()
            this.mouse.set(((event.clientX - x) / (window.innerWidth - x)) * 2 - 1, - ((event.clientY - y) / window.innerHeight) * 2 + 1)
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObjects(this.objects)
            if (intersects.length > 0) {
                var intersect = intersects[ 0 ]
                // delete cube
                if (this.isShiftDown) {
                    if (intersect.object !== plane) {
                        this.scene.remove(intersect.object)
                        this.objects.splice(this.objects.indexOf(intersect.object), 1)
                    }
                    // create cube
                } else {
                    var voxel = new this.$THREE.Mesh(this.cubeGeo, this.cubeMaterial)
                    voxel.position.copy(intersect.point).add(intersect.face.normal)
                    voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
                    this.scene.add(voxel)
                    this.objects.push(voxel)
                }
                this.render()
            }

        },
        onDocumentKeyDown(event) {
            switch (event.keyCode) {
                case 16: this.isShiftDown = true; break
            }
        },
        onDocumentKeyUp(event) {
            switch (event.keyCode) {
                case 16: this.isShiftDown = false; break
            }
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInteractiveVoxelpainter-container {
    position: relative;
    width: 100%;
    background-color: #f0f0f0;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
