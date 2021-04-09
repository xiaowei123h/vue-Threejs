<template>
    <div class="webglLightsHemisphere-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl hemisphere light example<br/>
			flamingo by <a href="https://mirada.com/" target="_blank" rel="noopener">mirada</a> from <a href="http://www.ro.me" target="_blank" rel="noopener">ro.me</a><br/><br/>
			<el-button type="primary" size="mini" @click="handleHemisphere">toggle hemisphere light</el-button>
			<el-button type="primary" size="mini" @click="handleDirectional">toggle directional light</el-button>
		</div>
    </div>
</template>

<script>
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            vertexShader: null,
            fragmentShader: null,
            camera: null,
            scene: null,
            renderer: null,
			mixers: [],
			stats: null,
            clock: null,
            hemiLight: null,
            hemiLightHelper: null,
            dirLight: null,
            dirLightHelper: null
        }
    },
    mounted() {
        this.vertexShader = `
            varying vec3 vWorldPosition;

			void main() {

				vec4 worldPosition = modelMatrix * vec4(position, 1.0);
				vWorldPosition = worldPosition.xyz;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            }`
        this.fragmentShader = `
            uniform vec3 topColor;
			uniform vec3 bottomColor;
			uniform float offset;
			uniform float exponent;

			varying vec3 vWorldPosition;

			void main() {

				float h = normalize(vWorldPosition + offset).y;
				gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h , 0.0), exponent), 0.0)), 1.0);

            }`
        this.clock = new this.$THREE.Clock()
        this.init()
        this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(30, this.$webglInnerWidth / window.innerHeight, 1, 5000)
            this.camera.position.set(0, 0, 250)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color().setHSL(0.6, 0, 1)
            this.scene.fog = new this.$THREE.Fog(this.scene.background, 1, 5000)
            // LIGHTS
            this.hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
            this.hemiLight.color.setHSL(0.6, 1, 0.6)
            this.hemiLight.groundColor.setHSL(0.095, 1, 0.75)
            this.hemiLight.position.set(0, 50, 0)
            this.scene.add(this.hemiLight)
            this.hemiLightHelper = new this.$THREE.HemisphereLightHelper(this.hemiLight, 10)
            this.scene.add(this.hemiLightHelper)
            //
            this.dirLight = new this.$THREE.DirectionalLight(0xffffff, 1)
            this.dirLight.color.setHSL(0.1, 1, 0.95)
            this.dirLight.position.set(- 1, 1.75, 1)
            this.dirLight.position.multiplyScalar(30)
            this.scene.add(this.dirLight)
            this.dirLight.castShadow = true
            this.dirLight.shadow.mapSize.width = 2048
            this.dirLight.shadow.mapSize.height = 2048
            var d = 50
            this.dirLight.shadow.camera.left = - d
            this.dirLight.shadow.camera.right = d
            this.dirLight.shadow.camera.top = d
            this.dirLight.shadow.camera.bottom = - d
            this.dirLight.shadow.camera.far = 3500
            this.dirLight.shadow.bias = - 0.0001
            this.dirLightHelper = new this.$THREE.DirectionalLightHelper(this.dirLight, 10)
            this.scene.add(this.dirLightHelper)
            // GROUND
            var groundGeo = new this.$THREE.PlaneBufferGeometry(10000, 10000)
            var groundMat = new this.$THREE.MeshLambertMaterial({ color: 0xffffff })
            groundMat.color.setHSL(0.095, 1, 0.75)
            var ground = new this.$THREE.Mesh(groundGeo, groundMat)
            ground.position.y = - 33
            ground.rotation.x = - Math.PI / 2
            ground.receiveShadow = true
            this.scene.add(ground)
            // SKYDOME
            var vertexShader = this.vertexShader
            var fragmentShader = this.fragmentShader
            var uniforms = {
                "topColor": { value: new this.$THREE.Color(0x0077ff) },
                "bottomColor": { value: new this.$THREE.Color(0xffffff) },
                "offset": { value: 33 },
                "exponent": { value: 0.6 }
            }
            uniforms[ "topColor" ].value.copy(this.hemiLight.color)
            this.scene.fog.color.copy(uniforms[ "bottomColor" ].value)
            var skyGeo = new this.$THREE.SphereBufferGeometry(4000, 32, 15)
            var skyMat = new this.$THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: this.$THREE.BackSide
            })
            var sky = new this.$THREE.Mesh(skyGeo, skyMat)
            this.scene.add(sky)
            // MODEL
            var loader = new GLTFLoader()
            loader.load('static/models/gltf/Flamingo.glb', (gltf) => {
                var mesh = gltf.scene.children[ 0 ]
                var s = 0.35
                mesh.scale.set(s, s, s)
                mesh.position.y = 15
                mesh.rotation.y = - 1
                mesh.castShadow = true
                mesh.receiveShadow = true
                this.scene.add(mesh)
                var mixer = new this.$THREE.AnimationMixer(mesh)
                mixer.clipAction(gltf.animations[ 0 ]).setDuration(1).play()
                this.mixers.push(mixer)
            })
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            // STATS
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        handleHemisphere() {
            this.hemiLight.visible = ! this.hemiLight.visible
            this.hemiLightHelper.visible = ! this.hemiLightHelper.visible
        },
        handleDirectional() {
            this.dirLight.visible = ! this.dirLight.visible
            this.dirLightHelper.visible = ! this.dirLightHelper.visible
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
            var delta = this.clock.getDelta()
            for (var i = 0; i < this.mixers.length; i ++) {
                this.mixers[ i ].update(delta)
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLightsHemisphere-container {
    position: relative;
    width: 100%;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
