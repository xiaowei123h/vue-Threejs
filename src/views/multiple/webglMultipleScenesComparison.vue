<template>
    <div class="webglMultipleScenesComparison-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - multiple scenes comparison<br />
		</div>

		<div class="container">
			<div class="slider"></div>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            renderer: null,
            controls: null,
            sceneL: null,
            sceneR: null,
			sliderPos: null,
        }
    },
    mounted() {
        this.sliderPos = window.innerWidth / 2
		this.init()
    },
    methods: {
        init() {
            this.container = document.querySelector('.container')
            this.sceneL = new this.$THREE.Scene()
            this.sceneL.background = new this.$THREE.Color(0xBCD48F)
            this.sceneR = new this.$THREE.Scene()
            this.sceneR.background = new this.$THREE.Color(0x8FBCD4)
            this.camera = new this.$THREE.PerspectiveCamera(35, (window.innerWidth - 281) / window.innerHeight, 0.1, 100)
            this.camera.position.z = 6
            this.controls = new OrbitControls(this.camera, this.container)
            var light = new this.$THREE.HemisphereLight(0xffffff, 0x444444, 1)
            light.position.set(- 2, 2, 2)
            this.sceneL.add(light.clone())
            this.sceneR.add(light.clone())
            this.initMeshes()
            this.initSlider()
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize((window.innerWidth - 281), window.innerHeight)
            this.renderer.setScissorTest(true)
            this.renderer.setAnimationLoop(this.render)
            this.container.appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize)
        },
        initMeshes() {
            var geometry = new this.$THREE.IcosahedronBufferGeometry(1, 3)
            var meshL = new this.$THREE.Mesh(geometry, new this.$THREE.MeshStandardMaterial())
            this.sceneL.add(meshL)
            var meshR = new this.$THREE.Mesh(geometry, new this.$THREE.MeshStandardMaterial({ wireframe: true }))
            this.sceneR.add(meshR)
        },
        initSlider() {
            var that = this
            var slider = document.querySelector('.slider')
            function onPointerDown() {
                if (event.isPrimary === false) return
                that.controls.enabled = false
                window.addEventListener('pointermove', onPointerMove, false)
                window.addEventListener('pointerup', onPointerUp, false)
            }
            function onPointerUp() {
                that.controls.enabled = true
                window.removeEventListener('pointermove', onPointerMove, false)
                window.removeEventListener('pointerup', onPointerUp, false)
            }
            function onPointerMove(e) {
                if (event.isPrimary === false) return
                that.sliderPos = Math.max(0, Math.min((window.innerWidth - 281), e.pageX))
                slider.style.left = that.sliderPos - (slider.offsetWidth / 2) + "px"
            }
            slider.style.touchAction = 'none' // disable touch scroll
            slider.addEventListener('pointerdown', onPointerDown)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        render() {
            this.renderer.setScissor(0, 0, this.sliderPos, window.innerHeight)
            this.renderer.render(this.sceneL, this.camera)
            this.renderer.setScissor(this.sliderPos, 0, window.innerWidth, window.innerHeight)
            this.renderer.render(this.sceneR, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMultipleScenesComparison-container {
    position: relative;
    width: 100%;
}
.container {
    position: absolute;
    width: 100%;
    height: 100%;
}
.slider {
    position: absolute;
    cursor: ew-resize;
    width: 40px;
    height: 40px;
    background-color: #F32196;
    opacity: 0.7;
    border-radius: 50%;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
}
</style>
