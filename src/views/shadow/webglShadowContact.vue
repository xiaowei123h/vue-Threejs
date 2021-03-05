<template>
    <div class="webglShadowContact-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - contact shadows
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { HorizontalBlurShader } from '@/components/jsm/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from '@/components/jsm/shaders/VerticalBlurShader.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
            gui: null,
			meshes: [],
			PLANE_WIDTH: 2.5,
			PLANE_HEIGHT: 2.5,
			CAMERA_HEIGHT: 0.3,
			state: {
				shadow: {
					blur: 3.5,
					darkness: 1,
					opacity: 1,
				},
				plane: {
					color: '#ffffff',
					opacity: 1,
				},
				showWireframe: false,
			},
            shadowGroup: null,
            renderTarget: null,
            renderTargetBlur: null,
            shadowCamera: null,
            cameraHelper: null,
            depthMaterial: null,
            horizontalBlurMaterial: null,
            verticalBlurMaterial: null,
            plane: null,
            blurPlane: null,
            fillPlane: null,
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
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.set(0.5, 1, 2)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglShadowContact-container')[0].appendChild(this.stats.dom)
            window.addEventListener('resize', this.onWindowResize)
            // add the example meshes
            var geometries = [
                new this.$THREE.BoxBufferGeometry(0.4, 0.4, 0.4),
                new this.$THREE.IcosahedronBufferGeometry(0.3),
                new this.$THREE.TorusKnotBufferGeometry(0.4, 0.05, 256, 24, 1, 3)
            ]
            var material = new this.$THREE.MeshNormalMaterial()
            for (var i = 0, l = geometries.length; i < l; i ++) {
                var angle = (i / l) * Math.PI * 2
                var geometry = geometries[ i ]
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.y = 0.1
                mesh.position.x = Math.cos(angle) / 2.0
                mesh.position.z = Math.sin(angle) / 2.0
                this.scene.add(mesh)
                this.meshes.push(mesh)
            }
            // the container, if you need to move the plane just move this
            this.shadowGroup = new this.$THREE.Group()
            this.shadowGroup.position.y = - 0.3
            this.scene.add(this.shadowGroup)
            // the render target that will show the shadows in the plane texture
            this.renderTarget = new this.$THREE.WebGLRenderTarget(512, 512)
            this.renderTarget.texture.generateMipmaps = false
            // the render target that we will use to blur the first render target
            this.renderTargetBlur = new this.$THREE.WebGLRenderTarget(512, 512)
            this.renderTargetBlur.texture.generateMipmaps = false
            // make a plane and make it face up
            var planeGeometry = new this.$THREE.PlaneBufferGeometry(this.PLANE_WIDTH, this.PLANE_HEIGHT).rotateX(Math.PI / 2)
            var planeMaterial = new this.$THREE.MeshBasicMaterial({
                map: this.renderTarget.texture,
                opacity: this.state.shadow.opacity,
                transparent: true,
            })
            this.plane = new this.$THREE.Mesh(planeGeometry, planeMaterial)
            this.shadowGroup.add(this.plane)
            // the y from the texture is flipped!
            this.plane.scale.y = - 1
            // the plane onto which to blur the texture
            this.blurPlane = new this.$THREE.Mesh(planeGeometry)
            this.blurPlane.visible = false
            this.shadowGroup.add(this.blurPlane)
            // the plane with the color of the ground
            var fillPlaneMaterial = new this.$THREE.MeshBasicMaterial({
                color: this.state.plane.color,
                opacity: this.state.plane.opacity,
                transparent: true,
            })
            this.fillPlane = new this.$THREE.Mesh(planeGeometry, fillPlaneMaterial)
            this.fillPlane.rotateX(Math.PI)
            this.fillPlane.position.y -= 0.00001
            this.shadowGroup.add(this.fillPlane)
            // the this.camera to render the depth material from
            this.shadowCamera = new this.$THREE.OrthographicCamera(- this.PLANE_WIDTH / 2, this.PLANE_WIDTH / 2, this.PLANE_HEIGHT / 2, - this.PLANE_HEIGHT / 2, 0, this.CAMERA_HEIGHT)
            this.shadowCamera.rotation.x = Math.PI / 2 // get the this.camera to look up
            this.shadowGroup.add(this.shadowCamera)
            this.cameraHelper = new this.$THREE.CameraHelper(this.shadowCamera)
            // like MeshDepthMaterial, but goes from black to transparent
            this.depthMaterial = new this.$THREE.MeshDepthMaterial()
            this.depthMaterial.userData.darkness = { value: this.state.shadow.darkness }
            this.depthMaterial.onBeforeCompile = (shader) => {
                shader.uniforms.darkness = this.depthMaterial.userData.darkness
                shader.fragmentShader = /* glsl */`
                    uniform float darkness;
                    ${shader.fragmentShader.replace(
                        'gl_FragColor = vec4(vec3(1.0 - fragCoordZ), opacity);',
                        'gl_FragColor = vec4(vec3(0.0), (1.0 - fragCoordZ) * darkness);'
                    )}
                `
            }
            this.depthMaterial.depthTest = false
            this.depthMaterial.depthWrite = false
            this.horizontalBlurMaterial = new this.$THREE.ShaderMaterial(HorizontalBlurShader)
            this.horizontalBlurMaterial.depthTest = false
            this.verticalBlurMaterial = new this.$THREE.ShaderMaterial(VerticalBlurShader)
            this.verticalBlurMaterial.depthTest = false
            //
            this.gui = new GUI()
            var shadowFolder = this.gui.addFolder('shadow')
            shadowFolder.open()
            var planeFolder = this.gui.addFolder('plane')
            planeFolder.open()
            shadowFolder.add(this.state.shadow, 'blur', 0, 15, 0.1)
            shadowFolder.add(this.state.shadow, 'darkness', 1, 5, 0.1).onChange(() => {
                this.depthMaterial.userData.darkness.value = this.state.shadow.darkness
            })
            shadowFolder.add(this.state.shadow, 'opacity', 0, 1, 0.01).onChange(() => {
                this.plane.material.opacity = this.state.shadow.opacity
            })
            planeFolder.addColor(this.state.plane, 'color').onChange(() => {
                this.fillPlane.material.color = new this.$THREE.Color(this.state.plane.color)
            })
            planeFolder.add(this.state.plane, 'opacity', 0, 1, 0.01).onChange(() => {
                this.fillPlane.material.opacity = this.state.plane.opacity
            })
            this.gui.add(this.state, 'showWireframe', true).onChange(() => {
                if (this.state.showWireframe) {
                    this.scene.add(this.cameraHelper)
                } else {
                    this.scene.remove(this.cameraHelper)
                }
            })
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglShadowContact-container')[0].appendChild(this.renderer.domElement)
            //
            new OrbitControls(this.camera, this.renderer.domElement)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        blurShadow(amount) {
            this.blurPlane.visible = true
            // blur horizontally and draw in the this.renderTargetBlur
            this.blurPlane.material = this.horizontalBlurMaterial
            this.blurPlane.material.uniforms.tDiffuse.value = this.renderTarget.texture
            this.horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256
            this.renderer.setRenderTarget(this.renderTargetBlur)
            this.renderer.render(this.blurPlane, this.shadowCamera)
            // blur vertically and draw in the main this.renderTarget
            this.blurPlane.material = this.verticalBlurMaterial
            this.blurPlane.material.uniforms.tDiffuse.value = this.renderTargetBlur.texture
            this.verticalBlurMaterial.uniforms.v.value = amount * 1 / 256
            this.renderer.setRenderTarget(this.renderTarget)
            this.renderer.render(this.blurPlane, this.shadowCamera)
            this.blurPlane.visible = false
        },
        animate() {
            requestAnimationFrame(this.animate)
            //
            this.meshes.forEach(mesh => {
                mesh.rotation.x += 0.01
                mesh.rotation.y += 0.02
            })
            //
            // remove the background
            var initialBackground = this.scene.background
            this.scene.background = null
            // force the this.depthMaterial to everything
            this.cameraHelper.visible = false
            this.scene.overrideMaterial = this.depthMaterial
            // render to the render target to get the depths
            this.renderer.setRenderTarget(this.renderTarget)
            this.renderer.render(this.scene, this.shadowCamera)
            // and reset the override material
            this.scene.overrideMaterial = null
            this.cameraHelper.visible = true
            this.blurShadow(this.state.shadow.blur)
            // a second pass to reduce the artifacts
            // (0.4 is the minimum blur amout so that the artifacts are gone)
            this.blurShadow(this.state.shadow.blur * 0.4)
            // reset and render the normal this.scene
            this.renderer.setRenderTarget(null)
            this.scene.background = initialBackground
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.webglShadowContact-container {
    width: 100%;
}
#info {
    background-color: #fff;
    color: #000;
}
#info a {
    color: #08f;
}
</style>
