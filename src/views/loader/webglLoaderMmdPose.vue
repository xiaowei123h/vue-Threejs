<template>
    <div class="webglLoaderMmdPose-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - MMDLoader test<br />
            <a href="https://github.com/mrdoob/three.js/tree/master/examples/models/mmd#readme" target="_blank" rel="noopener">MMD Assets license</a><br />
            Copyright
            <a href="https://sites.google.com/view/evpvp/" target="_blank" rel="noopener">Model Data</a>
            <a href="http://seiga.nicovideo.jp/seiga/im5162984" target="_blank" rel="noopener">Pose Data</a>
		</div>
    </div>
</template>

<script>
import '@/components/js/libs/ammo.wasm.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OutlineEffect } from '@/components/jsm/effects/OutlineEffect.js'
import { MMDLoader } from '@/components/jsm/loaders/MMDLoader.js'
import { MMDAnimationHelper } from '@/components/jsm/animation/MMDAnimationHelper.js'
export default {
    data() {
        return {
            gui: null,
            camera: null,
            scene: null,
            renderer: null,
            effect: null,
            mesh: null,
            helper: null,
			vpds: []
        }
    },
    mounted() {
        Ammo().then((AmmoLib) => {
            Ammo = AmmoLib;
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
            document.getElementsByClassName('webglLoaderMmdPose-container')[0].appendChild(container)
            this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 25
            // scene
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0xffffff)
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
            // model
            var that = this
            function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100
                    console.log(Math.round(percentComplete, 2) + '% downloaded')
                }
            }
            var modelFile = 'static/models/mmd/miku/miku_v2.pmd'
            var vpdFiles = [
                'static/models/mmd/vpds/01.vpd',
                'static/models/mmd/vpds/02.vpd',
                'static/models/mmd/vpds/03.vpd',
                'static/models/mmd/vpds/04.vpd',
                'static/models/mmd/vpds/05.vpd',
                'static/models/mmd/vpds/06.vpd',
                'static/models/mmd/vpds/07.vpd',
                'static/models/mmd/vpds/08.vpd',
                //'static/models/mmd/vpds/09.vpd',
                //'static/models/mmd/vpds/10.vpd',
                'static/models/mmd/vpds/11.vpd'
            ]
            this.helper = new MMDAnimationHelper()
            var loader = new MMDLoader()
            loader.load(modelFile, (object) => {
                that.mesh = object
                that.mesh.position.y = - 10
                that.scene.add(that.mesh)
                var vpdIndex = 0
                function loadVpd() {
                    var vpdFile = vpdFiles[ vpdIndex ]
                    loader.loadVPD(vpdFile, false, (vpd) => {
                        that.vpds.push(vpd)
                        vpdIndex ++
                        if (vpdIndex < vpdFiles.length) {
                            loadVpd()
                        } else {
                            initGui()
                        }
                    }, onProgress, null)
                }
                loadVpd()
            }, onProgress, null)
            //
            window.addEventListener('resize', this.onWindowResize, false)
            function initGui() {
                that.gui = new GUI()
                var dictionary = that.mesh.morphTargetDictionary
                var controls = {}
                var keys = []
                var poses = that.gui.addFolder('Poses')
                var morphs = that.gui.addFolder('Morphs')
                function getBaseName(s) {
                    return s.slice(s.lastIndexOf('/') + 1)
                }
                function initControls() {
                    for (var key in dictionary) {
                        controls[ key ] = 0.0
                    }
                    controls.pose = - 1
                    for (var i = 0; i < vpdFiles.length; i ++) {
                        controls[ getBaseName(vpdFiles[ i ]) ] = false
                    }
                }
                function initKeys() {
                    for (var key in dictionary) {
                        keys.push(key)
                    }
                }
                function initPoses() {
                    var files = { default: - 1 }
                    for (var i = 0; i < vpdFiles.length; i ++) {
                        files[ getBaseName(vpdFiles[ i ]) ] = i
                    }
                    poses.add(controls, 'pose', files).onChange(onChangePose)
                }
                function initMorphs() {
                    for (var key in dictionary) {
                        morphs.add(controls, key, 0.0, 1.0, 0.01).onChange(onChangeMorph)
                    }
                }
                function onChangeMorph() {
                    for (var i = 0; i < keys.length; i ++) {
                        var key = keys[ i ]
                        var value = controls[ key ]
                        that.mesh.morphTargetInfluences[ i ] = value
                    }
                }
                function onChangePose() {
                    var index = parseInt(controls.pose)
                    if (index === - 1) {
                        that.mesh.pose()
                    } else {
                        that.helper.pose(that.mesh, that.vpds[ index ])
                    }
                }
                initControls()
                initKeys()
                initPoses()
                initMorphs()
                onChangeMorph()
                onChangePose()
                poses.open()
                morphs.open()
            }
        },
        onWindowResize() {
            this.camera.aspect = (window.innerWidth - 281) / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.effect.setSize((window.innerWidth - 281), window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            this.effect.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderMmdPose-container {
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
