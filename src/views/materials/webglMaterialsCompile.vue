<template>
    <div class="webglMaterialsCompile-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Node-Based Material
			<br /><span class="button" id="preload">change preload</span>
		</div>

		<div id="waitScreen">
			Loading ...
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { TeapotBufferGeometry } from '@/components/jsm/geometries/TeapotBufferGeometry.js'
import {
    NodeFrame,
    FloatNode,
    ColorNode,
    ConstNode,
    ExpressionNode,
    MathNode,
    OperatorNode,
    TimerNode,
    PhongNodeMaterial
} from '@/components/jsm/nodes/Nodes.js'
export default {
    data() {
        return {
            container: null,
            renderer: null,
            scene: null,
            camera: null,
            clock: null,
            fov: 50,
			frame: null,
			teapot: null,
			controls: null,
			meshes: [],
        }
    },
    mounted() {
        this.container = document.getElementById('container')
        this.clock = new this.$THREE.Clock()
        this.frame = new NodeFrame()
        document.getElementById("preload").addEventListener('click', () => {
            var hash = document.location.hash.substr(1)
            if (hash.length === 0) {
                window.location.hash = "#NoPreLoad"
            } else {
                window.location.hash = ""
            }
            location.reload(true)
        }, false)
        window.addEventListener('load', this.init)
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(this.fov, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.x = 0
            this.camera.position.z = - 300
            this.camera.position.y = 200
            this.camera.target = new this.$THREE.Vector3()
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 50
            this.controls.maxDistance = 400
            this.scene.add(new this.$THREE.AmbientLight(0x464646))
            var light1 = new this.$THREE.DirectionalLight(0xffddcc, 1)
            light1.position.set(1, 0.75, 0.5)
            this.scene.add(light1)
            var light2 = new this.$THREE.DirectionalLight(0xccccff, 1)
            light2.position.set(- 1, 0.75, - 0.5)
            this.scene.add(light2)
            this.teapot = new TeapotBufferGeometry(15, 18)
            var itemsonrow = 10
            for (var i = 0; i < itemsonrow * itemsonrow; i ++) {
                var mesh = new this.$THREE.Mesh(this.teapot)
                mesh.position.x = 50 * (i % itemsonrow) - 50 * itemsonrow / 2
                mesh.position.z = 50 * Math.floor(i / itemsonrow) - 150
                this.updateMaterial(mesh)
                this.scene.add(mesh)
                this.meshes.push(mesh)
            }
            window.addEventListener('resize', this.onWindowResize, false)
            var hash = document.location.hash.substr(1)
            if (hash.length === 0) {
                this.renderer.compile(this.scene, this.camera)
            }
            document.getElementById("waitScreen").className = "hide"
            setTimeout(() => {
                this.onWindowResize()
                this.animate()
            }, 1)
        },
        updateMaterial(mesh) {
            if (mesh.material) mesh.material.dispose()
            var mtl = new PhongNodeMaterial()
            var time = new TimerNode()
            var speed = new FloatNode(Math.random())
            var color = new ColorNode(Math.random() * 0xFFFFFF)
            var timeSpeed = new OperatorNode(
                time,
                speed,
                OperatorNode.MUL
            )
            var sinCycleInSecs = new OperatorNode(
                timeSpeed,
                new ConstNode(ConstNode.PI2),
                OperatorNode.MUL
            )
            var cycle = new MathNode(sinCycleInSecs, MathNode.SIN)
            var cycleColor = new OperatorNode(
                cycle,
                color,
                OperatorNode.MUL
            )
            var cos = new MathNode(cycleColor, MathNode.SIN)
            mtl.color = new ColorNode(0)
            mtl.emissive = cos
            var transformer = new ExpressionNode("position + 0.0 * " + Math.random(), "vec3", [ ])
            mtl.transform = transformer
            // build shader (ignore auto build)
            mtl.build()
            // set material
            mesh.material = mtl
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            var delta = this.clock.getDelta()
            this.frame.update(delta)
            for (var i = 0; i < this.meshes.length; i ++) {
                var mesh = this.meshes[ i ]
                this.frame.updateNode(mesh.material)
            }
            this.renderer.render(this.scene, this.camera)
            requestAnimationFrame(this.animate)
        }
    },
}
</script>

<style scoped>
.webglMaterialsCompile-container {
    width: 100%;
}
#waitScreen {
    color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -50px;
    margin-left: -50px;
    width: 100px;
    height: 100px;
}
.hide {
    display:none;
}
</style>
