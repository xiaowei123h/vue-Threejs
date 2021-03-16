<template>
    <div class="miscExporterObj-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - exporter - obj<br /><br />
            <el-button type="primary" size="mini" @click="addGeometry(1)">triangle</el-button>
            <el-button type="primary" size="mini" @click="addGeometry(2)">cube</el-button>
            <el-button type="primary" size="mini" @click="addGeometry(3)">cylinder</el-button>
            <el-button type="primary" size="mini" @click="addGeometry(4)">multiple</el-button>
            <el-button type="primary" size="mini" @click="addGeometry(5)">transformed</el-button>
			<br /><br />
            <el-button type="primary" size="mini" @click="exportToObj()">export to obj</el-button>
		</div>
    </div>
</template>

<script>
import { OBJExporter } from '@/components/jsm/exporters/OBJExporter.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            light: null,
            renderer: null,
            exportButton: null,
            floatingDiv: null,
            mouseX: 0,
            mouseY: 0,
        }
    },
    mounted() {
        this.init();
		this.animate();
    },
    methods: {
        exportToObj() {
            var exporter = new OBJExporter();
            var result = exporter.parse(this.scene);
            this.floatingDiv.style.display = 'block';
            this.floatingDiv.innerHTML = result.split('\n').join('<br />');
        },
        addGeometry(type) {
            for (var i = 0; i < this.scene.children.length; i ++) {
                var child = this.scene.children[ i ];
                if (child.isMesh) {
                    child.geometry.dispose();
                    this.scene.remove(child);
                    i --;
                }
            }
            if (type === 1) {
                var material = new this.$THREE.MeshLambertMaterial({ color: 0x00cc00 });
                var geometry = this.generateTriangleGeometry();
                this.scene.add(new this.$THREE.Mesh(geometry, material));
            } else if (type === 2) {
                var material = new this.$THREE.MeshLambertMaterial({ color: 0x00cc00 });
                var geometry = new this.$THREE.BoxBufferGeometry(100, 100, 100);
                this.scene.add(new this.$THREE.Mesh(geometry, material));
            } else if (type === 3) {
                var material = new this.$THREE.MeshLambertMaterial({ color: 0x00cc00 });
                var geometry = new this.$THREE.CylinderBufferGeometry(50, 50, 100, 30, 1);
                this.scene.add(new this.$THREE.Mesh(geometry, material));
            } else if (type === 4 || type === 5) {
                var material = new this.$THREE.MeshLambertMaterial({ color: 0x00cc00 });
                var geometry = this.generateTriangleGeometry();
                var mesh = new this.$THREE.Mesh(geometry, material);
                mesh.position.x = - 200;
                this.scene.add(mesh);
                var geometry2 = new this.$THREE.BoxBufferGeometry(100, 100, 100);
                var mesh2 = new this.$THREE.Mesh(geometry2, material);
                this.scene.add(mesh2);
                var geometry3 = new this.$THREE.CylinderBufferGeometry(50, 50, 100, 30, 1);
                var mesh3 = new this.$THREE.Mesh(geometry3, material);
                mesh3.position.x = 200;
                this.scene.add(mesh3);
                if (type === 5) {
                    mesh.rotation.y = Math.PI / 4.0;
                    mesh2.rotation.y = Math.PI / 4.0;
                    mesh3.rotation.y = Math.PI / 4.0;
                }
            }
        },
        init() {
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('miscExporterObj-container')[0].appendChild(this.renderer.domElement);
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000);
            this.camera.position.set(0, 0, 400);
            this.scene = new this.$THREE.Scene();
            this.light = new this.$THREE.DirectionalLight(0xffffff);
            this.scene.add(this.light);
            this.addGeometry(1);
            window.addEventListener('click', this.onWindowClick, false);
            window.addEventListener('resize', this.onWindowResize, false);
            document.addEventListener('mousemove', this.onDocumentMouseMove, false);
            document.addEventListener('mouseover', this.onDocumentMouseMove, false);
            this.exportButton = document.getElementById('export');
            this.floatingDiv = document.createElement('div');
            this.floatingDiv.className = 'floating';
            document.getElementsByClassName('miscExporterObj-container')[0].appendChild(this.floatingDiv);
        },
        onWindowClick(event) {
            var needToClose = true;
            var target = event.target;
            while (target !== null) {
                if (target === this.floatingDiv || target === this.exportButton) {
                    needToClose = false;
                    break;
                }
                target = target.parentElement;
            }
            if (needToClose) {
                this.floatingDiv.style.display = 'none';
            }
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            var windowHalfX = (window.innerWidth - 281) / 2;
            var windowHalfY = window.innerHeight / 2;
            this.mouseX = (event.clientX - windowHalfX) / 2;
            this.mouseY = (event.clientY - windowHalfY) / 2;
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
            this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z).normalize();
            this.renderer.render(this.scene, this.camera);
        },
        generateTriangleGeometry() {
            var geometry = new this.$THREE.BufferGeometry();
            var vertices = [];
            vertices.push(- 50, - 50, 0);
            vertices.push(50, - 50, 0);
            vertices.push(50, 50, 0);
            geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            geometry.computeVertexNormals();
            return geometry;
        }
    },
}
</script>

<style scoped>
.miscExporterObj-contaeiner {
    width: 100%;
}
.floating {
    background : #000000;
    opacity : 0.8;
    width : 80%;
    height : 80%;
    position : absolute;
    left : 10%;
    top : 10%;
    border : 1px solid #555555;
    padding : 10px;
    display : none;
    overflow : auto;
    z-index: 100;
}
</style>
