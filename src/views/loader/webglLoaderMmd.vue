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
import '@/components/js/libs/ammo.wasm.js'
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
        this.clock = new this.$THREE.Clock();
        Ammo().then((AmmoLib) => {
            Ammo = AmmoLib;
            this.init();
            this.animate();
        });
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.createElement('div');
            document.body.appendChild(container);
            this.camera = new this.$THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
            this.camera.position.z = 30;
            // scene
            this.scene = new this.$THREE.Scene();
            this.scene.background = new this.$THREE.Color(0xffffff);
            var gridHelper = new this.$THREE.PolarGridHelper(30, 10);
            gridHelper.position.y = - 10;
            this.scene.add(gridHelper);
            var ambient = new this.$THREE.AmbientLight(0x666666);
            this.scene.add(ambient);
            var directionalLight = new this.$THREE.DirectionalLight(0x887766);
            directionalLight.position.set(- 1, 1, 1).normalize();
            this.scene.add(directionalLight);
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(this.renderer.domElement);
            this.effect = new OutlineEffect(this.renderer);
            // STATS
            this.stats = new this.$Stats();
            container.appendChild(this.stats.dom);
            // model
            function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log(Math.round(percentComplete, 2) + '% downloaded');
                }
            }
            var modelFile = 'static/models/mmd/miku/miku_v2.pmd';
            var vmdFiles = [ 'static/models/mmd/vmds/wavefile_v2.vmd' ];
            this.helper = new MMDAnimationHelper({
                afterglow: 2.0
            });
            var loader = new MMDLoader();
            loader.loadWithAnimation(modelFile, vmdFiles, (mmd) => {
                this.mesh = mmd.mesh;
                this.mesh.position.y = - 10;
                this.scene.add(this.mesh);
                this.helper.add(this.mesh, {
                    animation: mmd.animation,
                    physics: true
                });
                this.ikHelper = this.helper.objects.get(this.mesh).ikSolver.createHelper();
                this.ikHelper.visible = false;
                this.scene.add(this.ikHelper);
                this.physicsHelper = this.helper.objects.get(this.mesh).physics.createHelper();
                this.physicsHelper.visible = false;
                this.scene.add(this.physicsHelper);
                initGui();
            }, onProgress, null);
            var controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.minDistance = 10;
            controls.maxDistance = 100;
            window.addEventListener('resize', this.onWindowResize, false);
            function initGui() {
                var api = {
                    'animation': true,
                    'ik': true,
                    'outline': true,
                    'physics': true,
                    'show IK bones': false,
                    'show rigid bodies': false
                };
                this.gui = new GUI();
                this.gui.add(api, 'animation').onChange(() => {
                    this.helper.enable('animation', api[ 'animation' ]);
                });
                this.gui.add(api, 'ik').onChange(() => {
                    this.helper.enable('ik', api[ 'ik' ]);
                });
                this.gui.add(api, 'outline').onChange(() => {
                    this.effect.enabled = api[ 'outline' ];
                });
                this.gui.add(api, 'physics').onChange(() => {
                    this.helper.enable('physics', api[ 'physics' ]);
                });
                this.gui.add(api, 'show IK bones').onChange(() => {
                    this.ikHelper.visible = api[ 'show IK bones' ];
                });
                this.gui.add(api, 'show rigid bodies').onChange(() => {
                    if (this.physicsHelper !== undefined) this.physicsHelper.visible = api[ 'show rigid bodies' ];
                });
            }
        },
        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.effect.setSize(window.innerWidth, window.innerHeight);
        },
        animate() {
            requestAnimationFrame(athis.nimate);
            this.stats.begin();
            this.render();
            this.stats.end();
        },
        render() {
            this.helper.update(this.clock.getDelta());
            this.effect.render(this.scene, this.camera);
        }
    }
}
</script>

<style scoped>
.webglLoaderMmd-container {
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
