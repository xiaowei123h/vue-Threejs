<template>
    <div class="webglModifierSimplifier-container">
        
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { SimplifyModifier } from '@/components/jsm/modifiers/SimplifyModifier.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            var info = document.createElement('div')
            info.style.position = 'absolute'
            info.style.top = '10px'
            info.style.width = '100%'
            info.style.textAlign = 'center'
            info.innerHTML = '<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Vertex Reduction using SimplifyModifier'
            document.getElementsByClassName('webglModifierSimplifier-container')[0].appendChild(info)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglModifierSimplifier-container')[0].appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 15
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.addEventListener('change', this.render) // use if there is no animation loop
            controls.enablePan = false
            controls.enableZoom = false
            this.scene.add(new this.$THREE.AmbientLight(0xffffff, 0.2))
            var light = new this.$THREE.PointLight(0xffffff, 0.7)
            this.camera.add(light)
            this.scene.add(this.camera)
            new GLTFLoader().load("static/models/gltf/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                mesh.position.x = - 3
                mesh.rotation.y = Math.PI / 2
                this.scene.add(mesh)
                var modifier = new SimplifyModifier()
                var simplified = mesh.clone()
                simplified.material = simplified.material.clone()
                simplified.material.flatShading = true
                var count = Math.floor(simplified.geometry.attributes.position.count * 0.875) // number of vertices to remove
                simplified.geometry = modifier.modify(simplified.geometry, count)
                simplified.position.x = 3
                simplified.rotation.y = - Math.PI / 2
                this.scene.add(simplified)
                this.render()
            })
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglModifierSimplifier-container {
    width: 100%;
}
</style>
