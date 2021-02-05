<template>
    <div class="webglMaterialsTextureAnisotropy-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - anisotropic texture filtering example
		</div>

		<div id="lbl_left" class="lbl">
		anisotropy: <span class="c" id="val_left"></span><br/>
		</div>

		<div id="lbl_right" class="lbl">
		anisotropy: <span class="c" id="val_right"></span><br/>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            SCREEN_WIDTH: null,
			SCREEN_HEIGHT: null,
            container: null,
            stats: null,
            camera: null,
            scene1: null,
            scene2: null,
            renderer: null,
            mouseX: 0,
            mouseY: 0,
			windowHalfX: null,
			windowHalfY: null,
        }
    },
    mounted() {
        this.SCREEN_WIDTH = window.innerWidth;
        this.SCREEN_HEIGHT = window.innerHeight;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.init();
        this.animate();
    },
    methods: {
        init() {
            this.container = document.createElement('div');
            document.body.appendChild(this.container);
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            //
            this.camera = new this.$THREE.PerspectiveCamera(35, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 25000);
            this.camera.position.z = 1500;
            this.scene1 = new this.$THREE.Scene();
            this.scene1.background = new this.$THREE.Color(0xf2f7ff);
            this.scene1.fog = new this.$THREE.Fog(0xf2f7ff, 1, 25000);
            this.scene2 = new this.$THREE.Scene();
            this.scene2.background = new this.$THREE.Color(0xf2f7ff);
            this.scene2.fog = new this.$THREE.Fog(0xf2f7ff, 1, 25000);
            this.scene1.add(new this.$THREE.AmbientLight(0xeef0ff));
            this.scene2.add(new this.$THREE.AmbientLight(0xeef0ff));
            var light1 = new this.$THREE.DirectionalLight(0xffffff, 2);
            light1.position.set(1, 1, 1);
            this.scene1.add(light1);
            var light2 = new this.$THREE.DirectionalLight(0xffffff, 2);
            light2.position.set(1, 1, 1);
            this.scene2.add(light2);
            // GROUND
            var textureLoader = new this.$THREE.TextureLoader();
            var maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
            var texture1 = textureLoader.load("ststic/textures/crate.gif");
            var material1 = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, map: texture1 });
            texture1.anisotropy = maxAnisotropy;
            texture1.wrapS = texture1.wrapT = this.$THREE.RepeatWrapping;
            texture1.repeat.set(512, 512);
            var texture2 = textureLoader.load("ststic/textures/crate.gif");
            var material2 = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, map: texture2 });
            texture2.anisotropy = 1;
            texture2.wrapS = texture2.wrapT = this.$THREE.RepeatWrapping;
            texture2.repeat.set(512, 512);
            if (maxAnisotropy > 0) {
                document.getElementById("val_left").innerHTML = texture1.anisotropy;
                document.getElementById("val_right").innerHTML = texture2.anisotropy;
            } else {
                document.getElementById("val_left").innerHTML = "not supported";
                document.getElementById("val_right").innerHTML = "not supported";
            }
            //
            var geometry = new this.$THREE.PlaneBufferGeometry(100, 100);
            var mesh1 = new this.$THREE.Mesh(geometry, material1);
            mesh1.rotation.x = - Math.PI / 2;
            mesh1.scale.set(1000, 1000, 1000);
            var mesh2 = new this.$THREE.Mesh(geometry, material2);
            mesh2.rotation.x = - Math.PI / 2;
            mesh2.scale.set(1000, 1000, 1000);
            this.scene1.add(mesh1);
            this.scene2.add(mesh2);
            // RENDERER
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
            this.renderer.autoClear = false;
            this.renderer.domElement.style.position = "relative";
            this.container.appendChild(this.renderer.domElement);
            // STATS1
            this.stats = new this.$Stats();
            this.stats.dom.style.left = '280px'
            this.container.appendChild(this.stats.dom);
            document.addEventListener('mousemove', this.onDocumentMouseMove, false);
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX);
            this.mouseY = (event.clientY - this.windowHalfY);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
            this.stats.update();
        },
        render() {
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .05;
            this.camera.position.y = this.$THREE.MathUtils.clamp(this.camera.position.y + (- (this.mouseY - 200) - this.camera.position.y) * .05, 50, 1000);
            this.camera.lookAt(this.scene1.position);
            this.renderer.clear();
            this.renderer.setScissorTest(true);
            this.renderer.setScissor(0, 0, this.SCREEN_WIDTH / 2 - 2, this.SCREEN_HEIGHT);
            this.renderer.render(this.scene1, this.camera);
            this.renderer.setScissor(this.SCREEN_WIDTH / 2, 0, this.SCREEN_WIDTH / 2 - 2, this.SCREEN_HEIGHT);
            this.renderer.render(this.scene2, this.camera);
            this.renderer.setScissorTest(false);
        }
    },
}
</script>

<style scoped>
.webglMaterialsTextureAnisotropy-container {
    width: 100%;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}

.lbl {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    position: absolute;
    bottom: 0px;
    z-index: 100;
    text-shadow: #000 1px 1px 1px;
    background-color: rgba(0,0,0,0.85);
    padding: 1em;
}

#lbl_left {
    text-align:left;
    left:0px;
}

#lbl_right {
    text-align:left;
    right:0px
}

.g { color:#aaa }
.c { color:#fa0 }
</style>
