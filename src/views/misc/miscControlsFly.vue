<template>
    <div class="miscControlsFly-container">
        <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - earth [fly controls]<br/>
		    <b>WASD</b> move, <b>R|F</b> up | down, <b>Q|E</b> roll, <b>up|down</b> pitch, <b>left|right</b> yaw
		</div>
    </div>
</template>

<script>
import { FlyControls } from '@/components/jsm/controls/FlyControls.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { FilmPass } from '@/components/jsm/postprocessing/FilmPass.js'
export default {
    data() {
        return {
            radius: 6371,
			tilt: 0.41,
			rotationSpeed: 0.02,
			cloudsScale: 1.005,
			moonScale: 0.23,
			MARGIN: 0,
			SCREEN_HEIGHT: null,
			SCREEN_WIDTH: null,
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            stats: null,
            geometry: null,
            meshPlanet: null,
            meshClouds: null,
            meshMoon: null,
			dirLight: null,
			composer: null,
			textureLoader: null,
            d: null,
            dPlanet: null,
            dMoon: null,
			dMoonVec: null,
			clock: null,
        }
    },
    mounted() {
        this.SCREEN_HEIGHT = window.innerHeight - this.MARGIN * 2
        this.SCREEN_WIDTH = this.$webglInnerWidth
        this.textureLoader = new this.$THREE.TextureLoader()
        this.dMoonVec = new this.$THREE.Vector3()
        this.clock = new this.$THREE.Clock()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(25, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 50, 1e7)
            this.camera.position.z = this.radius * 5
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.FogExp2(0x000000, 0.00000025)
            this.dirLight = new this.$THREE.DirectionalLight(0xffffff)
            this.dirLight.position.set(- 1, 0, 1).normalize()
            this.scene.add(this.dirLight)
            var materialNormalMap = new this.$THREE.MeshPhongMaterial({
                specular: 0x333333,
                shininess: 15,
                map: this.textureLoader.load("static/textures/planets/earth_atmos_2048.jpg"),
                specularMap: this.textureLoader.load("static/textures/planets/earth_specular_2048.jpg"),
                normalMap: this.textureLoader.load("static/textures/planets/earth_normal_2048.jpg"),
                // y scale is negated to compensate for normal map handedness.
                normalScale: new this.$THREE.Vector2(0.85, - 0.85)
            })
            // planet
            this.geometry = new this.$THREE.SphereBufferGeometry(this.radius, 100, 50)
            this.meshPlanet = new this.$THREE.Mesh(this.geometry, materialNormalMap)
            this.meshPlanet.rotation.y = 0
            this.meshPlanet.rotation.z = this.tilt
            this.scene.add(this.meshPlanet)
            // clouds
            var materialClouds = new this.$THREE.MeshLambertMaterial({
                map: this.textureLoader.load("static/textures/planets/earth_clouds_1024.png"),
                transparent: true
            })
            this.meshClouds = new this.$THREE.Mesh(this.geometry, materialClouds)
            this.meshClouds.scale.set(this.cloudsScale, this.cloudsScale, this.cloudsScale)
            this.meshClouds.rotation.z = this.tilt
            this.scene.add(this.meshClouds)
            // moon
            var materialMoon = new this.$THREE.MeshPhongMaterial({
                map: this.textureLoader.load("static/textures/planets/moon_1024.jpg")
            })
            this.meshMoon = new this.$THREE.Mesh(this.geometry, materialMoon)
            this.meshMoon.position.set(this.radius * 5, 0, 0)
            this.meshMoon.scale.set(this.moonScale, this.moonScale, this.moonScale)
            this.scene.add(this.meshMoon)
            // stars
            var r = this.radius, starsGeometry = [ new this.$THREE.BufferGeometry(), new this.$THREE.BufferGeometry() ]
            var vertices1 = []
            var vertices2 = []
            var vertex = new this.$THREE.Vector3()
            for (var i = 0; i < 250; i ++) {
                vertex.x = Math.random() * 2 - 1
                vertex.y = Math.random() * 2 - 1
                vertex.z = Math.random() * 2 - 1
                vertex.multiplyScalar(r)
                vertices1.push(vertex.x, vertex.y, vertex.z)
            }
            for (var i = 0; i < 1500; i ++) {
                vertex.x = Math.random() * 2 - 1
                vertex.y = Math.random() * 2 - 1
                vertex.z = Math.random() * 2 - 1
                vertex.multiplyScalar(r)
                vertices2.push(vertex.x, vertex.y, vertex.z)
            }
            starsGeometry[ 0 ].setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices1, 3))
            starsGeometry[ 1 ].setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices2, 3))
            var starsMaterials = [
                new this.$THREE.PointsMaterial({ color: 0x555555, size: 2, sizeAttenuation: false }),
                new this.$THREE.PointsMaterial({ color: 0x555555, size: 1, sizeAttenuation: false }),
                new this.$THREE.PointsMaterial({ color: 0x333333, size: 2, sizeAttenuation: false }),
                new this.$THREE.PointsMaterial({ color: 0x3a3a3a, size: 1, sizeAttenuation: false }),
                new this.$THREE.PointsMaterial({ color: 0x1a1a1a, size: 2, sizeAttenuation: false }),
                new this.$THREE.PointsMaterial({ color: 0x1a1a1a, size: 1, sizeAttenuation: false })
            ]
            for (var i = 10; i < 30; i ++) {
                var stars = new this.$THREE.Points(starsGeometry[ i % 2 ], starsMaterials[ i % 6 ])
                stars.rotation.x = Math.random() * 6
                stars.rotation.y = Math.random() * 6
                stars.rotation.z = Math.random() * 6
                stars.scale.setScalar(i * 10)
                stars.matrixAutoUpdate = false
                stars.updateMatrix()
                this.scene.add(stars)
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
            document.getElementsByClassName('miscControlsFly-container')[0].appendChild(this.renderer.domElement)
            //
            this.controls = new FlyControls(this.camera, this.renderer.domElement)
            this.controls.movementSpeed = 1000
            this.controls.domElement = this.renderer.domElement
            this.controls.rollSpeed = Math.PI / 24
            this.controls.autoForward = false
            this.controls.dragToLook = false
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('miscControlsFly-container')[0].appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize, false)
            // postprocessing
            var renderModel = new RenderPass(this.scene, this.camera)
            var effectFilm = new FilmPass(0.35, 0.75, 2048, false)
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(renderModel)
            this.composer.addPass(effectFilm)
        },
        onWindowResize() {
            this.SCREEN_HEIGHT = window.innerHeight
            this.SCREEN_WIDTH = window.innerWidth - 281
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.composer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            // rotate the planet and clouds
            var delta = this.clock.getDelta()
            this.meshPlanet.rotation.y += this.rotationSpeed * delta
            this.meshClouds.rotation.y += 1.25 * this.rotationSpeed * delta
            // slow down as we approach the surface
            this.dPlanet = this.camera.position.length()
            this.dMoonVec.subVectors(this.camera.position, this.meshMoon.position)
            this.dMoon = this.dMoonVec.length()
            if (this.dMoon < this.dPlanet) {
                this.d = (this.dMoon - this.radius * moonScale * 1.01)
            } else {
                this.d = (this.dPlanet - this.radius * 1.01)
            }
            this.controls.movementSpeed = 0.33 * this.d
            this.controls.update(delta)
            this.composer.render(delta)
        }
    },
}
</script>

<style scoped>
.miscControlsFly-container {
    position: relative;
    width: 100%;
}
#info {
    background:#000;
    color: #eee;
}
#info a {
    color: #0080ff;
}
#info b {
    color: orange
}
</style>
