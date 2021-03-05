<template>
    <div class="webglRaycastSprite-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl raycast sprite<br></div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            controls: null,
            group: null,
            selectedObject: null,
            raycaster: null,
            mouseVector: null,
        }
    },
    mounted() {
        this.init()
        this.animate()
        this.raycaster = new this.$THREE.Raycaster()
		this.mouseVector = new this.$THREE.Vector3()
    },
    methods: {
        init() {
			// init renderer
			this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			document.getElementsByClassName('webglRaycastSprite-container')[0].appendChild(this.renderer.domElement)
			// init scene
			this.scene = new this.$THREE.Scene()
			this.scene.background = new this.$THREE.Color(0xffffff)
			this.group = new this.$THREE.Group()
			this.scene.add(this.group)
			// init camera
			this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 1000)
			this.camera.position.set(15, 15, 15)
			this.camera.lookAt(this.scene.position)
			this.controls = new OrbitControls(this.camera, this.renderer.domElement)
			this.controls.enableRotate = true
			// add sprites
			var sprite1 = new this.$THREE.Sprite(new this.$THREE.SpriteMaterial({ color: '#69f' }))
			sprite1.position.set(6, 5, 5)
			sprite1.scale.set(2, 5, 1)
			this.group.add(sprite1)
			var sprite2 = new this.$THREE.Sprite(new this.$THREE.SpriteMaterial({ color: '#69f', sizeAttenuation: false }))
			sprite2.material.rotation = Math.PI / 3 * 4
			sprite2.position.set(8, - 2, 2)
			sprite2.center.set(0.5, 0)
			sprite2.scale.set(.1, .5, .1)
			this.group.add(sprite2)
			var group2 = new this.$THREE.Object3D()
			group2.scale.set(1, 2, 1)
			group2.position.set(- 5, 0, 0)
			group2.rotation.set(Math.PI / 2, 0, 0)
			this.group.add(group2)
			var sprite3 = new this.$THREE.Sprite(new this.$THREE.SpriteMaterial({ color: '#69f' }))
			sprite3.position.set(0, 2, 5)
			sprite3.scale.set(10, 2, 3)
			sprite3.center.set(- 0.1, 0)
			sprite3.material.rotation = Math.PI / 3
			group2.add(sprite3)
			window.addEventListener('resize', this.onWindowResize, false)
			window.addEventListener("mousemove", this.onDocumentMouseMove, false)
        },
        animate() {
			this.renderer.render(this.scene, this.camera)
			requestAnimationFrame(this.animate)
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
			event.preventDefault()
			if (this.selectedObject) {
				this.selectedObject.material.color.set('#69f')
				this.selectedObject = null
			}
			var intersects = this.getIntersects(event.layerX, event.layerY)
			if (intersects.length > 0) {
				var res = intersects.filter((res) => {
					return res && res.object
				})[ 0 ]
				if (res && res.object) {
					this.selectedObject = res.object
					this.selectedObject.material.color.set('#f00')
				}
			}
        },
        getIntersects(x, y) {
			x = (x / this.$webglInnerWidth) * 2 - 1
			y = - (y / window.innerHeight) * 2 + 1
			this.mouseVector.set(x, y, 0.5)
			this.raycaster.setFromCamera(this.mouseVector, this.camera)
			return this.raycaster.intersectObject(this.group, true)
		}
    },
}
</script>

<style scoped>
.webglRaycastSprite-container {
    width: 100%;
    background-color: #fff;
}
#info {
    color: #333;
}
#info a {
    color: #08f;
}
</style>
