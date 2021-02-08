<template>
    <div class="webglMultipleCanvasesGrid-container">
        <div id="centerer">
			<div id="centerer-cell">
				<div id="container">
					<div class="container-row">
						<canvas id="canvas1"></canvas>
						<canvas id="canvas2"></canvas>
					</div>
					<div class="container-row">
						<canvas id="canvas3"></canvas>
						<canvas id="canvas4"></canvas>
					</div>
				</div>
			</div>
		</div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl -  multiple canvases - grid</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            views: [],
            scene: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.init();
		this.animate();
    },
    methods: {
        init() {
            var canvas1 = document.getElementById('canvas1');
            var canvas2 = document.getElementById('canvas2');
            var canvas3 = document.getElementById('canvas3');
            var canvas4 = document.getElementById('canvas4');
            var w = 300, h = 200;
            var fullWidth = w * 2;
            var fullHeight = h * 2;
            this.views.push(new View(canvas1, fullWidth, fullHeight, w * 0, h * 0, w, h));
            this.views.push(new View(canvas2, fullWidth, fullHeight, w * 1, h * 0, w, h));
            this.views.push(new View(canvas3, fullWidth, fullHeight, w * 0, h * 1, w, h));
            this.views.push(new View(canvas4, fullWidth, fullHeight, w * 1, h * 1, w, h));
            //
            this.scene = new this.$THREE.Scene();
            this.scene.background = new this.$THREE.Color(0xffffff);
            var light = new this.$THREE.DirectionalLight(0xffffff);
            light.position.set(0, 0, 1).normalize();
            this.scene.add(light);
            // shadow
            var canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            var context = canvas.getContext('2d');
            var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            gradient.addColorStop(0.1, 'rgba(210,210,210,1)');
            gradient.addColorStop(1, 'rgba(255,255,255,1)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            var shadowTexture = new this.$THREE.CanvasTexture(canvas);
            var shadowMaterial = new this.$THREE.MeshBasicMaterial({ map: shadowTexture });
            var shadowGeo = new this.$THREE.PlaneBufferGeometry(300, 300, 1, 1);
            var shadowMesh;
            shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial);
            shadowMesh.position.y = - 250;
            shadowMesh.rotation.x = - Math.PI / 2;
            this.scene.add(shadowMesh);
            shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial);
            shadowMesh.position.x = - 400;
            shadowMesh.position.y = - 250;
            shadowMesh.rotation.x = - Math.PI / 2;
            this.scene.add(shadowMesh);
            shadowMesh = new this.$THREE.Mesh(shadowGeo, shadowMaterial);
            shadowMesh.position.x = 400;
            shadowMesh.position.y = - 250;
            shadowMesh.rotation.x = - Math.PI / 2;
            this.scene.add(shadowMesh);
            var radius = 200;
            var geometry1 = new this.$THREE.IcosahedronBufferGeometry(radius, 1);
            var count = geometry1.attributes.position.count;
            geometry1.setAttribute('color', new this.$THREE.BufferAttribute(new Float32Array(count * 3), 3));
            var geometry2 = geometry1.clone();
            var geometry3 = geometry1.clone();
            var color = new this.$THREE.Color();
            var positions1 = geometry1.attributes.position;
            var positions2 = geometry2.attributes.position;
            var positions3 = geometry3.attributes.position;
            var colors1 = geometry1.attributes.color;
            var colors2 = geometry2.attributes.color;
            var colors3 = geometry3.attributes.color;
            for (var i = 0; i < count; i ++) {
                color.setHSL((positions1.getY(i) / radius + 1) / 2, 1.0, 0.5);
                colors1.setXYZ(i, color.r, color.g, color.b);
                color.setHSL(0, (positions2.getY(i) / radius + 1) / 2, 0.5);
                colors2.setXYZ(i, color.r, color.g, color.b);
                color.setRGB(1, 0.8 - (positions3.getY(i) / radius + 1) / 2, 0);
                colors3.setXYZ(i, color.r, color.g, color.b);
            }
            var material = new this.$THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: true,
                vertexColors: true,
                shininess: 0
            });
            var wireframeMaterial = new this.$THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true });
            var mesh = new this.$THREE.Mesh(geometry1, material);
            var wireframe = new this.$THREE.Mesh(geometry1, wireframeMaterial);
            mesh.add(wireframe);
            mesh.position.x = - 400;
            mesh.rotation.x = - 1.87;
            this.scene.add(mesh);
            mesh = new this.$THREE.Mesh(geometry2, material);
            wireframe = new this.$THREE.Mesh(geometry2, wireframeMaterial);
            mesh.add(wireframe);
            mesh.position.x = 400;
            this.scene.add(mesh);
            mesh = new this.$THREE.Mesh(geometry3, material);
            wireframe = new this.$THREE.Mesh(geometry3, wireframeMaterial);
            mesh.add(wireframe);
            this.scene.add(mesh);
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(300, 200);
            document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        },
        onDocumentMouseMove(event) {
            this.mouseX = event.clientX - this.windowHalfX;
            this.mouseY = event.clientY - this.windowHalfY;
        },
        animate() {
            for (var i = 0; i < this.views.length; ++ i) {
                this.views[ i ].render();
            }
            requestAnimationFrame(this.animate);
        }
    },
}
</script>

<style scoped>
.webglMultipleCanvasesGrid-container {
    width: 100%;
    height: 100%;
    background-color: #fff;
}
body {
    color: #444;
}
a {
    color: #08f;
}
#centerer {
    display: table;
    width: 100%;
    height: 100%;
}
#centerer-cell {
    display: table-cell;
    vertical-align: middle;
}
#container {
    margin-left: auto;
    margin-right: auto;
    width: 604px;  /* 300*2 + border; */
}
#container div {
    float: left;
}
#canvas1, #canvas2, #canvas3, #canvas4 {
    position: relative;
    float: left;
    width: 300px;
    height: 200px;
    outline: 1px solid red;
}
</style>
