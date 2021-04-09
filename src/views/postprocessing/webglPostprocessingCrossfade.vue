<template>
    <div class="webglPostprocessingCrossfade-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl scene transitions<br/>
			by <a href="https://twitter.com/fernandojsg">fernandojsg</a> - <a href="https://github.com/kile/three.js-demos">github</a>
		</div>

		<div id="container"></div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { BufferGeometryUtils } from '@/components/jsm/utils/BufferGeometryUtils.js'
import { FXScene, Transition } from '@/utils/webglPostprocessingCrossfade.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
			renderer: null,
			transition: null,
			transitionParams: {
				"useTexture": true,
				"transition": 0.5,
				"transitionSpeed": 2.0,
				"texture": 5,
				"loopTexture": true,
				"animateTransition": true,
				"textureThreshold": 0.3
			},
            clock: null,
            gui: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.initGUI()
            this.container = document.getElementById("container")
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            var sceneA = new FXScene("cube", 5000, 1200, 120, new this.$THREE.Vector3(0, - 0.4, 0), 0xffffff, this.$THREE, this.renderer, this.generateGeometry)
            var sceneB = new FXScene("sphere", 500, 2000, 50, new this.$THREE.Vector3(0, 0.2, 0.1), 0x000000, this.$THREE, this.renderer, this.generateGeometry)
            this.transition = new Transition(sceneA, sceneB, this.$THREE, this.transitionParams, this.renderer, this.clock)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.renderer.setSize( window.innerWidth - 281, window.innerHeight )
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        initGUI() {
            this.gui = new GUI()
            this.gui.add(this.transitionParams, "useTexture").onChange((value) => {
                this.transition.useTexture(value)
            })
            this.gui.add(this.transitionParams, 'loopTexture')
            this.gui.add(this.transitionParams, 'texture', { Perlin: 0, Squares: 1, Cells: 2, Distort: 3, Gradient: 4, Radial: 5 }).onChange((value) => {
                this.transition.setTexture(value)
            }).listen()
            this.gui.add(this.transitionParams, "textureThreshold", 0, 1, 0.01).onChange((value) => {
                this.transition.setTextureThreshold(value)
            })
            this.gui.add(this.transitionParams, "animateTransition")
            this.gui.add(this.transitionParams, "transition", 0, 1, 0.01).listen()
            this.gui.add(this.transitionParams, "transitionSpeed", 0.5, 5, 0.01)
        },
        render() {
            this.transition.render(this.clock.getDelta())
        },
        generateGeometry(objectType, numObjects) {
            var that = this
            function applyVertexColors(geometry, color) {
                var position = geometry.attributes.position
                var colors = []
                for (var i = 0; i < position.count; i ++) {
                    colors.push(color.r, color.g, color.b)
                }
                geometry.setAttribute('color', new that.$THREE.Float32BufferAttribute(colors, 3))
            }
            var geometries = []
            var matrix = new this.$THREE.Matrix4()
            var position = new this.$THREE.Vector3()
            var rotation = new this.$THREE.Euler()
            var quaternion = new this.$THREE.Quaternion()
            var scale = new this.$THREE.Vector3()
            var color = new this.$THREE.Color()
            for (var i = 0; i < numObjects; i ++) {
                position.x = Math.random() * 10000 - 5000
                position.y = Math.random() * 6000 - 3000
                position.z = Math.random() * 8000 - 4000
                rotation.x = Math.random() * 2 * Math.PI
                rotation.y = Math.random() * 2 * Math.PI
                rotation.z = Math.random() * 2 * Math.PI
                quaternion.setFromEuler(rotation)
                scale.x = Math.random() * 200 + 100
                var geometry
                if (objectType === 'cube') {
                    geometry = new this.$THREE.BoxBufferGeometry(1, 1, 1)
                    geometry = geometry.toNonIndexed() // merging needs consistent buffer geometries
                    scale.y = Math.random() * 200 + 100
                    scale.z = Math.random() * 200 + 100
                    color.setRGB(0, 0, 0.1 + 0.9 * Math.random())
                } else if (objectType === 'sphere') {
                    geometry = new this.$THREE.IcosahedronBufferGeometry(1, 1)
                    scale.y = scale.z = scale.x
                    color.setRGB(0.1 + 0.9 * Math.random(), 0, 0)
                }
                // give the geom's vertices a random color, to be displayed
                applyVertexColors(geometry, color)
                matrix.compose(position, quaternion, scale)
                geometry.applyMatrix4(matrix)
                geometries.push(geometry)
            }
            return BufferGeometryUtils.mergeBufferGeometries(geometries)
        }
    },
}
</script>

<style scoped>
.webglPostprocessingCrossfade-container {
    position: relative;
    width: 100%;
}
</style>
