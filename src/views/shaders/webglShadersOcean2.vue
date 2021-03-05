<template>
    <div class="webglShadersOcean2-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl ocean simulation
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { Ocean } from '@/components/jsm/misc/Ocean.js'
export default {
    data() {
        return {
            stats: null,
			lastTime: null,
            DEMO: null,
            gui: null,
        }
    },
    mounted() {
        this.stats = new this.$Stats();
        this.stats.dom.style.left = '280px'
        document.getElementsByClassName('webglShadersOcean2-container')[0].appendChild(this.stats.dom);
        this.lastTime = (new Date()).getTime();
        var that = this
        this.DEMO = {
            ms_Renderer: null,
            ms_Camera: null,
            ms_Scene: null,
            ms_Controls: null,
            ms_Ocean: null,
            Initialize: function () {
                this.ms_Renderer = new that.$THREE.WebGLRenderer();
                this.ms_Renderer.setPixelRatio(window.devicePixelRatio);
                document.getElementsByClassName('webglShadersOcean2-container')[0].appendChild(this.ms_Renderer.domElement);
                this.ms_Scene = new that.$THREE.Scene();
                this.ms_Camera = new that.$THREE.PerspectiveCamera(55.0, this.$webglInnerWidth / window.innerHeight, 0.5, 300000);
                this.ms_Camera.position.set(450, 350, 450);
                this.ms_Camera.lookAt(0, 0, 0);
                // Initialize Orbit control
                this.ms_Controls = new OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
                this.ms_Controls.userPan = false;
                this.ms_Controls.userPanSpeed = 0.0;
                this.ms_Controls.minDistance = 0;
                this.ms_Controls.maxDistance = 2000.0;
                this.ms_Controls.minPolarAngle = 0;
                this.ms_Controls.maxPolarAngle = Math.PI * 0.495;
                var gsize = 512;
                var res = 1024;
                var gres = res / 2;
                var origx = - gsize / 2;
                var origz = - gsize / 2;
                this.ms_Ocean = new Ocean(this.ms_Renderer, this.ms_Camera, this.ms_Scene,
                    {
                        USE_HALF_FLOAT: false,
                        INITIAL_SIZE: 256.0,
                        INITIAL_WIND: [ 10.0, 10.0 ],
                        INITIAL_CHOPPINESS: 1.5,
                        CLEAR_COLOR: [ 1.0, 1.0, 1.0, 0.0 ],
                        GEOMETRY_ORIGIN: [ origx, origz ],
                        SUN_DIRECTION: [ - 1.0, 1.0, 1.0 ],
                        OCEAN_COLOR: new that.$THREE.Vector3(0.004, 0.016, 0.047),
                        SKY_COLOR: new that.$THREE.Vector3(3.2, 9.6, 12.8),
                        EXPOSURE: 0.35,
                        GEOMETRY_RESOLUTION: gres,
                        GEOMETRY_SIZE: gsize,
                        RESOLUTION: res
                    });
                this.ms_Ocean.materialOcean.uniforms[ "u_projectionMatrix" ] = { value: this.ms_Camera.projectionMatrix };
                this.ms_Ocean.materialOcean.uniforms[ "u_viewMatrix" ] = { value: this.ms_Camera.matrixWorldInverse };
                this.ms_Ocean.materialOcean.uniforms[ "u_cameraPosition" ] = { value: this.ms_Camera.position };
                this.ms_Scene.add(this.ms_Ocean.oceanMesh);
                that.gui = new GUI();
                that.gui.add(this.ms_Ocean, "size", 100, 5000).onChange(function (v) {
                    this.object.size = v;
                    this.object.changed = true;
                });
                that.gui.add(this.ms_Ocean, "choppiness", 0.1, 4).onChange(function (v) {
                    this.object.choppiness = v;
                    this.object.changed = true;
                });
                that.gui.add(this.ms_Ocean, "windX", - 15, 15).onChange(function (v) {
                    this.object.windX = v;
                    this.object.changed = true;
                });
                that.gui.add(this.ms_Ocean, "windY", - 15, 15).onChange(function (v) {
                    this.object.windY = v;
                    this.object.changed = true;
                });
                that.gui.add(this.ms_Ocean, "sunDirectionX", - 1.0, 1.0).onChange(function (v) {
                    this.object.sunDirectionX = v;
                    this.object.changed = true;
                });
                that.gui.add(this.ms_Ocean, "sunDirectionY", - 1.0, 1.0).onChange(function (v) {
                    this.object.sunDirectionY = v;
                    this.object.changed = true;
                });
                that.gui.add(this.ms_Ocean, "sunDirectionZ", - 1.0, 1.0).onChange(function (v) {
                    this.object.sunDirectionZ = v;
                    this.object.changed = true;
                });
                that.gui.add(this.ms_Ocean, "exposure", 0.0, 0.5).onChange(function (v) {
                    this.object.exposure = v;
                    this.object.changed = true;
                });
            },
            Display: function () {
                this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
            },
            Update: function () {
                var currentTime = new Date().getTime();
                this.ms_Ocean.deltaTime = (currentTime - that.lastTime) / 1000 || 0.0;
                that.lastTime = currentTime;
                this.ms_Ocean.render(this.ms_Ocean.deltaTime);
                this.ms_Ocean.overrideMaterial = this.ms_Ocean.materialOcean;
                if (this.ms_Ocean.changed) {
                    this.ms_Ocean.materialOcean.uniforms[ "u_size" ].value = this.ms_Ocean.size;
                    this.ms_Ocean.materialOcean.uniforms[ "u_sunDirection" ].value.set(this.ms_Ocean.sunDirectionX, this.ms_Ocean.sunDirectionY, this.ms_Ocean.sunDirectionZ);
                    this.ms_Ocean.materialOcean.uniforms[ "u_exposure" ].value = this.ms_Ocean.exposure;
                    this.ms_Ocean.changed = false;
                }
                this.ms_Ocean.materialOcean.uniforms[ "u_normalMap" ].value = this.ms_Ocean.normalMapFramebuffer.texture;
                this.ms_Ocean.materialOcean.uniforms[ "u_displacementMap" ].value = this.ms_Ocean.displacementMapFramebuffer.texture;
                this.ms_Ocean.materialOcean.uniforms[ "u_projectionMatrix" ].value = this.ms_Camera.projectionMatrix;
                this.ms_Ocean.materialOcean.uniforms[ "u_viewMatrix" ].value = this.ms_Camera.matrixWorldInverse;
                this.ms_Ocean.materialOcean.uniforms[ "u_cameraPosition" ].value = this.ms_Camera.position;
                this.ms_Ocean.materialOcean.depthTest = true;
                this.Display();
            },
            Resize: function (inWidth, inHeight) {
                this.ms_Camera.aspect = inWidth / inHeight;
                this.ms_Camera.updateProjectionMatrix();
                this.ms_Renderer.setSize(inWidth, inHeight);
                this.Display();
            }
        };
        this.DEMO.Initialize();
        window.addEventListener('resize', () => {
            this.DEMO.Resize(window.innerWidth - 281, window.innerHeight);
        });
        this.DEMO.Resize(window.innerWidth - 281, window.innerHeight);
        this.render()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        render() {
            requestAnimationFrame(this.render);
            this.DEMO.Update();
            this.stats.update();
        }
    },
}
</script>

<style scoped>
.webglShadersOcean2-container {
    width: 100%;
}
</style>
