<template>
    <div class="css3dOrthographic-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> css3d - orthographic</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { CSS3DRenderer, CSS3DObject } from '@/components/jsm/renderers/CSS3DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            scene2: null,
            renderer2: null,
			frustumSize: 500,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var aspect = this.$webglInnerWidth / window.innerHeight
            this.camera = new this.$THREE.OrthographicCamera(this.frustumSize * aspect / - 2, this.frustumSize * aspect / 2, this.frustumSize / 2, this.frustumSize / - 2, 1, 1000)
            this.camera.position.set(- 200, 200, 200)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            this.scene2 = new this.$THREE.Scene()
            var material = new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 1, side: this.$THREE.DoubleSide });
            var that = this
            // left
            createPlane(
                100, 100,
                'chocolate',
                new this.$THREE.Vector3(- 50, 0, 0),
                new this.$THREE.Euler(0, - 90 * this.$THREE.MathUtils.DEG2RAD, 0)
            )
            // right
            createPlane(
                100, 100,
                'saddlebrown',
                new this.$THREE.Vector3(0, 0, 50),
                new this.$THREE.Euler(0, 0, 0)
            )
            // top
            createPlane(
                100, 100,
                'yellowgreen',
                new this.$THREE.Vector3(0, 50, 0),
                new this.$THREE.Euler(- 90 * this.$THREE.MathUtils.DEG2RAD, 0, 0)
            )
            // bottom
            createPlane(
                300, 300,
                'seagreen',
                new this.$THREE.Vector3(0, - 50, 0),
                new this.$THREE.Euler(- 90 * this.$THREE.MathUtils.DEG2RAD, 0, 0)
            )
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('css3dOrthographic-container')[0].appendChild(this.renderer.domElement)
            this.renderer2 = new CSS3DRenderer()
            this.renderer2.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer2.domElement.style.position = 'absolute'
            this.renderer2.domElement.style.top = 0
            document.getElementsByClassName('css3dOrthographic-container')[0].appendChild(this.renderer2.domElement)
            var controls = new OrbitControls(this.camera, this.renderer2.domElement)
            controls.minZoom = 0.5
            controls.maxZoom = 2
            function createPlane(width, height, cssColor, pos, rot) {
                var element = document.createElement('div')
                element.style.width = width + 'px'
                element.style.height = height + 'px'
                element.style.opacity = 0.75
                element.style.background = cssColor
                var object = new CSS3DObject(element)
                object.position.copy(pos)
                object.rotation.copy(rot)
                that.scene2.add(object)
                var geometry = new that.$THREE.PlaneBufferGeometry(width, height)
                var mesh = new that.$THREE.Mesh(geometry, material)
                mesh.position.copy(object.position)
                mesh.rotation.copy(object.rotation)
                that.scene.add(mesh)
            }
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var aspect = (window.innerWidth - 281) / window.innerHeight
            this.camera.left = - this.frustumSize * aspect / 2
            this.camera.right = this.frustumSize * aspect / 2
            this.camera.top = this.frustumSize / 2
            this.camera.bottom = - this.frustumSize / 2
            this.camera.updateProjectionMatrix()
            this.renderer.setSize((window.innerWidth - 281), window.innerHeight)
            this.renderer2.setSize((window.innerWidth - 281), window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera)
            this.renderer2.render(this.scene2, this.camera)
        }
    },
}
</script>

<style scoped>
.css3dOrthographic-container {
    position: relative;
    width: 100%;
    background-color: #f0f0f0;
}
#info a {
    color: #f00;
}
#info {
    color: #000000;
}
</style>
