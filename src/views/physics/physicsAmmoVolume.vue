<template>
    <div class="physicsAmmoVolume-container">
        <div id="info">
			Ammo.js physics soft body volume demo<br/>
			Click to throw a ball
		</div>
		<div id="container"></div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { BufferGeometryUtils } from '@/components/jsm/utils/BufferGeometryUtils.js'
export default {
    data() {
        return {
            // Graphics variables
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
			textureLoader: null,
			clock: null,
			clickRequest: false,
			mouseCoords: null,
			raycaster: null,
			ballMaterial: null,
			pos: null,
			quat: null,
			// Physics variables
			gravityConstant: - 9.8,
			physicsWorld: null,
			rigidBodies: [],
			softBodies: [],
			margin: 0.05,
			transformAux1: null,
			softBodyHelpers: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.mouseCoords = new this.$THREE.Vector2()
        this.raycaster = new this.$THREE.Raycaster()
        this.ballMaterial = new this.$THREE.MeshPhongMaterial({ color: 0x202020 })
        this.pos = new this.$THREE.Vector3()
        this.quat = new this.$THREE.Quaternion()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.initGraphics()
            this.initPhysics()
            this.createObjects()
            this.initInput()
        },
        initGraphics() {
            this.container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.2, 2000)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xbfd1e5)
            this.camera.position.set(- 7, 5, 8)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.container.appendChild(this.renderer.domElement)
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.target.set(0, 2, 0)
            this.controls.update()
            this.textureLoader = new this.$THREE.TextureLoader()
            var ambientLight = new this.$THREE.AmbientLight(0x404040)
            this.scene.add(ambientLight)
            var light = new this.$THREE.DirectionalLight(0xffffff, 1)
            light.position.set(- 10, 10, 5)
            light.castShadow = true
            var d = 20
            light.shadow.camera.left = - d
            light.shadow.camera.right = d
            light.shadow.camera.top = d
            light.shadow.camera.bottom = - d
            light.shadow.camera.near = 2
            light.shadow.camera.far = 50
            light.shadow.mapSize.x = 1024
            light.shadow.mapSize.y = 1024
            this.scene.add(light)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.stats.domElement.style.position = 'absolute'
            this.stats.domElement.style.top = '0px'
            this.container.appendChild(this.stats.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        initPhysics() {
            // Physics configuration
            var collisionConfiguration = new this.$Ammo.btSoftBodyRigidBodyCollisionConfiguration()
            var dispatcher = new this.$Ammo.btCollisionDispatcher(collisionConfiguration)
            var broadphase = new this.$Ammo.btDbvtBroadphase()
            var solver = new this.$Ammo.btSequentialImpulseConstraintSolver()
            var softBodySolver = new this.$Ammo.btDefaultSoftBodySolver()
            this.physicsWorld = new this.$Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver)
            this.physicsWorld.setGravity(new this.$Ammo.btVector3(0, this.gravityConstant, 0))
            this.physicsWorld.getWorldInfo().set_m_gravity(new this.$Ammo.btVector3(0, this.gravityConstant, 0))
            this.transformAux1 = new this.$Ammo.btTransform()
            this.softBodyHelpers = new this.$Ammo.btSoftBodyHelpers()
        },
        createObjects() {
            // Ground
            this.pos.set(0, - 0.5, 0)
            this.quat.set(0, 0, 0, 1)
            var ground = this.createParalellepiped(40, 1, 40, 0, this.pos, this.quat, new this.$THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
            ground.castShadow = true
            ground.receiveShadow = true
            this.textureLoader.load("static/textures/grid.png", (texture) => {
                texture.wrapS = this.$THREE.RepeatWrapping
                texture.wrapT = this.$THREE.RepeatWrapping
                texture.repeat.set(40, 40)
                ground.material.map = texture
                ground.material.needsUpdate = true
            })
            // Create soft volumes
            var volumeMass = 15
            var sphereGeometry = new this.$THREE.SphereBufferGeometry(1.5, 40, 25)
            sphereGeometry.translate(5, 5, 0)
            this.createSoftVolume(sphereGeometry, volumeMass, 250)
            var boxGeometry = new this.$THREE.BoxBufferGeometry(1, 1, 5, 4, 4, 20)
            boxGeometry.translate(- 2, 5, 0)
            this.createSoftVolume(boxGeometry, volumeMass, 120)
            // Ramp
            this.pos.set(3, 1, 0)
            this.quat.setFromAxisAngle(new this.$THREE.Vector3(0, 0, 1), 30 * Math.PI / 180)
            var obstacle = this.createParalellepiped(10, 1, 4, 0, this.pos, this.quat, new this.$THREE.MeshPhongMaterial({ color: 0x606060 }))
            obstacle.castShadow = true
            obstacle.receiveShadow = true
        },
        processGeometry(bufGeometry) {
            // Ony consider the position values when merging the vertices
            var posOnlyBufGeometry = new this.$THREE.BufferGeometry()
            posOnlyBufGeometry.setAttribute('position', bufGeometry.getAttribute('position'))
            posOnlyBufGeometry.setIndex(bufGeometry.getIndex())
            // Merge the vertices so the triangle soup is converted to indexed triangles
            var indexedBufferGeom = BufferGeometryUtils.mergeVertices(posOnlyBufGeometry)
            // Create index arrays mapping the indexed vertices to bufGeometry vertices
            this.mapIndices(bufGeometry, indexedBufferGeom)
        },
        isEqual(x1, y1, z1, x2, y2, z2) {
            var delta = 0.000001
            return Math.abs(x2 - x1) < delta &&
                    Math.abs(y2 - y1) < delta &&
                    Math.abs(z2 - z1) < delta
        },
        mapIndices(bufGeometry, indexedBufferGeom) {
            // Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry
            var vertices = bufGeometry.attributes.position.array
            var idxVertices = indexedBufferGeom.attributes.position.array
            var indices = indexedBufferGeom.index.array
            var numIdxVertices = idxVertices.length / 3
            var numVertices = vertices.length / 3
            bufGeometry.ammoVertices = idxVertices
            bufGeometry.ammoIndices = indices
            bufGeometry.ammoIndexAssociation = []
            for (var i = 0; i < numIdxVertices; i ++) {
                var association = []
                bufGeometry.ammoIndexAssociation.push(association)
                var i3 = i * 3
                for (var j = 0; j < numVertices; j ++) {
                    var j3 = j * 3
                    if (this.isEqual(idxVertices[ i3 ], idxVertices[ i3 + 1 ], idxVertices[ i3 + 2 ],
                        vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ])) {
                        association.push(j3)
                    }
                }
            }
        },
        createSoftVolume(bufferGeom, mass, pressure) {
            this.processGeometry(bufferGeom)
            var volume = new this.$THREE.Mesh(bufferGeom, new this.$THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
            volume.castShadow = true
            volume.receiveShadow = true
            volume.frustumCulled = false
            this.scene.add(volume)
            this.textureLoader.load("static/textures/colors.png", (texture) => {
                volume.material.map = texture
                volume.material.needsUpdate = true
            })
            // Volume physic object
            var volumeSoftBody = this.softBodyHelpers.CreateFromTriMesh(
                this.physicsWorld.getWorldInfo(),
                bufferGeom.ammoVertices,
                bufferGeom.ammoIndices,
                bufferGeom.ammoIndices.length / 3,
                true)
            var sbConfig = volumeSoftBody.get_m_cfg()
            sbConfig.set_viterations(40)
            sbConfig.set_piterations(40)
            // Soft-soft and soft-rigid collisions
            sbConfig.set_collisions(0x11)
            // Friction
            sbConfig.set_kDF(0.1)
            // Damping
            sbConfig.set_kDP(0.01)
            // Pressure
            sbConfig.set_kPR(pressure)
            // Stiffness
            volumeSoftBody.get_m_materials().at(0).set_m_kLST(0.9)
            volumeSoftBody.get_m_materials().at(0).set_m_kAST(0.9)
            volumeSoftBody.setTotalMass(mass, false)
            this.$Ammo.castObject(volumeSoftBody, this.$Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin)
            this.physicsWorld.addSoftBody(volumeSoftBody, 1, - 1)
            volume.userData.physicsBody = volumeSoftBody
            // Disable deactivation
            volumeSoftBody.setActivationState(4)
            this.softBodies.push(volume)
        },
        createParalellepiped(sx, sy, sz, mass, pos, quat, material) {
            var threeObject = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), material)
            var shape = new this.$Ammo.btBoxShape(new this.$Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
            shape.setMargin(this.margin)
            this.createRigidBody(threeObject, shape, mass, pos, quat)
            return threeObject
        },
        createRigidBody(threeObject, physicsShape, mass, pos, quat) {
            threeObject.position.copy(pos)
            threeObject.quaternion.copy(quat)
            var transform = new this.$Ammo.btTransform()
            transform.setIdentity()
            transform.setOrigin(new this.$Ammo.btVector3(pos.x, pos.y, pos.z))
            transform.setRotation(new this.$Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
            var motionState = new this.$Ammo.btDefaultMotionState(transform)
            var localInertia = new this.$Ammo.btVector3(0, 0, 0)
            physicsShape.calculateLocalInertia(mass, localInertia)
            var rbInfo = new this.$Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia)
            var body = new this.$Ammo.btRigidBody(rbInfo)
            threeObject.userData.physicsBody = body
            this.scene.add(threeObject)
            if (mass > 0) {
                this.rigidBodies.push(threeObject)
                // Disable deactivation
                body.setActivationState(4)
            }
            this.physicsWorld.addRigidBody(body)
            return body
        },
        initInput() {
            window.addEventListener('pointerdown', (event) => {
                var x
				if (window.innerWidth >= 640) {
					x = 281
				} else {
					x = 0
				}
                if (! this.clickRequest) {
                    this.mouseCoords.set(
                        ((event.clientX - x) / (window.innerWidth - x)) * 2 - 1,
                        - (event.clientY / window.innerHeight) * 2 + 1
                )
                    this.clickRequest = true
                }
            }, false)
        },
        processClick() {
            if (this.clickRequest) {
                this.raycaster.setFromCamera(this.mouseCoords, this.camera)
                // Creates a ball
                var ballMass = 3
                var ballRadius = 0.4
                var ball = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(ballRadius, 18, 16), this.ballMaterial)
                ball.castShadow = true
                ball.receiveShadow = true
                var ballShape = new this.$Ammo.btSphereShape(ballRadius)
                ballShape.setMargin(this.margin)
                this.pos.copy(this.raycaster.ray.direction)
                this.pos.add(this.raycaster.ray.origin)
                this.quat.set(0, 0, 0, 1)
                var ballBody = this.createRigidBody(ball, ballShape, ballMass, this.pos, this.quat)
                ballBody.setFriction(0.5)
                this.pos.copy(this.raycaster.ray.direction)
                this.pos.multiplyScalar(14)
                ballBody.setLinearVelocity(new this.$Ammo.btVector3(this.pos.x, this.pos.y, this.pos.z))
                this.clickRequest = false
            }
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
            var deltaTime = this.clock.getDelta()
            this.updatePhysics(deltaTime)
            this.processClick()
            this.renderer.render(this.scene, this.camera)
        },
        updatePhysics(deltaTime) {
            // Step world
            this.physicsWorld.stepSimulation(deltaTime, 10)
            // Update soft volumes
            for (var i = 0, il = this.softBodies.length; i < il; i ++) {
                var volume = this.softBodies[ i ]
                var geometry = volume.geometry
                var softBody = volume.userData.physicsBody
                var volumePositions = geometry.attributes.position.array
                var volumeNormals = geometry.attributes.normal.array
                var association = geometry.ammoIndexAssociation
                var numVerts = association.length
                var nodes = softBody.get_m_nodes()
                for (var j = 0; j < numVerts; j ++) {
                    var node = nodes.at(j)
                    var nodePos = node.get_m_x()
                    var x = nodePos.x()
                    var y = nodePos.y()
                    var z = nodePos.z()
                    var nodeNormal = node.get_m_n()
                    var nx = nodeNormal.x()
                    var ny = nodeNormal.y()
                    var nz = nodeNormal.z()
                    var assocVertex = association[ j ]
                    for (var k = 0, kl = assocVertex.length; k < kl; k ++) {
                        var indexVertex = assocVertex[ k ]
                        volumePositions[ indexVertex ] = x
                        volumeNormals[ indexVertex ] = nx
                        indexVertex ++
                        volumePositions[ indexVertex ] = y
                        volumeNormals[ indexVertex ] = ny
                        indexVertex ++
                        volumePositions[ indexVertex ] = z
                        volumeNormals[ indexVertex ] = nz
                    }
                }
                geometry.attributes.position.needsUpdate = true
                geometry.attributes.normal.needsUpdate = true
            }
            // Update rigid bodies
            for (var i = 0, il = this.rigidBodies.length; i < il; i ++) {
                var objThree = this.rigidBodies[ i ]
                var objPhys = objThree.userData.physicsBody
                var ms = objPhys.getMotionState()
                if (ms) {
                    ms.getWorldTransform(this.transformAux1)
                    var p = this.transformAux1.getOrigin()
                    var q = this.transformAux1.getRotation()
                    objThree.position.set(p.x(), p.y(), p.z())
                    objThree.quaternion.set(q.x(), q.y(), q.z(), q.w())
                }
            }
        }
    },
}
</script>

<style scoped>
.physicsAmmoVolume-container {
    position: relative;
    width: 100%;
    color: #333;
}
</style>
