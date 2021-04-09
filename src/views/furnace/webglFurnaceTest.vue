<template>
    <div class="webglFurnaceTest-container">
        <div id="container">
			<div id="info">
				<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
				<a href="https://google.github.io/filament/Filament.md.html#toc4.7.2" target="_blank" rel="noopener">White Furnace</a> energy conservation test by <a href="https://jsantell.com/" target="_blank" rel="noopener">Jordan Santell</a>
			</div>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
            radianceMap: null
        }
    },
    mounted() {
        Promise.resolve()
				.then(this.init)
				.then(this.createEnvironment)
				.then(this.createObjects)
				.then(this.animate)
    },
    methods: {
        init() {
            var width = this.$webglInnerWidth
            var height = window.innerHeight
            var aspect = width / height
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(width, height)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            document.getElementsByClassName('webglFurnaceTest-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onResize, false)
            document.getElementsByClassName('webglFurnaceTest-container')[0].addEventListener('mouseover', () => {
                this.scene.traverse((child) => {
                    if (child.isMesh) child.material.color.setHex(0xaaaaff)
                })
            })
            document.getElementsByClassName('webglFurnaceTest-container')[0].addEventListener('mouseout', () => {
                this.scene.traverse((child) => {
                    if (child.isMesh) child.material.color.setHex(0xffffff)
                })
            })
            // this.scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, aspect, 1, 30)
            this.camera.position.set(0, 0, 18)
        },
        createObjects() {
            var geometry = new this.$THREE.SphereBufferGeometry(0.4, 32, 32)
            for (var x = 0; x <= 10; x ++) {
                for (var y = 0; y <= 10; y ++) {
                    var material = new this.$THREE.MeshPhysicalMaterial({
                        roughness: x / 10,
                        metalness: y / 10,
                        color: 0xffffff,
                        envMap: this.radianceMap,
                        envMapIntensity: 1,
                        reflectivity: 1
                    })
                    var mesh = new this.$THREE.Mesh(geometry, material)
                    mesh.position.x = x - 5
                    mesh.position.y = 5 - y
                    this.scene.add(mesh)
                }
            }
        },
        createEnvironment() {
            return new Promise((resolve) => {
                var envScene = new this.$THREE.Scene()
                envScene.background = new this.$THREE.Color(0xcccccc)
                var pmremGenerator = new this.$THREE.PMREMGenerator(this.renderer)
                this.radianceMap = pmremGenerator.fromScene(envScene).texture
                pmremGenerator.dispose()
                this.scene.background = this.radianceMap
                resolve()
            })
        },
        onResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglFurnaceTest-container {
    position: relative;
    width: 100%;
}
</style>
