<template>
    <div class="webglMorphtargets-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - WebGL morph target example
		</div>
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
            raycaster: null,
			mesh: null,
            mouse: null,
            gui: null,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x222222)
            this.scene.fog = new this.$THREE.Fog(0x000000, 1, 15000)
            var light = new this.$THREE.PointLight(0xffffff)
            light.position.z = 500
            this.camera.add(light)
            this.scene.add(this.camera)
            this.scene.add(new this.$THREE.AmbientLight(0x111111))
            var geometry = new this.$THREE.BoxGeometry(100, 100, 100)
            var material = new this.$THREE.MeshLambertMaterial({ color: 0xff0000, morphTargets: true })
            // varruct 8 blend shapes
            for (var i = 0; i < 8; i ++) {
                var vertices = []
                for (var v = 0; v < geometry.vertices.length; v ++) {
                    vertices.push(geometry.vertices[ v ].clone())
                    if (v === i) {
                        vertices[ vertices.length - 1 ].x *= 2
                        vertices[ vertices.length - 1 ].y *= 2
                        vertices[ vertices.length - 1 ].z *= 2
                    }
                }
                geometry.morphTargets.push({ name: "target" + i, vertices: vertices })
            }
            this.mesh = new this.$THREE.Mesh(new this.$THREE.BufferGeometry().fromGeometry(geometry), material)
            this.scene.add(this.mesh)
            //
            var params = {
                influence1: 0,
                influence2: 0,
                influence3: 0,
                influence4: 0,
                influence5: 0,
                influence6: 0,
                influence7: 0,
                influence8: 0
            }
            this.gui = new GUI()
            var folder = this.gui.addFolder('Morph Targets')
            folder.add(params, 'influence1', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 0 ] = value
            })
            folder.add(params, 'influence2', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 1 ] = value
            })
            folder.add(params, 'influence3', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 2 ] = value
            })
            folder.add(params, 'influence4', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 3 ] = value
            })
            folder.add(params, 'influence5', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 4 ] = value
            })
            folder.add(params, 'influence6', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 5 ] = value
            })
            folder.add(params, 'influence7', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 6 ] = value
            })
            folder.add(params, 'influence8', 0, 1).step(0.01).onChange((value) => {
                this.mesh.morphTargetInfluences[ 7 ] = value
            })
            folder.open()
            //
            this.raycaster = new this.$THREE.Raycaster()
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 400
            controls.maxDistance = 1000
            //
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('click', this.onClick, false)
        },
        onClick(event) {
            event.preventDefault()
            this.mouse.x = (event.clientX / (window.innerWidth - 281)) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObject(this.mesh)
            if (intersects.length > 0) {
                this.mesh.material.color.set(Math.random() * 0xffffff)
            }
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.mesh.rotation.y += 0.01
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMorphtargets-container {
    position: relative;
    width: 100%;
}
</style>
