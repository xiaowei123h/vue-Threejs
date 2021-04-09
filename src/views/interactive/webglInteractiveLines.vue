<template>
    <div class="webglInteractiveLines-container">
        
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
            raycaster: null,
            renderer: null,
            parentTransform: null,
            sphereInter: null,
			mouse: null,
			radius: 100,
			theta: 0,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglInteractiveLines-container')[0].appendChild(this.container)
            var info = document.createElement('div')
            info.style.position = 'absolute'
            info.style.top = '10px'
            info.style.width = '100%'
            info.style.textAlign = 'center'
            info.innerHTML = '<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive lines'
            this.container.appendChild(info)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            var geometry = new this.$THREE.SphereBufferGeometry(5)
            var material = new this.$THREE.MeshBasicMaterial({ color: 0xff0000 })
            this.sphereInter = new this.$THREE.Mesh(geometry, material)
            this.sphereInter.visible = false
            this.scene.add(this.sphereInter)
            var lineGeometry = new this.$THREE.BufferGeometry()
            var points = []
            var point = new this.$THREE.Vector3()
            var direction = new this.$THREE.Vector3()
            for (var i = 0; i < 50; i ++) {
                direction.x += Math.random() - 0.5
                direction.y += Math.random() - 0.5
                direction.z += Math.random() - 0.5
                direction.normalize().multiplyScalar(10)
                point.add(direction)
                points.push(point.x, point.y, point.z)
            }
            lineGeometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(points, 3))
            this.parentTransform = new this.$THREE.Object3D()
            this.parentTransform.position.x = Math.random() * 40 - 20
            this.parentTransform.position.y = Math.random() * 40 - 20
            this.parentTransform.position.z = Math.random() * 40 - 20
            this.parentTransform.rotation.x = Math.random() * 2 * Math.PI
            this.parentTransform.rotation.y = Math.random() * 2 * Math.PI
            this.parentTransform.rotation.z = Math.random() * 2 * Math.PI
            this.parentTransform.scale.x = Math.random() + 0.5
            this.parentTransform.scale.y = Math.random() + 0.5
            this.parentTransform.scale.z = Math.random() + 0.5
            for (var i = 0; i < 50; i ++) {
                var object
                var lineMaterial = new this.$THREE.LineBasicMaterial({ color: Math.random() * 0xffffff })
                if (Math.random() > 0.5) {
                    object = new this.$THREE.Line(lineGeometry, lineMaterial)
                } else {
                    object = new this.$THREE.LineSegments(lineGeometry, lineMaterial)
                }
                object.position.x = Math.random() * 400 - 200
                object.position.y = Math.random() * 400 - 200
                object.position.z = Math.random() * 400 - 200
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.x = Math.random() + 0.5
                object.scale.y = Math.random() + 0.5
                object.scale.z = Math.random() + 0.5
                this.parentTransform.add(object)
            }
            this.scene.add(this.parentTransform)
            this.raycaster = new this.$THREE.Raycaster()
            this.raycaster.params.Line.threshold = 3
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onDocumentMouseMove(event) {
            event.preventDefault()
            this.mouse.x = ((event.clientX - 281) / (window.innerWidth - 281)) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.theta += 0.1
            this.camera.position.x = this.radius * Math.sin(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.position.y = this.radius * Math.sin(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.position.z = this.radius * Math.cos(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.lookAt(this.scene.position)
            this.camera.updateMatrixWorld()
            // find intersections
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObjects(this.parentTransform.children, true)
            if (intersects.length > 0) {
                this.sphereInter.visible = true
                this.sphereInter.position.copy(intersects[ 0 ].point)
            } else {
                this.sphereInter.visible = false
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInteractiveLines-container {
    position: relative;
    width: 100%;
    background-color: #f0f0f0;
    color: #444;
}
a {
    color: #08f;
}
</style>
