<template>
    <div class="webglLoaderTextureBasis-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl - basis texture loader<br />
			<a href="https://github.com/binomialLLC/basis_universal" target="_blank">Basis Universal GPU Texture Codec</a>
		</div>
    </div>
</template>

<script>
import { BasisTextureLoader } from '@/components/jsm/loaders/BasisTextureLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			mesh: null,
			clock: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock();
        this.init();
        this.animate();
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding;
            document.body.appendChild(this.renderer.domElement);
            this.camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
            this.camera.position.z = 500;
            this.scene = new this.$THREE.Scene();
            var geometry = new this.$THREE.BoxBufferGeometry(200, 200, 200);
            var material = new this.$THREE.MeshBasicMaterial();
            this.mesh = new this.$THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);
            var loader = new BasisTextureLoader();
            loader.setTranscoderPath('@/components/js/libs/basis/');
            loader.detectSupport(this.renderer);
            loader.load('static/textures/compressed/PavingStones.basis', (texture) => {
                texture.encoding = this.$THREE.sRGBEncoding;
                material.map = texture;
                material.needsUpdate = true;
            }, undefined, (error) => {
                console.error(error);
            });
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate);
            var delta = this.clock.getDelta() * 0.5;
            this.mesh.rotation.x += delta;
            this.mesh.rotation.y += delta;
            this.renderer.render(this.scene, this.camera);
        }
    }
}
</script>

<style scoped>
.webglLoaderTextureBasis-container {
    width: 100%;
}
</style>
