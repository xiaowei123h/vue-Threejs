<template>
    <div class="webglDecals-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - decal splatter<br/>
			click to shoot
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { DecalGeometry } from '@/components/jsm/geometries/DecalGeometry.js'
export default {
    data() {
        return {
            container: null,
            renderer: null,
            scene: null,camera: null,
            stats: null,
			mesh: null,
			raycaster: null,
			line: null,
			intersection: null,
			mouse: null,
			intersects: [],
			textureLoader: null,
			decalDiffuse: null,
			decalNormal: null,
			decalMaterial: null,
			decals: [],
			mouseHelper: null,
			position: null,
			orientation: null,
			size: null,
            params: null,
            gui: null
        }
    },
    mounted() {
        this.container = document.getElementById('container')
        this.intersection = {
            intersects: false,
            point: new this.$THREE.Vector3(),
            normal: new this.$THREE.Vector3()
        }
        this.mouse = new this.$THREE.Vector2()
        this.textureLoader = new this.$THREE.TextureLoader()
        this.decalDiffuse = this.textureLoader.load('static/textures/decal/decal-diffuse.png')
        this.decalNormal = this.textureLoader.load('static/textures/decal/decal-normal.jpg')
        this.decalMaterial = new this.$THREE.MeshPhongMaterial({
            specular: 0x444444,
            map: this.decalDiffuse,
            normalMap: this.decalNormal,
            normalScale: new this.$THREE.Vector2(1, 1),
            shininess: 30,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: - 4,
            wireframe: false
        })
        this.position = new this.$THREE.Vector3()
        this.orientation = new this.$THREE.Euler()
        this.size = new this.$THREE.Vector3(10, 10, 10)
        this.params = {
            minScale: 10,
            maxScale: 20,
            rotate: true,
            clear: () => {
                this.removeDecals()
            }
        }
        this.init()
        // window.addEventListener('load', this.init)
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            this.container.appendChild(this.stats.dom)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 120
            this.camera.target = new this.$THREE.Vector3()
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 50
            controls.maxDistance = 200
            this.scene.add(new this.$THREE.AmbientLight(0x443333))
            var dirLight1 = new this.$THREE.DirectionalLight(0xffddcc, 1)
            dirLight1.position.set(1, 0.75, 0.5)
            this.scene.add(dirLight1)
            var dirLight2 = new this.$THREE.DirectionalLight(0xccccff, 1)
            dirLight2.position.set(- 1, 0.75, - 0.5)
            this.scene.add(dirLight2)
            var geometry = new this.$THREE.BufferGeometry()
            geometry.setFromPoints([new this.$THREE.Vector3(), new this.$THREE.Vector3()])
            this.line = new this.$THREE.Line(geometry, new this.$THREE.LineBasicMaterial())
            this.scene.add(this.line)
            this.loadLeePerrySmith()
            this.raycaster = new this.$THREE.Raycaster()
            this.mouseHelper = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(1, 1, 10), new this.$THREE.MeshNormalMaterial())
            this.mouseHelper.visible = false
            this.scene.add(this.mouseHelper)
            window.addEventListener('resize', this.onWindowResize, false)
            var moved = false
            controls.addEventListener('change', () => {
                moved = true
            })
            window.addEventListener('pointerdown', () => {
                moved = false
            }, false)
            window.addEventListener('pointerup', (event) => {
                if (moved === false) {
                    checkIntersection(event.clientX, event.clientY)
                    if (this.intersection.intersects) this.shoot()
                }
            })
            window.addEventListener('pointermove', onPointerMove)
            function onPointerMove(event) {
                if (event.isPrimary) {
                    checkIntersection(event.clientX, event.clientY)
                }
            }
            var that = this
            function checkIntersection(x, y) {
                if (that.mesh === undefined) return
                that.mouse.x = ((x - 281) / that.$webglInnerWidth) * 2 - 1
                that.mouse.y = - (y / window.innerHeight) * 2 + 1
                that.raycaster.setFromCamera(that.mouse, that.camera)
                that.raycaster.intersectObject(that.mesh, false, that.intersects)
                if (that.intersects.length > 0) {
                    var p = that.intersects[0].point
                    that.mouseHelper.position.copy(p)
                    that.intersection.point.copy(p)
                    var n = that.intersects[0].face.normal.clone()
                    n.transformDirection(that.mesh.matrixWorld)
                    n.multiplyScalar(10)
                    n.add(that.intersects[0].point)
                    that.intersection.normal.copy(that.intersects[0].face.normal)
                    that.mouseHelper.lookAt(n)
                    var positions = that.line.geometry.attributes.position
                    positions.setXYZ(0, p.x, p.y, p.z)
                    positions.setXYZ(1, n.x, n.y, n.z)
                    positions.needsUpdate = true
                    that.intersection.intersects = true
                    that.intersects.length = 0
                } else {
                    that.intersection.intersects = false
                }
            }
            this.gui = new GUI()
            this.gui.add(this.params, 'minScale', 1, 30)
            this.gui.add(this.params, 'maxScale', 1, 30)
            this.gui.add(this.params, 'rotate')
            this.gui.add(this.params, 'clear')
            this.gui.open()
            this.onWindowResize()
            this.animate()
        },
        loadLeePerrySmith() {
            var that = this
            var loader = new GLTFLoader()
            loader.load('static/models/gltf/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
                that.mesh = gltf.scene.children[0]
                that.mesh.material = new that.$THREE.MeshPhongMaterial({
                    specular: 0x111111,
                    map: that.textureLoader.load('static/models/gltf/LeePerrySmith/Map-COL.jpg'),
                    specularMap: that.textureLoader.load('static/models/gltf/LeePerrySmith/Map-SPEC.jpg'),
                    normalMap: that.textureLoader.load('static/models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg'),
                    shininess: 25
                })
                that.scene.add(that.mesh)
                that.mesh.scale.set(10, 10, 10)
            })
        },
        shoot() {
            this.position.copy(this.intersection.point)
            this.orientation.copy(this.mouseHelper.rotation)
            if (this.params.rotate) this.orientation.z = Math.random() * 2 * Math.PI
            var scale = this.params.minScale + Math.random() * (this.params.maxScale - this.params.minScale)
            this.size.set(scale, scale, scale)
            var material = this.decalMaterial.clone()
            material.color.setHex(Math.random() * 0xffffff)
            var m = new this.$THREE.Mesh(new DecalGeometry(this.mesh, this.position, this.orientation, this.size), material)
            this.decals.push(m)
            this.scene.add(m)
        },
        removeDecals() {
            this.decals.forEach((d) => {
                this.scene.remove(d)
            })
            this.decals.length = 0
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    }
}
</script>

<style scoped>
.webglDecals-container {
    position: relative;
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
