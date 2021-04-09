<template>
    <div class="webglMaterialsTextureRotation-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - texture rotation
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            mesh: null,
            renderer: null,
            scene: null,
            camera: null,
			gui: null,
			API: {
				offsetX: 0,
				offsetY: 0,
				repeatX: 0.25,
				repeatY: 0.25,
				rotation: Math.PI / 4, // positive is counter-clockwise
				centerX: 0.5,
				centerY: 0.5
			}
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsTextureRotation-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(10, 15, 25)
            this.scene.add(this.camera)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render)
            controls.minDistance = 20
            controls.maxDistance = 50
            controls.maxPolarAngle = Math.PI / 2
            var geometry = new this.$THREE.BoxBufferGeometry(10, 10, 10)
            new this.$THREE.TextureLoader().load('static/textures/uv_grid_opengl.jpg', (texture) => {
                texture.wrapS = texture.wrapT = this.$THREE.RepeatWrapping
                texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
                //texture.matrixAutoUpdate = false // default true set to false to update texture.matrix manually
                var material = new this.$THREE.MeshBasicMaterial({ map: texture })
                this.mesh = new this.$THREE.Mesh(geometry, material)
                this.scene.add(this.mesh)
                this.updateUvTransform()
                this.initGui()
                this.render()
            })
            window.addEventListener('resize', this.onWindowResize, false)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        updateUvTransform() {
            var texture = this.mesh.material.map
            if (texture.matrixAutoUpdate === true) {
                texture.offset.set(this.API.offsetX, this.API.offsetY)
                texture.repeat.set(this.API.repeatX, this.API.repeatY)
                texture.center.set(this.API.centerX, this.API.centerY)
                texture.rotation = this.API.rotation // rotation is around [ 0.5, 0.5 ]
            } else {
                // one way...
                //texture.matrix.setUvTransform(API.offsetX, API.offsetY, API.repeatX, API.repeatY, API.rotation, API.centerX, API.centerY)
                // another way...
                texture.matrix
                    .identity()
                    .translate(- this.API.centerX, - this.API.centerY)
                    .rotate(this.API.rotation)					// I don't understand how rotation can preceed scale, but it seems to be required...
                    .scale(this.API.repeatX, this.API.repeatY)
                    .translate(this.API.centerX, this.API.centerY)
                    .translate(this.API.offsetX, this.API.offsetY)
            }
            this.render()
        },
        initGui() {
            this.gui = new GUI()
            this.gui.add(this.API, 'offsetX', 0.0, 1.0).name('offset.x').onChange(this.updateUvTransform)
            this.gui.add(this.API, 'offsetY', 0.0, 1.0).name('offset.y').onChange(this.updateUvTransform)
            this.gui.add(this.API, 'repeatX', 0.25, 2.0).name('repeat.x').onChange(this.updateUvTransform)
            this.gui.add(this.API, 'repeatY', 0.25, 2.0).name('repeat.y').onChange(this.updateUvTransform)
            this.gui.add(this.API, 'rotation', - 2.0, 2.0).name('rotation').onChange(this.updateUvTransform)
            this.gui.add(this.API, 'centerX', 0.0, 1.0).name('center.x').onChange(this.updateUvTransform)
            this.gui.add(this.API, 'centerY', 0.0, 1.0).name('center.y').onChange(this.updateUvTransform)
        }
    },
}
</script>

<style scoped>
.webglMaterialsTextureRotation-container {
    position: relative;
    width: 100%;
}
</style>
