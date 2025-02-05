<template>
    <div class="webglVideoKinect-container">
        <video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
			<source src="static/textures/kinect.webm">
			<source src="static/textures/kinect.mp4">
		</video>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            vs: null,
            fs: null,
            scene: null,
            camera: null,
            renderer: null,
            geometry: null,
            mesh: null,
            material: null,
            mouse: null,
            center: null,
            gui: null,
        }
    },
    mounted() {
        this.vs = `
            uniform sampler2D map;
			uniform float width;
			uniform float height;
			uniform float nearClipping, farClipping;
			uniform float pointSize;
			uniform float zOffset;
			varying vec2 vUv;
			const float XtoZ = 1.11146; // tan( 1.0144686 / 2.0 ) * 2.0;
			const float YtoZ = 0.83359; // tan( 0.7898090 / 2.0 ) * 2.0;
			void main() {
				vUv = vec2( position.x / width, position.y / height );
				vec4 color = texture2D( map, vUv );
				float depth = ( color.r + color.g + color.b ) / 3.0;
				// Projection code by @kcmic
				float z = ( 1.0 - depth ) * (farClipping - nearClipping) + nearClipping;
				vec4 pos = vec4(
					( position.x / width - 0.5 ) * z * XtoZ,
					( position.y / height - 0.5 ) * z * YtoZ,
					- z + zOffset,
					1.0);
				gl_PointSize = pointSize;
				gl_Position = projectionMatrix * modelViewMatrix * pos;
			}`
        this.fs = `
            uniform sampler2D map;
			varying vec2 vUv;
			void main() {
				vec4 color = texture2D( map, vUv );
				gl_FragColor = vec4( color.r, color.g, color.b, 0.2 );
			}`
        this.init();
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.createElement('div');
            document.getElementsByClassName('webglVideoKinect-container')[0].appendChild(container);
            var info = document.createElement('div');
            info.id = 'info';
            info.innerHTML = '<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - kinect';
            document.getElementsByClassName('webglVideoKinect-container')[0].appendChild(info);
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 10000);
            this.camera.position.set(0, 0, 500);
            this.scene = new this.$THREE.Scene();
            this.center = new this.$THREE.Vector3();
            this.center.z = - 1000;
            var video = document.getElementById('video');
            var texture = new this.$THREE.VideoTexture(video);
            texture.minFilter = this.$THREE.NearestFilter;
            var width = 640, height = 480;
            var nearClipping = 850, farClipping = 4000;
            this.geometry = new this.$THREE.BufferGeometry();
            var vertices = new Float32Array(width * height * 3);
            for (var i = 0, j = 0, l = vertices.length; i < l; i += 3, j ++) {
                vertices[ i ] = j % width;
                vertices[ i + 1 ] = Math.floor(j / width);
            }
            this.geometry.setAttribute('position', new this.$THREE.BufferAttribute(vertices, 3));
            this.material = new this.$THREE.ShaderMaterial({
                uniforms: {
                    "map": { value: texture },
                    "width": { value: width },
                    "height": { value: height },
                    "nearClipping": { value: nearClipping },
                    "farClipping": { value: farClipping },
                    "pointSize": { value: 2 },
                    "zOffset": { value: 1000 }
                },
                vertexShader: this.vs,
                fragmentShader: this.fs,
                blending: this.$THREE.AdditiveBlending,
                depthTest: false, depthWrite: false,
                transparent: true
            });
            this.mesh = new this.$THREE.Points(this.geometry, this.material);
            this.scene.add(this.mesh);
            this.gui = new GUI();
            this.gui.add(this.material.uniforms.nearClipping, 'value', 1, 10000, 1.0).name('nearClipping');
            this.gui.add(this.material.uniforms.farClipping, 'value', 1, 10000, 1.0).name('farClipping');
            this.gui.add(this.material.uniforms.pointSize, 'value', 1, 10, 1.0).name('pointSize');
            this.gui.add(this.material.uniforms.zOffset, 'value', 0, 4000, 1.0).name('zOffset');
            video.play();
            //
            this.renderer = new this.$THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            container.appendChild(this.renderer.domElement);
            this.mouse = new this.$THREE.Vector3(0, 0, 1);
            document.addEventListener('mousemove', this.onDocumentMouseMove, false);
            //
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        onDocumentMouseMove(event) {
            this.mouse.x = (event.clientX - (window.innerWidth - 281) / 2) * 8;
            this.mouse.y = (event.clientY - window.innerHeight / 2) * 8;
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
        },
        render() {
            this.camera.position.x += (this.mouse.x - this.camera.position.x) * 0.05;
            this.camera.position.y += (- this.mouse.y - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.center);
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webglVideoKinect-container {
    position: relative;
    width: 100%;
}
</style>
