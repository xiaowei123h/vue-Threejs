<template>
    <div class="webglSpritesNodes-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Node-Based Sprites
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { NodeMaterialLoader, NodeMaterialLoaderUtils } from '@/components/jsm/loaders/NodeMaterialLoader.js'
import {
    NodeFrame,
    SpriteNodeMaterial,
    MathNode,
    OperatorNode,
    TextureNode,
    Vector2Node,
    TimerNode,
    FunctionNode,
    FunctionCallNode,
    PositionNode,
    UVNode
} from '@/components/jsm/nodes/Nodes.js'
export default {
    data() {
        return {
            container: null,
            renderer: null,
            scene: null,
            camera: null,
			clock: null,
			frame: null,
            sprite1: null,
            sprite2: null,
            sprite3: null,
            walkingManTexture: null,
            walkingManTextureURL: null,
			library: {},
            controls: null,
            fov: 50
        }
    },
    mounted() {
        this.container = document.getElementById('container')
        this.clock = new this.$THREE.Clock()
        this.frame = new NodeFrame()
        window.addEventListener('load', this.init)
    },
    methods: {
        init() {
            //
            // Renderer / Controls
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.scene.fog = new this.$THREE.Fog(0x0000FF, 70, 150)
            this.camera = new this.$THREE.PerspectiveCamera(this.fov, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 100
            this.camera.target = new this.$THREE.Vector3()
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 50
            this.controls.maxDistance = 200
            //
            // SpriteNode
            //
            // https://openclipart.org/detail/239883/walking-man-sprite-sheet
            this.walkingManTextureURL = "static/textures/WalkingManSpriteSheet.png"
            this.walkingManTexture = new this.$THREE.TextureLoader().load(this.walkingManTextureURL)
            this.walkingManTexture.wrapS = this.walkingManTexture.wrapT = this.$THREE.RepeatWrapping
            this.library[ this.walkingManTextureURL ] = this.walkingManTexture
            // horizontal sprite-sheet animator
            function createHorizontalSpriteSheetNode(hCount, speed) {
                var speedNode = new Vector2Node(speed, 0) // frame per second
                var scale = new Vector2Node(1 / hCount, 1) // 8 horizontal images in sprite-sheet
                var uvTimer = new OperatorNode(
                    new TimerNode(),
                    speedNode,
                    OperatorNode.MUL
                )
                var uvIntegerTimer = new MathNode(
                    uvTimer,
                    MathNode.FLOOR
                )
                var uvFrameOffset = new OperatorNode(
                    uvIntegerTimer,
                    scale,
                    OperatorNode.MUL
                )
                var uvScale = new OperatorNode(
                    new UVNode(),
                    scale,
                    OperatorNode.MUL
                )
                var uvFrame = new OperatorNode(
                    uvScale,
                    uvFrameOffset,
                    OperatorNode.ADD
                )
                return uvFrame
            }
            // sprites
            var spriteWidth = 20, spriteHeight = 20
            this.scene.add(this.sprite1 = new this.$THREE.Sprite(new SpriteNodeMaterial()))
            this.sprite1.scale.x = spriteWidth
            this.sprite1.scale.y = spriteHeight
            this.sprite1.material.color = new TextureNode(this.walkingManTexture)
            this.sprite1.material.color.uv = createHorizontalSpriteSheetNode(8, 10)
            this.scene.add(this.sprite2 = new this.$THREE.Sprite(new SpriteNodeMaterial()))
            this.sprite2.position.x = 30
            this.sprite2.scale.x = spriteWidth
            this.sprite2.scale.y = spriteHeight
            this.sprite2.material.color = new TextureNode(this.walkingManTexture)
            this.sprite2.material.color.uv = createHorizontalSpriteSheetNode(8, 30)
            this.sprite2.material.color = new MathNode(this.sprite2.material.color, MathNode.INVERT)
            this.sprite2.material.spherical = false // look at this.camera horizontally only, very used in vegetation
            // horizontal zigzag sprite
            this.sprite2.material.position = new OperatorNode(
                new OperatorNode(
                    new MathNode(new TimerNode(3), MathNode.SIN), // 3 is speed (time scale)
                    new Vector2Node(.3, 0), // horizontal scale (position)
                    OperatorNode.MUL
                ),
                new PositionNode(),
                OperatorNode.ADD
            )
            var sineWaveFunction = new FunctionNode([
                // https://stackoverflow.com/questions/36174431/how-to-make-a-wave-warp-effect-in-shader
                "vec2 sineWave(vec2 uv, vec2 phase) {",
                // wave distortion
                "	float x = sin(25.0*uv.y + 30.0*uv.x + 6.28*phase.x) * 0.01;",
                "	float y = sin(25.0*uv.y + 30.0*uv.x + 6.28*phase.y) * 0.03;",
                "	return vec2(uv.x+x, uv.y+y);",
                "}"
            ].join("\n"))
            this.scene.add(this.sprite3 = new this.$THREE.Sprite(new SpriteNodeMaterial()))
            this.sprite3.position.x = - 30
            this.sprite3.scale.x = spriteWidth
            this.sprite3.scale.y = spriteHeight
            this.sprite3.material.color = new TextureNode(this.walkingManTexture)
            this.sprite3.material.color.uv = new FunctionCallNode(sineWaveFunction, {
                "uv": createHorizontalSpriteSheetNode(8, 10),
                "phase": new TimerNode()
            })
            this.sprite3.material.fog = true
            //
            //	Test serialization
            //
            this.spriteToJSON(this.sprite1)
            this.spriteToJSON(this.sprite2)
            this.spriteToJSON(this.sprite3)
            //
            // Events
            //
            window.addEventListener('resize', this.onWindowResize, false)
            this.onWindowResize()
            this.animate()
        },
        spriteToJSON(sprite) {
            // serialize
            var json = sprite.material.toJSON()
            // replace uuid to url (facilitates the load of textures using url otherside uuid)
            NodeMaterialLoaderUtils.replaceUUID(json, this.walkingManTexture, this.walkingManTextureURL)
            // deserialize
            var material = new NodeMaterialLoader(null, this.library).parse(json)
            // replace material
            sprite.material.dispose()
            sprite.material = material
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            var delta = this.clock.getDelta()
            // update material animation and/or gpu calcs (pre-this.renderer)
            this.frame.update(delta)
                .updateNode(this.sprite1.material)
                .updateNode(this.sprite2.material)
                .updateNode(this.sprite3.material)
            // rotate sprite
            this.sprite3.rotation.z -= Math.PI * .005
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        }
    },
}
</script>

<style scoped>
.webglSpritesNodes-container {
    position: relative;
    width: 100%;
}
</style>
