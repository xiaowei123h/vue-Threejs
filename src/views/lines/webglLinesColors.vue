<template>
    <div class="webglLinesColors-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - color lines<br/>
			<a href="http://en.wikipedia.org/wiki/Hilbert_curve">Hilbert curve</a> thanks to <a href="http://www.openprocessing.org/visuals/?visualID=15599">Thomas Diewald</a>
		</div>
    </div>
</template>

<script>
import { GeometryUtils } from '@/components/jsm/utils/GeometryUtils.js'
export default {
    data() {
        return {
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
            camera: null,
            scene: null,
            renderer: null,
        }
    },
    mounted() {
        this.windowHalfX = this.$webglInnerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.init();
		this.animate();
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(33, this.$webglInnerWidth / window.innerHeight, 1, 10000);
            this.camera.position.z = 1000;
            this.scene = new this.$THREE.Scene();
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('webglLinesColors-container')[0].appendChild(this.renderer.domElement);
            //
            var hilbertPoints = GeometryUtils.hilbert3D(new this.$THREE.Vector3(0, 0, 0), 200.0, 1, 0, 1, 2, 3, 4, 5, 6, 7);
            var geometry1 = new this.$THREE.BufferGeometry();
            var geometry2 = new this.$THREE.BufferGeometry();
            var geometry3 = new this.$THREE.BufferGeometry();
            var subdivisions = 6;
            var vertices = [];
            var colors1 = [];
            var colors2 = [];
            var colors3 = [];
            var point = new this.$THREE.Vector3();
            var color = new this.$THREE.Color();
            var spline = new this.$THREE.CatmullRomCurve3(hilbertPoints);
            for (var i = 0; i < hilbertPoints.length * subdivisions; i ++) {
                var t = i / (hilbertPoints.length * subdivisions);
                spline.getPoint(t, point);
                vertices.push(point.x, point.y, point.z);
                color.setHSL(0.6, 1.0, Math.max(0, - point.x / 200) + 0.5);
                colors1.push(color.r, color.g, color.b);
                color.setHSL(0.9, 1.0, Math.max(0, - point.y / 200) + 0.5);
                colors2.push(color.r, color.g, color.b);
                color.setHSL(i / (hilbertPoints.length * subdivisions), 1.0, 0.5);
                colors3.push(color.r, color.g, color.b);
            }
            geometry1.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            geometry2.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            geometry3.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            geometry1.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors1, 3));
            geometry2.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors2, 3));
            geometry3.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors3, 3));
            //
            var geometry4 = new this.$THREE.BufferGeometry();
            var geometry5 = new this.$THREE.BufferGeometry();
            var geometry6 = new this.$THREE.BufferGeometry();
            vertices = [];
            colors1 = [];
            colors2 = [];
            colors3 = [];
            for (var i = 0; i < hilbertPoints.length; i ++) {
                var point = hilbertPoints[i];
                vertices.push(point.x, point.y, point.z);
                color.setHSL(0.6, 1.0, Math.max(0, (200 - hilbertPoints[i].x) / 400) * 0.5 + 0.5);
                colors1.push(color.r, color.g, color.b);
                color.setHSL(0.3, 1.0, Math.max(0, (200 + hilbertPoints[i].x) / 400) * 0.5);
                colors2.push(color.r, color.g, color.b);
                color.setHSL(i / hilbertPoints.length, 1.0, 0.5);
                colors3.push(color.r, color.g, color.b);
            }
            geometry4.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            geometry5.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            geometry6.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            geometry4.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors1, 3));
            geometry5.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors2, 3));
            geometry6.setAttribute('color', new this.$THREE.Float32BufferAttribute(colors3, 3));
            // Create lines and add to this.
            var	material = new this.$THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true });
            var line, p;
            var scale = 0.3, d = 225;
            var parameters = [
                [material, scale * 1.5, [- d, - d / 2, 0], geometry1],
                [material, scale * 1.5, [0, - d / 2, 0], geometry2],
                [material, scale * 1.5, [d, - d / 2, 0], geometry3],
                [material, scale * 1.5, [- d, d / 2, 0], geometry4],
                [material, scale * 1.5, [0, d / 2, 0], geometry5],
                [material, scale * 1.5, [d, d / 2, 0], geometry6],
        ];
            for (var i = 0; i < parameters.length; i ++) {
                p = parameters[i];
                line = new this.$THREE.Line(p[3], p[0]);
                line.scale.x = line.scale.y = line.scale.z = p[1];
                line.position.x = p[2][0];
                line.position.y = p[2][1];
                line.position.z = p[2][2];
                this.scene.add(line);
            }
            //
            document.getElementsByClassName('webglLinesColors-container')[0].style.touchAction = 'none';
            document.getElementsByClassName('webglLinesColors-container')[0].addEventListener('pointermove', this.onPointerMove, false);
            //
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.windowHalfX = (window.innerWidth - x) / 2;
            this.windowHalfY = window.innerHeight / 2;
            this.$onWindowResize(this.camera, this.renderer)
        },
        onPointerMove(event) {
            if (event.isPrimary === false) return;
            this.mouseX = event.clientX - this.windowHalfX;
            this.mouseY = event.clientY - this.windowHalfY;
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
            this.camera.position.y += (- this.mouseY + 200 - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
            var time = Date.now() * 0.0005;
            for (var i = 0; i < this.scene.children.length; i ++) {
                var object = this.scene.children[i];
                if (object.isLine) {
                    object.rotation.y = time * (i % 2 ? 1 : - 1);
                }
            }
            this.renderer.render(this.scene, this.camera);
        }
    }
}
</script>

<style scoped>
.webglLinesColors-container {
    position: relative;
    width: 100%;
}
</style>
