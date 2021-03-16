<template>
    <div class="css3dPanoramaDeviceorientation-container">
        <div id="overlay">
            <el-button type="primary" size="mini" @click="handleStartButton" class="start-btn">Start Demo</el-button>
		</div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> css3d - panorama - device orientation.<br/>cubemap by <a href="http://www.humus.name/index.php?page=Textures" target="_blank" rel="noopener">Humus</a>.</div>
    </div>
</template>

<script>
import { DeviceOrientationControls } from '@/components/jsm/controls/DeviceOrientationControls.js'
import { CSS3DRenderer, CSS3DObject } from '@/components/jsm/renderers/CSS3DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			controls: null,
			startButton: null,
        }
    },
    mounted() {
    },
    methods: {
        handleStartButton() {
            this.init()
            this.animate()
        },
        init() {
            var overlay = document.getElementById('overlay')
            overlay.remove()
            this.camera = new this.$THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
            this.controls = new DeviceOrientationControls(this.camera)
            this.scene = new this.$THREE.Scene()
            var sides = [
                {
                    url: 'static/textures/cube/Bridge2/posx.jpg',
                    position: [ - 512, 0, 0 ],
                    rotation: [ 0, Math.PI / 2, 0 ]
                },
                {
                    url: 'static/textures/cube/Bridge2/negx.jpg',
                    position: [ 512, 0, 0 ],
                    rotation: [ 0, - Math.PI / 2, 0 ]
                },
                {
                    url: 'static/textures/cube/Bridge2/posy.jpg',
                    position: [ 0, 512, 0 ],
                    rotation: [ Math.PI / 2, 0, Math.PI ]
                },
                {
                    url: 'static/textures/cube/Bridge2/negy.jpg',
                    position: [ 0, - 512, 0 ],
                    rotation: [ - Math.PI / 2, 0, Math.PI ]
                },
                {
                    url: 'static/textures/cube/Bridge2/posz.jpg',
                    position: [ 0, 0, 512 ],
                    rotation: [ 0, Math.PI, 0 ]
                },
                {
                    url: 'static/textures/cube/Bridge2/negz.jpg',
                    position: [ 0, 0, - 512 ],
                    rotation: [ 0, 0, 0 ]
                }
            ]
            var cube = new this.$THREE.Object3D()
            this.scene.add(cube)
            for (var i = 0; i < sides.length; i ++) {
                var side = sides[ i ]
                var element = document.createElement('img')
                element.width = 1026 // 2 pixels extra to close the gap.
                element.src = side.url
                var object = new CSS3DObject(element)
                object.position.fromArray(side.position)
                object.rotation.fromArray(side.rotation)
                cube.add(object)
            }
            this.renderer = new CSS3DRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('css3dPanoramaDeviceorientation-container')[0].appendChild(this.renderer.domElement)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.css3dPanoramaDeviceorientation-container {
    width: 100%;
    background: #000;
    height: 100vh;
}
#overlay {
    text-align: center;
    line-height: 100vh;
}
</style>
