<template>
    <div class="webglPostprocessingNodes-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Node-Based Post-Processing
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import * as Nodes from '@/components/jsm/nodes/Nodes.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            object: null,
            light: null,
            nodepost: null,
			gui: null,
			clock: null,
			frame: null,
			param: null,
			textureLoader: null,
			lensflare2: null,
			decalNormal: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.frame = new Nodes.NodeFrame()
        this.param = { example: new URL(window.location.href).searchParams.get('e') || 'color-adjustment' }
        this.textureLoader = new this.$THREE.TextureLoader()
        this.lensflare2 = this.textureLoader.load('static/textures/lensflare/lensflare0.png')
        this.lensflare2.wrapS = this.lensflare2.wrapT = this.$THREE.RepeatWrapping
        this.decalNormal = this.textureLoader.load('static/textures/decal/decal-normal.jpg')
        this.decalNormal.wrapS = this.decalNormal.wrapT = this.$THREE.RepeatWrapping
        this.init()
		this.animate()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        clearGui() {
            if (this.gui) this.gui.destroy()
            this.gui = new GUI()
            this.gui.add(this.param, 'example', {
                'basic / color-adjustment': 'color-adjustment',
                'basic / blends': 'blends',
                'basic / fade': 'fade',
                'basic / invert': 'invert',
                'basic / blur': 'blur',
                'adv / motion-blur': 'motion-blur',
                'adv / saturation': 'saturation',
                'adv / refraction': 'refraction',
                'adv / mosaic': 'mosaic'
            }).onFinishChange(() => {
                this.updateMaterial()
            })
            this.gui.open()
        },
        addGui(name, value, callback, isColor, min, max) {
            var node
            this.param[ name ] = value
            if (isColor) {
                node = this.gui.addColor(this.param, name).onChange(() => {
                    callback(this.param[ name ])
                })
            } else if (typeof value == 'object') {
                this.param[ name ] = value[ Object.keys(value)[ 0 ] ]
                node = this.gui.add(this.param, name, value).onChange(() => {
                    callback(this.param[ name ])
                })
            } else {
                node = this.gui.add(this.param, name, min, max).onChange(() => {
                    callback(this.param[ name ])
                })
            }
            return node
        },
        updateMaterial() {
            var name = this.param.example
            var screen, fade, scale, size
            this.clearGui()
            switch (name) {
                case 'color-adjustment':
                    // POST
                    screen = new Nodes.ScreenNode()
                    var hue = new Nodes.FloatNode()
                    var sataturation = new Nodes.FloatNode(1)
                    var vibrance = new Nodes.FloatNode()
                    var brightness = new Nodes.FloatNode(0)
                    var contrast = new Nodes.FloatNode(1)
                    var hueNode = new Nodes.ColorAdjustmentNode(screen, hue, Nodes.ColorAdjustmentNode.HUE)
                    var satNode = new Nodes.ColorAdjustmentNode(hueNode, sataturation, Nodes.ColorAdjustmentNode.SATURATION)
                    var vibranceNode = new Nodes.ColorAdjustmentNode(satNode, vibrance, Nodes.ColorAdjustmentNode.VIBRANCE)
                    var brightnessNode = new Nodes.ColorAdjustmentNode(vibranceNode, brightness, Nodes.ColorAdjustmentNode.BRIGHTNESS)
                    var contrastNode = new Nodes.ColorAdjustmentNode(brightnessNode, contrast, Nodes.ColorAdjustmentNode.CONTRAST)
                    this.nodepost.output = contrastNode
                    // GUI
                    this.addGui('hue', hue.value, (val) => {
                        hue.value = val
                    }, false, 0, Math.PI * 2)
                    this.addGui('saturation', sataturation.value, (val) => {
                        sataturation.value = val
                    }, false, 0, 2)
                    this.addGui('vibrance', vibrance.value, (val) => {
                        vibrance.value = val
                    }, false, - 1, 1)
                    this.addGui('brightness', brightness.value, (val) => {
                        brightness.value = val
                    }, false, 0, .5)
                    this.addGui('contrast', contrast.value, (val) => {
                        contrast.value = val
                    }, false, 0, 2)
                    break
                case 'fade':
                    // POST
                    var color = new Nodes.ColorNode(0xFFFFFF)
                    var percent = new Nodes.FloatNode(.5)
                    fade = new Nodes.MathNode(
                        new Nodes.ScreenNode(),
                        color,
                        percent,
                        Nodes.MathNode.MIX
                    )
                    this.nodepost.output = fade
                    // GUI
                    this.addGui('color', color.value.getHex(), (val) => {
                        color.value.setHex(val)
                    }, true)
                    this.addGui('fade', percent.value, (val) => {
                        percent.value = val
                    }, false, 0, 1)
                    break
                case 'invert':
                    // POST
                    var alpha = new Nodes.FloatNode(1)
                    screen = new Nodes.ScreenNode()
                    var inverted = new Nodes.MathNode(screen, Nodes.MathNode.INVERT)
                    fade = new Nodes.MathNode(
                        screen,
                        inverted,
                        alpha,
                        Nodes.MathNode.MIX
                    )
                    this.nodepost.output = fade
                    // GUI
                    this.addGui('alpha', alpha.value, (val) => {
                        alpha.value = val
                    }, false, 0, 1)
                    break
                case 'blends':
                    // POST
                    var multiply = new Nodes.OperatorNode(
                        new Nodes.ScreenNode(),
                        new Nodes.TextureNode(this.lensflare2),
                        Nodes.OperatorNode.ADD
                    )
                    this.nodepost.output = multiply
                    // GUI
                    this.addGui('blend', {
                        'addition': Nodes.OperatorNode.ADD,
                        'subtract': Nodes.OperatorNode.SUB,
                        'multiply': Nodes.OperatorNode.MUL,
                        'division': Nodes.OperatorNode.DIV
                    }, (val) => {
                        multiply.op = val
                        this.nodepost.needsUpdate = true
                    })
                    break
                case 'saturation':
                    // PASS
                    screen = new Nodes.ScreenNode()
                    var sat = new Nodes.FloatNode(0)
                    var satrgb = new Nodes.FunctionNode( [
							"vec3 satrgb( vec3 rgb, float adjustment ) {",
							// include luminance function from LuminanceNode
							"	vec3 intensity = vec3( luminance( rgb ) );",
							"	return mix( intensity, rgb, adjustment );",
							"}"
						].join( "\n" ), [ Nodes.LuminanceNode.Nodes.luminance ] )
                    var saturation = new Nodes.FunctionCallNode(satrgb)
                    saturation.inputs.rgb = screen
                    saturation.inputs.adjustment = sat
                    this.nodepost.output = saturation
                    // GUI
                    this.addGui('saturation', sat.value, (val) => {
                        sat.value = val
                    }, false, 0, 2)
                    break
                case 'refraction':
                    // POST
                    var normal = new Nodes.TextureNode(this.decalNormal)
                    var normalXY = new Nodes.SwitchNode(normal, 'xy')
                    scale = new Nodes.FloatNode(.5)
                    var normalXYFlip = new Nodes.MathNode(
                        normalXY,
                        Nodes.MathNode.INVERT
                    )
                    var offsetNormal = new Nodes.OperatorNode(
                        normalXYFlip,
                        new Nodes.FloatNode(.5),
                        Nodes.OperatorNode.ADD
                    )
                    var scaleTexture = new Nodes.OperatorNode(
                        new Nodes.SwitchNode(normal, 'z'),
                        offsetNormal,
                        Nodes.OperatorNode.MUL
                    )
                    var scaleNormal = new Nodes.MathNode(
                        new Nodes.FloatNode(1),
                        scaleTexture,
                        scale,
                        Nodes.MathNode.MIX
                    )
                    var offsetCoord = new Nodes.OperatorNode(
                        new Nodes.UVNode(),
                        scaleNormal,
                        Nodes.OperatorNode.MUL
                    )
                    screen = new Nodes.ScreenNode(offsetCoord)
                    this.nodepost.output = screen
                    // GUI
                    this.addGui('scale', scale.value, (val) => {
                        scale.value = val
                    }, false, 0, 1)
                    this.addGui('invert', false, (val) => {
                        offsetNormal.a = val ? normalXYFlip : normalXY
                        this.nodepost.needsUpdate = true
                    })
                    break
                case 'motion-blur':
                    // POST
                    size = this.renderer.getDrawingBufferSize(new this.$THREE.Vector2())
                    screen = new Nodes.ScreenNode()
                    var previousFrame = new Nodes.RTTNode(size.width, size.height, screen)
                    var motionBlur = new Nodes.MathNode(
                        previousFrame,
                        screen,
                        new Nodes.FloatNode(.5),
                        Nodes.MathNode.MIX
                    )
                    var currentFrame = new Nodes.RTTNode(size.width, size.height, motionBlur)
                    currentFrame.saveTo = previousFrame
                    this.nodepost.output = currentFrame
                    break
                case 'mosaic':
                    // POST
                    scale = new Nodes.FloatNode(128)
                    fade = new Nodes.FloatNode(1)
                    var uv = new Nodes.UVNode()
                    var blocks = new Nodes.OperatorNode(
                        uv,
                        scale,
                        Nodes.OperatorNode.MUL
                    )
                    var blocksSize = new Nodes.MathNode(
                        blocks,
                        Nodes.MathNode.FLOOR
                    )
                    var mosaicUV = new Nodes.OperatorNode(
                        blocksSize,
                        scale,
                        Nodes.OperatorNode.DIV
                    )
                    var fadeScreen = new Nodes.MathNode(
                        uv,
                        mosaicUV,
                        fade,
                        Nodes.MathNode.MIX
                    )
                    this.nodepost.output = new Nodes.ScreenNode(fadeScreen)
                    // GUI
                    this.addGui('scale', scale.value, (val) => {
                        scale.value = val
                    }, false, 16, 1024)
                    this.addGui('fade', fade.value, (val) => {
                        fade.value = val
                    }, false, 0, 1)
                    this.addGui('mask', false, (val) => {
                        fadeScreen.c = val ? new Nodes.TextureNode(this.lensflare2) : fade
                        this.nodepost.needsUpdate = true
                    })
                    break
                case 'blur':
                    // POST
                    size = this.renderer.getDrawingBufferSize(new this.$THREE.Vector2())
                    var blurScreen = new Nodes.BlurNode(new Nodes.ScreenNode())
                    blurScreen.size = new this.$THREE.Vector2(size.width, size.height)
                    this.nodepost.output = blurScreen
                    // GUI
                    this.addGui('blurX', blurScreen.radius.x, (val) => {
                        blurScreen.radius.x = val
                    }, false, 0, 15)
                    this.addGui('blurY', blurScreen.radius.y, (val) => {
                        blurScreen.radius.y = val
                    }, false, 0, 15)
                    break
            }
            this.nodepost.needsUpdate = true
            // test serialization
            /*
                        var library = {}
                        library[ lensflare2.uuid ] = lensflare2
                        library[ decalNormal.uuid ] = decalNormal

                        var json = nodepost.toJSON()

                        nodepost.output = new NodeMaterialLoader(null, library).parse(json).value
                    */
        },
        init() {
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglPostprocessingNodes-container')[0].appendChild(this.renderer.domElement)
            this.nodepost = new Nodes.NodePostProcessing(this.renderer)
            //
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 400
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.Fog(0x0066FF, 1, 1000)
            this.object = new this.$THREE.Object3D()
            this.scene.add(this.object)
            var geometry = new this.$THREE.SphereBufferGeometry(1, 4, 4)
            for (var i = 0; i < 100; i ++) {
                var material = new this.$THREE.MeshPhongMaterial({ color: 0x888888 + (Math.random() * 0x888888), flatShading: true })
                var mesh = new this.$THREE.Mesh(geometry, material)
                mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
                mesh.position.multiplyScalar(Math.random() * 400)
                mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
                mesh.scale.x = mesh.scale.y = mesh.scale.z = 10 + (Math.random() * 40)
                this.object.add(mesh)
            }
            this.scene.add(new this.$THREE.AmbientLight(0x999999))
            this.light = new this.$THREE.DirectionalLight(0xffffff)
            this.light.position.set(1, 1, 1)
            this.scene.add(this.light)
            //
            this.updateMaterial()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            var delta = this.clock.getDelta()
            this.object.rotation.x += 0.005
            this.object.rotation.y += 0.01
            this.frame.update(delta)
            this.nodepost.render(this.scene, this.camera, this.frame)
        }
    },
}
</script>

<style scoped>
.webglPostprocessingNodes-container {
    position: relative;
    width: 100%;
}
</style>
