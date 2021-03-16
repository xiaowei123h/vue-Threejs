<template>
    <div class="miscExporterPly-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - exporter - ply<br/><br/>
			<button id="exportASCII">export ASCII</button> <button id="exportBinaryBigEndian">export binary (Big Endian)</button> <button id="exportBinaryLittleEndian">export binary (Little Endian)</button>
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { PLYExporter } from '@/components/jsm/exporters/PLYExporter.js'
export default {
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
            exporter: null,
            mesh: null,
            link: null,
        }
    },
    mounted() {
        this.link = document.createElement('a');
        this.link.style.display = 'none';
        document.getElementsByClassName('miscExporterPly-container')[0].appendChild(this.link);
        this.init();
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 1000);
            this.camera.position.set(200, 100, 200);
            this.scene = new this.$THREE.Scene();
            this.scene.background = new this.$THREE.Color(0xa0a0a0);
            this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 200, 1000);
            this.exporter = new PLYExporter();
            //
            var hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444);
            hemiLight.position.set(0, 200, 0);
            this.scene.add(hemiLight);
            var directionalLight = new this.$THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, 200, 100);
            directionalLight.castShadow = true;
            directionalLight.shadow.camera.top = 180;
            directionalLight.shadow.camera.bottom = - 100;
            directionalLight.shadow.camera.left = - 120;
            directionalLight.shadow.camera.right = 120;
            this.scene.add(directionalLight);
            // ground
            var ground = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(2000, 2000), new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
            ground.rotation.x = - Math.PI / 2;
            ground.receiveShadow = true;
            this.scene.add(ground);
            var grid = new this.$THREE.GridHelper(2000, 20, 0x000000, 0x000000);
            grid.material.opacity = 0.2;
            grid.material.transparent = true;
            this.scene.add(grid);
            // export mesh
            var geometry = new this.$THREE.BoxBufferGeometry(50, 50, 50);
            var material = new this.$THREE.MeshPhongMaterial({ color: 0x00ff00 });
            this.mesh = new this.$THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
            this.mesh.position.y = 25;
            this.scene.add(this.mesh);
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            document.getElementsByClassName('miscExporterPly-container')[0].appendChild(this.renderer.domElement);
            //
            var controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.target.set(0, 25, 0);
            controls.update();
            //
            window.addEventListener('resize', this.onWindowResize, false);
            var buttonExportASCII = document.getElementById('exportASCII');
            buttonExportASCII.addEventListener('click', this.exportASCII);
            var buttonExportBinaryBE = document.getElementById('exportBinaryBigEndian');
            buttonExportBinaryBE.addEventListener('click', this.exportBinaryBigEndian);
            var buttonExportBinaryLE = document.getElementById('exportBinaryLittleEndian');
            buttonExportBinaryLE.addEventListener('click', this.exportBinaryLittleEndian);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
        },
        exportASCII() {
            this.exporter.parse(this.mesh, (result) => {
                this.saveString(result, 'box.ply');
            });
        },
        exportBinaryBigEndian() {
            this.exporter.parse(this.mesh, (result) => {
                this.saveArrayBuffer(result, 'box.ply');
            }, { binary: true });
        },
        exportBinaryLittleEndian() {
            this.exporter.parse(this.mesh, (result) => {
                this.saveArrayBuffer(result, 'box.ply');
            }, { binary: true, littleEndian: true });
        },
        save(blob, filename) {
            this.link.href = URL.createObjectURL(blob);
            this.link.download = filename;
            this.link.click();
        },
        saveString(text, filename) {
            this.save(new Blob([ text ], { type: 'text/plain' }), filename);
        },
        saveArrayBuffer(buffer, filename) {
            this.save(new Blob([ buffer ], { type: 'application/octet-stream' }), filename);
        }
    },
}
</script>

<style scoped>
.miscExporterPly-container {
    width: 100%;
}
</style>
