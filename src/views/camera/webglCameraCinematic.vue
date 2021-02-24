<template>
    <div class="webglCameraCinematic-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive cubes
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { CinematicCamera } from '@/components/jsm/cameras/CinematicCamera.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            raycaster: null,
            renderer: null,
            stats: null,
			mouse: null,
			INTERSECTED: null,
			radius: 100,
            theta: 0,
            gui: null
        }
    },
    mounted() {
        this.mouse = new this.$THREE.Vector2()
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.camera = new CinematicCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.setLens(5)
            this.camera.position.set(2, 1, 500)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xf0f0f0)
            this.scene.add(new this.$THREE.AmbientLight(0xffffff, 0.3))
            var light = new this.$THREE.DirectionalLight(0xffffff, 0.35)
            light.position.set(1, 1, 1).normalize()
            this.scene.add(light)
            var geometry = new this.$THREE.BoxBufferGeometry(20, 20, 20)
            for (var i = 0; i < 1500; i ++) {
                var object = new this.$THREE.Mesh(geometry, new this.$THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
                object.position.x = Math.random() * 800 - 400
                object.position.y = Math.random() * 800 - 400
                object.position.z = Math.random() * 800 - 400
                this.scene.add(object)
            }
            this.raycaster = new this.$THREE.Raycaster()
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglCameraCinematic-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglCameraCinematic-container')[0].appendChild(this.stats.dom)
            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            window.addEventListener('resize', this.onWindowResize, false)
            var effectController = {
                focalLength: 15,
                // jsDepthCalculation: true,
                // shaderFocus: false,
                //
                fstop: 2.8,
                // maxblur: 1.0,
                //
                showFocus: false,
                focalDepth: 3,
                // manualdof: false,
                // vignetting: false,
                // depthblur: false,
                //
                // threshold: 0.5,
                // gain: 2.0,
                // bias: 0.5,
                // fringe: 0.7,
                //
                // focalLength: 35,
                // noise: true,
                // pentagon: false,
                //
                // dithering: 0.0001
            }
            var that = this
            var matChanger = function () {
                for (var e in effectController) {
                    if (e in that.camera.postprocessing.bokeh_uniforms) {
                        that.camera.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ]
                    }
                }
                that.camera.postprocessing.bokeh_uniforms[ 'znear' ].value = that.camera.near
                that.camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = that.camera.far
                that.camera.setLens(effectController.focalLength, that.camera.frameHeight, effectController.fstop, that.camera.coc)
                effectController[ 'focalDepth' ] = that.camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value
            }
            //
            this.gui = new GUI()
            this.gui.add(effectController, 'focalLength', 1, 135, 0.01).onChange(matChanger)
            this.gui.add(effectController, 'fstop', 1.8, 22, 0.01).onChange(matChanger)
            this.gui.add(effectController, 'focalDepth', 0.1, 100, 0.001).onChange(matChanger)
            this.gui.add(effectController, 'showFocus', true).onChange(matChanger)
            matChanger()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            event.preventDefault()
            this.mouse.x = (event.clientX / this.$webglInnerWidth) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        },
        animate() {
            requestAnimationFrame(this.animate, this.renderer.domElement)
            this.render()
            this.stats.update()
        },
        render() {
            this.theta += 0.1
            this.camera.position.x = this.radius * Math.sin(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.position.y = this.radius * Math.sin(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.position.z = this.radius * Math.cos(this.$THREE.MathUtils.degToRad(this.theta))
            this.camera.lookAt(this.scene.position)
            this.camera.updateMatrixWorld()
            // find intersections
            this.raycaster.setFromCamera(this.mouse, this.camera)
            var intersects = this.raycaster.intersectObjects(this.scene.children)
            if (intersects.length > 0) {
                var targetDistance = intersects[ 0 ].distance
                this.camera.focusAt(targetDistance) // using Cinematic this.camera focusAt method
                if (this.INTERSECTED != intersects[ 0 ].object) {
                    if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)
                    this.INTERSECTED = intersects[ 0 ].object
                    this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex()
                    this.INTERSECTED.material.emissive.setHex(0xff0000)
                }
            } else {
                if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)
                this.INTERSECTED = null
            }
            //
            if (this.camera.postprocessing.enabled) {
                this.camera.renderCinematic(this.scene, this.renderer)
            } else {
                this.scene.overrideMaterial = null
                this.renderer.clear()
                this.renderer.render(this.scene, this.camera)
            }
        }
    }
}
</script>

<style scoped>
.webglCameraCinematic-container {
    width: 100%;
    background-color: #fff;
    color: #000;
}
#info a {
    color: #08f;
}
</style>
