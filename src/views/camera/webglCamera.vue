<template>
    <div class="webglCamera-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - cameras<br/>
		    <b>O</b> orthographic <b>P</b> perspective
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
			aspect: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
            cameraRig: null,
            activeCamera: null,
            activeHelper: null,
            cameraPerspective: null,
            cameraOrtho: null,
            cameraPerspectiveHelper: null,
            cameraOrthoHelper: null,
			frustumSize: 600,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.SCREEN_HEIGHT = window.innerHeight
        this.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglCamera-container')[0].appendChild(this.container)
            this.scene = new this.$THREE.Scene()
            //
            this.camera = new this.$THREE.PerspectiveCamera(50, 0.5 * this.aspect, 1, 10000)
            this.camera.position.z = 2500
            this.cameraPerspective = new this.$THREE.PerspectiveCamera(50, 0.5 * this.aspect, 150, 1000)
            this.cameraPerspectiveHelper = new this.$THREE.CameraHelper(this.cameraPerspective)
            this.scene.add(this.cameraPerspectiveHelper)
            //
            this.cameraOrtho = new this.$THREE.OrthographicCamera(0.5 * this.frustumSize * this.aspect / - 2, 0.5 * this.frustumSize * this.aspect / 2, this.frustumSize / 2, this.frustumSize / - 2, 150, 1000)
            this.cameraOrthoHelper = new this.$THREE.CameraHelper(this.cameraOrtho)
            this.scene.add(this.cameraOrthoHelper)
            //
            this.activeCamera = this.cameraPerspective
            this.activeHelper = this.cameraPerspectiveHelper
            // counteract different front orientation of this.cameras vs rig
            this.cameraOrtho.rotation.y = Math.PI
            this.cameraPerspective.rotation.y = Math.PI
            this.cameraRig = new this.$THREE.Group()
            this.cameraRig.add(this.cameraPerspective)
            this.cameraRig.add(this.cameraOrtho)
            this.scene.add(this.cameraRig)
            //
            this.mesh = new this.$THREE.Mesh(
                new this.$THREE.SphereBufferGeometry(100, 16, 8),
                new this.$THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
            )
            this.scene.add(this.mesh)
            var mesh2 = new this.$THREE.Mesh(
                new this.$THREE.SphereBufferGeometry(50, 16, 8),
                new this.$THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
            )
            mesh2.position.y = 150
            this.mesh.add(mesh2)
            var mesh3 = new this.$THREE.Mesh(
                new this.$THREE.SphereBufferGeometry(5, 16, 8),
                new this.$THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
            )
            mesh3.position.z = 150
            this.cameraRig.add(mesh3)
            //
            var geometry = new this.$THREE.BufferGeometry()
            var vertices = []
            for (var i = 0; i < 10000; i ++) {
                vertices.push(this.$THREE.MathUtils.randFloatSpread(2000)) // x
                vertices.push(this.$THREE.MathUtils.randFloatSpread(2000)) // y
                vertices.push(this.$THREE.MathUtils.randFloatSpread(2000)) // z
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3))
            var particles = new this.$THREE.Points(geometry, new this.$THREE.PointsMaterial({ color: 0x888888 }))
            this.scene.add(particles)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.autoClear = false
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('keydown', this.onKeyDown, false)
        },
        onKeyDown(event) {
            switch (event.keyCode) {
                case 79: /*O*/
                    this.activeCamera = this.cameraOrtho
                    this.activeHelper = this.cameraOrthoHelper
                    break
                case 80: /*P*/
                    this.activeCamera = this.cameraPerspective
                    this.activeHelper = this.cameraPerspectiveHelper
                    break
            }
        },
        onWindowResize() {
            this.SCREEN_WIDTH = window.innerWidth - 281
            this.SCREEN_HEIGHT = window.innerHeight
            this.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            this.camera.aspect = 0.5 * this.aspect
            this.camera.updateProjectionMatrix()
            this.cameraPerspective.aspect = 0.5 * this.aspect
            this.cameraPerspective.updateProjectionMatrix()
            this.cameraOrtho.left = - 0.5 * this.frustumSize * this.aspect / 2
            this.cameraOrtho.right = 0.5 * this.frustumSize * this.aspect / 2
            this.cameraOrtho.top = this.frustumSize / 2
            this.cameraOrtho.bottom = - this.frustumSize / 2
            this.cameraOrtho.updateProjectionMatrix()
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var r = Date.now() * 0.0005
            this.mesh.position.x = 700 * Math.cos(r)
            this.mesh.position.z = 700 * Math.sin(r)
            this.mesh.position.y = 700 * Math.sin(r)
            this.mesh.children[ 0 ].position.x = 70 * Math.cos(2 * r)
            this.mesh.children[ 0 ].position.z = 70 * Math.sin(r)
            if (this.activeCamera === this.cameraPerspective) {
                this.cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r)
                this.cameraPerspective.far = this.mesh.position.length()
                this.cameraPerspective.updateProjectionMatrix()
                this.cameraPerspectiveHelper.update()
                this.cameraPerspectiveHelper.visible = true
                this.cameraOrthoHelper.visible = false
            } else {
                this.cameraOrtho.far = this.mesh.position.length()
                this.cameraOrtho.updateProjectionMatrix()
                this.cameraOrthoHelper.update()
                this.cameraOrthoHelper.visible = true
                this.cameraPerspectiveHelper.visible = false
            }
            this.cameraRig.lookAt(this.mesh.position)
            this.renderer.clear()
            this.activeHelper.visible = false
            this.renderer.setViewport(0, 0, this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT)
            this.renderer.render(this.scene, this.activeCamera)
            this.activeHelper.visible = true
            this.renderer.setViewport(this.SCREEN_WIDTH / 2, 0, this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglCamera-container {
    position: relative;
    width: 100%;
}
b {
    color: lightgreen;
}
#info {
    margin-left: 0;
}
</style>
