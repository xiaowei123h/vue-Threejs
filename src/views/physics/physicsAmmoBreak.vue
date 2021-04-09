<template>
    <div class="physicsAmmoBreak-container">
        <div id="info">Physics threejs demo with convex objects breaking in real time<br />Press mouse to throw balls and move the camera.</div>
	    <div id="container"></div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ConvexObjectBreaker } from '@/components/jsm/misc/ConvexObjectBreaker.js'
import { ConvexBufferGeometry } from '@/components/jsm/geometries/ConvexGeometry.js'
export default {
    data() {
        return {
            // - Global variables -
            // Graphics variables
            container: null,
            stats: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            textureLoader: null,
            clock: null,
            mouseCoords: null,
            raycaster: null,
            ballMaterial: null,
            // Physics variables
            gravityConstant: 7.8,
            collisionConfiguration: null,
            dispatcher: null,
            broadphase: null,
            solver: null,
            physicsWorld: null,
            margin: 0.05,
            convexBreaker: null,
            // Rigid bodies include all movable objects
            rigidBodies: [],
            pos: null,
            quat: null,
            transformAux1: null,
            tempBtVec3_1: null,
            objectsToRemove: [],
            numObjectsToRemove: 0,
            impactPoint: null,
            impactNormal: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.mouseCoords = new this.$THREE.Vector2()
        this.raycaster = new this.$THREE.Raycaster()
        this.ballMaterial = new this.$THREE.MeshPhongMaterial({ color: 0x202020 })
        this.convexBreaker = new ConvexObjectBreaker()
        this.pos = new this.$THREE.Vector3()
        this.quat = new this.$THREE.Quaternion()
        for (var i = 0; i < 500; i ++) {
            this.objectsToRemove[ i ] = null
        }
        this.impactPoint = new this.$THREE.Vector3()
		this.impactNormal = new this.$THREE.Vector3()
		this.$nextTick(() => {
			Ammo().then((AmmoLib) => {
				Ammo = AmmoLib
				this.init()
				this.animate()
			})
		})
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
			this.camera.position.set(- 14, 8, 16)
			this.renderer = new this.$THREE.WebGLRenderer()
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.renderer.shadowMap.enabled = true
			this.container.appendChild(this.renderer.domElement)
			this.controls = new OrbitControls(this.camera, this.renderer.domElement)
			this.controls.target.set(0, 2, 0)
			this.controls.update()
			this.textureLoader = new this.$THREE.TextureLoader()
			var ambientLight = new this.$THREE.AmbientLight(0x707070)
			this.scene.add(ambientLight)
			var light = new this.$THREE.DirectionalLight(0xffffff, 1)
			light.position.set(- 10, 18, 5)
			light.castShadow = true
			var d = 14
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
			//
			window.addEventListener('resize', this.onWindowResize, false)
        },
        initPhysics() {
			// Physics configuration
			this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
			this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration)
			this.broadphase = new Ammo.btDbvtBroadphase()
			this.solver = new Ammo.btSequentialImpulseConstraintSolver()
			this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration)
			this.physicsWorld.setGravity(new Ammo.btVector3(0, - this.gravityConstant, 0))
			this.transformAux1 = new Ammo.btTransform()
			this.tempBtVec3_1 = new Ammo.btVector3(0, 0, 0)
        },
        createObject(mass, halfExtents, pos, quat, material) {
			var object = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2), material)
			object.position.copy(pos)
			object.quaternion.copy(quat)
			this.convexBreaker.prepareBreakableObject(object, mass, new this.$THREE.Vector3(), new this.$THREE.Vector3(), true)
			this.createDebrisFromBreakableObject(object)
        },
        createObjects() {
			// Ground
			this.pos.set(0, - 0.5, 0)
			this.quat.set(0, 0, 0, 1)
			var ground = this.createParalellepipedWithPhysics(40, 1, 40, 0, this.pos, this.quat, new this.$THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
			ground.receiveShadow = true
			this.textureLoader.load("static/textures/grid.png", (texture) => {
				texture.wrapS = this.$THREE.RepeatWrapping
				texture.wrapT = this.$THREE.RepeatWrapping
				texture.repeat.set(40, 40)
				ground.material.map = texture
				ground.material.needsUpdate = true
			})
			// Tower 1
			var towerMass = 1000
			var towerHalfExtents = new this.$THREE.Vector3(2, 5, 2)
			this.pos.set(- 8, 5, 0)
			this.quat.set(0, 0, 0, 1)
			this.createObject(towerMass, towerHalfExtents, this.pos, this.quat, this.createMaterial(0xB03014))
			// Tower 2
			this.pos.set(8, 5, 0)
			this.quat.set(0, 0, 0, 1)
			this.createObject(towerMass, towerHalfExtents, this.pos, this.quat, this.createMaterial(0xB03214))
			//Bridge
			var bridgeMass = 100
			var bridgeHalfExtents = new this.$THREE.Vector3(7, 0.2, 1.5)
			this.pos.set(0, 10.2, 0)
			this.quat.set(0, 0, 0, 1)
			this.createObject(bridgeMass, bridgeHalfExtents, this.pos, this.quat, this.createMaterial(0xB3B865))
			// Stones
			var stoneMass = 120
			var stoneHalfExtents = new this.$THREE.Vector3(1, 2, 0.15)
			var numStones = 8
			this.quat.set(0, 0, 0, 1)
			for (var i = 0; i < numStones; i ++) {
				this.pos.set(0, 2, 15 * (0.5 - i / (numStones + 1)))
				this.createObject(stoneMass, stoneHalfExtents, this.pos, this.quat, this.createMaterial(0xB0B0B0))
			}
			// Mountain
			var mountainMass = 860
			var mountainHalfExtents = new this.$THREE.Vector3(4, 5, 4)
			this.pos.set(5, mountainHalfExtents.y * 0.5, - 7)
			this.quat.set(0, 0, 0, 1)
			var mountainPoints = []
			mountainPoints.push(new this.$THREE.Vector3(mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z))
			mountainPoints.push(new this.$THREE.Vector3(- mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z))
			mountainPoints.push(new this.$THREE.Vector3(mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z))
			mountainPoints.push(new this.$THREE.Vector3(- mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z))
			mountainPoints.push(new this.$THREE.Vector3(0, mountainHalfExtents.y, 0))
			var mountain = new this.$THREE.Mesh(new ConvexBufferGeometry(mountainPoints), this.createMaterial(0xB03814))
			mountain.position.copy(this.pos)
			mountain.quaternion.copy(this.quat)
			this.convexBreaker.prepareBreakableObject(mountain, mountainMass, new this.$THREE.Vector3(), new this.$THREE.Vector3(), true)
			this.createDebrisFromBreakableObject(mountain)
        },
        createParalellepipedWithPhysics(sx, sy, sz, mass, pos, quat, material) {
			var object = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), material)
			var shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
			shape.setMargin(this.margin)
			this.createRigidBody(object, shape, mass, pos, quat)
			return object
        },
        createDebrisFromBreakableObject(object) {
			object.castShadow = true
			object.receiveShadow = true
			var shape = this.createConvexHullPhysicsShape(object.geometry.attributes.position.array)
			shape.setMargin(this.margin)
			var body = this.createRigidBody(object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity)
			// Set pointer back to the three object only in the debris objects
			var btVecUserData = new Ammo.btVector3(0, 0, 0)
			btVecUserData.threeObject = object
			body.setUserPointer(btVecUserData)
        },
        removeDebris(object) {
			this.scene.remove(object)
			this.physicsWorld.removeRigidBody(object.userData.physicsBody)
        },
        createConvexHullPhysicsShape(coords) {
			var shape = new Ammo.btConvexHullShape()
			for (var i = 0, il = coords.length; i < il; i += 3) {
				this.tempBtVec3_1.setValue(coords[ i ], coords[ i + 1 ], coords[ i + 2 ])
				var lastOne = (i >= (il - 3))
				shape.addPoint(this.tempBtVec3_1, lastOne)
			}
			return shape
        },
        createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
			if (pos) {
				object.position.copy(pos)
			} else {
				pos = object.position
			}
			if (quat) {
				object.quaternion.copy(quat)
			} else {
				quat = object.quaternion
			}
			var transform = new Ammo.btTransform()
			transform.setIdentity()
			transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
			transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
			var motionState = new Ammo.btDefaultMotionState(transform)
			var localInertia = new Ammo.btVector3(0, 0, 0)
			physicsShape.calculateLocalInertia(mass, localInertia)
			var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia)
			var body = new Ammo.btRigidBody(rbInfo)
			body.setFriction(0.5)
			if (vel) {
				body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z))
			}
			if (angVel) {
				body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z))
			}
			object.userData.physicsBody = body
			object.userData.collided = false
			this.scene.add(object)
			if (mass > 0) {
				this.rigidBodies.push(object)
				// Disable deactivation
				body.setActivationState(4)
			}
			this.physicsWorld.addRigidBody(body)
			return body
        },
        createRandomColor() {
			return Math.floor(Math.random() * (1 << 24))
        },
        createMaterial(color) {
			color = color || createRandomColor()
			return new this.$THREE.MeshPhongMaterial({ color: color })
        },
        initInput() {
			window.addEventListener('pointerdown', (event) => {
				this.mouseCoords.set(
					(event.clientX / (window.innerWidth + 281)) * 2 - 1,
					- (event.clientY / window.innerHeight) * 2 + 1
				)
				this.raycaster.setFromCamera(this.mouseCoords, this.camera)
				// Creates a ball and throws it
				var ballMass = 35
				var ballRadius = 0.4
				var ball = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(ballRadius, 14, 10), this.ballMaterial)
				ball.castShadow = true
				ball.receiveShadow = true
				var ballShape = new Ammo.btSphereShape(ballRadius)
				ballShape.setMargin(this.margin)
				this.pos.copy(this.raycaster.ray.direction)
				this.pos.add(this.raycaster.ray.origin)
				this.quat.set(0, 0, 0, 1)
				var ballBody = this.createRigidBody(ball, ballShape, ballMass, this.pos, this.quat)
				this.pos.copy(this.raycaster.ray.direction)
				this.pos.multiplyScalar(24)
				ballBody.setLinearVelocity(new Ammo.btVector3(this.pos.x, this.pos.y, this.pos.z))
			}, false)
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
			this.renderer.render(this.scene, this.camera)
        },
        updatePhysics(deltaTime) {
			// Step world
			this.physicsWorld.stepSimulation(deltaTime, 10)
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
					objThree.userData.collided = false
				}
			}
			for (var i = 0, il = this.dispatcher.getNumManifolds(); i < il; i ++) {
				var contactManifold = this.dispatcher.getManifoldByIndexInternal(i)
				var rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody)
				var rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody)
				var threeObject0 = Ammo.castObject(rb0.getUserPointer(), Ammo.btVector3).threeObject
				var threeObject1 = Ammo.castObject(rb1.getUserPointer(), Ammo.btVector3).threeObject
				if (! threeObject0 && ! threeObject1) {
					continue
				}
				var userData0 = threeObject0 ? threeObject0.userData : null
				var userData1 = threeObject1 ? threeObject1.userData : null
				var breakable0 = userData0 ? userData0.breakable : false
				var breakable1 = userData1 ? userData1.breakable : false
				var collided0 = userData0 ? userData0.collided : false
				var collided1 = userData1 ? userData1.collided : false
				if ((! breakable0 && ! breakable1) || (collided0 && collided1)) {
					continue
				}
				var contact = false
				var maxImpulse = 0
				for (var j = 0, jl = contactManifold.getNumContacts(); j < jl; j ++) {
					var contactPoint = contactManifold.getContactPoint(j)
					if (contactPoint.getDistance() < 0) {
						contact = true
						var impulse = contactPoint.getAppliedImpulse()
						if (impulse > maxImpulse) {
							maxImpulse = impulse
							var pos = contactPoint.get_m_positionWorldOnB()
							var normal = contactPoint.get_m_normalWorldOnB()
							this.impactPoint.set(pos.x(), pos.y(), pos.z())
							this.impactNormal.set(normal.x(), normal.y(), normal.z())
						}
						break
					}
				}
				// If no point has contact, abort
				if (! contact) continue
				// Subdivision
				var fractureImpulse = 250
				if (breakable0 && ! collided0 && maxImpulse > fractureImpulse) {
					var debris = this.convexBreaker.subdivideByImpact(threeObject0, this.impactPoint, this.impactNormal, 1, 2, 1.5)
					var numObjects = debris.length
					for (var j = 0; j < numObjects; j ++) {
						var vel = rb0.getLinearVelocity()
						var angVel = rb0.getAngularVelocity()
						var fragment = debris[ j ]
						fragment.userData.velocity.set(vel.x(), vel.y(), vel.z())
						fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z())
						this.createDebrisFromBreakableObject(fragment)
					}
					this.objectsToRemove[ this.numObjectsToRemove ++ ] = threeObject0
					userData0.collided = true
				}
				if (breakable1 && ! collided1 && maxImpulse > fractureImpulse) {
					var debris = this.convexBreaker.subdivideByImpact(threeObject1, this.impactPoint, this.impactNormal, 1, 2, 1.5)
					var numObjects = debris.length
					for (var j = 0; j < numObjects; j ++) {
						var vel = rb1.getLinearVelocity()
						var angVel = rb1.getAngularVelocity()
						var fragment = debris[ j ]
						fragment.userData.velocity.set(vel.x(), vel.y(), vel.z())
						fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z())
						this.createDebrisFromBreakableObject(fragment)
					}
					this.objectsToRemove[ this.numObjectsToRemove ++ ] = threeObject1
					userData1.collided = true
				}
			}
			for (var i = 0; i < this.numObjectsToRemove; i ++) {
				this.removeDebris(this.objectsToRemove[ i ])
			}
			this.numObjectsToRemove = 0
		}
    },
}
</script>

<style scoped>
.physicsAmmoBreak-container {
	position: relative;
    width: 100%;
    color: #333;
}
</style>
