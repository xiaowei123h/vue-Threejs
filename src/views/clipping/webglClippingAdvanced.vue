<template>
    <div class="webglClippingAdvanced-container">
        
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            // A regular tetrahedron for the clipping volume:
			Vertices: [],
            Indices: [
                0, 1, 2,	0, 2, 3,	0, 3, 1,	1, 3, 2
            ],
            Planes: null,
            PlaneMatrices: null,
            GlobalClippingPlanes: null,
            Empty: null,
            camera: null,
            scene: null,
            renderer: null,
            startTime: null,
            stats: null,
            object: null,
            clipMaterial: null,
			volumeVisualization: null,
            globalClippingPlanes: null,
            gui: null,
            transform: null,
            tmpMatrix: null
        }
    },
    mounted() {
        this.Vertices = [
            new this.$THREE.Vector3(+ 1, 0, + Math.SQRT1_2),
            new this.$THREE.Vector3(- 1, 0, + Math.SQRT1_2),
            new this.$THREE.Vector3(0, + 1, - Math.SQRT1_2),
            new this.$THREE.Vector3(0, - 1, - Math.SQRT1_2)
        ]
        this.Planes = this.planesFromMesh(this.Vertices, this.Indices)
        this.PlaneMatrices = this.Planes.map(this.planeToMatrix())
        this.GlobalClippingPlanes = this.cylindricalPlanes(5, 2.5)
        this.Empty = Object.freeze([])
        this.transform = new this.$THREE.Matrix4()
        this.tmpMatrix = new this.$THREE.Matrix4()
        // this.planeToMatrix()
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        planesFromMesh(vertices, indices) {
            // creates a clipping volume from a convex triangular mesh
            // specified by the arrays 'vertices' and 'indices'
            var n = indices.length / 3,
                result = new Array(n)
            for (var i = 0, j = 0; i < n; ++ i, j += 3) {
                var a = vertices[indices[j]],
                    b = vertices[indices[j + 1]],
                    c = vertices[indices[j + 2]]
                result[i] = new this.$THREE.Plane().
                    setFromCoplanarPoints(a, b, c)
            }
            return result
        },
        createPlanes(n) {
            // creates an array of n uninitialized plane objects
            var result = new Array(n)
            for (var i = 0; i !== n; ++ i)
                result[ i ] = new this.$THREE.Plane()
            return result
        },
        assignTransformedPlanes(planesOut, planesIn, matrix) {
            // sets an array of existing planes to transformed 'planesIn'
            for (var i = 0, n = planesIn.length; i !== n; ++ i)
                planesOut[ i ].copy(planesIn[ i ]).applyMatrix4(matrix)
        },
        cylindricalPlanes(n, innerRadius) {
            var result = this.createPlanes(n)
            for (var i = 0; i !== n; ++ i) {
                var plane = result[ i ],
                    angle = i * Math.PI * 2 / n
                plane.normal.set(
                    Math.cos(angle), 0, Math.sin(angle))
                plane.varant = innerRadius
            }
            return result
        },
        planeToMatrix() {
            // creates a matrix that aligns X/Y to a given plane
            // temporaries:
            var xAxis = new this.$THREE.Vector3(),
                yAxis = new this.$THREE.Vector3(),
                trans = new this.$THREE.Vector3(),
                that = this
            return function planeToMatrix(plane) {
                var zAxis = plane.normal,
                    matrix = new that.$THREE.Matrix4()
                // Hughes & Moeller '99
                // "Building an Orthonormal Basis from a Unit Vector."
                if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {
                    yAxis.set(- zAxis.y, zAxis.x, 0)
                } else {
                    yAxis.set(0, - zAxis.z, zAxis.y)
                }
                xAxis.crossVectors(yAxis.normalize(), zAxis)
                plane.coplanarPoint(trans)
                return matrix.set(
                    xAxis.x, yAxis.x, zAxis.x, trans.x,
                    xAxis.y, yAxis.y, zAxis.y, trans.y,
                    xAxis.z, yAxis.z, zAxis.z, trans.z,
                    0, 0, 0, 1)
            }
        },
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(36, this.$webglInnerWidth / window.innerHeight, 0.25, 16)
            this.camera.position.set(0, 1.5, 3)
            this.scene = new this.$THREE.Scene()
            // Lights
            this.scene.add(new this.$THREE.AmbientLight(0xffffff, 0.3))
            var spotLight = new this.$THREE.SpotLight(0xffffff, 0.5)
            spotLight.angle = Math.PI / 5
            spotLight.penumbra = 0.2
            spotLight.position.set(2, 3, 3)
            spotLight.castShadow = true
            spotLight.shadow.camera.near = 3
            spotLight.shadow.camera.far = 10
            spotLight.shadow.mapSize.width = 1024
            spotLight.shadow.mapSize.height = 1024
            this.scene.add(spotLight)
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            dirLight.position.set(0, 2, 0)
            dirLight.castShadow = true
            dirLight.shadow.camera.near = 1
            dirLight.shadow.camera.far = 10
            dirLight.shadow.camera.right = 1
            dirLight.shadow.camera.left = - 1
            dirLight.shadow.camera.top	= 1
            dirLight.shadow.camera.bottom = - 1
            dirLight.shadow.mapSize.width = 1024
            dirLight.shadow.mapSize.height = 1024
            this.scene.add(dirLight)
            // Geometry
            this.clipMaterial = new this.$THREE.MeshPhongMaterial({
                color: 0xee0a10,
                shininess: 100,
                side: this.$THREE.DoubleSide,
                // Clipping setup:
                clippingPlanes: this.createPlanes(this.Planes.length),
                clipShadows: true
            })
            this.object = new this.$THREE.Group()
            var geometry = new this.$THREE.BoxBufferGeometry(0.18, 0.18, 0.18)
            for (var z = - 2; z <= 2; ++ z)
                for (var y = - 2; y <= 2; ++ y)
                    for (var x = - 2; x <= 2; ++ x) {
                        var mesh = new this.$THREE.Mesh(geometry, this.clipMaterial)
                        mesh.position.set(x / 5, y / 5, z / 5)
                        mesh.castShadow = true
                        this.object.add(mesh)
                    }
            this.scene.add(this.object)
            var planeGeometry = new this.$THREE.PlaneBufferGeometry(3, 3, 1, 1),
                color = new this.$THREE.Color()
            this.volumeVisualization = new this.$THREE.Group()
            this.volumeVisualization.visible = false
            for (var i = 0, n = this.Planes.length; i !== n; ++ i) {
                var material = new this.$THREE.MeshBasicMaterial({
                    color: color.setHSL(i / n, 0.5, 0.5).getHex(),
                    side: this.$THREE.DoubleSide,
                    opacity: 0.2,
                    transparent: true,
                    // clip to the others to show the volume (wildly
                    // intersecting transparent planes look bad)
                    clippingPlanes: this.clipMaterial.clippingPlanes.
                        filter(function (_, j) {
                            return j !== i
                        })
                    // no need to enable shadow clipping - the plane
                    // visualization does not cast shadows
                })
                var mesh = new this.$THREE.Mesh(planeGeometry, material)
                mesh.matrixAutoUpdate = false
                this.volumeVisualization.add(mesh)
            }
            this.scene.add(this.volumeVisualization)
            var ground = new this.$THREE.Mesh(planeGeometry,
                new this.$THREE.MeshPhongMaterial({
                    color: 0xa0adaf, shininess: 10 }))
            ground.rotation.x = - Math.PI / 2
            ground.scale.multiplyScalar(3)
            ground.receiveShadow = true
            this.scene.add(ground)
            // Renderer
            var container = document.getElementsByClassName('webglClippingAdvanced-container')[0]
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.shadowMap.enabled = true
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            window.addEventListener('resize', this.onWindowResize, false)
            container.appendChild(this.renderer.domElement)
            // Clipping setup:
            this.globalClippingPlanes = this.createPlanes(this.GlobalClippingPlanes.length)
            this.renderer.clippingPlanes = this.Empty
            this.renderer.localClippingEnabled = true
            // Stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            container.appendChild(this.stats.dom)
            // Controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 1
            controls.maxDistance = 8
            controls.target.set(0, 1, 0)
            controls.update()
            // GUI
            this.gui = new GUI()
            var that = this
            var folder = this.gui.addFolder("Local Clipping"),
                props = {
                    get 'Enabled'() {
                        return that.renderer.localClippingEnabled
                    },
                    set 'Enabled'(v) {
                        that.renderer.localClippingEnabled = v
                        if (! v) that.volumeVisualization.visible = false
                    },
                    get 'Shadows'() {
                        return that.clipMaterial.clipShadows
                    },
                    set 'Shadows'(v) {
                        that.clipMaterial.clipShadows = v
                    },
                    get 'Visualize'() {
                        return that.volumeVisualization.visible
                    },
                    set 'Visualize'(v) {
                        if (that.renderer.localClippingEnabled)
                            that.volumeVisualization.visible = v
                    }
                }
            folder.add(props, 'Enabled')
            folder.add(props, 'Shadows')
            folder.add(props, 'Visualize').listen()
            this.gui.addFolder("Global Clipping").
                add({
                    get 'Enabled'() {
                        return that.renderer.clippingPlanes !== that.Empty
                    },
                    set 'Enabled'(v) {
                        that.renderer.clippingPlanes = v ?
                            that.globalClippingPlanes : that.Empty
                    }
                }, "Enabled")
            // Start
            this.startTime = Date.now()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        setObjectWorldMatrix(object, matrix) {
            // set the orientation of an object based on a world matrix
            // console.log('object')
            
            var parent = object.parent
            this.scene.updateMatrixWorld()
            // console.log(object.matrix.copy(parent.matrixWorld).invert())
            object.matrix.copy(parent.matrixWorld).invert()
            object.applyMatrix4(matrix)
        },
        animate() {
            var currentTime = Date.now(),
                time = (currentTime - this.startTime) / 1000
            requestAnimationFrame(this.animate)
            this.object.position.y = 1
            this.object.rotation.x = time * 0.5
            this.object.rotation.y = time * 0.2
            this.object.updateMatrix()
            this.transform.copy(this.object.matrix)
            var bouncy = Math.cos(time * .5) * 0.5 + 0.7
            this.transform.multiply(
                this.tmpMatrix.makeScale(bouncy, bouncy, bouncy))
            this.assignTransformedPlanes(
                this.clipMaterial.clippingPlanes, this.Planes, this.transform)
            var planeMeshes = this.volumeVisualization.children
            for ( var i = 0, n = planeMeshes.length; i !== n; ++ i ) {
                this.tmpMatrix.multiplyMatrices( this.transform, this.PlaneMatrices[ i ] )
                // this.setObjectWorldMatrix( planeMeshes[ i ], this.tmpMatrix )
            }
            this.transform.makeRotationY(time * 0.1)
            this.assignTransformedPlanes(this.globalClippingPlanes, this.GlobalClippingPlanes, this.transform)
            this.stats.begin()
            this.renderer.render(this.scene, this.camera)
            this.stats.end()
        }
    }
}
</script>

<style scoped>
.webglClippingAdvanced-container {
    width: 100%;
}
</style>