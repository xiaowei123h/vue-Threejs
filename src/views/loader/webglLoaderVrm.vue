<template>
    <div class="webglLoaderVrm-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - VRMLoader<br />
			Alicia by
			<a href="https://3d.nicovideo.jp/works/td32797" target="_blank" rel="noopener">Dwango</a> /
			<a href="http://3d.nicovideo.jp/alicia/rule.html">License</a><br />
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { VRMLoader } from '@/components/jsm/loaders/VRMLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            controls: null,
            camera: null,
            scene: null,
            renderer: null,
            light: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderVrm-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
            this.camera.position.set(0, 1.6, - 2.2)
            this.scene = new this.$THREE.Scene()
            this.light = new this.$THREE.HemisphereLight(0xbbbbff, 0x444422)
            this.light.position.set(0, 1, 0)
            this.scene.add(this.light)
            // model
            var loader = new VRMLoader()
            loader.load('static/models/vrm/Alicia/AliciaSolid.vrm', (vrm) => {
                // VRMLoader doesn't support VRM Unlit extension yet so
                // converting all materials to this.$THREE.MeshBasicMaterial here as workaround so far.
                vrm.scene.traverse((object) => {
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            for (var i = 0, il = object.material.length; i < il; i ++) {
                                var material = new this.$THREE.MeshBasicMaterial()
                                this.$THREE.Material.prototype.copy.call(material, object.material[ i ])
                                material.color.copy(object.material[ i ].color)
                                material.map = object.material[ i ].map
                                material.skinning = object.material[ i ].skinning
                                material.morphTargets = object.material[ i ].morphTargets
                                material.morphNormals = object.material[ i ].morphNormals
                                object.material[ i ] = material
                            }
                        } else {
                            var material = new this.$THREE.MeshBasicMaterial()
                            this.$THREE.Material.prototype.copy.call(material, object.material)
                            material.color.copy(object.material.color)
                            material.map = object.material.map
                            material.skinning = object.material.skinning
                            material.morphTargets = object.material.morphTargets
                            material.morphNormals = object.material.morphNormals
                            object.material = material
                        }
                    }
                })
                this.scene.add(vrm.scene)
            })
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 1
            this.controls.maxDistance = 5
            this.controls.enableDamping = true
            this.controls.target.set(0, 0.9, 0)
            this.controls.update()
            window.addEventListener('resize', this.onWindowResize, false)
            // stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update() // to support damping
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglLoaderVrm-container {
    width: 100%;
}
</style>