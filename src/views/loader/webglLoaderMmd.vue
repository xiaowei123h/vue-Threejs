<template>
    <div class="webglLoaderMmd-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - MMDLoader test<br />
            <a href="https://github.com/mrdoob/three.js/tree/master/examples/models/mmd#readme" target="_blank" rel="noopener">MMD Assets license</a><br />
            Copyright
            <a href="https://sites.google.com/view/evpvp/" target="_blank" rel="noopener">Model Data</a>
            <a href="http://www.nicovideo.jp/watch/sm13147122" target="_blank" rel="noopener">Dance Data</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OutlineEffect } from '@/components/jsm/effects/OutlineEffect.js'
import { MMDLoader } from '@/components/jsm/loaders/MMDLoader.js'
import { MMDAnimationHelper } from '@/components/jsm/animation/MMDAnimationHelper.js'
export default {
    data() {
        return {
            gui: null,
            stats: null,
            mesh: null,
            camera: null,
            scene: null,
            renderer: null,
            effect: null,
            helper: null,
            ikHelper: null,
            physicsHelper: null,
			clock: null,
        }
    },
    mounted() {
        this.clock = new this.$moduleTHREE.Clock()
        Ammo().then((AmmoLib) => {
            Ammo = AmmoLib
            this.init()
            this.animate()
        })
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.createElement('div')
            document.getElementsByClassName('webglLoaderMmd-container')[0].appendChild(container)
            this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 30
            // scene
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0xffffff)
            var gridHelper = new this.$moduleTHREE.PolarGridHelper(30, 10)
            gridHelper.position.y = - 10
            this.scene.add(gridHelper)
            var ambient = new this.$moduleTHREE.AmbientLight(0x666666)
            this.scene.add(ambient)
            var directionalLight = new this.$moduleTHREE.DirectionalLight(0x887766)
            directionalLight.position.set(- 1, 1, 1).normalize()
            this.scene.add(directionalLight)
            //
            this.renderer = new this.$moduleTHREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            container.appendChild(this.renderer.domElement)
            this.effect = new OutlineEffect(this.renderer)
            // STATS
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            container.appendChild(this.stats.dom)
            // model
            function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100
                    console.log(Math.round(percentComplete, 2) + '% downloaded')
                }
            }
            var modelFile = 'static/models/mmd/miku/miku_v2.pmd'
            var vmdFiles = [ 'static/models/mmd/vmds/wavefile_v2.vmd' ]
            this.helper = new MMDAnimationHelper({
                afterglow: 2.0
            })
            var loader = new MMDLoader()
            var that = this
            loader.loadWithAnimation(modelFile, vmdFiles, function (mmd) {
                that.mesh = mmd.mesh
                that.mesh.position.y = - 10
                that.scene.add(that.mesh)
                that.helper.add(that.mesh, {
                    animation: mmd.animation,
                    physics: true
                })
                that.ikHelper = that.helper.objects.get(that.mesh).ikSolver.createHelper()
                that.ikHelper.visible = false
                that.scene.add(that.ikHelper)
                that.physicsHelper = that.helper.objects.get(that.mesh).physics.createHelper()
                that.physicsHelper.visible = false
                that.scene.add(that.physicsHelper)
                initGui()
            }, onProgress, null)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 10
            controls.maxDistance = 100
            window.addEventListener('resize', this.onWindowResize, false)
            function initGui() {
                var api = {
                    'animation': true,
                    'ik': true,
                    'outline': true,
                    'physics': true,
                    'show IK bones': false,
                    'show rigid bodies': false
                }
                that.gui = new GUI()
                that.gui.add(api, 'animation').onChange(() => {
                    that.helper.enable('animation', api[ 'animation' ])
                })
                that.gui.add(api, 'ik').onChange(() => {
                    that.helper.enable('ik', api[ 'ik' ])
                })
                that.gui.add(api, 'outline').onChange(() => {
                    that.effect.enabled = api[ 'outline' ]
                })
                that.gui.add(api, 'physics').onChange(() => {
                    that.helper.enable('physics', api[ 'physics' ])
                })
                that.gui.add(api, 'show IK bones').onChange(() => {
                    that.ikHelper.visible = api[ 'show IK bones' ]
                })
                that.gui.add(api, 'show rigid bodies').onChange(() => {
                    if (that.physicsHelper !== undefined) that.physicsHelper.visible = api[ 'show rigid bodies' ]
                })
            }
        },
        onWindowResize() {
            this.camera.aspect = (window.innerWidth - 281) / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.effect.setSize(window.innerWidth - 281, window.innerHeight)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.stats.begin()
            this.render()
            this.stats.end()
        },
        render() {
            this.helper.update(this.clock.getDelta())
            this.effect.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderMmd-container {
    position: relative;
    width: 100%;
    background-color: #fff;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
