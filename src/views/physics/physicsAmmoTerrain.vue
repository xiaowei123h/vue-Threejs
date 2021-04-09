<template>
    <div class="physicsAmmoTerrain-container">
        <div id="container"></div>
		<div id="info">Ammo.js physics terrain heightfield demo</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            // Heightfield parameters
			terrainWidthExtents: 100,
			terrainDepthExtents: 100,
			terrainWidth: 128,
			terrainDepth: 128,
			terrainHalfWidth: null,
			terrainHalfDepth: null,
			terrainMaxHeight: 8,
			terrainMinHeight: - 2,
			// Graphics variables
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			terrainMesh: null,
			clock: null,
			// Physics variables
			collisionConfiguration: null,
			dispatcher: null,
			broadphase: null,
			solver: null,
			physicsWorld: null,
			dynamicObjects: [],
			transformAux1: null,
			heightData: null,
			ammoHeightData: null,
			time: 0,
			objectTimePeriod: 3,
			timeNextSpawn: null,
			maxNumObjects: 30,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.terrainHalfWidth = this.terrainWidth / 2
		this.terrainHalfDepth = this.terrainDepth / 2
        this.timeNextSpawn = this.time + this.objectTimePeriod
        Ammo().then((AmmoLib) => {
            Ammo = AmmoLib
            this.init()
            this.animate()
        })
    },
    methods: {
        init() {
            this.heightData = this.generateHeight(this.terrainWidth, this.terrainDepth, this.terrainMinHeight, this.terrainMaxHeight)
            this.initGraphics()
            this.initPhysics()
        },
        initGraphics() {
            this.container = document.getElementById('container')
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.stats.domElement.style.position = 'absolute'
            this.stats.domElement.style.top = '0px'
            this.container.appendChild(this.stats.domElement)
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.2, 2000)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xbfd1e5)
            this.camera.position.y = this.heightData[ this.terrainHalfWidth + this.terrainHalfDepth * this.terrainWidth ] * (this.terrainMaxHeight - this.terrainMinHeight) + 5
            this.camera.position.z = this.terrainDepthExtents / 2
            this.camera.lookAt(0, 0, 0)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.enableZoom = false
            var geometry = new this.$THREE.PlaneBufferGeometry(this.terrainWidthExtents, this.terrainDepthExtents, this.terrainWidth - 1, this.terrainDepth - 1)
            geometry.rotateX(- Math.PI / 2)
            var vertices = geometry.attributes.position.array
            for (var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3) {
                // j + 1 because it is the y component that we modify
                vertices[ j + 1 ] = this.heightData[ i ]
            }
            geometry.computeVertexNormals()
            var groundMaterial = new this.$THREE.MeshPhongMaterial({ color: 0xC7C7C7 })
            this.terrainMesh = new this.$THREE.Mesh(geometry, groundMaterial)
            this.terrainMesh.receiveShadow = true
            this.terrainMesh.castShadow = true
            this.scene.add(this.terrainMesh)
            var textureLoader = new this.$THREE.TextureLoader()
            textureLoader.load("static/textures/grid.png", (texture) => {
                texture.wrapS = this.$THREE.RepeatWrapping
                texture.wrapT = this.$THREE.RepeatWrapping
                texture.repeat.set(this.terrainWidth - 1, this.terrainDepth - 1)
                groundMaterial.map = texture
                groundMaterial.needsUpdate = true
            })
            var light = new this.$THREE.DirectionalLight(0xffffff, 1)
            light.position.set(100, 100, 50)
            light.castShadow = true
            var dLight = 200
            var sLight = dLight * 0.25
            light.shadow.camera.left = - sLight
            light.shadow.camera.right = sLight
            light.shadow.camera.top = sLight
            light.shadow.camera.bottom = - sLight
            light.shadow.camera.near = dLight / 30
            light.shadow.camera.far = dLight
            light.shadow.mapSize.x = 1024 * 2
            light.shadow.mapSize.y = 1024 * 2
            this.scene.add(light)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        initPhysics() {
            // Physics configuration
            this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
            this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration)
            this.broadphase = new Ammo.btDbvtBroadphase()
            this.solver = new Ammo.btSequentialImpulseConstraintSolver()
            this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration)
            this.physicsWorld.setGravity(new Ammo.btVector3(0, - 6, 0))
            // Create the terrain body
            var groundShape = this.createTerrainShape()
            var groundTransform = new Ammo.btTransform()
            groundTransform.setIdentity()
            // Shifts the terrain, since bullet re-centers it on its bounding box.
            groundTransform.setOrigin(new Ammo.btVector3(0, (this.terrainMaxHeight + this.terrainMinHeight) / 2, 0))
            var groundMass = 0
            var groundLocalInertia = new Ammo.btVector3(0, 0, 0)
            var groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
            var groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))
            this.physicsWorld.addRigidBody(groundBody)
            this.transformAux1 = new Ammo.btTransform()
        },
        generateHeight(width, depth, minHeight, maxHeight) {
            // Generates the height data (a sinus wave)
            var size = width * depth
            var data = new Float32Array(size)
            var hRange = maxHeight - minHeight
            var w2 = width / 2
            var d2 = depth / 2
            var phaseMult = 12
            var p = 0
            for (var j = 0; j < depth; j ++) {
                for (var i = 0; i < width; i ++) {
                    var radius = Math.sqrt(
                        Math.pow((i - w2) / w2, 2.0) +
                            Math.pow((j - d2) / d2, 2.0))
                    var height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight
                    data[ p ] = height
                    p ++
                }
            }
            return data
        },
        createTerrainShape() {
            // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
            var heightScale = 1
            // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
            var upAxis = 1
            // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
            var hdt = "PHY_FLOAT"
            // Set this to your needs (inverts the triangles)
            var flipQuadEdges = false
            // Creates height data buffer in Ammo heap
            this.ammoHeightData = Ammo._malloc(4 * this.terrainWidth * this.terrainDepth)
            // Copy the javascript height data array to the Ammo one.
            var p = 0
            var p2 = 0
            for (var j = 0; j < this.terrainDepth; j ++) {
                for (var i = 0; i < this.terrainWidth; i ++) {
                    // write 32-bit float data to memory
                    Ammo.HEAPF32[ this.ammoHeightData + p2 >> 2 ] = this.heightData[ p ]
                    p ++
                    // 4 bytes/float
                    p2 += 4
                }
            }
            // Creates the heightfield physics shape
            var heightFieldShape = new Ammo.btHeightfieldTerrainShape(
                this.terrainWidth,
                this.terrainDepth,
                this.ammoHeightData,
                heightScale,
                this.terrainMinHeight,
                this.terrainMaxHeight,
                upAxis,
                hdt,
                flipQuadEdges
            )
            // Set horizontal scale
            var scaleX = this.terrainWidthExtents / (this.terrainWidth - 1)
            var scaleZ = this.terrainDepthExtents / (this.terrainDepth - 1)
            heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
            heightFieldShape.setMargin(0.05)
            return heightFieldShape
        },
        generateObject() {
            var numTypes = 4
            var objectType = Math.ceil(Math.random() * numTypes)
            var threeObject = null
            var shape = null
            var objectSize = 3
            var margin = 0.05
            var radius, height
            switch (objectType) {
                case 1:
                    // Sphere
                    radius = 1 + Math.random() * objectSize
                    threeObject = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(radius, 20, 20), this.createObjectMaterial())
                    shape = new Ammo.btSphereShape(radius)
                    shape.setMargin(margin)
                    break
                case 2:
                    // Box
                    var sx = 1 + Math.random() * objectSize
                    var sy = 1 + Math.random() * objectSize
                    var sz = 1 + Math.random() * objectSize
                    threeObject = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), this.createObjectMaterial())
                    shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
                    shape.setMargin(margin)
                    break
                case 3:
                    // Cylinder
                    radius = 1 + Math.random() * objectSize
                    height = 1 + Math.random() * objectSize
                    threeObject = new this.$THREE.Mesh(new this.$THREE.CylinderBufferGeometry(radius, radius, height, 20, 1), this.createObjectMaterial())
                    shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius))
                    shape.setMargin(margin)
                    break
                default:
                    // Cone
                    radius = 1 + Math.random() * objectSize
                    height = 2 + Math.random() * objectSize
                    threeObject = new this.$THREE.Mesh(new this.$THREE.ConeBufferGeometry(radius, height, 20, 2), this.createObjectMaterial())
                    shape = new Ammo.btConeShape(radius, height)
                    break
            }
            threeObject.position.set((Math.random() - 0.5) * this.terrainWidth * 0.6, this.terrainMaxHeight + objectSize + 2, (Math.random() - 0.5) * this.terrainDepth * 0.6)
            var mass = objectSize * 5
            var localInertia = new Ammo.btVector3(0, 0, 0)
            shape.calculateLocalInertia(mass, localInertia)
            var transform = new Ammo.btTransform()
            transform.setIdentity()
            var pos = threeObject.position
            transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
            var motionState = new Ammo.btDefaultMotionState(transform)
            var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
            var body = new Ammo.btRigidBody(rbInfo)
            threeObject.userData.physicsBody = body
            threeObject.receiveShadow = true
            threeObject.castShadow = true
            this.scene.add(threeObject)
            this.dynamicObjects.push(threeObject)
            this.physicsWorld.addRigidBody(body)
        },
        createObjectMaterial() {
            var c = Math.floor(Math.random() * (1 << 24))
            return new this.$THREE.MeshPhongMaterial({ color: c })
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            var deltaTime = this.clock.getDelta()
            if (this.dynamicObjects.length < this.maxNumObjects && this.time > this.timeNextSpawn) {
                this.generateObject()
                this.timeNextSpawn = this.time + this.objectTimePeriod
            }
            this.updatePhysics(deltaTime)
            this.renderer.render(this.scene, this.camera)
            this.time += deltaTime
        },
        updatePhysics(deltaTime) {
            this.physicsWorld.stepSimulation(deltaTime, 10)
            // Update objects
            for (var i = 0, il = this.dynamicObjects.length; i < il; i ++) {
                var objThree = this.dynamicObjects[ i ]
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
.physicsAmmoTerrain-container {
    position: relative;
    width: 100%;
    color: #333;
}
</style>
