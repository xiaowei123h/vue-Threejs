<template>
    <div class="webglMirrorNodes-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - mirror node-based
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { ReflectorRTT } from '@/components/jsm/objects/ReflectorRTT.js'
import {
        NodeFrame,
        ExpressionNode,
        PhongNodeMaterial,
        MathNode,
        OperatorNode,
        TextureNode,
        BlurNode,
        FloatNode,
        ReflectorNode,
        SwitchNode,
        NormalMapNode,
    } from '@/components/jsm/nodes/Nodes.js'
export default {
    data() {
        return {
            WIDTH: null,
			HEIGHT: null,
			// camera
			VIEW_ANGLE: 45,
			ASPECT: null,
			NEAR: 1,
			FAR: 500,
			decalNormal: null,
			decalDiffuse: null,
            camera: null,
            scene: null,
            renderer: null,
			clock: null,
			cameraControls: null,
			gui: null,
            sphereGroup: null,
            smallSphere: null,
			groundMirrorMaterial: null,
			frame: null,
        }
    },
    mounted() {
        this.WIDTH = this.$webglInnerWidth
        this.HEIGHT = window.innerHeight
        this.ASPECT = this.WIDTH / this.HEIGHT
        this.decalNormal = new this.$THREE.TextureLoader().load('static/textures/decal/decal-normal.jpg')
        this.decalDiffuse = new this.$THREE.TextureLoader().load('static/textures/decal/decal-diffuse.png')
        this.decalDiffuse.wrapS = this.decalDiffuse.wrapT = this.$THREE.RepeatWrapping
        this.clock = new this.$THREE.Clock()
        this.gui = new GUI()
        this.frame = new NodeFrame()
        this.init()
        this.fillScene()
        this.update()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.WIDTH, this.HEIGHT)
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR)
            this.camera.position.set(0, 75, 160)
            this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement)
            this.cameraControls.target.set(0, 40, 0)
            this.cameraControls.maxDistance = 400
            this.cameraControls.minDistance = 10
            this.cameraControls.update()
            var container = document.getElementById('container')
            container.appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        fillScene() {
            var planeGeo = new this.$THREE.PlaneBufferGeometry(100.1, 100.1)
            var geometry, material
            // reflector/mirror plane
            geometry = new this.$THREE.PlaneBufferGeometry(100, 100)
            var groundMirror = new ReflectorRTT(geometry, { clipBias: 0.003, textureWidth: this.WIDTH, textureHeight: this.HEIGHT })
            var mask = new SwitchNode(new TextureNode(this.decalDiffuse), 'w')
            var mirror = new ReflectorNode(groundMirror)
            var normalMap = new TextureNode(this.decalNormal)
            var normalXY = new SwitchNode(normalMap, 'xy')
            var normalXYFlip = new MathNode(
                normalXY,
                MathNode.INVERT
            )
            var offsetNormal = new OperatorNode(
                normalXYFlip,
                new FloatNode(.5),
                OperatorNode.SUB
            )
            mirror.offset = new OperatorNode(
                offsetNormal, // normal
                new FloatNode(6), // scale
                OperatorNode.MUL
            )
            var blurMirror = new BlurNode(mirror)
            blurMirror.size = new this.$THREE.Vector2(this.WIDTH, this.HEIGHT)
            blurMirror.uv = new ExpressionNode("projCoord.xyz / projCoord.q", "vec3")
            blurMirror.uv.keywords[ "projCoord" ] = new OperatorNode(mirror.offset, mirror.uv, OperatorNode.ADD)
            blurMirror.radius.x = blurMirror.radius.y = 0
            this.gui.add({ blur: blurMirror.radius.x }, "blur", 0, 25).onChange((v) => {
                blurMirror.radius.x = blurMirror.radius.y = v
            })
            this.groundMirrorMaterial = new PhongNodeMaterial()
            this.groundMirrorMaterial.environment = blurMirror // or add "mirror" variable to disable blur
            this.groundMirrorMaterial.environmentAlpha = mask
            this.groundMirrorMaterial.normal = new NormalMapNode(normalMap)
            //this.groundMirrorMaterial.normalScale = new FloatNode(1)
            // test serialization
            /*
                    var library = {}
                    library[ groundMirror.uuid ] = groundMirror
                    library[ decalDiffuse.uuid ] = decalDiffuse
                    library[ decalNormal.uuid ] = decalNormal
                    library[ mirror.textureMatrix.uuid ] = mirror.textureMatrix // use textureMatrix to projection

                    var json = this.groundMirrorMaterial.toJSON()

                    this.groundMirrorMaterial = new NodeMaterialLoader(null, library).parse(json)
                */
            //--
            var mirrorMesh = new this.$THREE.Mesh(planeGeo, this.groundMirrorMaterial)
            // add all alternative mirror materials inside the ReflectorRTT to prevent:
            // glDrawElements: Source and destination textures of the draw are the same.
            groundMirror.add(mirrorMesh)
            groundMirror.rotateX(- Math.PI / 2)
            this.scene.add(groundMirror)
            this.sphereGroup = new this.$THREE.Object3D()
            this.scene.add(this.sphereGroup)
            geometry = new this.$THREE.CylinderBufferGeometry(0.1, 15 * Math.cos(Math.PI / 180 * 30), 0.1, 24, 1)
            material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x444444 })
            var sphereCap = new this.$THREE.Mesh(geometry, material)
            sphereCap.position.y = - 15 * Math.sin(Math.PI / 180 * 30) - 0.05
            sphereCap.rotateX(- Math.PI)
            geometry = new this.$THREE.SphereBufferGeometry(15, 24, 24, Math.PI / 2, Math.PI * 2, 0, Math.PI / 180 * 120)
            var halfSphere = new this.$THREE.Mesh(geometry, material)
            halfSphere.add(sphereCap)
            halfSphere.rotateX(- Math.PI / 180 * 135)
            halfSphere.rotateZ(- Math.PI / 180 * 20)
            halfSphere.position.y = 7.5 + 15 * Math.sin(Math.PI / 180 * 30)
            this.sphereGroup.add(halfSphere)
            geometry = new this.$THREE.IcosahedronBufferGeometry(5, 0)
            material = new this.$THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x333333, flatShading: true })
            this.smallSphere = new this.$THREE.Mesh(geometry, material)
            this.scene.add(this.smallSphere)
            // walls
            var planeTop = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0xffffff }))
            planeTop.position.y = 100
            planeTop.rotateX(Math.PI / 2)
            this.scene.add(planeTop)
            var planeBack = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0xffffff }))
            planeBack.position.z = - 50
            planeBack.position.y = 50
            this.scene.add(planeBack)
            var planeFront = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0x7f7fff }))
            planeFront.position.z = 50
            planeFront.position.y = 50
            planeFront.rotateY(Math.PI)
            this.scene.add(planeFront)
            var planeRight = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0x00ff00 }))
            planeRight.position.x = 50
            planeRight.position.y = 50
            planeRight.rotateY(- Math.PI / 2)
            this.scene.add(planeRight)
            var planeLeft = new this.$THREE.Mesh(planeGeo, new this.$THREE.MeshPhongMaterial({ color: 0xff0000 }))
            planeLeft.position.x = - 50
            planeLeft.position.y = 50
            planeLeft.rotateY(Math.PI / 2)
            this.scene.add(planeLeft)
            // lights
            var mainLight = new this.$THREE.PointLight(0xcccccc, 1.5, 250)
            mainLight.position.y = 60
            this.scene.add(mainLight)
            var greenLight = new this.$THREE.PointLight(0x00ff00, 0.25, 1000)
            greenLight.position.set(550, 50, 0)
            this.scene.add(greenLight)
            var redLight = new this.$THREE.PointLight(0xff0000, 0.25, 1000)
            redLight.position.set(- 550, 50, 0)
            this.scene.add(redLight)
            var blueLight = new this.$THREE.PointLight(0x7f7fff, 0.25, 1000)
            blueLight.position.set(0, 50, 550)
            this.scene.add(blueLight)
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        },
        update() {
            requestAnimationFrame(this.update)
            var delta = this.clock.getDelta()
            var timer = Date.now() * 0.01
            this.sphereGroup.rotation.y -= 0.002
            this.smallSphere.position.set(
                Math.cos(timer * 0.1) * 30,
                Math.abs(Math.cos(timer * 0.2)) * 20 + 5,
                Math.sin(timer * 0.1) * 30
            )
            this.smallSphere.rotation.y = (Math.PI / 2) - timer * 0.1
            this.smallSphere.rotation.z = timer * 0.8
            this.frame.update(delta).updateNode(this.groundMirrorMaterial)
            this.render()
        }
    },
}
</script>

<style scoped>
.webglMirrorNodes-container {
    width: 100%;
}
#info {
    color: #444;
}
#info a {
    color: #08f;
}
</style>
