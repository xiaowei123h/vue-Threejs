<template>
    <div class="webglLightprobeCubecamera-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - light probe from cubeCamera
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js';
import { LightProbeHelper } from '@/components/jsm/helpers/LightProbeHelper.js';
import { LightProbeGenerator } from '@/components/jsm/lights/LightProbeGenerator.js'
export default {
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            cubeCamera: null,
			lightProbe: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('webglLightprobeCubecamera-container')[0].appendChild(this.renderer.domElement);
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding;
            // scene
            this.scene = new this.$THREE.Scene();
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000);
            this.camera.position.set(0, 0, 30);
            var cubeRenderTarget = new this.$THREE.WebGLCubeRenderTarget(256, {
                encoding: this.$THREE.sRGBEncoding, // since gamma is applied during rendering, the cubeCamera renderTarget texture encoding must be sRGBEncoding
                format: this.$THREE.RGBAFormat
            });
            this.cubeCamera = new this.$THREE.CubeCamera(1, 1000, cubeRenderTarget);
            // controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.addEventListener('change', this.render);
            controls.minDistance = 10;
            controls.maxDistance = 50;
            controls.enablePan = false;
            // probe
            this.lightProbe = new this.$THREE.LightProbe();
            this.scene.add(this.lightProbe);
            // envmap
            var genCubeUrls = (prefix, postfix) => {
                return [
                    prefix + 'px' + postfix, prefix + 'nx' + postfix,
                    prefix + 'py' + postfix, prefix + 'ny' + postfix,
                    prefix + 'pz' + postfix, prefix + 'nz' + postfix
                ];
            };
            var urls = genCubeUrls('static/textures/cube/pisa/', '.png');
            new this.$THREE.CubeTextureLoader().load(urls, (cubeTexture) => {
                cubeTexture.encoding = this.$THREE.sRGBEncoding;
                this.scene.background = cubeTexture;
                this.cubeCamera.update(this.renderer, this.scene);
                this.lightProbe.copy(LightProbeGenerator.fromCubeRenderTarget(this.renderer, cubeRenderTarget));
                this.scene.add(new LightProbeHelper(this.lightProbe, 5));
                this.render();
            });
            // listener
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.render();
        },
        render() {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
</script>

<style scoped>
.webglLightprobeCubecamera-container {
    position: relative;
    width: 100%;
}
</style>
