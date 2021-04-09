<template>
    <div class="webglInstancingScatter-container">
        
    </div>
</template>

<script>
import { MeshSurfaceSampler } from '@/components/jsm/math/MeshSurfaceSampler.js';
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js';
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
			api: null,
            stemMesh: null,
            blossomMesh: null,
            stemGeometry: null,
            blossomGeometry: null,
            stemMaterial: null,
            blossomMaterial: null,
			sampler: null,
			count: null,
			ages: null,
			scales: null,
			dummy: null,
			_position: null,
			_normal: null,
			_scale: null,
			// surfaceGeometry = new this.$THREE.BoxBufferGeometry(10, 10, 10).toNonIndexed();
			surfaceGeometry: null,
			surfaceMaterial: null,
			surface: null,
			// Scaling curve causes particles to grow quickly, ease gradually into full scale, then
			// disappear quickly. More of the particle's lifetime is spent around full scale.
            loader: null,
            gui: null,
            loader: null,
        }
    },
    mounted() {
        this.api = {
            count: 2000,
            distribution: 'random',
            resample: this.resample,
            surfaceColor: 0xFFF784,
            backgroundColor: 0xE39469,

        }
        this.count = this.api.count
        this.ages = new Float32Array(this.count)
        this.scales = new Float32Array(this.count)
        this.dummy = new this.$THREE.Object3D()
        this._position = new this.$THREE.Vector3()
        this._normal = new this.$THREE.Vector3()
        this._scale = new this.$THREE.Vector3()
        this.surfaceGeometry = new this.$THREE.TorusKnotBufferGeometry(10, 3, 100, 16).toNonIndexed()
        this.surfaceMaterial = new this.$THREE.MeshLambertMaterial({ color: this.api.surfaceColor, wireframe: false })
        this.surface = new this.$THREE.Mesh(this.surfaceGeometry, this.surfaceMaterial)
        this.loader = new GLTFLoader()
        this.loader.load('static/models/gltf/Flower/Flower.glb', (gltf) => {
            var _stemMesh = gltf.scene.getObjectByName('Stem')
            var _blossomMesh = gltf.scene.getObjectByName('Blossom')
            this.stemGeometry = new this.$THREE.InstancedBufferGeometry()
            this.blossomGeometry = new this.$THREE.InstancedBufferGeometry()
            this.$THREE.BufferGeometry.prototype.copy.call(this.stemGeometry, _stemMesh.geometry)
            this.$THREE.BufferGeometry.prototype.copy.call(this.blossomGeometry, _blossomMesh.geometry)
            var defaultTransform = new this.$THREE.Matrix4()
                .makeRotationX(Math.PI)
                .multiply(new this.$THREE.Matrix4().makeScale(7, 7, 7))
            this.stemGeometry.applyMatrix4(defaultTransform)
            this.blossomGeometry.applyMatrix4(defaultTransform)
            this.stemMaterial = _stemMesh.material
            this.blossomMaterial = _blossomMesh.material
            // Assign random colors to the blossoms.
            var _color = new this.$THREE.Color()
            var color = new Float32Array(this.count * 3)
            var blossomPavarte = [ 0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405 ]
            for (var i = 0; i < this.count; i ++) {
                _color.setHex(blossomPavarte[ Math.floor(Math.random() * blossomPavarte.length) ])
                _color.toArray(color, i * 3)
            }
            this.blossomGeometry.setAttribute('color', new this.$THREE.InstancedBufferAttribute(color, 3))
            this.blossomMaterial.vertexColors = true
            this.stemMesh = new this.$THREE.InstancedMesh(this.stemGeometry, this.stemMaterial, this.count)
            this.blossomMesh = new this.$THREE.InstancedMesh(this.blossomGeometry, this.blossomMaterial, this.count)
            // Instance matrices will be updated every frame.
            this.stemMesh.instanceMatrix.setUsage(this.$THREE.DynamicDrawUsage)
            this.blossomMesh.instanceMatrix.setUsage(this.$THREE.DynamicDrawUsage)
            this.resample()
            this.init()
            this.animate()
        })
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        easeOutCubic(t) {
            return (-- t) * t * t + 1
        },
        scaleCurve(t) {
            return Math.abs(this.easeOutCubic((t > 0.5 ? 1 - t : t) * 2))
        },
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(25, 25, 25)
            this.camera.lookAt(0, 0, 0)
            //
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(this.api.backgroundColor)
            var pointLight = new this.$THREE.PointLight(0xAA8899, 0.75)
            pointLight.position.set(50, - 25, 75)
            this.scene.add(pointLight)
            this.scene.add(new this.$THREE.HemisphereLight())
            //
            this.scene.add(this.stemMesh)
            this.scene.add(this.blossomMesh)
            this.scene.add(this.surface)
            //
            this.gui = new GUI()
            this.gui.add(this.api, 'count', 0, this.count).onChange(() => {
                this.stemMesh.count = this.api.count
                this.blossomMesh.count = this.api.count
            })
            // this.gui.addColor(api, 'backgroundColor').onChange(function () {
            // 	scene.background.setHex(api.backgroundColor)
            // })
            // this.gui.addColor(api, 'surfaceColor').onChange(function () {
            // 	surfaceMaterial.color.setHex(api.surfaceColor)
            // })
            this.gui.add(this.api, 'distribution').options([ 'random', 'weighted' ]).onChange(this.resample)
            this.gui.add(this.api, 'resample')
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglInstancingScatter-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglInstancingScatter-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        resample() {
            var vertexCount = this.surface.geometry.getAttribute('position').count
            console.info('Sampling ' + this.count + ' points from a surface with ' + vertexCount + ' vertices...')
            //
            console.time('.build()')
            this.sampler = new MeshSurfaceSampler(this.surface)
                .setWeightAttribute(this.api.distribution === 'weighted' ? 'uv' : null)
                .build()
            console.timeEnd('.build()')
            //
            console.time('.sample()')
            for (var i = 0; i < this.count; i ++) {
                this.ages[ i ] = Math.random()
                this.scales[ i ] = this.scaleCurve(this.ages[ i ])
                this.resampleParticle(i)
            }
            console.timeEnd('.sample()')
            this.stemMesh.instanceMatrix.needsUpdate = true
            this.blossomMesh.instanceMatrix.needsUpdate = true
        },
        resampleParticle(i) {
            this.sampler.sample(this._position, this._normal)
            this._normal.add(this._position)
            this.dummy.position.copy(this._position)
            this.dummy.scale.set(this.scales[ i ], this.scales[ i ], this.scales[ i ])
            this.dummy.lookAt(this._normal)
            this.dummy.updateMatrix()
            this.stemMesh.setMatrixAt(i, this.dummy.matrix)
            this.blossomMesh.setMatrixAt(i, this.dummy.matrix)
        },
        updateParticle(i) {
            // Update lifecycle.
            this.ages[ i ] += 0.005
            if (this.ages[ i ] >= 1) {
                this.ages[ i ] = 0.001
                this.scales[ i ] = this.scaleCurve(this.ages[ i ])
                this.resampleParticle(i)
                return
            }
            // Update scale.
            var prevScale = this.scales[ i ]
            this.scales[ i ] = this.scaleCurve(this.ages[ i ])
            this._scale.set(this.scales[ i ] / prevScale, this.scales[ i ] / prevScale, this.scales[ i ] / prevScale)
            // Update transform.
            this.stemMesh.getMatrixAt(i, this.dummy.matrix)
            this.dummy.matrix.scale(this._scale)
            this.stemMesh.setMatrixAt(i, this.dummy.matrix)
            this.blossomMesh.setMatrixAt(i, this.dummy.matrix)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            if (this.stemMesh && this.blossomMesh) {
                var time = Date.now() * 0.001
                this.scene.rotation.x = Math.sin(time / 4)
                this.scene.rotation.y = Math.sin(time / 2)
                for (var i = 0; i < this.api.count; i ++) {
                    this.updateParticle(i)
                }
                this.stemMesh.instanceMatrix.needsUpdate = true
                this.blossomMesh.instanceMatrix.needsUpdate = true
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInstancingScatter-container {
    position: relative;
    width: 100%;
}
</style>
