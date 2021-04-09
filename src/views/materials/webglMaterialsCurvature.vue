<template>
    <div class="webglMaterialsCurvature-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - curvature estimation of a geometry<br/>
			by <a href="http://codercat.club" target="_blank" rel="noopener">CoderCat</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
export default {
    data() {
        return {
            vertexShaderRaw: null,
            fragmentShaderRaw: null,
            gui: null,
            camera: null,
            scene: null,
            renderer: null,
            ninjaMeshRaw: null,
            curvatureAttribute: null,
            bufferGeo: null,
        }
    },
    mounted() {
        this.vertexShaderRaw = `
            attribute float curvature;
            varying float vCurvature;
            void main() {
                vec3 p = position;
                vec4 modelViewPosition = modelViewMatrix * vec4(p , 1.0);
                gl_Position = projectionMatrix * modelViewPosition;
                vCurvature = curvature;
            }`
        this.fragmentShaderRaw = `
            varying vec3 vViewPosition;
            varying float vCurvature;
            void main() {
                    gl_FragColor = vec4(vCurvature * 2.0, 0.0, 0.0, 0.0);
            }`
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        average(dict) {
            var sum = 0
            var length = 0
            Object.keys(dict).forEach((key) => {
                sum += dict[ key ]
                length ++
            })
            return sum / length
        },
        clamp(number, min, max) {
            return Math.max(min, Math.min(number, max))
        },
        filterConcave(curvature) {
            for (var i = 0; i < curvature.length; i ++) {
                curvature[ i ] = Math.abs(this.clamp(curvature[ i ], - 1, 0))
            }
        },
        filterConvex(curvature) {
            for (var i = 0; i < curvature.length; i ++) {
                curvature[ i ] = this.clamp(curvature[ i ], 0, 1)
            }
        },
        filterBoth(curvature) {
            for (var i = 0; i < curvature.length; i ++) {
                curvature[ i ] = Math.abs(curvature[ i ])
            }
        },
        init() {
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 0.1, 1000)
            this.camera.position.x = - 23
            this.camera.position.y = 2
            this.camera.position.z = 24
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.autoClear = false
            document.getElementsByClassName('webglMaterialsCurvature-container')[0].appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 20
            controls.maxDistance = 100
            var loader = new OBJLoader()
            //load the obj
            loader.load('static/models/obj/ninja/ninjaHead_Low.obj', (object) => {
                object.traverse((child) => {
                    if (child.isMesh) {
                        this.bufferGeo = child.geometry
                        this.bufferGeo.center()
                        var dict = {}
                        for (var i = 0; i < this.bufferGeo.attributes.position.count; i += 3) {
                            //create a dictionary of every position, and its neighboring positions
                            var array = this.bufferGeo.attributes.position.array
                            var normArray = this.bufferGeo.attributes.normal.array
                            var posA = new this.$THREE.Vector3(array[ 3 * i ], array[ 3 * i + 1 ], array[ 3 * i + 2 ])
                            var posB = new this.$THREE.Vector3(array[ 3 * (i + 1) ], array[ 3 * (i + 1) + 1 ], array[ 3 * (i + 1) + 2 ])
                            var posC = new this.$THREE.Vector3(array[ 3 * (i + 2) ], array[ 3 * (i + 2) + 1 ], array[ 3 * (i + 2) + 2 ])
                            var normA = new this.$THREE.Vector3(normArray[ 3 * i ], normArray[ 3 * i + 1 ], normArray[ 3 * i + 2 ]).normalize()
                            var normB = new this.$THREE.Vector3(normArray[ 3 * (i + 1) ], normArray[ 3 * (i + 1) + 1 ], normArray[ 3 * (i + 1) + 2 ]).normalize()
                            var normC = new this.$THREE.Vector3(normArray[ 3 * (i + 2) ], normArray[ 3 * (i + 2) + 1 ], normArray[ 3 * (i + 2) + 2 ]).normalize()
                            var strA = posA.toArray().toString()
                            var strB = posB.toArray().toString()
                            var strC = posC.toArray().toString()
                            var posB_A = new this.$THREE.Vector3().subVectors(posB, posA)
                            var posB_C = new this.$THREE.Vector3().subVectors(posB, posC)
                            var posC_A = new this.$THREE.Vector3().subVectors(posC, posA)
                            var b2a = normB.dot(posB_A.normalize())
                            var b2c = normB.dot(posB_C.normalize())
                            var c2a = normC.dot(posC_A.normalize())
                            var a2b = - normA.dot(posB_A.normalize())
                            var c2b = - normC.dot(posB_C.normalize())
                            var a2c = - normA.dot(posC_A.normalize())
                            if (dict[ strA ] === undefined) {
                                dict[ strA ] = {}
                            }
                            if (dict[ strB ] === undefined) {
                                dict[ strB ] = {}
                            }
                            if (dict[ strC ] === undefined) {
                                dict[ strC ] = {}
                            }
                            dict[ strA ][ strB ] = a2b
                            dict[ strA ][ strC ] = a2c
                            dict[ strB ][ strA ] = b2a
                            dict[ strB ][ strC ] = b2c
                            dict[ strC ][ strA ] = c2a
                            dict[ strC ][ strB ] = c2b
                        }
                        var curvatureDict = {}
                        var min = 10, max = 0
                        Object.keys(dict).forEach((key) => {
                            curvatureDict[ key ] = this.average(dict[ key ])
                        })
                        //smoothing
                        var smoothCurvatureDict = Object.create(curvatureDict)
                        Object.keys(dict).forEach((key) => {
                            var count = 0
                            var sum = 0
                            Object.keys(dict[ key ]).forEach((key2) => {
                                sum += smoothCurvatureDict[ key2 ]
                                count ++
                            })
                            smoothCurvatureDict[ key ] = sum / count
                        })
                        curvatureDict = smoothCurvatureDict
                        // fit values to 0 and 1
                        Object.keys(curvatureDict).forEach((key) => {
                            var val = Math.abs(curvatureDict[ key ])
                            if (val < min) min = val
                            if (val > max) max = val
                        })
                        var range = (max - min)
                        Object.keys(curvatureDict).forEach((key) => {
                            var val = Math.abs(curvatureDict[ key ])
                            if (curvatureDict[ key ] < 0) {
                                curvatureDict[ key ] = (min - val) / range
                            } else {
                                curvatureDict[ key ] = (val - min) / range
                            }
                        })
                        this.curvatureAttribute = new Float32Array(this.bufferGeo.attributes.position.count)
                        for (var i = 0; i < this.bufferGeo.attributes.position.count; i ++) {
                            var array = this.bufferGeo.attributes.position.array
                            var pos = new this.$THREE.Vector3(array[ 3 * i ], array[ 3 * i + 1 ], array[ 3 * i + 2 ])
                            var str = pos.toArray().toString()
                            this.curvatureAttribute[ i ] = curvatureDict[ str ]
                        }
                        this.bufferGeo.setAttribute('curvature', new this.$THREE.BufferAttribute(this.curvatureAttribute, 1))
                        //starting filter is to show both concave and convex
                        var curvatureFiltered = new Float32Array(this.curvatureAttribute)
                        this.filterBoth(curvatureFiltered)
                        var materialRaw = new this.$THREE.ShaderMaterial({
                            vertexShader: this.vertexShaderRaw,
                            fragmentShader: this.fragmentShaderRaw
                        })
                        this.ninjaMeshRaw = new this.$THREE.Mesh(this.bufferGeo, materialRaw)
                    }
                })
                this.scene.add(this.ninjaMeshRaw)
            })
            //init GUI
            var params = {
                filterConvex: () => {
                    var curvatureFiltered = new Float32Array(this.curvatureAttribute)
                    this.filterConvex(curvatureFiltered)
                    this.bufferGeo.attributes.curvature.array = curvatureFiltered
                    this.bufferGeo.attributes.curvature.needsUpdate = true
                },
                filterConcave: () => {
                    var curvatureFiltered = new Float32Array(this.curvatureAttribute)
                    this.filterConcave(curvatureFiltered)
                    this.bufferGeo.attributes.curvature.array = curvatureFiltered
                    this.bufferGeo.attributes.curvature.needsUpdate = true
                },
                filterBoth: () => {
                    var curvatureFiltered = new Float32Array(this.curvatureAttribute)
                    this.filterBoth(curvatureFiltered)
                    this.bufferGeo.attributes.curvature.array = curvatureFiltered
                    this.bufferGeo.attributes.curvature.needsUpdate = true
                }
            }
            this.gui = new GUI()
            var topologyFolder = this.gui.addFolder('Topology')
            topologyFolder.add(params, 'filterConvex')
            topologyFolder.add(params, 'filterConcave')
            topologyFolder.add(params, 'filterBoth')
            topologyFolder.open()
            this.onWindowResize()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsCurvature-container {
    position: relative;
    width: 100%;
}
</style>
