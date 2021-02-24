<template>
    <div class="webglPointsSprites-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl particle sprites example<br/>
			snowflakes by <a href="http://en.wikipedia.org/wiki/File:Sketch_of_snow_crystal_by_Ren%C3%A9_Descartes.jpg">Ren&eacute;  Descartes</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            parameters: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
            materials: [],
            gui: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2
        this.windowHalfY = window.innerHeight / 2
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.FogExp2(0x000000, 0.0008)
            var geometry = new this.$THREE.BufferGeometry()
            var vertices = []
            var textureLoader = new this.$THREE.TextureLoader()
            var sprite1 = textureLoader.load('static/textures/sprites/snowflake1.png')
            var sprite2 = textureLoader.load('static/textures/sprites/snowflake2.png')
            var sprite3 = textureLoader.load('static/textures/sprites/snowflake3.png')
            var sprite4 = textureLoader.load('static/textures/sprites/snowflake4.png')
            var sprite5 = textureLoader.load('static/textures/sprites/snowflake5.png')
            for (var i = 0; i < 10000; i ++) {
                var x = Math.random() * 2000 - 1000
                var y = Math.random() * 2000 - 1000
                var z = Math.random() * 2000 - 1000
                vertices.push(x, y, z)
            }
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3))
            this.parameters = [
                [[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
                [[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
                [[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
                [[ 0.85, 0, 0.5 ], sprite5, 8 ],
                [[ 0.80, 0, 0.5 ], sprite4, 5 ]
            ]
            for (var i = 0; i < this.parameters.length; i ++) {
                var color = this.parameters[ i ][ 0 ]
                var sprite = this.parameters[ i ][ 1 ]
                var size = this.parameters[ i ][ 2 ]
                this.materials[ i ] = new this.$THREE.PointsMaterial({ size: size, map: sprite, blending: this.$THREE.AdditiveBlending, depthTest: false, transparent: true })
                this.materials[ i ].color.setHSL(color[ 0 ], color[ 1 ], color[ 2 ])
                var particles = new this.$THREE.Points(geometry, this.materials[ i ])
                particles.rotation.x = Math.random() * 6
                particles.rotation.y = Math.random() * 6
                particles.rotation.z = Math.random() * 6
                this.scene.add(particles)
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPointsSprites-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglPointsSprites-container')[0].appendChild(this.stats.dom)
            //
            this.gui = new GUI()
            var params = {
                texture: true
            }
            this.gui.add(params, 'texture').onChange((value) => {
                for (var i = 0; i < this.materials.length; i ++) {
                    this.materials[ i ].map = (value === true) ? this.parameters[ i ][ 1 ] : null
                    this.materials[ i ].needsUpdate = true
                }
            })
            this.gui.open()
            document.getElementsByClassName('webglPointsSprites-container')[0].style.touchAction = 'none'
            document.getElementsByClassName('webglPointsSprites-container')[0].addEventListener('pointermove', this.onPointerMove, false)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2
            this.windowHalfY = window.innerHeight / 2
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return
            this.mouseX = event.clientX - this.windowHalfX
            this.mouseY = event.clientY - this.windowHalfY
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.00005
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * 0.05
            this.camera.lookAt(this.scene.position)
            for (var i = 0; i < this.scene.children.length; i ++) {
                var object = this.scene.children[ i ]
                if (object instanceof this.$THREE.Points) {
                    object.rotation.y = time * (i < 4 ? i + 1 : - (i + 1))
                }
            }
            for (var i = 0; i < this.materials.length; i ++) {
                var color = this.parameters[ i ][ 0 ]
                var h = (360 * (color[ 0 ] + time) % 360) / 360
                this.materials[ i ].color.setHSL(h, color[ 1 ], color[ 2 ])
            }
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglPointsSprites-container {
    width: 100%;
}
</style>