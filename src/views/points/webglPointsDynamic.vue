<template>
    <div class="webglPointsDynamic-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl dynamic particles + postprocessing<br/>
			models by <a href="http://sketchup.google.com/3dwarehouse/details?mid=2c6fd128fca34052adc5f5b98d513da1" target="_blank" rel="noopener">Reallusion</a>
			<a href="http://sketchup.google.com/3dwarehouse/details?mid=f526cc4abf7cb68d76cab47c765b7255" target="_blank" rel="noopener">iClone</a>
		</div>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/components/jsm/postprocessing/ShaderPass.js'
import { BloomPass } from '@/components/jsm/postprocessing/BloomPass.js'
import { FilmPass } from '@/components/jsm/postprocessing/FilmPass.js'
import { FocusShader } from '@/components/jsm/shaders/FocusShader.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
			parent: null,
            meshes: [],
            clonemeshes: [],
            composer: null,
            effectFocus: null,
			clock: null,
			stats: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.querySelector('#container')
            this.camera = new this.$THREE.PerspectiveCamera(20, this.$webglInnerWidth / window.innerHeight, 1, 50000)
            this.camera.position.set(0, 700, 7000)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x000104)
            this.scene.fog = new this.$THREE.FogExp2(0x000104, 0.0000675)
            this.camera.lookAt(this.scene.position)
            var loader = new OBJLoader()
            loader.load('static/models/obj/male02/male02.obj', (object) => {
                var positions = this.combineBuffer(object, 'position')
                this.createMesh(positions, this.scene, 4.05, - 500, - 350, 600, 0xff7744)
                this.createMesh(positions, this.scene, 4.05, 500, - 350, 0, 0xff5522)
                this.createMesh(positions, this.scene, 4.05, - 250, - 350, 1500, 0xff9922)
                this.createMesh(positions, this.scene, 4.05, - 250, - 350, - 1500, 0xff99ff)
            })
            loader.load('static/models/obj/female02/female02.obj', (object) => {
                var positions = this.combineBuffer(object, 'position')
                this.createMesh(positions, this.scene, 4.05, - 1000, - 350, 0, 0xffdd44)
                this.createMesh(positions, this.scene, 4.05, 0, - 350, 0, 0xffffff)
                this.createMesh(positions, this.scene, 4.05, 1000, - 350, 400, 0xff4422)
                this.createMesh(positions, this.scene, 4.05, 250, - 350, 1500, 0xff9955)
                this.createMesh(positions, this.scene, 4.05, 250, - 350, 2500, 0xff77dd)
            })
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false
            container.appendChild(this.renderer.domElement)
            this.parent = new this.$THREE.Object3D()
            this.scene.add(this.parent)
            var grid = new this.$THREE.Points(new this.$THREE.PlaneBufferGeometry(15000, 15000, 64, 64), new this.$THREE.PointsMaterial({ color: 0xff0000, size: 10 }))
            grid.position.y = - 400
            grid.rotation.x = - Math.PI / 2
            this.parent.add(grid)
            // postprocessing
            var renderModel = new RenderPass(this.scene, this.camera)
            var effectBloom = new BloomPass(0.75)
            var effectFilm = new FilmPass(0.5, 0.5, 1448, false)
            this.effectFocus = new ShaderPass(FocusShader)
            this.effectFocus.uniforms[ "screenWidth" ].value = this.$webglInnerWidth * window.devicePixelRatio
            this.effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight * window.devicePixelRatio
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(renderModel)
            this.composer.addPass(effectBloom)
            this.composer.addPass(effectFilm)
            this.composer.addPass(this.effectFocus)
            //stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.camera.lookAt(this.scene.position)
            this.composer.setSize(window.innerWidth - 281, window.innerHeight)
            this.effectFocus.uniforms[ "screenWidth" ].value = (window.innerWidth - 281) * window.devicePixelRatio
            this.effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight * window.devicePixelRatio
        },
        combineBuffer(model, bufferName) {
            var count = 0
            model.traverse((child) => {
                if (child.isMesh) {
                    var buffer = child.geometry.attributes[ bufferName ]
                    count += buffer.array.length
                }
            })
            var combined = new Float32Array(count)
            var offset = 0
            model.traverse((child) => {
                if (child.isMesh) {
                    var buffer = child.geometry.attributes[ bufferName ]
                    combined.set(buffer.array, offset)
                    offset += buffer.array.length
                }
            })
            return new this.$THREE.BufferAttribute(combined, 3)
        },
        createMesh(positions, scene, scale, x, y, z, color) {
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', positions.clone())
            geometry.setAttribute('initialPosition', positions.clone())
            geometry.attributes.position.setUsage(this.$THREE.DynamicDrawUsage)
            var clones = [
                [ 6000, 0, - 4000 ],
                [ 5000, 0, 0 ],
                [ 1000, 0, 5000 ],
                [ 1000, 0, - 5000 ],
                [ 4000, 0, 2000 ],
                [ - 4000, 0, 1000 ],
                [ - 5000, 0, - 5000 ],
                [ 0, 0, 0 ]
            ]
            for (var i = 0; i < clones.length; i ++) {
                var c = (i < clones.length - 1) ? 0x252525 : color
                this.mesh = new this.$THREE.Points(geometry, new this.$THREE.PointsMaterial({ size: 30, color: c }))
                this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale
                this.mesh.position.x = x + clones[ i ][ 0 ]
                this.mesh.position.y = y + clones[ i ][ 1 ]
                this.mesh.position.z = z + clones[ i ][ 2 ]
                this.parent.add(this.mesh)
                this.clonemeshes.push({ mesh: this.mesh, speed: 0.5 + Math.random() })
            }
            this.meshes.push({
                mesh: this.mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor(200 + 200 * Math.random()),
                start: Math.floor(100 + 200 * Math.random()),
            })
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var delta = 10 * this.clock.getDelta()
            delta = delta < 2 ? delta : 2
            this.parent.rotation.y += - 0.02 * delta
            for (var j = 0; j < this.clonemeshes.length; j ++) {
                var cm = this.clonemeshes[ j ]
                cm.mesh.rotation.y += - 0.1 * delta * cm.speed
            }
            for (var j = 0; j < this.meshes.length; j ++) {
                var data = this.meshes[ j ]
                var positions = data.mesh.geometry.attributes.position
                var initialPositions = data.mesh.geometry.attributes.initialPosition
                var count = positions.count
                if (data.start > 0) {
                    data.start -= 1
                } else {
                    if (data.direction === 0) {
                        data.direction = - 1
                    }
                }
                for (var i = 0; i < count; i ++) {
                    var px = positions.getX(i)
                    var py = positions.getY(i)
                    var pz = positions.getZ(i)
                    // falling down
                    if (data.direction < 0) {
                        if (py > 0) {
                            positions.setXYZ(
                                i,
                                px + 1.5 * (0.50 - Math.random()) * data.speed * delta,
                                py + 3.0 * (0.25 - Math.random()) * data.speed * delta,
                                pz + 1.5 * (0.50 - Math.random()) * data.speed * delta
                        )
                        } else {
                            data.verticesDown += 1
                        }
                    }
                    // rising up
                    if (data.direction > 0) {
                        var ix = initialPositions.getX(i)
                        var iy = initialPositions.getY(i)
                        var iz = initialPositions.getZ(i)
                        var dx = Math.abs(px - ix)
                        var dy = Math.abs(py - iy)
                        var dz = Math.abs(pz - iz)
                        var d = dx + dy + dx
                        if (d > 1) {
                            positions.setXYZ(
                                i,
                                px - (px - ix) / dx * data.speed * delta * (0.85 - Math.random()),
                                py - (py - iy) / dy * data.speed * delta * (1 + Math.random()),
                                pz - (pz - iz) / dz * data.speed * delta * (0.85 - Math.random())
                        )
                        } else {
                            data.verticesUp += 1
                        }
                    }
                }
                // all vertices down
                if (data.verticesDown >= count) {
                    if (data.delay <= 0) {
                        data.direction = 1
                        data.speed = 5
                        data.verticesDown = 0
                        data.delay = 320
                    } else {
                        data.delay -= 1
                    }
                }
                // all vertices up
                if (data.verticesUp >= count) {
                    if (data.delay <= 0) {
                        data.direction = - 1
                        data.speed = 15
                        data.verticesUp = 0
                        data.delay = 120
                    } else {
                        data.delay -= 1
                    }
                }
                positions.needsUpdate = true
            }
            this.composer.render(0.01)
        }
    },
}
</script>

<style scoped>
.webglPointsDynamic-container {
    width: 100%;
}
</style>