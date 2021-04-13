<template>
    <div class="webglLoader3mf-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>
			<a href="http://3mf.io" target="_blank" rel="noopener">3MF File format</a>
			<div>3MF loader test by <a href="https://github.com/technohippy" target="_blank" rel="noopener">technohippy</a></div>
			<div>Files from <a href="https://github.com/3MFConsortium/3mf-samples" target="_blank" rel="noopener">3mf-samples</a></div>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ThreeMFLoader } from '@/components/jsm/loaders/3MFLoader.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            object: null,
            loader: null,
            controls: null,
			params: null,
            assets: null,
            gui: null
        }
    },
    mounted() {
        this.params = {
            asset: 'cube_gears'
        }
        this.assets = [
            'cube_gears',
            'facecolors',
            'multipletextures',
            'vertexcolors'
        ]
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglLoader3mf-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x333333)
            this.scene.add(new this.$THREE.AmbientLight(0xffffff, 0.2))
            this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 1, 500)
            // Z is up for objects intended to be 3D printed.
            this.camera.up.set(0, 0, 1)
            this.camera.position.set(- 100, - 250, 100)
            this.scene.add(this.camera)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.addEventListener('change', this.render)
            this.controls.minDistance = 50
            this.controls.maxDistance = 400
            this.controls.enablePan = false
            this.controls.update()
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.8)
            this.camera.add(pointLight)
            var manager = new this.$THREE.LoadingManager()
            manager.onLoad = () => {
                var aabb = new this.$THREE.Box3().setFromObject(this.object)
                var center = aabb.getCenter(new this.$THREE.Vector3())
                this.object.position.x += (this.object.position.x - center.x)
                this.object.position.y += (this.object.position.y - center.y)
                this.object.position.z += (this.object.position.z - center.z)
                this.controls.reset()
                this.scene.add(this.object)
                this.render()
            }
            this.loader = new ThreeMFLoader(manager)
            this.loadAsset(this.params.asset)
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.gui = new GUI({ width: 300 })
            this.gui.add(this.params, 'asset', this.assets).onChange((value) => {
                this.loadAsset(value)
            })
        },
        loadAsset(asset) {
            this.loader.load('static/models/3mf/' + asset + '.3mf', (group) => {
                if (this.object) {
                    this.object.traverse((child) => {
                        if (child.material) child.material.dispose()
                        if (child.material && child.material.map) child.material.map.dispose()
                        if (child.geometry) child.geometry.dispose()
                    })
                    this.scene.remove(this.object)
                }
                //
                this.object = group
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoader3mf-container {
    position: relative;
    width: 100%;
    background-color: #333;
}
</style>
