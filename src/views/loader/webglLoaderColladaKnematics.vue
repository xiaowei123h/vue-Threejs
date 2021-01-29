<template>
    <div class="webglLoaderColladaKnematics-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> collada loader - kinematics<br/>
			robot from <a href="https://github.com/rdiankov/collada_robots" target="_blank" rel="noopener">collada robots</a>
		</div>
    </div>
</template>

<script>
import { TWEEN } from '@/components/jsm/libs/tween.module.min.js'
import { ColladaLoader } from '@/components/jsm/loaders/ColladaLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
			particleLight: null,
			dae: null,
			kinematics: null,
			kinematicsTween: null,
			tweenParameters: {},
			loader: null,
        }
    },
    mounted() {
        this.loader = new ColladaLoader()
        // loader.load('./models/collada/kawada-hironx.dae', function (collada) {
        this.loader.load('static/models/collada/abb_irb52_7_120.dae', (collada) => {
            this.dae = collada.scene
            this.dae.traverse(function (child) {
                if (child.isMesh) {
                    // model does not have normals
                    child.material.flatShading = true
                }
            })
            this.dae.scale.x = this.dae.scale.y = this.dae.scale.z = 10.0
            this.dae.updateMatrix()
            this.kinematics = collada.kinematics
            this.init()
            this.animate()
        })
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglLoaderColladaKnematics-container')[0].appendChild(this.container)
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.set(2, 2, 3)
            this.scene = new this.$THREE.Scene()
            // Grid
            var grid = new this.$THREE.GridHelper(20, 20, 0x888888, 0x444444)
            this.scene.add(grid)
            // Add the COLLADA
            this.scene.add(this.dae)
            this.particleLight = new this.$THREE.Mesh(new this.$THREE.SphereBufferGeometry(4, 8, 8), new this.$THREE.MeshBasicMaterial({ color: 0xffffff }))
            this.scene.add(this.particleLight)
            // Lights
            var light = new this.$THREE.HemisphereLight(0xffeeee, 0x111122)
            this.scene.add(light)
            var pointLight = new this.$THREE.PointLight(0xffffff, 0.3)
            this.particleLight.add(pointLight)
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom)
            this.setupTween()
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        setupTween() {
            var duration = this.$THREE.MathUtils.randInt(1000, 5000)
            var target = {}
            for (var prop in this.kinematics.joints) {
                if (this.kinematics.joints.hasOwnProperty(prop)) {
                    if (! this.kinematics.joints[ prop ].static) {
                        var joint = this.kinematics.joints[ prop ]
                        var old = this.tweenParameters[ prop ]
                        var position = old ? old : joint.zeroPosition
                        this.tweenParameters[ prop ] = position
                        target[ prop ] = this.$THREE.MathUtils.randInt(joint.limits.min, joint.limits.max)
                    }
                }
            }
            this.kinematicsTween = new TWEEN.Tween(this.tweenParameters).to(target, duration).easing(TWEEN.Easing.Quadratic.Out)
            this.kinematicsTween.onUpdate((object) => {
                for (var prop in this.kinematics.joints) {
                    if (this.kinematics.joints.hasOwnProperty(prop)) {
                        if (! this.kinematics.joints[ prop ].static) {
                            this.kinematics.setJointValue(prop, object[ prop ])
                        }
                    }
                }
            })
            this.kinematicsTween.start()
            setTimeout(this.setupTween, duration)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
            TWEEN.update()
        },
        render() {
            var timer = Date.now() * 0.0001
            this.camera.position.x = Math.cos(timer) * 20
            this.camera.position.y = 10
            this.camera.position.z = Math.sin(timer) * 20
            this.camera.lookAt(0, 5, 0)
            this.particleLight.position.x = Math.sin(timer * 4) * 3009
            this.particleLight.position.y = Math.cos(timer * 5) * 4000
            this.particleLight.position.z = Math.cos(timer * 4) * 3009
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderColladaKnematics-container {
    width: 100%;
}
</style>
