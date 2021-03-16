<template>
    <div class="css3dSprites-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> css3d - sprites</div>
		<div id="container"></div>
    </div>
</template>

<script>
import { TWEEN } from '@/compontents/jsm/libs/tween.module.min.js'
// import { TrackballControls } from '@/compontents/jsm/controls/TrackballControls.js'
// import { CSS3DRenderer, CSS3DSprite } from '@/compontents/jsm/renderers/CSS3DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			controls: null,
			particlesTotal: 512,
			positions: [],
			objects: [],
			current: 0,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000)
            this.camera.position.set(600, 400, 1500)
            this.camera.lookAt(0, 0, 0)
            this.scene = new this.$THREE.Scene()
            var image = document.createElement('img')
            image.addEventListener('load', () => {
                for (var i = 0; i < this.particlesTotal; i ++) {
                    var object = new CSS3DSprite(image.cloneNode())
                    object.position.x = Math.random() * 4000 - 2000,
                    object.position.y = Math.random() * 4000 - 2000,
                    object.position.z = Math.random() * 4000 - 2000
                    this.scene.add(object)
                    this.objects.push(object)
                }
                this.transition()
            }, false)
            image.src = 'static/textures/sprite.png'
            // Plane
            var amountX = 16
            var amountZ = 32
            var separationPlane = 150
            var offsetX = ((amountX - 1) * separationPlane) / 2
            var offsetZ = ((amountZ - 1) * separationPlane) / 2
            for (var i = 0; i < this.particlesTotal; i ++) {
                var x = (i % amountX) * separationPlane
                var z = Math.floor(i / amountX) * separationPlane
                var y = (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200
                this.positions.push(x - offsetX, y, z - offsetZ)
            }
            // Cube
            var amount = 8
            var separationCube = 150
            var offset = ((amount - 1) * separationCube) / 2
            for (var i = 0; i < this.particlesTotal; i ++) {
                var x = (i % amount) * separationCube
                var y = Math.floor((i / amount) % amount) * separationCube
                var z = Math.floor(i / (amount * amount)) * separationCube
                this.positions.push(x - offset, y - offset, z - offset)
            }
            // Random
            for (var i = 0; i < this.particlesTotal; i ++) {
                this.positions.push(
                    Math.random() * 4000 - 2000,
                    Math.random() * 4000 - 2000,
                    Math.random() * 4000 - 2000
            )
            }
            // Sphere
            var radius = 750
            for (var i = 0; i < this.particlesTotal; i ++) {
                var phi = Math.acos(- 1 + (2 * i) / this.particlesTotal)
                var theta = Math.sqrt(this.particlesTotal * Math.PI) * phi
                this.positions.push(
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.sin(theta) * Math.sin(phi),
                    radius * Math.cos(phi)
            )
            }
            //
            this.renderer = new CSS3DRenderer()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            document.getElementById('container').appendChild(this.renderer.domElement)
            //
            this.controls = new TrackballControls(camera, this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        transition() {
            var offset = this.current * this.particlesTotal * 3
            var duration = 2000
            for (var i = 0, j = offset; i < this.particlesTotal; i ++, j += 3) {
                var object = this.objects[ i ]
                new TWEEN.Tween(object.position)
                    .to({
                        x: this.positions[ j ],
                        y: this.positions[ j + 1 ],
                        z: this.positions[ j + 2 ]
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start()
            }
            new TWEEN.Tween(this)
                .to({}, duration * 3)
                .onComplete(transition)
                .start()
            this.current = (this.current + 1) % 4
        },
        animate() {
            requestAnimationFrame(this.animate)
            TWEEN.update()
            this.controls.update()
            var time = performance.now()
            for (var i = 0, l = this.objects.length; i < l; i ++) {
                var object = this.objects[ i ]
                var scale = Math.sin((Math.floor(object.position.x) + time) * 0.002) * 0.3 + 1
                object.scale.set(scale, scale, scale)
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.css3dSprites-container {
    width: 100%;
}
#info {
    background-color: #fff;
    color: #000;
}
#info a {
    color: #48f;
}
</style>
