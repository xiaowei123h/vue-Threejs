<template>
    <div class="webglSprites-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - sprites
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
            cameraOrtho: null,
            sceneOrtho: null,
            spriteTL: null,
            spriteTR: null,
            spriteBL: null,
            spriteBR: null,
            spriteC: null,
			mapC: null,
			group: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            this.camera = new this.$THREE.PerspectiveCamera(60, width / height, 1, 2100)
            this.camera.position.z = 1500
            this.cameraOrtho = new this.$THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, 1, 10)
            this.cameraOrtho.position.z = 10
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.Fog(0x000000, 1500, 2100)
            this.sceneOrtho = new this.$THREE.Scene()
            // create sprites
            var amount = 200
            var radius = 500
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load("static/textures/sprite0.png", this.createHUDSprites)
            var mapB = textureLoader.load("static/textures/sprite1.png")
            this.mapC = textureLoader.load("static/textures/sprite2.png")
            this.group = new this.$THREE.Group()
            var materialC = new this.$THREE.SpriteMaterial({ map: this.mapC, color: 0xffffff, fog: true })
            var materialB = new this.$THREE.SpriteMaterial({ map: mapB, color: 0xffffff, fog: true })
            for (var a = 0; a < amount; a ++) {
                var x = Math.random() - 0.5
                var y = Math.random() - 0.5
                var z = Math.random() - 0.5
                var material
                if (z < 0) {
                    material = materialB.clone()
                } else {
                    material = materialC.clone()
                    material.color.setHSL(0.5 * Math.random(), 0.75, 0.5)
                    material.map.offset.set(- 0.5, - 0.5)
                    material.map.repeat.set(2, 2)
                }
                var sprite = new this.$THREE.Sprite(material)
                sprite.position.set(x, y, z)
                sprite.position.normalize()
                sprite.position.multiplyScalar(radius)
                this.group.add(sprite)
            }
            this.scene.add(this.group)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false // To allow render overlay on top of sprited sphere
            document.getElementsByClassName('webglSprites-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        createHUDSprites(texture) {
            var material = new this.$THREE.SpriteMaterial({ map: texture })
            var width = material.map.image.width
            var height = material.map.image.height
            this.spriteTL = new this.$THREE.Sprite(material)
            this.spriteTL.center.set(0.0, 1.0)
            this.spriteTL.scale.set(width, height, 1)
            this.sceneOrtho.add(this.spriteTL)
            this.spriteTR = new this.$THREE.Sprite(material)
            this.spriteTR.center.set(1.0, 1.0)
            this.spriteTR.scale.set(width, height, 1)
            this.sceneOrtho.add(this.spriteTR)
            this.spriteBL = new this.$THREE.Sprite(material)
            this.spriteBL.center.set(0.0, 0.0)
            this.spriteBL.scale.set(width, height, 1)
            this.sceneOrtho.add(this.spriteBL)
            this.spriteBR = new this.$THREE.Sprite(material)
            this.spriteBR.center.set(1.0, 0.0)
            this.spriteBR.scale.set(width, height, 1)
            this.sceneOrtho.add(this.spriteBR)
            this.spriteC = new this.$THREE.Sprite(material)
            this.spriteC.center.set(0.5, 0.5)
            this.spriteC.scale.set(width, height, 1)
            this.sceneOrtho.add(this.spriteC)
            this.updateHUDSprites()
        },
        updateHUDSprites() {
            var width = (window.innerWidth - 281) / 2
            var height = window.innerHeight / 2
            this.spriteTL.position.set(- width, height, 1) // top left
            this.spriteTR.position.set(width, height, 1) // top right
            this.spriteBL.position.set(- width, - height, 1) // bottom left
            this.spriteBR.position.set(width, - height, 1) // bottom right
            this.spriteC.position.set(0, 0, 1) // center
        },
        onWindowResize() {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            var width = window.innerWidth - x
            var height = window.innerHeight
            this.$onWindowResize(this.camera, this.renderer)
            this.cameraOrtho.left = - width / 2
            this.cameraOrtho.right = width / 2
            this.cameraOrtho.top = height / 2
            this.cameraOrtho.bottom = - height / 2
            this.cameraOrtho.updateProjectionMatrix()
            this.updateHUDSprites()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var time = Date.now() / 1000
            for (var i = 0, l = this.group.children.length; i < l; i ++) {
                var sprite = this.group.children[ i ]
                var material = sprite.material
                var scale = Math.sin(time + sprite.position.x * 0.01) * 0.3 + 1.0
                var imageWidth = 1
                var imageHeight = 1
                if (material.map && material.map.image && material.map.image.width) {
                    imageWidth = material.map.image.width
                    imageHeight = material.map.image.height
                }
                sprite.material.rotation += 0.1 * (i / l)
                sprite.scale.set(scale * imageWidth, scale * imageHeight, 1.0)
                if (material.map !== this.mapC) {
                    material.opacity = Math.sin(time + sprite.position.x * 0.01) * 0.4 + 0.6
                }
            }
            this.group.rotation.x = time * 0.5
            this.group.rotation.y = time * 0.75
            this.group.rotation.z = time * 1.0
            this.renderer.clear()
            this.renderer.render(this.scene, this.camera)
            this.renderer.clearDepth()
            this.renderer.render(this.sceneOrtho, this.cameraOrtho)
        }
    },
}
</script>

<style scoped>
.webglSprites-container {
    position: relative;
    width: 100%;
}
</style>
