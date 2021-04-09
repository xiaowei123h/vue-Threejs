<template>
    <div class="webglMathObb-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - OBB (Oriented Bounding Box)
		</div>
    </div>
</template>

<script>
import { OBB } from '@/components/jsm/math/OBB.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
            controls: null,
            stats: null,
            raycaster: null,
            hitbox: null,
            objects: [],
            mouse: null,
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(0, 0, 75)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.clock = new this.$THREE.Clock()
            this.raycaster = new this.$THREE.Raycaster()
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x222222, 1.5)
            hemiLight.position.set(1, 1, 1)
            this.scene.add(hemiLight)
            var size = new this.$THREE.Vector3(10, 5, 6)
            var geometry = new this.$THREE.BoxBufferGeometry(size.x, size.y, size.z)
            // setup OBB on geometry level (doing this manually for now)
            geometry.userData.obb = new OBB()
            geometry.userData.obb.halfSize.copy(size).multiplyScalar(0.5)
            for (var i = 0; i < 100; i ++) {
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: 0x00ff00 }))
                object.matrixAutoUpdate = false
                object.position.x = Math.random() * 80 - 40
                object.position.y = Math.random() * 80 - 40
                object.position.z = Math.random() * 80 - 40
                object.rotation.x = Math.random() * 2 * Math.PI
                object.rotation.y = Math.random() * 2 * Math.PI
                object.rotation.z = Math.random() * 2 * Math.PI
                object.scale.x = Math.random() + 0.5
                object.scale.y = Math.random() + 0.5
                object.scale.z = Math.random() + 0.5
                this.scene.add(object)
                // bounding volume on object level (this will reflect the current world transform)
                object.userData.obb = new OBB()
                this.objects.push(object)
            }
            //
            this.hitbox = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true }))
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMathObb-container')[0].appendChild(this.renderer.domElement)
            //
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglMathObb-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            document.addEventListener('click', this.onClick, false)
        },
        onClick(event) {
            event.preventDefault()
            this.mouse.x = (event.clientX / (window.innerWidth - 281)) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersectionPoint = new this.$THREE.Vector3()
            var intersections = []
            for (var i = 0, il = this.objects.length; i < il; i ++) {
                var object = this.objects[ i ]
                var obb = object.userData.obb
                var ray = this.raycaster.ray
                if (obb.intersectRay(ray, intersectionPoint) !== null) {
                    var distance = ray.origin.distanceTo(intersectionPoint)
                    intersections.push({ distance: distance, object: object })
                }
            }
            if (intersections.length > 0) {
                // determine closest intersection and highlight the respective 3D object
                intersections.sort(this.sortIntersections)
                intersections[ 0 ].object.add(this.hitbox)
            } else {
                var parent = this.hitbox.parent
                if (parent) parent.remove(this.hitbox)
            }

        },
        sortIntersections(a, b) {
            return a.distance - b.distance
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            // transform cubes
            var delta = this.clock.getDelta()
            for (var i = 0, il = this.objects.length; i < il; i ++) {
                var object = this.objects[ i ]
                object.rotation.x += delta * Math.PI * 0.20
                object.rotation.y += delta * Math.PI * 0.1
                object.updateMatrix()
                object.updateMatrixWorld()
                // update OBB
                object.userData.obb.copy(object.geometry.userData.obb)
                object.userData.obb.applyMatrix4(object.matrixWorld)
                // reset
                object.material.color.setHex(0x00ff00)
            }
            // collision detection
            for (var i = 0, il = this.objects.length; i < il; i ++) {
                var object = this.objects[ i ]
                var obb = object.userData.obb
                for (var j = i + 1, jl = this.objects.length; j < jl; j ++) {
                    var objectToTest = this.objects[ j ]
                    var obbToTest = objectToTest.userData.obb
                    // now perform intersection test
                    if (obb.intersectsOBB(obbToTest) === true) {
                        object.material.color.setHex(0xff0000)
                        objectToTest.material.color.setHex(0xff0000)
                    }
                }
            }
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglMathObb-container {
    position: relative;
    width: 100%;
}
#info {
    color: #444;
}
#info a {
    color: #444;
}
</style>