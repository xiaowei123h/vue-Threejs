<template>
    <div class="webglMaterialsCubemapDynamic-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js webgl</a> - materials - dynamic cube reflection<br/>Photo by <a href="http://www.flickr.com/photos/jonragnarsson/2294472375/" target="_blank" rel="noopener">J&oacute;n Ragnarsson</a>.</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            cube: null,
            sphere: null,
            torus: null,
            material: null,
            count: 0,
            cubeCamera1: null,
            cubeCamera2: null,
            cubeRenderTarget1: null,
            cubeRenderTarget2: null,
            onPointerDownPointerX: null,
            onPointerDownPointerY: null,
            onPointerDownLon: null,
            onPointerDownLat: null,
            lon: 0,
            lat: 0,
            phi: 0,
            theta: 0,
			textureLoader: null,
        }
    },
    mounted() {
        this.textureLoader = new this.$THREE.TextureLoader()
        this.textureLoader.load('static/textures/2294472375_24a3b8ef46_o.jpg', (texture) => {
            texture.encoding = this.$THREE.sRGBEncoding
            texture.mapping = this.$THREE.EquirectangularReflectionMapping
            this.init(texture)
            this.animate()
        })
    },
    methods: {
        init(texture) {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            document.getElementsByClassName('webglMaterialsCubemapDynamic-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.scene.background = texture
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            //
            this.cubeRenderTarget1 = new this.$THREE.WebGLCubeRenderTarget(256, {
                format: this.$THREE.RGBFormat,
                generateMipmaps: true,
                minFilter: this.$THREE.LinearMipmapLinearFilter,
                encoding: this.$THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
            })
            this.cubeCamera1 = new this.$THREE.CubeCamera(1, 1000, this.cubeRenderTarget1)
            this.cubeRenderTarget2 = new this.$THREE.WebGLCubeRenderTarget(256, {
                format: this.$THREE.RGBFormat,
                generateMipmaps: true,
                minFilter: this.$THREE.LinearMipmapLinearFilter,
                encoding: this.$THREE.sRGBEncoding
            })
            this.cubeCamera2 = new this.$THREE.CubeCamera(1, 1000, this.cubeRenderTarget2)
            //
            this.material = new this.$THREE.MeshBasicMaterial({
                envMap: this.cubeRenderTarget2.texture,
                combine: this.$THREE.MultiplyOperation,
                reflectivity: 1
            })
            this.sphere = new this.$THREE.Mesh(new this.$THREE.IcosahedronBufferGeometry(20, 8), this.material)
            this.scene.add(this.sphere)
            this.cube = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(20, 20, 20), this.material)
            this.scene.add(this.cube)
            this.torus = new this.$THREE.Mesh(new this.$THREE.TorusKnotBufferGeometry(10, 5, 128, 16), this.material)
            this.scene.add(this.torus)
            //
            document.addEventListener('pointerdown', this.onPointerDown, false)
            document.addEventListener('wheel', this.onDocumentMouseWheel, false)
            window.addEventListener('resize', this.onWindowResized, false)
        },
        onWindowResized() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerDown(event) {
            event.preventDefault()
            this.onPointerDownPointerX = event.clientX
            this.onPointerDownPointerY = event.clientY
            this.onPointerDownLon = this.lon
            this.onPointerDownLat = this.lat
            document.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
        },
        onPointerMove(event) {
            this.lon = (event.clientX - this.onPointerDownPointerX) * 0.1 + this.onPointerDownLon
            this.lat = (event.clientY - this.onPointerDownPointerY) * 0.1 + this.onPointerDownLat
        },
        onPointerUp() {
            document.removeEventListener('pointermove', this.onPointerMove, false)
            document.removeEventListener('pointerup', this.onPointerUp, false)
        },
        onDocumentMouseWheel(event) {
            var fov = this.camera.fov + event.deltaY * 0.05
            this.camera.fov = this.$THREE.MathUtils.clamp(fov, 10, 75)
            this.camera.updateProjectionMatrix()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var time = Date.now()
            this.lon += .15
            this.lat = Math.max(- 85, Math.min(85, this.lat))
            this.phi = this.$THREE.MathUtils.degToRad(90 - this.lat)
            this.theta = this.$THREE.MathUtils.degToRad(this.lon)
            this.cube.position.x = Math.cos(time * 0.001) * 30
            this.cube.position.y = Math.sin(time * 0.001) * 30
            this.cube.position.z = Math.sin(time * 0.001) * 30
            this.cube.rotation.x += 0.02
            this.cube.rotation.y += 0.03
            this.torus.position.x = Math.cos(time * 0.001 + 10) * 30
            this.torus.position.y = Math.sin(time * 0.001 + 10) * 30
            this.torus.position.z = Math.sin(time * 0.001 + 10) * 30
            this.torus.rotation.x += 0.02
            this.torus.rotation.y += 0.03
            this.camera.position.x = 100 * Math.sin(this.phi) * Math.cos(this.theta)
            this.camera.position.y = 100 * Math.cos(this.phi)
            this.camera.position.z = 100 * Math.sin(this.phi) * Math.sin(this.theta)
            this.camera.lookAt(this.scene.position)
            // pingpong
            if (this.count % 2 === 0) {
                this.cubeCamera1.update(this.renderer, this.scene)
                this.material.envMap = this.cubeRenderTarget1.texture
            } else {
                this.cubeCamera2.update(this.renderer, this.scene)
                this.material.envMap = this.cubeRenderTarget2.texture
            }
            this.count ++
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsCubemapDynamic-container {
    width: 100%;
    touch-action: none;
}
</style>
