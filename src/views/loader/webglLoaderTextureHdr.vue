<template>
    <div class="webglLoaderTextureHdr-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl HDR (RGBE) texture loader example<br/>
			Image courtesy of <a href="http://www.pauldebevec.com/Research/HDR/" target="_blank" rel="noopener">Paul Debevec</a>.
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js';
import { RGBELoader } from '@/components/jsm/loaders/RGBELoader.js'
export default {
    data() {
        return {
            params: {
				exposure: 2.0
			},
            renderer: null,
            scene: null,
            camera: null,
            gui: null,
        }
    },
    mounted() {
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('webglLoaderTextureHdr-container')[0].appendChild(this.renderer.domElement);
            this.renderer.toneMapping = this.$THREE.ReinhardToneMapping;
            this.renderer.toneMappingExposure = this.params.exposure;
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding;
            this.scene = new this.$THREE.Scene();
            var aspect = this.$webglInnerWidth / window.innerHeight;
            this.camera = new this.$THREE.OrthographicCamera(- aspect, aspect, 1, - 1, 0, 1);
            new RGBELoader()
                .setDataType(this.$THREE.UnsignedByteType) // alt: FloatType, HalfFloatType
                .load('static/textures/memorial.hdr', (texture, textureData) => {
                    //console.log(textureData);
                    //console.log(texture);
                    var material = new this.$THREE.MeshBasicMaterial({ map: texture });
                    var quad = new this.$THREE.PlaneBufferGeometry(1.5 * textureData.width / textureData.height, 1.5);
                    var mesh = new this.$THREE.Mesh(quad, material);
                    this.scene.add(mesh);
                    this.render();
                });
            //
            this.gui = new GUI();
            this.gui.add(this.params, 'exposure', 0, 4, 0.01).onChange(this.render);
            this.gui.open();
            //
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            var aspect = window.innerWidth - 281 / window.innerHeight;
            var frustumHeight = this.camera.top - this.camera.bottom;
            this.camera.left = - frustumHeight * aspect / 2;
            this.camera.right = frustumHeight * aspect / 2;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth - 281, window.innerHeight);
            this.render();
        },
        render() {
            this.renderer.toneMappingExposure = this.params.exposure;
            this.renderer.render(this.scene, this.camera);
        }
    }
}
</script>

<style scoped>
.webglLoaderTextureHdr-container {
    position: relative;
    width: 100%;
}
</style>
