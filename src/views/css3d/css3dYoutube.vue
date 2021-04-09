<template>
    <div class="css3dYoutube-container">
        <div id="container"></div>
		<div id="blocker"></div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { CSS3DRenderer, CSS3DObject } from '@/components/jsm/renderers/CSS3DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			controls: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        Element(id, x, y, z, ry) {
            var div = document.createElement('div')
            div.style.width = '480px'
            div.style.height = '360px'
            div.style.backgroundColor = '#000'
            var iframe = document.createElement('iframe')
            iframe.style.width = '480px'
            iframe.style.height = '360px'
            iframe.style.border = '0px'
            iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join('')
            div.appendChild(iframe)
            var object = new CSS3DObject(div)
            object.position.set(x, y, z)
            object.rotation.y = ry
            return object
        },
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 5000)
            this.camera.position.set(500, 350, 750)
            this.scene = new this.$THREE.Scene()
            this.renderer = new CSS3DRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            var group = new this.$THREE.Group()
            group.add(new this.Element('SJOz3qjfQXU', 0, 0, 240, 0))
            group.add(new this.Element('Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2))
            group.add(new this.Element('IrydklNpcFI', 0, 0, - 240, Math.PI))
            group.add(new this.Element('9ubytEsCaS0', - 240, 0, 0, - Math.PI / 2))
            this.scene.add(group)
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.rotateSpeed = 4
            window.addEventListener('resize', this.onWindowResize, false)
            // Block iframe events when dragging this.camera
            var blocker = document.getElementById('blocker')
            blocker.style.display = 'none'
            this.controls.addEventListener('start', () => {
                blocker.style.display = ''
            })
            this.controls.addEventListener('end', () => {
                blocker.style.display = 'none'
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.teacherManage-container {
    position: relative;
    width: 100%;
}
#info {
    background-color: #ffffff;
}

#blocker {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}
</style>
