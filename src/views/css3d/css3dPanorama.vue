<template>
    <div class="css3dPanorama-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js css3d</a> - panorama demo. cubemap by <a href="http://www.humus.name/index.php?page=Textures" target="_blank" rel="noopener">Humus</a>.</div>
    </div>
</template>

<script>
import { CSS3DRenderer, CSS3DObject } from '@/components/jsm/renderers/CSS3DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			target: null,
            lon: 90,
            lat: 0,
            phi: 0,
            theta: 0,
            pointerX: null,
            pointerY: null,
        }
    },
    mounted() {
        this.target = new this.$THREE.Vector3()
        this.init();
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 1000)
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
            for (var i = 0; i < sides.length; i ++) {
                var side = sides[ i ]
                var element = document.createElement('img')
                element.draggable = false
                element.width = 1026 // 2 pixels extra to close the gap.
                element.src = side.url
                var object = new CSS3DObject(element)
                object.position.fromArray(side.position)
                object.rotation.fromArray(side.rotation)
                this.scene.add(object)
            }
            this.renderer = new CSS3DRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('css3dPanorama-container')[0].appendChild(this.renderer.domElement)
            //
            document.getElementsByClassName('css3dPanorama-container')[0].style.touchAction = 'none'
            document.getElementsByClassName('css3dPanorama-container')[0].addEventListener('pointerdown', this.onPointerDown, false)
            document.addEventListener('wheel', this.onDocumentMouseWheel, false)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerDown(event) {
            if (event.isPrimary === false) return
            this.pointerX = event.clientX
            this.pointerY = event.clientY
            document.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.lon -= (event.clientX - this.pointerX) * 0.1
            this.lat += (event.clientY - this.pointerY) * 0.1
            this.pointerX = event.clientX
            this.pointerY = event.clientY
        },
        onPointerUp() {
            if (event.isPrimary === false) return
            document.removeEventListener('pointermove', this.onPointerMove)
            document.removeEventListener('pointerup', this.onPointerUp)
        },
        onDocumentMouseWheel(event) {
            var fov = this.camera.fov + event.deltaY * 0.05
            this.camera.fov = this.$THREE.MathUtils.clamp(fov, 10, 75)
            this.camera.updateProjectionMatrix()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.lon += 0.1
            this.lat = Math.max(- 85, Math.min(85, this.lat))
            this.phi = this.$THREE.MathUtils.degToRad(90 - this.lat)
            this.theta = this.$THREE.MathUtils.degToRad(this.lon)
            this.target.x = Math.sin(this.phi) * Math.cos(this.theta)
            this.target.y = Math.cos(this.phi)
            this.target.z = Math.sin(this.phi) * Math.sin(this.theta)
            this.camera.lookAt(this.target)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.css3dPanorama-container {
    position: relative;
    width: 100%;
}
</style>
