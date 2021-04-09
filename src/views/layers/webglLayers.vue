<template>
    <div class="layers-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl layers
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            gui: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			theta: 0,
			radius: 100,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('layers-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.layers.enable(0) // enabled by default
            this.camera.layers.enable(1)
            this.camera.layers.enable(2)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            var light = new this.$THREE.PointLight(0xffffff, 1)
            light.layers.enable(0)
            light.layers.enable(1)
            light.layers.enable(2)
            this.scene.add(this.camera)
            this.camera.add(light)
            var colors = [ 0xff0000, 0x00ff00, 0x0000ff ]
            var geometry = new this.$THREE.BoxBufferGeometry(20, 20, 20)
            for (var i = 0; i < 300; i ++) {
                var layer = (i % 3)
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: colors[ layer ] }))
                object.position.x = Math.random() * 800 - 400
                object.position.y = Math.random() * 800 - 400
                object.position.z = Math.random() * 800 - 400
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.x = Math.random() + 0.5
                object.scale.y = Math.random() + 0.5
                object.scale.z = Math.random() + 0.5
                object.layers.set(layer)
                this.scene.add(object)
            }
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            var layers = {
                'toggle red': () => {
                    this.camera.layers.toggle(0)
                },
                'toggle green': () => {
                    this.camera.layers.toggle(1)
                },
                'toggle blue': () => {
                    this.camera.layers.toggle(2)
                },
                'enable all': () => {
                    this.camera.layers.enableAll()
                },
                'disable all': () => {
                    this.camera.layers.disableAll()
                }
            }
            //
            // Init gui
            this.gui = new GUI()
            this.gui.add(layers, 'toggle red')
            this.gui.add(layers, 'toggle green')
            this.gui.add(layers, 'toggle blue')
            this.gui.add(layers, 'enable all')
            this.gui.add(layers, 'disable all')
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
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
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.layers-container {
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
