<template>
    <div class="miscControlsDrag-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - drag controls<br />
			Use "Shift+Click" to add/remove objects to/from a group.<br />
			Grouped objects can be transformed as a union.
		</div>
    </div>
</template>

<script>
import { DragControls } from '@/components/jsm/controls/DragControls.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            group: null,
			enableSelection: false,
			objects: [],
            mouse: null,
            raycaster: null,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.raycaster = new this.$THREE.Raycaster()
        this.init()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('miscControlsDrag-container')[0].appendChild(this.container)
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
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            var geometry = new this.$THREE.BoxBufferGeometry(40, 40, 40)
            for (var i = 0; i < 200; i ++) {
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
                object.position.x = Math.random() * 1000 - 500
                object.position.y = Math.random() * 600 - 300
                object.position.z = Math.random() * 800 - 400
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.x = Math.random() * 2 + 1
                object.scale.y = Math.random() * 2 + 1
                object.scale.z = Math.random() * 2 + 1
                object.castShadow = true
                object.receiveShadow = true
                this.scene.add(object)
                this.objects.push(object)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$THREE.PCFShadowMap
            this.container.appendChild(this.renderer.domElement)
            this.controls = new DragControls([ ... this.objects ], this.camera, this.renderer.domElement)
            this.controls.addEventListener('drag', this.render)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('click', this.onClick, false)
            window.addEventListener('keydown', this.onKeyDown, false)
            window.addEventListener('keyup', this.onKeyUp, false)
            this.render()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render()
        },
        onKeyDown(event) {
            this.enableSelection = (event.keyCode === 16) ? true : false
        },
        onKeyUp() {
            this.enableSelection = false
        },
        onClick(event) {
            event.preventDefault()
            if (this.enableSelection === true) {
                var draggableObjects = this.controls.getObjects()
                draggableObjects.length = 0
                this.mouse.x = (event.clientX / this.$webglInnerWidth) * 2 - 1
                this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
                this.raycaster.setFromCamera(this.mouse, camera)
                var intersections = this.raycaster.intersectObjects(this.objects, true)
                if (intersections.length > 0) {
                    var object = intersections[ 0 ].object
                    if (this.group.children.includes(object) === true) {
                        object.material.emissive.set(0x000000)
                        this.scene.attach(object)
                    } else {
                        object.material.emissive.set(0xaaaaaa)
                        this.group.attach(object)
                    }
                    this.controls.transformGroup = true
                    draggableObjects.push(this.group)
                }
                if (this.group.children.length === 0) {
                    this.controls.transformGroup = false
                    draggableObjects.push(...this.objects)
                }
            }
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.miscControlsDrag-container {
    width: 100%;
}
#info {
    background-color: #f0f0f0;
    color: #444;
}
#info a {
    color: #08f;
}
</style>
