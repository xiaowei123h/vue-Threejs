<template>
    <div class="webglPostprocessingAfterimage-container">
        
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { AfterimagePass } from '@/components/jsm/postprocessing/AfterimagePass.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            composer: null,
			mesh: null,
			afterimagePass: null,
			params: {
				enable: true
            },
            gui: null,
        }
    },
    mounted() {
        this.init();
        this.createGUI();
        this.animate();
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('webglPostprocessingAfterimage-container')[0].appendChild(this.renderer.domElement);
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000);
            this.camera.position.z = 400;
            this.scene = new this.$THREE.Scene();
            this.scene.fog = new this.$THREE.Fog(0x000000, 1, 1000);
            var geometry = new this.$THREE.BoxBufferGeometry(150, 150, 150, 2, 2, 2);
            var material = new this.$THREE.MeshNormalMaterial();
            this.mesh = new this.$THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);
            // postprocessing
            this.composer = new EffectComposer(this.renderer);
            this.composer.addPass(new RenderPass(this.scene, this.camera));
            this.afterimagePass = new AfterimagePass();
            this.composer.addPass(this.afterimagePass);
            window.addEventListener('resize', this.onWindowResize, false);
            if (typeof TESTING !== 'undefined') { for (var i = 0; i < 45; i ++) { this.render(); }; };
        },
        createGUI() {
            this.gui = new GUI({ name: 'Damp setting' });
            this.gui.add(this.afterimagePass.uniforms[ "damp" ], 'value', 0, 1).step(0.001);
            this.gui.add(this.params, 'enable');
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(window.innerWidth - 281, window.innerHeight);
        },
        render() {
            this.mesh.rotation.x += 0.005;
            this.mesh.rotation.y += 0.01;
            if (this.params.enable) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
        }
    },
}
</script>

<style scoped>
.webglPostprocessingAfterimage-container {
    width: 100%;
}
</style>
