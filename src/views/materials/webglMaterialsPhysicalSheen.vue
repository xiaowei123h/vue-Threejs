<template>
    <div class="webglMaterialsPhysicalSheen-container">
        <div id="info">Sheen demo by <a href="https://github.com/DanielSturk">DanielSturk</a></div>
		<div id="container"></div>
    </div>
</template>

<script>
import * as Nodes from '@/components/jsm/nodes/Nodes.js'
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { FBXLoader } from '@/components/jsm/loaders/FBXLoader.js'
export default {
    data() {
        return {
            camera: null,
            controls: null,
            scene: null,
            renderer: null,
            stats: null,
			directionalLight: null,
            mesh: null,
            sphere: null,
            material: null,
            nodeMaterial: null,
            params: null,
            gui: null,
        }
    },
    mounted() {
        this.params = {
            nodeMaterial: true,
            color: new this.$THREE.Color(255, 0, 127),
            sheenBRDF: true,
            sheen: new this.$THREE.Color(10, 10, 10), // corresponds to .04 reflectance
            roughness: .9,
            exposure: 2,
        }
        // model
        new FBXLoader().load('static/models/fbx/cloth.fbx', (loadedModel) => {
            this.mesh = loadedModel.children[ 0 ];
            this.init();
        });
    },
    beforeDestroy() {
        this.gui.hide()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 0.2, 2000);
            this.scene = new this.$THREE.Scene();
            this.scene.background = new this.$THREE.Color(0xbfd1e5);
            this.mesh.scale.multiplyScalar(.5);
            this.scene.add(this.mesh);
            //
            this.material = new this.$THREE.MeshPhysicalMaterial();
            this.material.side = this.$THREE.DoubleSide;
            this.material.metalness = 0;
            //
            this.nodeMaterial = new Nodes.StandardNodeMaterial();
            this.nodeMaterial.side = this.$THREE.DoubleSide;
            this.nodeMaterial.metalness = new Nodes.FloatNode(0);
            this.nodeMaterial.roughness = new Nodes.FloatNode();
            this.nodeMaterial.color = new Nodes.ColorNode(this.params.color.clone());
            //
            this.sphere = new this.$THREE.Mesh(
                new this.$THREE.SphereBufferGeometry(1, 100, 100),
                this.material
            );
            this.scene.add(this.sphere);
            this.camera.position.set(- 12, 7, 4);
            var container = document.getElementById('container');
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            container.appendChild(this.renderer.domElement);
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.set(0, 2, 0);
            this.controls.update();
            this.directionalLight = new this.$THREE.DirectionalLight(0xffffff, .5);
            this.directionalLight.position.set(0, 10, 0);
            this.directionalLight.castShadow = true;
            this.directionalLight.add(
                new this.$THREE.Mesh(
                    new this.$THREE.SphereBufferGeometry(.5),
                    new this.$THREE.MeshBasicMaterial({ color: 0xffffff })
                )
            );
            this.scene.add(this.directionalLight);
            this.stats = new this.$Stats();
            this.stats.dom.style.left = '280px'
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.top = '0px';
            container.appendChild(this.stats.dom);
            window.addEventListener('resize', this.onWindowResize, false);
            this.gui = new GUI();
            var that = this
            function onUpdate() {
                that.mesh.material = that.sphere.material = that.params.nodeMaterial
                    ? that.nodeMaterial
                    : that.material;
                that.material.sheen = that.params.sheenBRDF
                    ? new that.$THREE.Color()
                    : null;
                that.material.needsUpdate = true;
                that.nodeMaterial.sheen = that.params.sheenBRDF
                    ? new Nodes.ColorNode(that.material.sheen)
                    : undefined;
                that.nodeMaterial.needsCompile = true;
            }
            this.gui.add(this.params, 'nodeMaterial').onChange(onUpdate);
            this.gui.addColor(this.params, 'color');
            this.gui.add(this.params, 'sheenBRDF').onChange(onUpdate);
            this.gui.addColor(this.params, 'sheen');
            this.gui.add(this.params, 'roughness', 0, 1);
            this.gui.add(this.params, 'exposure', 0, 3);
            this.gui.open();
            onUpdate();
            this.animate();
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
            this.stats.update();
        },
        render() {
            //
            this.material.color.copy(this.params.color).multiplyScalar(1 / 255);
            this.material.roughness = this.params.roughness;
            //
            this.nodeMaterial.color.value.copy(this.material.color);
            this.nodeMaterial.roughness.value = this.params.roughness;
            //
            if (this.params.sheenBRDF) {
                this.material.sheen.copy(this.params.sheen).multiplyScalar(1 / 255);
            }
            //
            this.renderer.toneMappingExposure = this.params.exposure;
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webglMaterialsPhysicalSheen-container {
    width: 100%;
    color: #333;
}
</style>
