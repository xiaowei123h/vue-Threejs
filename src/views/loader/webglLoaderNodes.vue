<template>
    <div class="webglLoaderNodes-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Node-Based Material<br />
			Serialized using <a href="webgl_materials_nodes.html">webgl_materials_nodes.html</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { NodeMaterialLoader } from '@/components/jsm/loaders/NodeMaterialLoader.js';
import { TeapotBufferGeometry } from '@/components/jsm/geometries/TeapotBufferGeometry.js';
import { NodeFrame } from '@/components/jsm/nodes/core/NodeFrame.js';
import { NodeMaterial } from '@/components/jsm/nodes/materials/NodeMaterial.js';
export default {
    data() {
        return {
            container: null,
            renderer: null,
            scene: null,
            camera: null,
            clock: null,
            frame: null,
            teapot: null,
            mesh: null,
            cloud: null,
            controls: null,
            gui: null,
            param: { load: 'caustic' }
        }
    },
    mounted() {
        this.container = document.getElementById('container')
        this.clock = new this.$THREE.Clock()
        this.fov = 50
        this.frame = new NodeFrame()
        window.addEventListener('load', this.init)
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 1, 1000)
            this.camera.position.x = 50
            this.camera.position.z = - 50
            this.camera.position.y = 30
            this.camera.target = new this.$THREE.Vector3()
            this.cloud = new this.$THREE.TextureLoader().load('static/textures/lava/cloud.png')
            this.cloud.wrapS = this.cloud.wrapT = this.$THREE.RepeatWrapping
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 50
            this.controls.maxDistance = 200
            this.scene.add(new this.$THREE.AmbientLight(0x464646))
            var light1 = new this.$THREE.DirectionalLight(0xffddcc, 1)
            light1.position.set(1, 0.75, 0.5)
            this.scene.add(light1)
            var light2 = new this.$THREE.DirectionalLight(0xccccff, 1)
            light2.position.set(- 1, 0.75, - 0.5)
            this.scene.add(light2)
            this.teapot = new TeapotBufferGeometry(15, 18)
            this.mesh = new this.$THREE.Mesh(this.teapot)
            this.scene.add(this.mesh)
            window.addEventListener('resize', this.onWindowResize, false)
            this.updateMaterial()
            this.onWindowResize()
            this.animate()
        },
        clearGui() {
            if (this.gui) this.gui.destroy()
            this.gui = new GUI()
            this.gui.add(this.param, 'load', {
                'caustic': 'caustic',
                'displace': 'displace',
                'wave': 'wave',
                'xray': 'xray'
            }).onFinishChange(() => {
                this.updateMaterial()
            })
            this.gui.open()
        },
        addGui(name, value, callback, isColor, min, max) {
            let node
            this.param[ name ] = value
            if (isColor) {
                node = this.gui.addColor(this.param, name).onChange(() => {
                    callback(this.param[ name ])
                })
            } else if (typeof value == 'object') {
                node = this.gui.add(this.param, name, value).onChange(() => {
                    callback(this.param[ name ])
                })
            } else {
                node = this.gui.add(this.param, name, min, max).onChange(() => {
                    callback(this.param[ name ])
                })
            }
            return node
        },
        updateMaterial() {
            if (this.mesh.material) this.mesh.material.dispose()
            this.clearGui()
            var url = "static/nodes/" + this.param.load + ".json"
            var library = {
                "cloud": this.cloud
            }
            var loader = new NodeMaterialLoader(undefined, library).load(url, () => {
                var time = loader.getObjectByName("time")
                if (time) {
                    // enable time scale
                    time.timeScale = true
                    // gui
                    this.addGui('timeScale', time.scale, (val) => {
                        time.scale = val
                    }, false, - 2, 2)
                }
                // set material
                this.mesh.material = loader.material
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            var delta = this.clock.getDelta()
            // update material animation and/or gpu calcs (pre-renderer)
            if (this.mesh.material instanceof NodeMaterial) this.frame.update(delta).updateNode(this.mesh.material)
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        }
    }
}
</script>

<style scoped>
.webglLoaderNodes-container {
    width: 100%;
}
</style>
