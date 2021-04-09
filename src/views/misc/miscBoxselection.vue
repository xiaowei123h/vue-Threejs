<template>
    <div class="miscBoxselection-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - box selection
		</div>
    </div>
</template>

<script>
import { SelectionBox } from '@/components/jsm/interactive/SelectionBox.js'
import { SelectionHelper } from '@/components/jsm/interactive/SelectionHelper.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            selectionBox: null,
            helper: null,
        }
    },
    mounted() {
        this.init()
        this.animate()
        this.selectionBox = new SelectionBox(this.camera, this.scene)
        this.helper = new SelectionHelper(this.selectionBox, this.renderer, 'selectBox')
        console.log(this.helper)
        document.addEventListener('pointerdown', (event) => {
            for (var item of this.selectionBox.collection) {
                item.material.emissive.set(0x000000)
            }
            this.selectionBox.startPoint.set(
                ((event.clientX - 281) / (window.innerWidth - 281)) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5)
        })
        document.addEventListener('pointermove', (event) => {
            if (this.helper.isDown) {
                for (var i = 0; i < this.selectionBox.collection.length; i ++) {
                    this.selectionBox.collection[ i ].material.emissive.set(0x000000)
                }
                this.selectionBox.endPoint.set(
                    ((event.clientX - 281) / (window.innerWidth - 281)) * 2 - 1,
                    - (event.clientY / window.innerHeight) * 2 + 1,
                    0.5)
                var allSelected = this.selectionBox.select()
                for (var i = 0; i < allSelected.length; i ++) {
                    allSelected[ i ].material.emissive.set(0xffffff)
                }

            }
        })
        document.addEventListener('pointerup', (event) => {
            this.selectionBox.endPoint.set(
                ((event.clientX - 281) / (window.innerWidth - 281)) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5)
            var allSelected = this.selectionBox.select()
            for (var i = 0; i < allSelected.length; i ++) {
                allSelected[ i ].material.emissive.set(0xffffff)
            }
        })
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('miscBoxselection-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 5000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            this.scene.add(new this.$THREE.AmbientLight(0x505050))
            var light = new this.$THREE.SpotLight(0xffffff, 1.5)
            light.position.set(0, 500, 2000)
            light.angle = Math.PI / 9
            light.castShadow = true
            light.shadow.camera.near = 1000
            light.shadow.camera.far = 4000
            light.shadow.mapSize.width = 1024
            light.shadow.mapSize.height = 1024
            this.scene.add(light)
            var geometry = new this.$THREE.BoxBufferGeometry(20, 20, 20)
            for (var i = 0; i < 200; i ++) {
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
                object.position.x = Math.random() * 1600 - 800
                object.position.y = Math.random() * 900 - 450
                object.position.z = Math.random() * 900 - 500
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.x = Math.random() * 2 + 1
                object.scale.y = Math.random() * 2 + 1
                object.scale.z = Math.random() * 2 + 1
                object.castShadow = true
                object.receiveShadow = true
                this.scene.add(object)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFShadowMap
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)

        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.miscBoxselection-container {
    position: relative;
    width: 100%;
}
#info {
    background-color: #f0f0f0;
    color: #000;
    touch-action: none;
}
#info a {
    color: #08e;
}
</style>

<style>
.miscBoxselection-container .selectBox {
    border: 1px solid #55aaff;
    background-color: rgba(75, 160, 255, 0.3);
    position: fixed;
}
</style>
