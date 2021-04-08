<template>
    <div class="webglMultipleElementsText-container">
        <canvas id="c"></canvas>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - multiple elements with text - webgl</div>

        <p>Sound waves whose geometry is determined by a single dimension, plane waves, obey the wave equation</p>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            scenes: [],
            views: null,
            t: null,
            canvas: null,
            renderer: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            var balls = 20
            var size = .25
            var colors = [
                'rgb(0,127,255)', 'rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,255,255)',
                'rgb(255,0,255)', 'rgb(255,0,127)', 'rgb(255,255,0)', 'rgb(0,255,127)'
            ]
            this.canvas = document.getElementById('c')
            this.renderer = new this.$THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.views = document.querySelectorAll('.view')
            console.log(this.views)
            for (var n = 0; n < this.views.length; n ++) {
                var scene = new this.$THREE.Scene()
                scene.background = new this.$THREE.Color(0xffffff)
                var geometry0 = new this.$THREE.BufferGeometry()
                var geometry1 = new this.$THREE.BufferGeometry()
                var vertices = []
                if (this.views[ n ].lattice) {
                    var range = balls / 2
                    for (var i = - range; i <= range; i ++) {
                        for (var j = - range; j <= range; j ++) {
                            for (var k = - range; k <= range; k ++) {
                                vertices.push(i, j, k)
                            }
                        }
                    }
                } else {
                    for (var m = 0; m < Math.pow(balls, 3); m ++) {
                        var i = balls * Math.random() - balls / 2
                        var j = balls * Math.random() - balls / 2
                        var k = balls * Math.random() - balls / 2
                        vertices.push(i, j, k)
                    }
                }
                geometry0.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3))
                geometry1.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices.slice(), 3))
                var index = Math.floor(colors.length * Math.random())
                var canvas2 = document.createElement('canvas')
                canvas2.width = 128
                canvas2.height = 128
                var context = canvas2.getContext('2d')
                context.arc(64, 64, 64, 0, 2 * Math.PI)
                context.fillStyle = colors[ index ]
                context.fill()
                var texture = new this.$THREE.CanvasTexture(canvas2)
                var material = new this.$THREE.PointsMaterial({ size: size, map: texture, transparent: true, alphaTest: 0.1 })
                scene.add(new this.$THREE.Points(geometry0, material))
                scene.userData.view = this.views[ n ]
                scene.userData.geometry1 = geometry1
                var camera = new this.$THREE.PerspectiveCamera(75, 1, 0.1, 100)
                camera.position.set(0, 0, 1.2 * balls)
                scene.userData.camera = camera
                var controls = new OrbitControls(camera, this.views[ n ])
                scene.userData.controls = controls
                console.log(scene)
                this.scenes.push(scene)
            }
            console.log(this.scenes)
            this.t = 0
            this.animate()
        },
        updateSize() {
            var width = this.canvas.clientWidth
            var height = this.canvas.clientHeight
            if (this.canvas.width !== width || this.canvas.height != height) {
                this.renderer.setSize(width, height, false)
            }
        },
        animate() {
            this.render()
            requestAnimationFrame(this.animate)
        },
        render() {
            this.updateSize()
            this.renderer.setClearColor(0xffffff)
            this.renderer.setScissorTest(false)
            this.renderer.clear()
            this.renderer.setClearColor(0x000000)
            this.renderer.setScissorTest(true)
            this.scenes.forEach((scene) => {
                var rect = scene.userData.view.getBoundingClientRect()
                // check if it's offscreen. If so skip it
                if (rect.bottom < 0 || rect.top > this.renderer.domElement.clientHeight ||
                        rect.right < 0 || rect.left > this.renderer.domElement.clientWidth) {
                    return // it's off screen
                }
                // set the viewport
                var width = rect.right - rect.left
                var height = rect.bottom - rect.top
                var left = rect.left
                var bottom = this.renderer.domElement.clientHeight - rect.bottom
                this.renderer.setViewport(left, bottom, width, height)
                this.renderer.setScissor(left, bottom, width, height)
                this.renderer.render(scene, scene.userData.camera)
                var points = scene.children[ 0 ]
                var position = points.geometry.attributes.position
                var point = new this.$THREE.Vector3()
                var offset = new this.$THREE.Vector3()
                for (var i = 0; i < position.count; i ++) {
                    point.fromBufferAttribute(scene.userData.geometry1.attributes.position, i)
                    scene.userData.view.displacement(point.x, point.y, point.z, t / 5, offset)
                    position.setXYZ(i, point.x + offset.x, point.y + offset.y, point.z + offset.z)
                }
                position.needsUpdate = true
            })
            this.t ++
        }
    },
}
</script>

<style scoped>
.webglMultipleElementsText-container {
    position: relative;
    height: 100vh;
    width: 100%;
    background-color: #fff;
    color: #444;
    margin: auto;
    padding: .5in;
    max-width: 7in;
    text-align: justify;
}
</style>

<style>
/* * {
    box-sizing: border-box;
    -moz-box-sizing: border-box;
} */


.webglMultipleElementsText-container #info a {
    color: #08f;
}

.webglMultipleElementsText-container #info {
    left: 0px;
}

.webglMultipleElementsText-container .view {
    width: 5in;
    height: 5in;
    margin: auto;
}

.webglMultipleElementsText-container #c {
    position: fixed;
    left: 0px; top: 0px;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: -1;
}

.webglMultipleElementsText-container .math {
    text-align: center;
}

.webglMultipleElementsText-container .math-frac {
    display: inline-block;
    vertical-align: middle;
}

.webglMultipleElementsText-container .math-num {
    display: block;
}

.webglMultipleElementsText-container .math-denom {
    display: block;
    border-top: 1px solid;
}

.webglMultipleElementsText-container .math-sqrt {
    display: inline-block;
    transform: scale(1, 1.3);
}

.webglMultipleElementsText-container .math-sqrt-stem {
    display: inline-block;
    border-top: 1px solid;
    margin-top: 5px;
}
</style>
