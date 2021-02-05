<template>
    <div class="webglMaterialsCubemapBallsReflection-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl cube reflection demo.<br/>
			skybox by <a href="http://ict.debevec.org/~debevec/" target="_blank" rel="noopener">Paul Debevec</a>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
			spheres: [],
			mouseX: 0,
			mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        this.init();
        this.animate();
    },
    methods: {
        init() {
            this.container = document.createElement('div');
            document.getElementsByClassName('webglMaterialsCubemapBallsReflection-container')[0].appendChild(this.container);
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 100000);
            this.camera.position.z = 3200;
            this.scene = new this.$THREE.Scene();
            this.scene.background = new this.$THREE.CubeTextureLoader()
                .setPath('static/textures/cube/pisa/')
                .load([ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ]);
            var geometry = new this.$THREE.SphereBufferGeometry(100, 32, 16);
            var material = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, envMap: this.scene.background });
            for (var i = 0; i < 500; i ++) {
                var mesh = new this.$THREE.Mesh(geometry, material);
                mesh.position.x = Math.random() * 10000 - 5000;
                mesh.position.y = Math.random() * 10000 - 5000;
                mesh.position.z = Math.random() * 10000 - 5000;
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
                this.scene.add(mesh);
                this.spheres.push(mesh);
            }
            //
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            this.container.appendChild(this.renderer.domElement);
            //
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.windowHalfX = (window.innerWidth - 281) / 2;
            this.windowHalfY = window.innerHeight / 2;
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) * 10;
            this.mouseY = (event.clientY - this.windowHalfY) * 10;
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
        },
        render() {
            var timer = 0.0001 * Date.now();
            for (var i = 0, il = this.spheres.length; i < il; i ++) {
                var sphere = this.spheres[ i ];
                sphere.position.x = 5000 * Math.cos(timer + i);
                sphere.position.y = 5000 * Math.sin(timer + i * 1.1);
            }
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05;
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05;
            this.camera.lookAt(this.scene.position);
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webglMaterialsCubemapBallsReflection-container {
    width: 100%;
}
</style>
