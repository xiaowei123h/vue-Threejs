<template>
    <div class="webglFramebufferTexture-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> framebuffer to texture
		</div>

		<div id="selection">
			<div></div>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
            sprite: null,
            texture: null,
            cameraOrtho: null,
            sceneOrtho: null,
			dpr: null,
			textureSize: null,
			vector: null
        }
    },
    mounted() {
        this.dpr = window.devicePixelRatio
        this.textureSize = 128 * this.dpr
        this.vector = new this.$THREE.Vector2()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            //
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            this.camera = new this.$THREE.PerspectiveCamera(70, width / height, 1, 1000)
            this.camera.position.z = 20
            this.cameraOrtho = new this.$THREE.OrthographicCamera(width / 2,width / 2, height / 2, - height / 2, 1, 10)
            this.cameraOrtho.position.z = 10
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x20252f)
            this.sceneOrtho = new this.$THREE.Scene()
            //
            var geometry = new this.$THREE.TorusKnotBufferGeometry(3, 1, 256, 32)
            var material = new this.$THREE.MeshStandardMaterial({ color: 0x6083c2 })
            this.mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.mesh)
            //
            var ambientLight = new this.$THREE.AmbientLight(0xcccccc, 0.4)
            this.scene.add(ambientLight)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            this.scene.add(this.camera)
            //
            var data = new Uint8Array(this.textureSize * this.textureSize * 3)
            this.texture = new this.$THREE.DataTexture(data, this.textureSize, this.textureSize, this.$THREE.RGBFormat)
            this.texture.minFilter = this.$THREE.NearestFilter
            this.texture.magFilter = this.$THREE.NearestFilter
            //
            var spriteMaterial = new this.$THREE.SpriteMaterial({ map: this.texture })
            this.sprite = new this.$THREE.Sprite(spriteMaterial)
            this.sprite.scale.set(this.textureSize, this.textureSize, 1)
            this.sceneOrtho.add(this.sprite)
            this.updateSpritePosition()
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false
            document.getElementsByClassName('webglFramebufferTexture-container')[0].appendChild(this.renderer.domElement)
            //
            var selection = document.getElementById('selection')
            console.log(selection.style)
            var controls = new OrbitControls(this.camera, selection)
            controls.enablePan = false
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            var width = (window.innerWidth - 281)
            var height = window.innerHeight
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
            this.cameraOrtho.left = -width / 2
            this.cameraOrtho.right = width / 2
            this.cameraOrtho.top = height / 2
            this.cameraOrtho.bottom = - height / 2
            this.cameraOrtho.updateProjectionMatrix()
            this.renderer.setSize((window.innerWidth - 281), window.innerHeight)
            this.updateSpritePosition()
        },
        updateSpritePosition() {
            var halfWidth = (window.innerWidth - 281) / 2
            var halfHeight = window.innerHeight / 2
            var halfImageWidth = this.textureSize / 2
            var halfImageHeight = this.textureSize / 2
            this.sprite.position.set(- halfWidth + halfImageWidth, halfHeight - halfImageHeight, 1)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.mesh.rotation.x += 0.005
            this.mesh.rotation.y += 0.01
            this.renderer.clear()
            this.renderer.render(this.scene, this.camera)
            // calculate start position for copying data
            this.vector.x = (this.$webglInnerWidth * this.dpr / 2) - (this.textureSize / 2)
            this.vector.y = (window.innerHeight * this.dpr / 2) - (this.textureSize / 2)
            this.renderer.copyFramebufferToTexture(this.vector, this.texture)
            this.renderer.clearDepth()
            this.renderer.render(this.sceneOrtho, this.cameraOrtho)
        }
    }
}
</script>

<style scoped>
.webglFramebufferTexture-container {
    position: relative;
    width: 100%;
}
#selection {
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    top: 0;
    left: 150px;
    z-index: 999;
}

#selection > div {
    height: 128px;
    width: 128px;
    border: 1px solid white;
}
</style>
