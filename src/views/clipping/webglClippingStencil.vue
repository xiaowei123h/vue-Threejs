<template>
    <div class="webglClippingStencil-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - solid geometry with clip planes and stencil materials</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            object: null,
            stats: null,
            planes: null,
            planeObjects: null,
            planeHelpers: null,
			clock: null,
			params: {
				animate: true,
				planeX: {
					varant: 0,
					negated: false,
					displayHelper: false
				},
				planeY: {
					varant: 0,
					negated: false,
					displayHelper: false
				},
				planeZ: {
					varant: 0,
					negated: false,
					displayHelper: false
				}
            },
            gui: null
        }
    },
    mounted() {
        this.init()
        this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        createPlaneStencilGroup(geometry, plane, renderOrder) {
            var group = new this.$THREE.Group()
            var baseMat = new this.$THREE.MeshBasicMaterial()
            baseMat.depthWrite = false
            baseMat.depthTest = false
            baseMat.colorWrite = false
            baseMat.stencilWrite = true
            baseMat.stencilFunc = this.$THREE.AlwaysStencilFunc
            // back faces
            var mat0 = baseMat.clone()
            mat0.side = this.$THREE.BackSide
            mat0.clippingPlanes = [ plane ]
            mat0.stencilFail = this.$THREE.IncrementWrapStencilOp
            mat0.stencilZFail = this.$THREE.IncrementWrapStencilOp
            mat0.stencilZPass = this.$THREE.IncrementWrapStencilOp
            var mesh0 = new this.$THREE.Mesh(geometry, mat0)
            mesh0.renderOrder = renderOrder
            group.add(mesh0)
            // front faces
            var mat1 = baseMat.clone()
            mat1.side = this.$THREE.FrontSide
            mat1.clippingPlanes = [ plane ]
            mat1.stencilFail = this.$THREE.DecrementWrapStencilOp
            mat1.stencilZFail = this.$THREE.DecrementWrapStencilOp
            mat1.stencilZPass = this.$THREE.DecrementWrapStencilOp
            var mesh1 = new this.$THREE.Mesh(geometry, mat1)
            mesh1.renderOrder = renderOrder
            group.add(mesh1)
            return group
        },
        init() {
            this.clock = new this.$THREE.Clock()
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(36, this.$webglInnerWidth / window.innerHeight, 1, 100)
            this.camera.position.set(2, 2, 2)
            this.scene.add(new this.$THREE.AmbientLight(0xffffff, 0.5))
            var dirLight = new this.$THREE.DirectionalLight(0xffffff, 1)
            dirLight.position.set(5, 10, 7.5)
            dirLight.castShadow = true
            dirLight.shadow.camera.right = 2
            dirLight.shadow.camera.left = - 2
            dirLight.shadow.camera.top	= 2
            dirLight.shadow.camera.bottom = - 2
            dirLight.shadow.mapSize.width = 1024
            dirLight.shadow.mapSize.height = 1024
            this.scene.add(dirLight)
            this.planes = [
                new this.$THREE.Plane(new this.$THREE.Vector3(- 1, 0, 0), 0),
                new this.$THREE.Plane(new this.$THREE.Vector3(0, - 1, 0), 0),
                new this.$THREE.Plane(new this.$THREE.Vector3(0, 0, - 1), 0)
            ]
            this.planeHelpers = this.planes.map(p => new this.$THREE.PlaneHelper(p, 2, 0xffffff))
            this.planeHelpers.forEach(ph => {
                ph.visible = false
                this.scene.add(ph)
            })
            var geometry = new this.$THREE.TorusKnotBufferGeometry(0.4, 0.15, 220, 60)
            this.object = new this.$THREE.Group()
            this.scene.add(this.object)
            // Set up clip plane rendering
            this.planeObjects = []
            var planeGeom = new this.$THREE.PlaneBufferGeometry(4, 4)
            for (var i = 0; i < 3; i ++) {
                var poGroup = new this.$THREE.Group()
                var plane = this.planes[ i ]
                var stencilGroup = this.createPlaneStencilGroup(geometry, plane, i + 1)
                // plane is clipped by the other clipping this.planes
                var planeMat =
                    new this.$THREE.MeshStandardMaterial({
                        color: 0xE91E63,
                        metalness: 0.1,
                        roughness: 0.75,
                        clippingPlanes: this.planes.filter(p => p !== plane),
                        stencilWrite: true,
                        stencilRef: 0,
                        stencilFunc: this.$THREE.NotEqualStencilFunc,
                        stencilFail: this.$THREE.ReplaceStencilOp,
                        stencilZFail: this.$THREE.ReplaceStencilOp,
                        stencilZPass: this.$THREE.ReplaceStencilOp,
                    })
                var po = new this.$THREE.Mesh(planeGeom, planeMat)
                po.onAfterRender = function (renderer) {
                    renderer.clearStencil()
                }
                po.renderOrder = i + 1.1
                this.object.add(stencilGroup)
                poGroup.add(po)
                this.planeObjects.push(po)
                this.scene.add(poGroup)
            }
            var material = new this.$THREE.MeshStandardMaterial({
                color: 0xFFC107,
                metalness: 0.1,
                roughness: 0.75,
                clippingPlanes: this.planes,
                clipShadows: true,
                shadowSide: this.$THREE.DoubleSide,
            })
            // add the color
            var clippedColorFront = new this.$THREE.Mesh(geometry, material)
            clippedColorFront.castShadow = true
            clippedColorFront.renderOrder = 6
            this.object.add(clippedColorFront)
            var ground = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(9, 9, 1, 1),
                new this.$THREE.ShadowMaterial({ color: 0, opacity: 0.25, side: this.$THREE.DoubleSide })
            )
            ground.rotation.x = - Math.PI / 2 // rotates X/Y to X/Z
            ground.position.y = - 1
            ground.receiveShadow = true
            this.scene.add(ground)
            // Stats
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglClippingStencil-container')[0].appendChild(this.stats.dom)
            // Renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.shadowMap.enabled = true
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setClearColor(0x263238)
            window.addEventListener('resize', this.onWindowResize, false)
            document.getElementsByClassName('webglClippingStencil-container')[0].appendChild(this.renderer.domElement)
            this.renderer.localClippingEnabled = true
            // Controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 2
            controls.maxDistance = 20
            controls.update()
            // GUI
            this.gui = new GUI()
            this.gui.add(this.params, 'animate')
            var planeX = this.gui.addFolder('planeX')
            planeX.add(this.params.planeX, 'displayHelper').onChange(v => this.planeHelpers[ 0 ].visible = v)
            planeX.add(this.params.planeX, 'varant').min(- 1).max(1).onChange(d => this.planes[ 0 ].varant = d)
            planeX.add(this.params.planeX, 'negated').onChange(() => {
                this.planes[ 0 ].negate()
                this.params.planeX.varant = this.planes[ 0 ].varant
            })
            planeX.open()
            var planeY = this.gui.addFolder('planeY')
            planeY.add(this.params.planeY, 'displayHelper').onChange(v => this.planeHelpers[ 1 ].visible = v)
            planeY.add(this.params.planeY, 'varant').min(- 1).max(1).onChange(d => this.planes[ 1 ].varant = d)
            planeY.add(this.params.planeY, 'negated').onChange(() => {
                this.planes[ 1 ].negate()
                this.params.planeY.varant = this.planes[ 1 ].varant
            })
            planeY.open()
            var planeZ = this.gui.addFolder('planeZ')
            planeZ.add(this.params.planeZ, 'displayHelper').onChange(v => this.planeHelpers[ 2 ].visible = v)
            planeZ.add(this.params.planeZ, 'varant').min(- 1).max(1).onChange(d => this.planes[ 2 ].varant = d)
            planeZ.add(this.params.planeZ, 'negated').onChange(() => {
                this.planes[ 2 ].negate()
                this.params.planeZ.varant = this.planes[ 2 ].varant
            })
            planeZ.open()
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            var delta = this.clock.getDelta()
            requestAnimationFrame(this.animate)
            if (this.params.animate) {
                this.object.rotation.x += delta * 0.5
                this.object.rotation.y += delta * 0.2
            }
            for (var i = 0; i < this.planeObjects.length; i ++) {
                var plane = this.planes[ i ]
                var po = this.planeObjects[ i ]
                plane.coplanarPoint(po.position)
                po.lookAt(
                    po.position.x - plane.normal.x,
                    po.position.y - plane.normal.y,
                    po.position.z - plane.normal.z,
            )
            }
            this.stats.begin()
            this.renderer.render(this.scene, this.camera)
            this.stats.end()
        }
    }
}
</script>

<style scoped>
.webglClippingStencil-container {
    position: relative;
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
