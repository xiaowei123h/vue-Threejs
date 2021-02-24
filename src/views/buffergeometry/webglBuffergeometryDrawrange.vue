<template>
    <div class="webglBuffergeometryDrawrange-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry drawrange<br/>
			by <a href="https://twitter.com/fernandojsg">fernandojsg</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            group: null,
            container: null,
            stats: null,
			particlesData: [],
            camera: null,
            scene: null,
            renderer: null,
            positions: null,
            colors: null,
			particles: null,
			pointCloud: null,
			particlePositions: null,
			linesMesh: null,
			maxParticleCount: 1000,
			particleCount: 500,
			r: 800,
			rHalf: null,
			effectController: {
				showDots: true,
				showLines: true,
				minDistance: 150,
				limitConnections: false,
				maxConnections: 20,
				particleCount: 500
            },
            gui: null
        }
    },
    mounted() {
        this.rHalf = this.r / 2
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        initGUI() {
            this.gui = new GUI()
            this.gui.add(this.effectController, "showDots").onChange((value) => {
                this.pointCloud.visible = value
            })
            this.gui.add(this.effectController, "showLines").onChange((value) => {
                this.linesMesh.visible = value
            })
            this.gui.add(this.effectController, "minDistance", 10, 300)
            this.gui.add(this.effectController, "limitConnections")
            this.gui.add(this.effectController, "maxConnections", 0, 30, 1)
            this.gui.add(this.effectController, "particleCount", 0, this.maxParticleCount, 1).onChange((value) => {
                this.particleCount = parseInt(value)
                particles.setDrawRange(0, this.particleCount)
            })
        },
        init() {
            this.initGUI()
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 4000)
            this.camera.position.z = 1750
            var controls = new OrbitControls(this.camera, this.container)
            controls.minDistance = 1000
            controls.maxDistance = 3000
            this.scene = new this.$THREE.Scene()
            this.group = new this.$THREE.Group()
            this.scene.add(this.group)
            var helper = new this.$THREE.BoxHelper(new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(r, r, r)))
            helper.material.color.setHex(0x101010)
            helper.material.blending = this.$THREE.AdditiveBlending
            helper.material.transparent = true
            this.group.add(helper)
            var segments = this.maxParticleCount * this.maxParticleCount
            this.positions = new Float32Array(segments * 3)
            this.colors = new Float32Array(segments * 3)
            var pMaterial = new this.$THREE.PointsMaterial({
                color: 0xFFFFFF,
                size: 3,
                blending: this.$THREE.AdditiveBlending,
                transparent: true,
                sizeAttenuation: false
            })
            this.particles = new this.$THREE.BufferGeometry()
            this.particlePositions = new Float32Array(this.maxParticleCount * 3)
            for (var i = 0; i < this.maxParticleCount; i ++) {
                var x = Math.random() * r - r / 2
                var y = Math.random() * r - r / 2
                var z = Math.random() * r - r / 2
                this.particlePositions[ i * 3 ] = x
                this.particlePositions[ i * 3 + 1 ] = y
                this.particlePositions[ i * 3 + 2 ] = z
                // add it to the geometry
                this.particlesData.push({
                    velocity: new this.$THREE.Vector3(- 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2),
                    numConnections: 0
                })
            }
            this.particles.setDrawRange(0, particleCount)
            this.particles.setAttribute('position', new this.$THREE.BufferAttribute(this.particlePositions, 3).setUsage(this.$THREE.DynamicDrawUsage))
            // create the particle system
            this.pointCloud = new this.$THREE.Points(this.particles, pMaterial)
            this.group.add(this.pointCloud)
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setAttribute('position', new this.$THREE.BufferAttribute(this.positions, 3).setUsage(this.$THREE.DynamicDrawUsage))
            geometry.setAttribute('color', new this.$THREE.BufferAttribute(this.colors, 3).setUsage(this.$THREE.DynamicDrawUsage))
            geometry.computeBoundingSphere()
            geometry.setDrawRange(0, 0)
            var material = new this.$THREE.LineBasicMaterial({
                vertexColors: true,
                blending: this.$THREE.AdditiveBlending,
                transparent: true
            })
            this.linesMesh = new this.$THREE.LineSegments(geometry, material)
            this.group.add(this.linesMesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.container.appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            window.addEventListener('resize', onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            var vertexpos = 0
            var colorpos = 0
            var numConnected = 0
            for (var i = 0; i < this.particleCount; i ++)
                this.particlesData[i].numConnections = 0
            for (var i = 0; i < this.particleCount; i ++) {
                // get the particle
                var particleData = this.particlesData[i]
                this.particlePositions[i * 3] += particleData.velocity.x
                this.particlePositions[i * 3 + 1] += particleData.velocity.y
                this.particlePositions[i * 3 + 2] += particleData.velocity.z
                if (this.particlePositions[i * 3 + 1] < - this.rHalf || this.particlePositions[i * 3 + 1] > this.rHalf)
                    particleData.velocity.y = - particleData.velocity.y
                if (this.particlePositions[i * 3] < - this.rHalf || this.particlePositions[i * 3] > this.rHalf)
                    particleData.velocity.x = - particleData.velocity.x
                if (this.particlePositions[i * 3 + 2] < - this.rHalf || this.particlePositions[i * 3 + 2] > this.rHalf)
                    particleData.velocity.z = - particleData.velocity.z
                if (this.effectController.limitConnections && particleData.numConnections >= this.effectController.maxConnections)
                    continue
                // Check collision
                for (var j = i + 1; j < this.particleCount; j ++) {
                    var particleDataB = this.particlesData[j]
                    if (this.effectController.limitConnections && particleDataB.numConnections >= this.effectController.maxConnections)
                        continue
                    var dx = this.particlePositions[i * 3] - this.particlePositions[j * 3]
                    var dy = this.particlePositions[i * 3 + 1] - this.particlePositions[j * 3 + 1]
                    var dz = this.particlePositions[i * 3 + 2] - this.particlePositions[j * 3 + 2]
                    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
                    if (dist < this.effectController.minDistance) {
                        particleData.numConnections ++
                        particleDataB.numConnections ++
                        var alpha = 1.0 - dist / this.effectController.minDistance
                        this.positions[vertexpos ++] = this.particlePositions[i * 3]
                        this.positions[vertexpos ++] = this.particlePositions[i * 3 + 1]
                        this.positions[vertexpos ++] = this.particlePositions[i * 3 + 2]
                        this.positions[vertexpos ++] = this.particlePositions[j * 3]
                        this.positions[vertexpos ++] = this.particlePositions[j * 3 + 1]
                        this.positions[vertexpos ++] = this.particlePositions[j * 3 + 2]
                        this.colors[colorpos ++] = alpha
                        this.colors[colorpos ++] = alpha
                        this.colors[colorpos ++] = alpha
                        this.colors[colorpos ++] = alpha
                        this.colors[colorpos ++] = alpha
                        this.colors[colorpos ++] = alpha
                        numConnected ++
                    }
                }
            }
            this.linesMesh.geometry.setDrawRange(0, numConnected * 2)
            this.linesMesh.geometry.attributes.position.needsUpdate = true
            this.linesMesh.geometry.attributes.color.needsUpdate = true
            this.pointCloud.geometry.attributes.position.needsUpdate = true
            requestAnimationFrame(this.animate)
            this.stats.update()
            this.render()
        },
        render() {
            var time = Date.now() * 0.001
            this.group.rotation.y = time * 0.1
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglBuffergeometryDrawrange-container {
    width: 100%;
}
</style>