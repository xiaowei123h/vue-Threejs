<template>
    <div class="webglPostprocessingRgbHalftone-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - RGB Halftone post-processing by
			<a href="https://github.com/meatbags" target="_blank">Xavier Burrow</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { HalftonePass } from '@/components/jsm/postprocessing/HalftonePass.js'
export default {
    data() {
        return {
            renderer: null,
            clock: null,
            camera: null,
            stats: null,
			rotationSpeed: Math.PI / 64,
            composer: null,
            group: null,
            gui: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.clock = new this.$THREE.Clock()
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 12
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglPostprocessingRgbHalftone-container')[0].appendChild(this.renderer.domElement)
            document.getElementsByClassName('webglPostprocessingRgbHalftone-container')[0].appendChild(this.stats.dom)
            // camera controls
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 0, 0)
            controls.update()
            // scene
            var scene = new this.$THREE.Scene()
            scene.background = new this.$THREE.Color(0x444444)
            this.group = new this.$THREE.Group()
            var floor = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(100, 1, 100), new this.$THREE.MeshPhongMaterial({}))
            floor.position.y = - 10
            var light = new this.$THREE.PointLight(0xffffff, 1.0, 50, 2)
            light.position.y = 2
            this.group.add(floor, light)
            scene.add(this.group)
            var mat = new this.$THREE.ShaderMaterial({
                uniforms: {},
                vertexShader: [
                    "varying vec2 vUV;",
                    "varying vec3 vNormal;",
                    "void main() {",
                    "vUV = uv;",
                    "vNormal = vec3(normal);",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
                    "}"
                ].join("\n"),
                fragmentShader: [
                    "varying vec2 vUV;",
                    "varying vec3 vNormal;",
                    "void main() {",
                    "vec4 c = vec4(abs(vNormal) + vec3(vUV, 0.0), 0.0);",
                    "gl_FragColor = c;",
                    "}"
                ].join("\n")
            })
            for (var i = 0; i < 50; ++ i) {
                // fill scene with coloured cubes
                var mesh = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(2, 2, 2), mat)
                mesh.position.set(Math.random() * 16 - 8, Math.random() * 16 - 8, Math.random() * 16 - 8)
                mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
                this.group.add(mesh)
            }
            // post-processing
            this.composer = new EffectComposer(this.renderer)
            var renderPass = new RenderPass(scene, this.camera)
            var params = {
                shape: 1,
                radius: 4,
                rotateR: Math.PI / 12,
                rotateB: Math.PI / 12 * 2,
                rotateG: Math.PI / 12 * 3,
                scatter: 0,
                blending: 1,
                blendingMode: 1,
                greyscale: false,
                disable: false
            }
            var halftonePass = new HalftonePass(this.$webglInnerWidth, window.innerHeight, params)
            this.composer.addPass(renderPass)
            this.composer.addPass(halftonePass)
            window.onresize = () => {
                // resize this.composer
                this.$onWindowResize(this.camera, this.renderer)
                this.$statsPosition(this.stats)
                this.composer.setSize(window.innerWidth - 281, window.innerHeight)
            }
            // GUI
            var controller = {
                radius: halftonePass.uniforms[ "radius" ].value,
                rotateR: halftonePass.uniforms[ "rotateR" ].value / (Math.PI / 180),
                rotateG: halftonePass.uniforms[ "rotateG" ].value / (Math.PI / 180),
                rotateB: halftonePass.uniforms[ "rotateB" ].value / (Math.PI / 180),
                scatter: halftonePass.uniforms[ "scatter" ].value,
                shape: halftonePass.uniforms[ "shape" ].value,
                greyscale: halftonePass.uniforms[ "greyscale" ].value,
                blending: halftonePass.uniforms[ "blending" ].value,
                blendingMode: halftonePass.uniforms[ "blendingMode" ].value,
                disable: halftonePass.uniforms[ "disable" ].value
            }
            function onGUIChange() {
                // update uniforms
                halftonePass.uniforms[ "radius" ].value = controller.radius
                halftonePass.uniforms[ "rotateR" ].value = controller.rotateR * (Math.PI / 180)
                halftonePass.uniforms[ "rotateG" ].value = controller.rotateG * (Math.PI / 180)
                halftonePass.uniforms[ "rotateB" ].value = controller.rotateB * (Math.PI / 180)
                halftonePass.uniforms[ "scatter" ].value = controller.scatter
                halftonePass.uniforms[ "shape" ].value = controller.shape
                halftonePass.uniforms[ "greyscale" ].value = controller.greyscale
                halftonePass.uniforms[ "blending" ].value = controller.blending
                halftonePass.uniforms[ "blendingMode" ].value = controller.blendingMode
                halftonePass.uniforms[ "disable" ].value = controller.disable
            }
            this.gui = new GUI()
            this.gui.add(controller, 'shape', { 'Dot': 1, 'Ellipse': 2, 'Line': 3, 'Square': 4 }).onChange(onGUIChange)
            this.gui.add(controller, 'radius', 1, 25).onChange(onGUIChange)
            this.gui.add(controller, 'rotateR', 0, 90).onChange(onGUIChange)
            this.gui.add(controller, 'rotateG', 0, 90).onChange(onGUIChange)
            this.gui.add(controller, 'rotateB', 0, 90).onChange(onGUIChange)
            this.gui.add(controller, 'scatter', 0, 1, 0.01).onChange(onGUIChange)
            this.gui.add(controller, 'greyscale').onChange(onGUIChange)
            this.gui.add(controller, 'blending', 0, 1, 0.01).onChange(onGUIChange)
            this.gui.add(controller, 'blendingMode', { 'Linear': 1, 'Multiply': 2, 'Add': 3, 'Lighter': 4, 'Darker': 5 }).onChange(onGUIChange)
            this.gui.add(controller, 'disable').onChange(onGUIChange)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            this.stats.update()
            this.group.rotation.y += delta * this.rotationSpeed
            this.composer.render(delta)
        }
    },
}
</script>

<style scoped>
.webglPostprocessingRgbHalftone-container {
    position: relative;
    width: 100%;
}
</style>
