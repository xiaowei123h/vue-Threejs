<template>
    <div class="webglShadowmapPointlight-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - this.$THREE.PointLight ShadowMap by <a href="https://github.com/mkkellogg">mkkellogg</a>
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
            stats: null,
            pointLight: null,
            pointLight2: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 10, 40)
            this.scene = new this.$THREE.Scene()
            this.scene.add(new this.$THREE.AmbientLight(0x111122))
            // lights
            var that = this
            function createLight(color) {
                var intensity = 1.5
                var light = new that.$THREE.PointLight(color, intensity, 20)
                light.castShadow = true
                light.shadow.camera.near = 1
                light.shadow.camera.far = 60
                light.shadow.bias = - 0.005 // reduces self-shadowing on double-sided objects
                var geometry = new that.$THREE.SphereBufferGeometry(0.3, 12, 6)
                var material = new that.$THREE.MeshBasicMaterial({ color: color })
                material.color.multiplyScalar(intensity)
                var sphere = new that.$THREE.Mesh(geometry, material)
                light.add(sphere)
                var texture = new that.$THREE.CanvasTexture(that.generateTexture())
                texture.magFilter = that.$THREE.NearestFilter
                texture.wrapT = that.$THREE.RepeatWrapping
                texture.wrapS = that.$THREE.RepeatWrapping
                texture.repeat.set(1, 4.5)
                geometry = new that.$THREE.SphereBufferGeometry(2, 32, 8)
                material = new that.$THREE.MeshPhongMaterial({
                    side: that.$THREE.DoubleSide,
                    alphaMap: texture,
                    alphaTest: 0.5
                })
                sphere = new that.$THREE.Mesh(geometry, material)
                sphere.castShadow = true
                sphere.receiveShadow = true
                light.add(sphere)
                // custom distance material
                var distanceMaterial = new that.$THREE.MeshDistanceMaterial({
                    alphaMap: material.alphaMap,
                    alphaTest: material.alphaTest
                })
                sphere.customDistanceMaterial = distanceMaterial
                return light
            }
            this.pointLight = createLight(0x0088ff)
            this.scene.add(this.pointLight)
            this.pointLight2 = createLight(0xff8888)
            this.scene.add(this.pointLight2)
            //
            var geometry = new this.$THREE.BoxBufferGeometry(30, 30, 30)
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xa0adaf,
                shininess: 10,
                specular: 0x111111,
                side: this.$THREE.BackSide
            })
            var mesh = new this.$THREE.Mesh(geometry, material)
            mesh.position.y = 10
            mesh.receiveShadow = true
            this.scene.add(mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.BasicShadowMap
            document.getElementsByClassName('webglShadowmapPointlight-container')[0].appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 10, 0)
            controls.update()
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglShadowmapPointlight-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        generateTexture() {
            var canvas = document.createElement('canvas')
            canvas.width = 2
            canvas.height = 2
            var context = canvas.getContext('2d')
            context.fillStyle = 'white'
            context.fillRect(0, 1, 2, 1)
            return canvas
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var time = performance.now() * 0.001
            this.pointLight.position.x = Math.sin(time * 0.6) * 9
            this.pointLight.position.y = Math.sin(time * 0.7) * 9 + 6
            this.pointLight.position.z = Math.sin(time * 0.8) * 9
            this.pointLight.rotation.x = time
            this.pointLight.rotation.z = time
            time += 10000
            this.pointLight2.position.x = Math.sin(time * 0.6) * 9
            this.pointLight2.position.y = Math.sin(time * 0.7) * 9 + 6
            this.pointLight2.position.z = Math.sin(time * 0.8) * 9
            this.pointLight2.rotation.x = time
            this.pointLight2.rotation.z = time
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglShadowmapPointlight-container {
    position: relative;
    width: 100%;
}
</style>
