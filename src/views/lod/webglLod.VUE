<template>
    <div class="webglLod-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - level of detail
		</div>
    </div>
</template>

<script>
import { FlyControls } from '@/components/jsm/controls/FlyControls.js'
export default {
    data() {
        return {
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
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
            this.container = document.createElement('div');
            document.getElementsByClassName('webglLod-container')[0].appendChild(this.container);
            this.camera = new this.$THREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 15000);
            this.camera.position.z = 1000;
            this.scene = new this.$THREE.Scene();
            this.scene.fog = new this.$THREE.Fog(0x000000, 1, 15000);
            var pointLight = new this.$THREE.PointLight(0xff2200);
            pointLight.position.set(0, 0, 0);
            this.scene.add(pointLight);
            var dirLight = new this.$THREE.DirectionalLight(0xffffff);
            dirLight.position.set(0, 0, 1).normalize();
            this.scene.add(dirLight);
            var geometry = [
                [ new this.$THREE.IcosahedronBufferGeometry(100, 16), 50 ],
                [ new this.$THREE.IcosahedronBufferGeometry(100, 8), 300 ],
                [ new this.$THREE.IcosahedronBufferGeometry(100, 4), 1000 ],
                [ new this.$THREE.IcosahedronBufferGeometry(100, 2), 2000 ],
                [ new this.$THREE.IcosahedronBufferGeometry(100, 1), 8000 ]
            ];
            var material = new this.$THREE.MeshLambertMaterial({ color: 0xffffff, wireframe: true });
            for (var j = 0; j < 1000; j ++) {
                var lod = new this.$THREE.LOD();
                for (var i = 0; i < geometry.length; i ++) {
                    var mesh = new this.$THREE.Mesh(geometry[ i ][ 0 ], material);
                    mesh.scale.set(1.5, 1.5, 1.5);
                    mesh.updateMatrix();
                    mesh.matrixAutoUpdate = false;
                    lod.addLevel(mesh, geometry[ i ][ 1 ]);
                }
                lod.position.x = 10000 * (0.5 - Math.random());
                lod.position.y = 7500 * (0.5 - Math.random());
                lod.position.z = 10000 * (0.5 - Math.random());
                lod.updateMatrix();
                lod.matrixAutoUpdate = false;
                this.scene.add(lod);
            }
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            this.container.appendChild(this.renderer.domElement);
            //
            this.controls = new FlyControls(this.camera, this.renderer.domElement);
            this.controls.movementSpeed = 1000;
            this.controls.rollSpeed = Math.PI / 10;
            //
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
        },
        render() {
            this.controls.update(this.clock.getDelta());
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webglLod-container {
    position: relative;
    width: 100%;
}
</style>
