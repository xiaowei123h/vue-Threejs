<template>
    <div class="css3dSandbox-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> css3d - sandbox</div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { CSS3DRenderer, CSS3DObject } from '@/components/jsm/renderers/CSS3DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            scene2: null,
            renderer2: null,
			controls: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(200, 200, 200)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            this.scene2 = new this.$THREE.Scene()
            var material = new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 1, side: this.$THREE.DoubleSide })
            //
            for (var i = 0; i < 10; i ++) {
                var element = document.createElement('div')
                element.style.width = '100px'
                element.style.height = '100px'
                element.style.opacity = (i < 5) ? 0.5 : 1
                element.style.background = new this.$THREE.Color(Math.random() * 0xffffff).getStyle()
                var object = new CSS3DObject(element)
                object.position.x = Math.random() * 200 - 100
                object.position.y = Math.random() * 200 - 100
                object.position.z = Math.random() * 200 - 100
                object.rotation.x = Math.random()
                object.rotation.y = Math.random()
                object.rotation.z = Math.random()
                object.scale.x = Math.random() + 0.5
                object.scale.y = Math.random() + 0.5
                this.scene2.add(object)
                var geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.copy(object.position)
                mesh.rotation.copy(object.rotation)
                mesh.scale.copy(object.scale)
                this.scene.add(mesh)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('css3dSandbox-container')[0].appendChild(this.renderer.domElement)
            this.renderer2 = new CSS3DRenderer()
            this.renderer2.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer2.domElement.style.position = 'absolute'
            this.renderer2.domElement.style.top = 0
            document.getElementsByClassName('css3dSandbox-container')[0].appendChild(this.renderer2.domElement)
            this.controls = new TrackballControls(this.camera, this.renderer2.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.renderer2.setSize(window.innerWidth - 281, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            this.renderer2.render(this.scene2, this.camera)
        }
    },
}
</script>

<style scoped>
.css3dSandbox-container {
    position: relative;
    width: 100%;
}
#info {
    color: #000;
}
#info a {
    color: #080;
}
</style>
