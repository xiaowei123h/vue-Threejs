<template>
    <div class="webglClipping-container">
        
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            startTime: null,
            object: null,
            stats: null,
            gui: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(36, this.$webglInnerWidth / window.innerHeight, 0.25, 16)
            this.camera.position.set(0, 1.3, 3)
            this.scene = new this.$THREE.Scene()
            // Lights
            this.scene.add(new this.$THREE.AmbientLight(0x505050))
            var spotLight = new this.$THREE.SpotLight(0xffffff)
            spotLight.angle = Math.PI / 5
            spotLight.penumbra = 0.2
            spotLight.position.set(2, 3, 3)
            spotLight.castShadow = true
            spotLight.shadow.camera.near = 3
            spotLight.shadow.camera.far = 10
            spotLight.shadow.mapSize.width = 1024
            spotLight.shadow.mapSize.height = 1024
            this.scene.add(spotLight)
            var dirLight = new this.$THREE.DirectionalLight(0x55505a, 1)
            dirLight.position.set(0, 3, 0)
            dirLight.castShadow = true
            dirLight.shadow.camera.near = 1
            dirLight.shadow.camera.far = 10
            dirLight.shadow.camera.right = 1
            dirLight.shadow.camera.left = - 1
            dirLight.shadow.camera.top	= 1
            dirLight.shadow.camera.bottom = - 1
            dirLight.shadow.mapSize.width = 1024
            dirLight.shadow.mapSize.height = 1024
            this.scene.add(dirLight)
            // ***** Clipping planes: *****
            var localPlane = new this.$THREE.Plane(new this.$THREE.Vector3(0, - 1, 0), 0.8)
            var globalPlane = new this.$THREE.Plane(new this.$THREE.Vector3(- 1, 0, 0), 0.1)
            // Geometry
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0x80ee10,
                shininess: 100,
                side: this.$THREE.DoubleSide,
                // ***** Clipping setup (material): *****
                clippingPlanes: [localPlane],
                clipShadows: true
            })
            var geometry = new this.$THREE.TorusKnotBufferGeometry(0.4, 0.08, 95, 20)
            this.object = new this.$THREE.Mesh(geometry, material)
            this.object.castShadow = true
            this.scene.add(this.object)
            var ground = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(9, 9, 1, 1),
                new this.$THREE.MeshPhongMaterial({ color: 0xa0adaf, shininess: 150 })
            )
            ground.rotation.x = - Math.PI / 2 // rotates X/Y to X/Z
            ground.receiveShadow = true
            this.scene.add(ground)
            // Stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglClipping-container')[0].appendChild(this.stats.dom)
            // Renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.shadowMap.enabled = true
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            window.addEventListener('resize', this.onWindowResize, false)
            document.getElementsByClassName('webglClipping-container')[0].appendChild(this.renderer.domElement)
            // ***** Clipping setup (this.renderer): *****
            var globalPlanes = [globalPlane],
                Empty = Object.freeze([])
            this.renderer.clippingPlanes = Empty // GUI sets it to globalPlanes
            this.renderer.localClippingEnabled = true
            // Controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 1, 0)
            controls.update()
            // GUI
            var that = this
            this.gui = new GUI()
            var folderLocal = this.gui.addFolder('Local Clipping')
            var propsLocal = {
                    get 'Enabled'() {
                        return that.renderer.localClippingEnabled
                    },
                    set 'Enabled'( v ) {
                        that.renderer.localClippingEnabled = v
                    },
                    get 'Shadows'() {
                        return material.clipShadows
                    },
                    set 'Shadows'( v ) {
                        material.clipShadows = v
                    },
                    get 'Plane'() {
                        return localPlane.constant
                    },
                    set 'Plane'( v ) {
                        localPlane.constant = v
                    }
                }
            var folderGlobal = this.gui.addFolder('Global Clipping')
            var propsGlobal = {
                    get 'Enabled'() {
                        return that.renderer.clippingPlanes !== Empty
                    },
                    set 'Enabled'( v ) {
                        that.renderer.clippingPlanes = v ? globalPlanes : Empty
                    },
                    get 'Plane'() {
                        return globalPlane.constant
                    },
                    set 'Plane'( v ) {
                        globalPlane.constant = v
                    }
                }
            folderLocal.add(propsLocal, 'Enabled')
            folderLocal.add(propsLocal, 'Shadows')
            folderLocal.add(propsLocal, 'Plane', 0.3, 1.25)
            folderGlobal.add(propsGlobal, 'Enabled')
            folderGlobal.add(propsGlobal, 'Plane', - 0.4, 3)
            // Start
            this.startTime = Date.now()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            var currentTime = Date.now()
            var time = (currentTime - this.startTime) / 1000
            requestAnimationFrame(this.animate)
            this.object.position.y = 0.8
            this.object.rotation.x = time * 0.5
            this.object.rotation.y = time * 0.2
            this.object.scale.setScalar(Math.cos(time) * 0.125 + 0.875)
            this.stats.begin()
            this.renderer.render(this.scene, this.camera)
            this.stats.end()
        }
    }
}
</script>

<style scoped>
.webglClipping-container {
    width: 100%;
}
</style>