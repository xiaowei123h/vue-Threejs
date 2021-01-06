<template>
    <div class="webglAnimationCloth-container">
        <div id="info">Simple Cloth Simulation<br/>
			Verlet integration with relaxed constraints<br/>
		</div>
    </div>
</template>

<script>
import * as THREE from 'three'
import { Cloth, Plane } from '@/utils/animationCloth.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            params: {
				enableWind: true,
				showBall: false,
				togglePins: this.togglePins
            },
            DAMPING: 0.03,
            DRAG: null,
			MASS: 0.1,
			restDistance: 25,
			xSegs: 10,
			ySegs: 10,
			clothFunction: null,
			cloth: null,
			GRAVITY: 981 * 1.4,
			gravity: null,
			TIMESTEP: 18 / 1000,
			TIMESTEP_SQ: null,
			pins: [],
			windForce: null,
			ballPosition: null,
			ballSize: 60,
            tmpForce: null,
            pinsFormation: [],
            diff: null,
            clothGeometry: null,
            sphere: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            object: null,
            il: null,
            constraints: null,
            gui: null
        }
    },
    mounted() {
        this.DRAG = 1 - this.DAMPING
        this.clothFunction = Plane( this.restDistance * this.xSegs, this.restDistance * this.ySegs )
        this.cloth = new Cloth( this.xSegs, this.ySegs, this.MASS, this.$THREE, this.restDistance, this.DRAG, this.clothFunction )
        this.gravity = new this.$THREE.Vector3( 0, - this.GRAVITY, 0 ).multiplyScalar( this.MASS )
        this.TIMESTEP_SQ = this.TIMESTEP * this.TIMESTEP
        this.windForce = new this.$THREE.Vector3( 0, 0, 0 )
        this.ballPosition = new this.$THREE.Vector3( 0, - 45, 0 )
        this.tmpForce = new this.$THREE.Vector3()
        this.diff = new this.$THREE.Vector3()
        this.initPinsFormation()
        this.init()
        this.animate(0)
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.container = document.createElement('div')
			document.getElementsByClassName('webglAnimationCloth-container')[0].appendChild(this.container)
            // scene
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xcce0ff)
            this.scene.fog = new this.$THREE.Fog(0xcce0ff, 500, 10000)
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(30, (this.$webglInnerWidth) / window.innerHeight, 1, 10000)
            this.camera.position.set(1000, 50, 1500)
            // lights
            this.scene.add(new this.$THREE.AmbientLight(0x666666))
            const light = new this.$THREE.DirectionalLight(0xdfebff, 1)
            light.position.set(50, 200, 100)
            light.position.multiplyScalar(1.3)
            light.castShadow = true
            light.shadow.mapSize.width = 1024
            light.shadow.mapSize.height = 1024
            const d = 300
            light.shadow.camera.left = - d
            light.shadow.camera.right = d
            light.shadow.camera.top = d
            light.shadow.camera.bottom = - d
            light.shadow.camera.far = 1000
            this.scene.add(light)
            // cloth material
            const loader = new this.$THREE.TextureLoader()
            const clothTexture = loader.load('static/textures/patterns/circuit_pattern.png')
            clothTexture.anisotropy = 16
            const clothMaterial = new this.$THREE.MeshLambertMaterial({
                map: clothTexture,
                side: this.$THREE.DoubleSide,
                alphaTest: 0.5
            })
            // cloth geometry
            this.clothGeometry = new this.$THREE.ParametricBufferGeometry(this.clothFunction, this.cloth.w, this.cloth.h)
            // cloth mesh
            this.object = new this.$THREE.Mesh(this.clothGeometry, clothMaterial)
            this.object.position.set( 0, 0, 0 )
            this.object.castShadow = true
            this.scene.add(this.object)
            this.object.customDepthMaterial = new this.$THREE.MeshDepthMaterial({
                depthPacking: this.$THREE.RGBADepthPacking,
                map: clothTexture,
                alphaTest: 0.5
            })
            // sphere
            const ballGeo = new this.$THREE.SphereBufferGeometry(this.ballSize, 32, 16)
            const ballMaterial = new this.$THREE.MeshLambertMaterial()
            this.sphere = new this.$THREE.Mesh( ballGeo, ballMaterial )
            this.sphere.castShadow = true
            this.sphere.receiveShadow = true
            this.sphere.visible = false
            this.scene.add( this.sphere )
            // ground
            const groundTexture = loader.load('static/textures/terrain/grasslight-big.jpg')
            groundTexture.wrapS = groundTexture.wrapT = this.$THREE.RepeatWrapping
            groundTexture.repeat.set(25, 25)
            groundTexture.anisotropy = 16
            groundTexture.encoding = this.$THREE.sRGBEncoding
            const groundMaterial = new this.$THREE.MeshLambertMaterial({map: groundTexture})
            let mesh = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(20000, 20000), groundMaterial)
            mesh.position.y = - 250
            mesh.rotation.x = - Math.PI / 2
            mesh.receiveShadow = true
            this.scene.add(mesh)
            // poles
            const poleGeo = new this.$THREE.BoxBufferGeometry(5, 375, 5)
            const poleMat = new this.$THREE.MeshLambertMaterial()
            mesh = new this.$THREE.Mesh(poleGeo, poleMat)
            mesh.position.x = - 125
            mesh.position.y = - 62
            mesh.receiveShadow = true
            mesh.castShadow = true
            this.scene.add( mesh )
            mesh = new this.$THREE.Mesh(poleGeo, poleMat)
            mesh.position.x = 125
            mesh.position.y = - 62
            mesh.receiveShadow = true
            mesh.castShadow = true
            this.scene.add(mesh)
            mesh = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(255, 5, 5), poleMat)
            mesh.position.y = - 250 + (750 / 2)
            mesh.position.x = 0
            mesh.receiveShadow = true
            mesh.castShadow = true
            this.scene.add(mesh)
            const gg = new this.$THREE.BoxBufferGeometry(10, 10, 10)
            mesh = new this.$THREE.Mesh(gg, poleMat)
            mesh.position.y = - 250
            mesh.position.x = 125
            mesh.receiveShadow = true
            mesh.castShadow = true
            this.scene.add(mesh)
            mesh = new this.$THREE.Mesh(gg, poleMat)
            mesh.position.y = - 250
            mesh.position.x = - 125
            mesh.receiveShadow = true
            mesh.castShadow = true
            this.scene.add(mesh)
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({antialias: true})
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            // controls
            const controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.maxPolarAngle = Math.PI * 0.5
            controls.minDistance = 1000
            controls.maxDistance = 5000
            // performance monitor
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild( this.stats.dom )
            //
            window.addEventListener('resize', this.onWindowResize, false)
            //
            this.gui = new GUI()
            this.gui.add(this.params, 'enableWind').name('Enable wind')
            this.gui.add(this.params, 'showBall').name('Show ball')
            this.gui.add(this.params, 'togglePins').name('Toggle pins')
            //
            if (typeof TESTING !== 'undefined') {
                for (var i = 0; i < 50; i ++) {
                    this.simulate(500 - 10 * i)
                }
            }
        },
        animate(now) {
            requestAnimationFrame(this.animate)
            this.simulate(now)
            this.render()
            this.stats.update()
        },
        render() {
            const p = this.cloth.particles
            for (var i = 0, il = p.length; i < il; i ++) {
                const v = p[i].position
                this.clothGeometry.attributes.position.setXYZ(i, v.x, v.y, v.z)
            }
            this.clothGeometry.attributes.position.needsUpdate = true
            this.clothGeometry.computeVertexNormals()
            this.sphere.position.copy(this.ballPosition)
            this.renderer.render(this.scene, this.camera)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        initPinsFormation() {
            this.pins = [6]
			this.pinsFormation.push(this.pins)
			this.pins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			this.pinsFormation.push(this.pins)
			this.pins = [0]
			this.pinsFormation.push(this.pins)
			this.pins = [] // cut the rope ;)
			this.pinsFormation.push(this.pins)
			this.pins = [0, this.cloth.w] // classic 2 pins
			this.pinsFormation.push(this.pins)
			this.pins = this.pinsFormation[1]
        },
        togglePins() {
            this.pins = this.pinsFormation[~ ~ (Math.random() * this.pinsFormation.length)]
        },
        satisfyConstraints(p1, p2, distance) {
            this.diff.subVectors(p2.position, p1.position)
            const currentDist = this.diff.length()
            if (currentDist === 0) return // prevents division by 0
            const correction = this.diff.multiplyScalar(1 - distance / currentDist)
            const correctionHalf = correction.multiplyScalar(0.5)
            p1.position.add(correctionHalf)
            p2.position.sub(correctionHalf)
        },
        simulate(now) {
            const windStrength = Math.cos(now / 7000) * 20 + 40
            this.windForce.set( Math.sin(now / 2000), Math.cos(now / 3000), Math.sin(now / 1000) )
            this.windForce.normalize()
            this.windForce.multiplyScalar(windStrength)
            // Aerodynamics forces
            const particles = this.cloth.particles
            var ill = this.il
            if (this.params.enableWind) {
                let indx
                const normal = new this.$THREE.Vector3()
                const indices = this.clothGeometry.index
                const normals = this.clothGeometry.attributes.normal
                for (var i = 0, ill = indices.count; i < ill; i += 3) {
                    for (let j = 0; j < 3; j ++) {
                        indx = indices.getX(i + j)
                        normal.fromBufferAttribute(normals, indx)
                        this.tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(this.windForce))
                        particles[indx].addForce(this.tmpForce)
                    }
                }
            }
            for (let i = 0, ill = particles.length; i < ill; i ++) {
                const particle = particles[i]
                particle.addForce(this.gravity)
                particle.integrate(this.TIMESTEP_SQ)
            }
            // Start Constraints
            this.constraints = this.cloth.constraints
            this.il = this.constraints.length
            var iil = this.il
            for (let i = 0; i < iil; i ++) {
                const constraint = this.constraints[i]
                this.satisfyConstraints(constraint[0], constraint[1], constraint[2])
            }
            // Ball Constraints
            this.ballPosition.z = - Math.sin(now / 600) * 90 //+ 40;
            this.ballPosition.x = Math.cos(now / 400) * 70
            if (this.params.showBall) {
                this.sphere.visible = true
                for (let i = 0, iil = particles.length; i < iil; i ++) {
                    const particle = particles[i]
                    const pos = particle.position
                    this.diff.subVectors(pos, this.ballPosition)
                    if (this.diff.length() < this.ballSize) {
                        // collided
                        this.diff.normalize().multiplyScalar(this.ballSize)
                        pos.copy( this.ballPosition ).add(this.diff)
                    }
                }
            } else {
                this.sphere.visible = false
            }
            // Floor Constraints
            for (var i = 0, iil = particles.length; i < iil; i ++) {
                const particle = particles[i]
                const pos = particle.position
                if (pos.y < - 250) {
                    pos.y =- 250
                }
            }
            // Pin Constraints
            for (var i = 0, iil = this.pins.length; i < iil; i ++) {
                const xy = this.pins[i]
                const p = particles[xy]
                p.position.copy(p.original)
                p.previous.copy(p.original)
            }
        }
    }
}
</script>

<style scoped>
.webglAnimationCloth-container {
    color: #000;
}
a {
    color: #080;
}
</style>
