<template>
    <div class="webxrVrSandbox-container">
        
    </div>
</template>

<script>
import { Lensflare, LensflareElement } from '@/components/jsm/objects/Lensflare.js'
import { Reflector } from '@/components/jsm/objects/Reflector.js'
import { VRButton } from '@/components/jsm/webxr/VRButton.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			reflector: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var background = new this.$THREE.CubeTextureLoader()
                .setPath('static/textures/cube/MilkyWay/')
                .lad([ 'dark-s_px.jpg', 'dark-s_nx.jpg', 'dark-s_py.jpg', 'dark-s_ny.jpg', 'dark-s_pz.jpg', 'dark-s_nz.jpg' ])
            this.scene = new this.$THREE.Scene()
            this.scene.background = background
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10)
            this.camera.position.set(0, 1.6, 2)
            var torusGeometry = new this.$THREE.TorusKnotBufferGeometry(0.4, 0.15, 150, 20)
            var torusMaterial = new this.$THREE.MeshStandardMaterial({ roughness: 0.01, metalness: 0.2, envMap: background })
            var torus = new this.$THREE.Mesh(torusGeometry, torusMaterial)
            torus.position.y = 0.75
            torus.position.z = - 2
            torus.castShadow = true
            torus.receiveShadow = true
            this.scene.add(torus)
            var boxGeometry = new this.$THREE.BoxBufferGeometry(1.5, 0.1, 1.5)
            var boxMaterial = new this.$THREE.MeshPhongMaterial()
            var box = new this.$THREE.Mesh(boxGeometry, boxMaterial)
            box.position.y = - 0.2
            box.position.z = - 2
            box.castShadow = true
            box.receiveShadow = true
            this.scene.add(box)
            var light1 = new this.$THREE.DirectionalLight(0x8800ff)
            light1.position.set(- 1, 1.5, - 1.5)
            light1.castShadow = true
            light1.shadow.camera.zoom = 4
            this.scene.add(light1)
            light1.target.position.set(0, 0, - 2)
            this.scene.add(light1.target)
            // var helper1 = new this.$THREE.CameraHelper(light.shadow.camera)
            // this.scene.add(helper1)
            var light2 = new this.$THREE.DirectionalLight(0xff0000)
            light2.position.set(1, 1.5, - 2.5)
            light2.castShadow = true
            light2.shadow.camera.zoom = 4
            this.scene.add(light2)
            light2.target.position.set(0, 0, - 2)
            this.scene.add(light2.target)
            // var helper2 = new this.$THREE.CameraHelper(light.shadow.camera)
            // this.scene.add(helper2)
            // lensflare
            var loader = new this.$THREE.TextureLoader()
            var texture0 = loader.load("static/textures/lensflare/lensflare0.png")
            var texture3 = loader.load("static/textures/lensflare/lensflare3.png")
            var lensflare = new Lensflare()
            lensflare.position.set(0, 5, - 5)
            lensflare.addElement(new LensflareElement(texture0, 700, 0 ))
            lensflare.addElement(new LensflareElement(texture3, 60, 0.6 ))
            lensflare.addElement(new LensflareElement(texture3, 70, 0.7 ))
            lensflare.addElement(new LensflareElement(texture3, 120, 0.9 ))
            lensflare.addElement(new LensflareElement(texture3, 70, 1 ))
            this.scene.add(lensflare)
            //
            this.reflector = new Reflector(new this.$THREE.PlaneBufferGeometry(1.4, 1.4), {
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio
            })
            this.reflector.position.x = 1
            this.reflector.position.y = 0.5
            this.reflector.position.z = - 3
            this.reflector.rotation.y = - Math.PI / 4
            this.scene.add(this.reflector)
            var frameGeometry = new this.$THREE.BoxBufferGeometry(1.5, 1.5, 0.1)
            var frameMaterial = new this.$THREE.MeshPhongMaterial()
            var frame = new this.$THREE.Mesh(frameGeometry, frameMaterial)
            frame.position.z = - 0.07
            frame.castShadow = true
            frame.receiveShadow = true
            this.reflector.add(frame)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.autoClear = false
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.xr.enabled = true
            document.getElementsByClassName('webxrVrSandbox-container')[0].appendChild(this.renderer.domElement)
            document.getElementsByClassName('webxrVrSandbox-container')[0].appendChild(VRButton.createButton(this.renderer ))
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            this.renderer.setAnimationLoop(this.render)
        },
        render() {
            var time = performance.now() * 0.0002
            var torus = this.scene.children[ 0 ]
            torus.rotation.x = time * 2
            torus.rotation.y = time * 5
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webxrVrSandbox-container {
    width: 100%;
}
</style>
