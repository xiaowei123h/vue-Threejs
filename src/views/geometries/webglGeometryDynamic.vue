<template>
    <div class="webglGeometryDynamic-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - dynamic geometry<br />
			left click: forward, right click: backward
		</div>
    </div>
</template>

<script>
import { FirstPersonControls } from '@/components/jsm/controls/FirstPersonControls.js'
export default {
    data() {
        return {
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            stats: null,
            mesh: null,
            geometry: null,
            material: null,
            clock: null,
            worldWidth: 128,
            worldDepth: 128,
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 20000)
            this.camera.position.y = 200
            this.clock = new this.$THREE.Clock()
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xaaccff)
            this.scene.fog = new this.$THREE.FogExp2(0xaaccff, 0.0007)
            this.geometry = new this.$THREE.PlaneBufferGeometry(20000, 20000, this.worldWidth - 1, this.worldDepth - 1)
            this.geometry.rotateX(- Math.PI / 2)
            var position = this.geometry.attributes.position
            position.usage = this.$THREE.DynamicDrawUsage
            for (var i = 0; i < position.count; i ++) {
                var y = 35 * Math.sin(i / 2)
                position.setY(i, y)
            }
            var texture = new this.$THREE.TextureLoader().load('static/textures/water.jpg')
            texture.wrapS = texture.wrapT = this.$THREE.RepeatWrapping
            texture.repeat.set(5, 5)
            this.material = new this.$THREE.MeshBasicMaterial({ color: 0x0044ff, map: texture })
            this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
            this.scene.add(this.mesh)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglGeometryDynamic-container')[0].appendChild(this.renderer.domElement)
            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)
            this.controls.movementSpeed = 500
            this.controls.lookSpeed = 0.1
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglGeometryDynamic-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.controls.handleResize()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var delta = this.clock.getDelta()
            var time = this.clock.getElapsedTime() * 10
            var position = this.geometry.attributes.position
            for (var i = 0; i < position.count; i ++) {
                var y = 35 * Math.sin(i / 5 + (time + i) / 7)
                position.setY(i, y)
            }
            position.needsUpdate = true
            this.controls.update(delta)
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglGeometryDynamic-container {
    position: relative;
    width: 100%;
    color: #666;
}
</style>
