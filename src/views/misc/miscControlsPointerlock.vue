<template>
    <div class="miscControlsPointerlock-container">
        <div id="instructions">
            <span style="font-size:36px">Click to play</span>
            <br /><br />
            Move: WASD<br/>
            Jump: SPACE<br/>
            Look: MOUSE
        </div>
    </div>
</template>

<script>
import { PointerLockControls } from '@/components/jsm/controls/PointerLockControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
			objects: [],
			raycaster: null,
			moveForward: false,
			moveBackward: false,
			moveLeft: false,
			moveRight: false,
			canJump: false,
			prevTime: null,
			velocity: null,
			direction: null,
			vertex: null,
			color: null,
        }
    },
    mounted() {
        this.prevTime = performance.now()
        this.velocity = new this.$THREE.Vector3()
        this.direction = new this.$THREE.Vector3()
        this.vertex = new this.$THREE.Vector3()
        this.color = new this.$THREE.Color()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
            this.camera.position.y = 10
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.scene.fog = new this.$THREE.Fog(0xffffff, 0, 750)
            var light = new this.$THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75)
            light.position.set(0.5, 1, 0.75)
            this.scene.add(light)
            this.controls = new PointerLockControls(this.camera, document.getElementsByClassName('miscControlsPointerlock-container')[0])
            var blocker = document.getElementById('blocker')
            var instructions = document.getElementById('instructions')
            instructions.addEventListener('click', () => {
                this.controls.lock()
            }, false)
            this.controls.addEventListener('lock', () => {
                instructions.style.display = 'none'
                blocker.style.display = 'none'
            })
            this.controls.addEventListener('unlock', () => {
                blocker.style.display = 'block'
                instructions.style.display = ''
            })
            this.scene.add(this.controls.getObject())
            var onKeyDown = (event) => {
                switch (event.keyCode) {
                    case 38: // up
                    case 87: // w
                        this.moveForward = true
                        break
                    case 37: // left
                    case 65: // a
                        this.moveLeft = true
                        break
                    case 40: // down
                    case 83: // s
                        this.moveBackward = true
                        break
                    case 39: // right
                    case 68: // d
                        this.moveRight = true
                        break
                    case 32: // space
                        if (this.canJump === true) this.velocity.y += 350
                        this.canJump = false
                        break
                }
            };
            var onKeyUp = (event) => {
                switch (event.keyCode) {
                    case 38: // up
                    case 87: // w
                        this.moveForward = false
                        break
                    case 37: // left
                    case 65: // a
                        this.moveLeft = false
                        break
                    case 40: // down
                    case 83: // s
                        this.moveBackward = false
                        break
                    case 39: // right
                    case 68: // d
                        this.moveRight = false
                        break
                }
            }
            document.addEventListener('keydown', onKeyDown, false)
            document.addEventListener('keyup', onKeyUp, false)
            this.raycaster = new this.$THREE.Raycaster(new this.$THREE.Vector3(), new this.$THREE.Vector3(0, - 1, 0), 0, 10)
            // floor
            var floorGeometry = new this.$THREE.PlaneBufferGeometry(2000, 2000, 100, 100)
            floorGeometry.rotateX(- Math.PI / 2)
            // vertex displacement
            var position = floorGeometry.attributes.position
            for (var i = 0, l = position.count; i < l; i ++) {
                this.vertex.fromBufferAttribute(position, i)
                this.vertex.x += Math.random() * 20 - 10
                this.vertex.y += Math.random() * 2
                this.vertex.z += Math.random() * 20 - 10
                position.setXYZ(i, this.vertex.x, this.vertex.y, this.vertex.z)
            }
            floorGeometry = floorGeometry.toNonIndexed() // ensure each face has unique vertices
            position = floorGeometry.attributes.position
            var colorsFloor = []
            for (var i = 0, l = position.count; i < l; i ++) {
                this.color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75)
                colorsFloor.push(this.color.r, this.color.g, this.color.b)
            }
            floorGeometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colorsFloor, 3))
            var floorMaterial = new this.$THREE.MeshBasicMaterial({ vertexColors: true })
            var floor = new this.$THREE.Mesh(floorGeometry, floorMaterial)
            this.scene.add(floor)
            // objects
            var boxGeometry = new this.$THREE.BoxBufferGeometry(20, 20, 20).toNonIndexed()
            position = boxGeometry.attributes.position
            var colorsBox = []
            for (var i = 0, l = position.count; i < l; i ++) {
                this.color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75)
                colorsBox.push(this.color.r, this.color.g, this.color.b)
            }
            boxGeometry.setAttribute('color', new this.$THREE.Float32BufferAttribute(colorsBox, 3))
            for (var i = 0; i < 500; i ++) {
                var boxMaterial = new this.$THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: true })
                boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75)
                var box = new this.$THREE.Mesh(boxGeometry, boxMaterial)
                box.position.x = Math.floor(Math.random() * 20 - 10) * 20
                box.position.y = Math.floor(Math.random() * 20) * 20 + 10
                box.position.z = Math.floor(Math.random() * 20 - 10) * 20
                this.scene.add(box)
                this.objects.push(box)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            document.getElementsByClassName('miscControlsPointerlock-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var time = performance.now()
            if (this.controls.isLocked === true) {
                this.raycaster.ray.origin.copy(this.controls.getObject().position)
                this.raycaster.ray.origin.y -= 10
                var intersections = this.raycaster.intersectObjects(this.objects)
                var onObject = intersections.length > 0
                var delta = (time - this.prevTime) / 1000
                this.velocity.x -= this.velocity.x * 10.0 * delta
                this.velocity.z -= this.velocity.z * 10.0 * delta
                this.velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass
                this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
                this.direction.x = Number(this.moveRight) - Number(this.moveLeft)
                this.direction.normalize() // this ensures consistent movements in all this.directions
                if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta
                if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta
                if (onObject === true) {
                    this.velocity.y = Math.max(0, this.velocity.y)
                    this.canJump = true
                }
                this.controls.moveRight(- this.velocity.x * delta)
                this.controls.moveForward(- this.velocity.z * delta)
                this.controls.getObject().position.y += (this.velocity.y * delta) // new behavior
                if (this.controls.getObject().position.y < 10) {
                    this.velocity.y = 0
                    this.controls.getObject().position.y = 10
                    this.canJump = true
                }
            }
            this.prevTime = time
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.miscControlsPointerlock-container {
    width: 100%;
}
#blocker {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

#instructions {
    width: 100%;
    height: 100%;

    display: -webkit-box;
    display: -moz-box;
    display: box;

    -webkit-box-orient: horizontal;
    -moz-box-orient: horizontal;
    box-orient: horizontal;

    -webkit-box-pack: center;
    -moz-box-pack: center;
    box-pack: center;

    -webkit-box-align: center;
    -moz-box-align: center;
    box-align: center;

    color: #ffffff;
    text-align: center;
    font-family: Arial;
    font-size: 14px;
    line-height: 24px;

    cursor: pointer;
}
</style>
