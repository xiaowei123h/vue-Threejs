<template>
    <div class="webglMaterialsNormalmapObjectSpace-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl object-space normalmap demo<br />
			Nefertiti Bust by
			<a href="http://www.cultlab3d.de/" target="_blank" rel="noopener">CultLab3D</a><br />

		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('webglMaterialsNormalmapObjectSpace-container')[0].appendChild(this.renderer.domElement);
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding;
            // scene
            this.scene = new this.$THREE.Scene();
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000);
            this.camera.position.set(- 10, 0, 23);
            this.scene.add(this.camera);
            // controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.addEventListener('change', this.render);
            controls.minDistance = 10;
            controls.maxDistance = 50;
            controls.enablePan = false;
            // ambient
            this.scene.add(new this.$THREE.AmbientLight(0xffffff, .2));
            // light
            var light = new this.$THREE.PointLight(0xffffff, 1.5);
            this.camera.add(light);
            // model
            new GLTFLoader().load('static/models/gltf/Nefertiti/Nefertiti.glb', (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        // glTF currently supports only tangent-space normal maps.
                        // this model has been modified to demonstrate the use of an object-space normal map.
                        child.material.normalMapType = this.$THREE.ObjectSpaceNormalMap;
                        // attribute normals are not required with an object-space normal map. remove them.
                        child.geometry.deleteAttribute('normal');
                        //
                        child.material.side = this.$THREE.DoubleSide;
                        child.scale.multiplyScalar(0.5);
                        // recenter
                        new this.$THREE.Box3().setFromObject(child).getCenter(child.position).multiplyScalar(- 1);
                        this.scene.add(child);
                    }
                });
                this.render();
            });
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render();
        },
        render() {
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webglMaterialsNormalmapObjectSpace-container {
    position: relative;
    width: 100%;
}
</style>
