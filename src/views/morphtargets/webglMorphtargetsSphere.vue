<template>
    <div class="webglMorphtargetsSphere-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - WebGL morph target example
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
			mesh: null,
			sign: 1,
			speed: 0.5, 
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 0.2, 100)
            this.camera.position.set(0, 5, 5)
            this.scene = new this.$THREE.Scene()
            this.clock = new this.$THREE.Clock()
            var light1 = new this.$THREE.PointLight(0xff2200, 0.7)
            light1.position.set(100, 100, 100)
            this.scene.add(light1)
            var light2 = new this.$THREE.PointLight(0x22ff00, 0.7)
            light2.position.set(- 100, - 100, - 100)
            this.scene.add(light2)
            this.scene.add(new this.$THREE.AmbientLight(0x111111))
            var loader = new GLTFLoader()
            loader.load('static/models/gltf/AnimatedMorphSphere/glTF/AnimatedMorphSphere.gltf', (gltf) => {
                gltf.scene.traverse((node) => {
                    if (node.isMesh) this.mesh = node
                })
                this.mesh.material.morphTargets = true
                this.mesh.rotation.z = Math.PI / 2
                //this.mesh.material.visible = false
                this.scene.add(this.mesh)
                //
                var pointsMaterial = new this.$THREE.PointsMaterial({
                    size: 10,
                    sizeAttenuation: false,
                    map: new this.$THREE.TextureLoader().load('static/textures/sprites/disc.png'),
                    alphaTest: 0.5,
                    morphTargets: true
                })
                var points = new this.$THREE.Points(this.mesh.geometry, pointsMaterial)
                points.morphTargetInfluences = this.mesh.morphTargetInfluences
                points.morphTargetDictionary = this.mesh.morphTargetDictionary
                this.mesh.add(points)
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 1
            controls.maxDistance = 20
            //
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('visibilitychange', this.onVisibilityChange)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onVisibilityChange() {
            if (document.hidden === true) {
                this.clock.stop()
            } else {
                this.clock.start()
            }
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var delta = this.clock.getDelta()
            if (this.mesh !== null) {
                var step = delta * this.speed
                this.mesh.rotation.y += step
                this.mesh.morphTargetInfluences[ 1 ] = this.mesh.morphTargetInfluences[ 1 ] + step * this.sign
                if (this.mesh.morphTargetInfluences[ 1 ] <= 0 || this.mesh.morphTargetInfluences[ 1 ] >= 1) {
                    this.sign *= - 1
                }
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMorphtargetsSphere-container {
    position: relative;
    width: 100%;
}
</style>
