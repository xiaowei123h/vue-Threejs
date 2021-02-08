<template>
    <div class="webglMultipleElements-container">
        <canvas id="c"></canvas>
		<div id="content">
			<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - multiple elements - webgl</div>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            canvas: null,
            renderer: null,
			scenes: [],
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.canvas = document.getElementById("c")
            var geometries = [
                new this.$THREE.BoxBufferGeometry(1, 1, 1),
                new this.$THREE.SphereBufferGeometry(0.5, 12, 8),
                new this.$THREE.DodecahedronBufferGeometry(0.5),
                new this.$THREE.CylinderBufferGeometry(0.5, 0.5, 1, 12)
            ]
            var content = document.getElementById('content')
            for (var i = 0; i < 40; i ++) {
                var scene = new this.$THREE.Scene()
                // make a list item
                var element = document.createElement('div')
                element.className = 'list-item'
                var sceneElement = document.createElement('div')
                element.appendChild(sceneElement)
                var descriptionElement = document.createElement('div')
                descriptionElement.innerText = 'Scene ' + (i + 1)
                element.appendChild(descriptionElement)
                // the element that represents the area we want to render the scene
                scene.userData.element = sceneElement
                content.appendChild(element)
                var camera = new this.$THREE.PerspectiveCamera(50, 1, 1, 10)
                camera.position.z = 2
                scene.userData.camera = camera
                var controls = new OrbitControls(scene.userData.camera, scene.userData.element)
                controls.minDistance = 2
                controls.maxDistance = 5
                controls.enablePan = false
                controls.enableZoom = false
                scene.userData.controls = controls
                // add one random mesh to each scene
                var geometry = geometries[ geometries.length * Math.random() | 0 ]
                var material = new this.$THREE.MeshStandardMaterial({
                    color: new this.$THREE.Color().setHSL(Math.random(), 1, 0.75),
                    roughness: 0.5,
                    metalness: 0,
                    flatShading: true
                })
                scene.add(new this.$THREE.Mesh(geometry, material))
                scene.add(new this.$THREE.HemisphereLight(0xaaaaaa, 0x444444))
                var light = new this.$THREE.DirectionalLight(0xffffff, 0.5)
                light.position.set(1, 1, 1)
                scene.add(light)
                this.scenes.push(scene)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
            this.renderer.setClearColor(0xffffff, 1)
            this.renderer.setPixelRatio(window.devicePixelRatio)
        },
        updateSize() {
            var width = this.canvas.clientWidth
            var height = this.canvas.clientHeight
            if (this.canvas.width !== width || this.canvas.height !== height) {
                this.renderer.setSize(width, height, false)
            }
        },
        animate() {
            this.render()
            requestAnimationFrame(this.animate)
        },
        render() {
            this.updateSize()
            this.canvas.style.transform = `translateY(${window.scrollY}px)`
            this.renderer.setClearColor(0xffffff)
            this.renderer.setScissorTest(false)
            this.renderer.clear()
            this.renderer.setClearColor(0xe0e0e0)
            this.renderer.setScissorTest(true)
            this.scenes.forEach((scene) => {
                // so something moves
                scene.children[ 0 ].rotation.y = Date.now() * 0.001
                // get the element that is a place holder for where we want to
                // draw the scene
                var element = scene.userData.element
                // get its position relative to the page's viewport
                var rect = element.getBoundingClientRect()
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
                var camera = scene.userData.camera
                //camera.aspect = width / height // not changing in this example
                //camera.updateProjectionMatrix()
                //scene.userData.controls.update()
                this.renderer.render(scene, camera)
            })
        }
    },
}
</script>

<style scoped>
.webglMultipleElements-container {
    width: 100%;
}
* {
    box-sizing: border-box;
    -moz-box-sizing: border-box;
}

body {
    background-color: #fff;
    color: #444;
}

a {
    color: #08f;
}

#content {
    position: absolute;
    top: 0; width: 100%;
    z-index: 1;
    padding: 3em 0 0 0;
}

#c {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
}

.list-item {
    display: inline-block;
    margin: 1em;
    padding: 1em;
    box-shadow: 1px 2px 4px 0px rgba(0,0,0,0.25);
}

.list-item > div:nth-child(1) {
    width: 200px;
    height: 200px;
}

.list-item > div:nth-child(2) {
    color: #888;
    font-family: sans-serif;
    font-size: large;
    width: 200px;
    margin-top: 0.5em;
}
</style>
