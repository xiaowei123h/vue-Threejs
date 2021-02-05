<template>
    <div class="webglMaterialsShadersFresnel-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl cube Fresnel shader demo.<br/>texture by <a href="http://www.humus.name/index.php?page=Textures" target="_blank" rel="noopener">Humus</a>
		</div>
    </div>
</template>

<script>
import { FresnelShader } from '@/components/jsm/shaders/FresnelShader.js'
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
            document.getElementsByClassName('webglMaterialsShadersFresnel-container')[0].appendChild(this.container);
            this.camera = new this.$THREE.PerspectiveCamera(60, this.$webglInnerWidth / window.innerHeight, 1, 100000);
            this.camera.position.z = 3200;
            //
            var path = "static/textures/cube/Park2/";
            var format = '.jpg';
            var urls = [
                path + 'posx' + format, path + 'negx' + format,
                path + 'posy' + format, path + 'negy' + format,
                path + 'posz' + format, path + 'negz' + format
            ];
            var textureCube = new this.$THREE.CubeTextureLoader().load(urls);
            this.scene = new this.$THREE.Scene();
            this.scene.background = textureCube;
            //
            var geometry = new this.$THREE.SphereBufferGeometry(100, 32, 16);
            var shader = FresnelShader;
            var uniforms = this.$THREE.UniformsUtils.clone(shader.uniforms);
            uniforms[ "tCube" ].value = textureCube;
            var material = new this.$THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader
            });
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
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05;
            this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05;
            this.camera.lookAt(this.scene.position);
            for (var i = 0, il = this.spheres.length; i < il; i ++) {
                var sphere = this.spheres[ i ];
                sphere.position.x = 5000 * Math.cos(timer + i);
                sphere.position.y = 5000 * Math.sin(timer + i * 1.1);
            }
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webglMaterialsShadersFresnel-container {
    width: 100%;
}
</style>
