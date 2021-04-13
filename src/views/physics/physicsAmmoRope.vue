<template>
    <div class="physicsAmmoRope-container">
        <div id="info">Ammo.js physics soft body rope demo<br>Press Q or A to move the arm.</div>
	    <div id="container"></div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
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
            // Physics variables
            gravityConstant: - 9.8,
            collisionConfiguration: null,
            dispatcher: null,
            broadphase: null,
            solver: null,
            softBodySolver: null,
            physicsWorld: null,
            rigidBodies: [],
            margin: 0.05,
            hinge: null,
            rope: null,
            transformAux1: null,
            armMovement: 0,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
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
			var d = 10
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
			this.collisionConfiguration = new this.$Ammo.btSoftBodyRigidBodyCollisionConfiguration()
			this.dispatcher = new this.$Ammo.btCollisionDispatcher(this.collisionConfiguration)
			this.broadphase = new this.$Ammo.btDbvtBroadphase()
			this.solver = new this.$Ammo.btSequentialImpulseConstraintSolver()
			this.softBodySolver = new this.$Ammo.btDefaultSoftBodySolver()
			this.physicsWorld = new this.$Ammo.btSoftRigidDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration, this.softBodySolver)
			this.physicsWorld.setGravity(new this.$Ammo.btVector3(0, this.gravityConstant, 0))
			this.physicsWorld.getWorldInfo().set_m_gravity(new this.$Ammo.btVector3(0, this.gravityConstant, 0))
			this.transformAux1 = new this.$Ammo.btTransform()
        },
        createObjects() {
			var pos = new this.$THREE.Vector3()
			var quat = new this.$THREE.Quaternion()
			// Ground
			pos.set(0, - 0.5, 0)
			quat.set(0, 0, 0, 1)
			var ground = this.createParalellepiped(40, 1, 40, 0, pos, quat, new this.$THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
			ground.castShadow = true
			ground.receiveShadow = true
			this.textureLoader.load("static/textures/grid.png", (texture) => {
				texture.wrapS = this.$THREE.RepeatWrapping
				texture.wrapT = this.$THREE.RepeatWrapping
				texture.repeat.set(40, 40)
				ground.material.map = texture
				ground.material.needsUpdate = true
			})
			// Ball
			var ballMass = 1.2
			var ballRadius = 0.6
			var ball = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(ballRadius, 20, 20), new this.$THREE.MeshPhongMaterial({ color: 0x202020 }))
			ball.castShadow = true
			ball.receiveShadow = true
			var ballShape = new this.$Ammo.btSphereShape(ballRadius)
			ballShape.setMargin(this.margin)
			pos.set(- 3, 2, 0)
			quat.set(0, 0, 0, 1)
            this.createRigidBody(ball, ballShape, ballMass, pos, quat)
			ball.userData.physicsBody.setFriction(0.5)
			// Wall
			var brickMass = 0.5
			var brickLength = 1.2
			var brickDepth = 0.6
			var brickHeight = brickLength * 0.5
			var numBricksLength = 6
			var numBricksHeight = 8
			var z0 = - numBricksLength * brickLength * 0.5
			pos.set(0, brickHeight * 0.5, z0)
			quat.set(0, 0, 0, 1)
			for (var j = 0; j < numBricksHeight; j ++) {
				var oddRow = (j % 2) == 1
				pos.z = z0
				if (oddRow) {
					pos.z -= 0.25 * brickLength
				}
				var nRow = oddRow ? numBricksLength + 1 : numBricksLength
				for (var i = 0; i < nRow; i ++) {
					var brickLengthCurrent = brickLength
					var brickMassCurrent = brickMass
					if (oddRow && (i == 0 || i == nRow - 1)) {
						brickLengthCurrent *= 0.5
						brickMassCurrent *= 0.5
					}
					var brick = this.createParalellepiped(brickDepth, brickHeight, brickLengthCurrent, brickMassCurrent, pos, quat, this.createMaterial())
					brick.castShadow = true
					brick.receiveShadow = true
					if (oddRow && (i == 0 || i == nRow - 2)) {
						pos.z += 0.75 * brickLength
					} else {
						pos.z += brickLength
					}
				}
				pos.y += brickHeight
			}
			// The rope
			// Rope graphic object
			var ropeNumSegments = 10
			var ropeLength = 4
			var ropeMass = 3
			var ropePos = ball.position.clone()
			ropePos.y += ballRadius
			var segmentLength = ropeLength / ropeNumSegments
			var ropeGeometry = new this.$THREE.BufferGeometry()
			var ropeMaterial = new this.$THREE.LineBasicMaterial({ color: 0x000000 })
			var ropePositions = []
			var ropeIndices = []
			for (var i = 0; i < ropeNumSegments + 1; i ++) {
				ropePositions.push(ropePos.x, ropePos.y + i * segmentLength, ropePos.z)
			}
			for (var i = 0; i < ropeNumSegments; i ++) {
				ropeIndices.push(i, i + 1)
			}
			ropeGeometry.setIndex(new this.$THREE.BufferAttribute(new Uint16Array(ropeIndices), 1))
			ropeGeometry.setAttribute('position', new this.$THREE.BufferAttribute(new Float32Array(ropePositions), 3))
			ropeGeometry.computeBoundingSphere()
			this.rope = new this.$THREE.LineSegments(ropeGeometry, ropeMaterial)
			this.rope.castShadow = true
			this.rope.receiveShadow = true
			this.scene.add(this.rope)
			// Rope physic object
			var softBodyHelpers = new this.$Ammo.btSoftBodyHelpers()
			var ropeStart = new this.$Ammo.btVector3(ropePos.x, ropePos.y, ropePos.z)
			var ropeEnd = new this.$Ammo.btVector3(ropePos.x, ropePos.y + ropeLength, ropePos.z)
			var ropeSoftBody = softBodyHelpers.CreateRope(this.physicsWorld.getWorldInfo(), ropeStart, ropeEnd, ropeNumSegments - 1, 0)
			var sbConfig = ropeSoftBody.get_m_cfg()
			sbConfig.set_viterations(10)
			sbConfig.set_piterations(10)
			ropeSoftBody.setTotalMass(ropeMass, false)
			this.$Ammo.castObject(ropeSoftBody, this.$Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin * 3)
            this.physicsWorld.addSoftBody(ropeSoftBody, 1, - 1)
			this.rope.userData.physicsBody = ropeSoftBody
			// Disable deactivation
			ropeSoftBody.setActivationState(4)
			// The base
			var armMass = 2
			var armLength = 3
			var pylonHeight = ropePos.y + ropeLength
			var baseMaterial = new this.$THREE.MeshPhongMaterial({ color: 0x606060 })
			pos.set(ropePos.x, 0.1, ropePos.z - armLength)
			quat.set(0, 0, 0, 1)
			var base = this.createParalellepiped(1, 0.2, 1, 0, pos, quat, baseMaterial)
			base.castShadow = true
			base.receiveShadow = true
			pos.set(ropePos.x, 0.5 * pylonHeight, ropePos.z - armLength)
			var pylon = this.createParalellepiped(0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial)
			pylon.castShadow = true
			pylon.receiveShadow = true
			pos.set(ropePos.x, pylonHeight + 0.2, ropePos.z - 0.5 * armLength)
			var arm = this.createParalellepiped(0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial)
			arm.castShadow = true
			arm.receiveShadow = true
			// Glue the rope extremes to the ball and the arm
			var influence = 1
			ropeSoftBody.appendAnchor(0, ball.userData.physicsBody, true, influence)
			ropeSoftBody.appendAnchor(ropeNumSegments, arm.userData.physicsBody, true, influence)
			// Hinge varraint to move the arm
			var pivotA = new this.$Ammo.btVector3(0, pylonHeight * 0.5, 0)
			var pivotB = new this.$Ammo.btVector3(0, - 0.2, - armLength * 0.5)
			var axis = new this.$Ammo.btVector3(0, 1, 0)
			this.hinge = new this.$Ammo.btHingeConstraint(pylon.userData.physicsBody, arm.userData.physicsBody, pivotA, pivotB, axis, axis, true)
			this.physicsWorld.addConstraint(this.hinge, true)
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
        },
        createRandomColor() {
			return Math.floor(Math.random() * (1 << 24))
        },
        createMaterial() {
			return new this.$THREE.MeshPhongMaterial({ color: this.createRandomColor() })
        },
        initInput() {
			window.addEventListener('keydown', (event) => {
				switch (event.keyCode) {
					// Q
					case 81:
						this.armMovement = 1
						break
					// A
					case 65:
						this.armMovement = - 1
						break
				}
			}, false)
			window.addEventListener('keyup', () => {
				this.armMovement = 0
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
			// Hinge control
			this.hinge.enableAngularMotor(true, 1.5 * this.armMovement, 50)
			// Step world
			this.physicsWorld.stepSimulation(deltaTime, 10)
			// Update rope
			var softBody = this.rope.userData.physicsBody
			var ropePositions = this.rope.geometry.attributes.position.array
			var numVerts = ropePositions.length / 3
			var nodes = softBody.get_m_nodes()
			var indexFloat = 0
			for (var i = 0; i < numVerts; i ++) {
				var node = nodes.at(i)
				var nodePos = node.get_m_x()
				ropePositions[ indexFloat ++ ] = nodePos.x()
				ropePositions[ indexFloat ++ ] = nodePos.y()
				ropePositions[ indexFloat ++ ] = nodePos.z()
			}
			this.rope.geometry.attributes.position.needsUpdate = true
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
.physicsAmmoRope-container {
	position: relative;
    width: 100%;
    color: #333;
}
</style>
