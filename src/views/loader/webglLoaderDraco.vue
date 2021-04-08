<template>
    <div class="webglLoaderDraco-container">
        <div id="container"></div>
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> -
            <a href="https://github.com/google/draco" target="_blank" rel="noopener">DRACO</a> loader
        </div>
    </div>
</template>

<script>
import { DRACOLoader } from '@/components/jsm/loaders/DRACOLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            container: null,
            dracoLoader: null,
        }
    },
    mounted() {
        this.container = document.querySelector('#container');
		// Configure and create Draco decoder.
		this.dracoLoader = new DRACOLoader();
		this.dracoLoader.setDecoderPath('static/js/libs/draco/');
		this.dracoLoader.setDecoderConfig({ type: 'js' });
		this.init();
		this.animate();
    },
    methods: {
        init() {
			this.camera = new this.$THREE.PerspectiveCamera(35, this.$webglInnerWidth / window.innerHeight, 0.1, 15);
			this.camera.position.set(3, 0.25, 3);
			this.scene = new this.$THREE.Scene();
			this.scene.background = new this.$THREE.Color(0x443333);
			this.scene.fog = new this.$THREE.Fog(0x443333, 1, 4);
			// Ground
			var plane = new this.$THREE.Mesh(
				new this.$THREE.PlaneBufferGeometry(8, 8),
				new this.$THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
			);
			plane.rotation.x = - Math.PI / 2;
			plane.position.y = 0.03;
			plane.receiveShadow = true;
			this.scene.add(plane);
			// Lights
			var hemiLight = new this.$THREE.HemisphereLight(0x443333, 0x111122);
			this.scene.add(hemiLight);
			var spotLight = new this.$THREE.SpotLight();
			spotLight.angle = Math.PI / 16;
			spotLight.penumbra = 0.5;
			spotLight.castShadow = true;
			spotLight.position.set(- 1, 1, 1);
			this.scene.add(spotLight);
			this.dracoLoader.load('static/models/draco/bunny.drc', (geometry) => {
				geometry.computeVertexNormals();
				var material = new this.$THREE.MeshStandardMaterial({ color: 0x606060 });
				var mesh = new this.$THREE.Mesh(geometry, material);
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				this.scene.add(mesh);
				// Release decoder resources.
				this.dracoLoader.dispose();
			});
			// renderer
			this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
			this.renderer.outputEncoding = this.$THREE.sRGBEncoding;
			this.renderer.shadowMap.enabled = true;
			this.container.appendChild(this.renderer.domElement);
			window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
			this.render();
			requestAnimationFrame(this.animate);
        },
        render() {
			var timer = Date.now() * 0.0003;
			this.camera.position.x = Math.sin(timer) * 0.5;
			this.camera.position.z = Math.cos(timer) * 0.5;
			this.camera.lookAt(0, 0.1, 0);
			this.renderer.render(this.scene, this.camera);
		}
    }
}
</script>

<style scoped>
.webglLoaderDraco-container {
    width: 100%;
}
#info {
	margin-left: 60px;
}
</style>
