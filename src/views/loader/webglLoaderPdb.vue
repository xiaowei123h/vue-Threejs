<template>
    <div class="webglLoaderPdb-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js webgl</a> - molecules</div>
		<div id="menu"></div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { PDBLoader } from '@/components/jsm/loaders/PDBLoader.js'
import { CSS2DRenderer, CSS2DObject } from '@/components/jsm/renderers/CSS2DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            labelRenderer: null,
			controls: null,
			root: null,
			MOLECULES: {
				"Ethanol": "ethanol.pdb",
				"Aspirin": "aspirin.pdb",
				"Caffeine": "caffeine.pdb",
				"Nicotine": "nicotine.pdb",
				"LSD": "lsd.pdb",
				"Cocaine": "cocaine.pdb",
				"Cholesterol": "cholesterol.pdb",
				"Lycopene": "lycopene.pdb",
				"Glucose": "glucose.pdb",
				"Aluminium oxide": "Al2O3.pdb",
				"Cubane": "cubane.pdb",
				"Copper": "cu.pdb",
				"Fluorite": "caf2.pdb",
				"Salt": "nacl.pdb",
				"YBCO superconductor": "ybco.pdb",
				"Buckyball": "buckyball.pdb",
				"Graphite": "graphite.pdb"
			},
			loader: null,
			offset: null,
			menu: null,
        }
    },
    mounted() {
        this.loader = new PDBLoader()
        this.offset = new this.$THREE.Vector3()
        this.menu = document.getElementById('menu')
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x050505)
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 5000)
            this.camera.position.z = 1000
            this.scene.add(this.camera)
            var light1 = new this.$THREE.DirectionalLight(0xffffff, 0.8)
            light1.position.set(1, 1, 1)
            this.scene.add(light1)
            var light2 = new this.$THREE.DirectionalLight(0xffffff, 0.5)
            light2.position.set(- 1, - 1, 1)
            this.scene.add(light2)
            this.root = new this.$THREE.Group()
            this.scene.add(this.root)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementById('container').appendChild(this.renderer.domElement)
            this.labelRenderer = new CSS2DRenderer()
            this.labelRenderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.labelRenderer.domElement.style.position = 'absolute'
            this.labelRenderer.domElement.style.top = '0px'
            this.labelRenderer.domElement.style.left = '281px'
            this.labelRenderer.domElement.style.pointerEvents = 'none'
            document.getElementById('container').appendChild(this.labelRenderer.domElement)
            //
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 500
            this.controls.maxDistance = 2000
            //
            this.loadMolecule('static/models/pdb/caffeine.pdb')
            this.createMenu()
            //
            window.addEventListener('resize', this.onWindowResize, false)
            if (window.innerWidth >= 640) {
                document.getElementById('menu').style.bottom = '20px'
            } else {
                document.getElementById('menu').style.bottom = '69px'
            }
        },
        generateButtonCallback(url) {
            return () => {
                this.loadMolecule(url)
            }
        },
        createMenu() {
            for (var m in this.MOLECULES) {
                var button = document.createElement('button')
                button.innerHTML = m
                this.menu.appendChild(button)
                var url = 'static/models/pdb/' + this.MOLECULES[ m ]
                button.addEventListener('click', this.generateButtonCallback(url), false)
            }
        },
        loadMolecule(url) {
            while (this.root.children.length > 0) {
                var object = this.root.children[ 0 ]
                object.parent.remove(object)
            }
            this.loader.load(url, (pdb) => {
                var geometryAtoms = pdb.geometryAtoms
                var geometryBonds = pdb.geometryBonds
                var json = pdb.json
                var boxGeometry = new this.$THREE.BoxBufferGeometry(1, 1, 1)
                var sphereGeometry = new this.$THREE.IcosahedronBufferGeometry(1, 3)
                geometryAtoms.computeBoundingBox()
                geometryAtoms.boundingBox.getCenter(this.offset).negate()
                geometryAtoms.translate(this.offset.x, this.offset.y, this.offset.z)
                geometryBonds.translate(this.offset.x, this.offset.y, this.offset.z)
                var positions = geometryAtoms.getAttribute('position')
                var colors = geometryAtoms.getAttribute('color')
                var position = new this.$THREE.Vector3()
                var color = new this.$THREE.Color()
                for (var i = 0; i < positions.count; i ++) {
                    position.x = positions.getX(i)
                    position.y = positions.getY(i)
                    position.z = positions.getZ(i)
                    color.r = colors.getX(i)
                    color.g = colors.getY(i)
                    color.b = colors.getZ(i)
                    var material = new this.$THREE.MeshPhongMaterial({ color: color })
                    var object = new this.$THREE.Mesh(sphereGeometry, material)
                    object.position.copy(position)
                    object.position.multiplyScalar(75)
                    object.scale.multiplyScalar(25)
                    this.root.add(object)
                    var atom = json.atoms[ i ]
                    var text = document.createElement('div')
                    text.className = 'label'
                    text.style.color = 'rgb(' + atom[ 3 ][ 0 ] + ',' + atom[ 3 ][ 1 ] + ',' + atom[ 3 ][ 2 ] + ')'
                    text.textContent = atom[ 4 ]
                    var label = new CSS2DObject(text)
                    label.position.copy(object.position)
                    this.root.add(label)
                }
                positions = geometryBonds.getAttribute('position')
                var start = new this.$THREE.Vector3()
                var end = new this.$THREE.Vector3()
                for (var i = 0; i < positions.count; i += 2) {
                    start.x = positions.getX(i)
                    start.y = positions.getY(i)
                    start.z = positions.getZ(i)
                    end.x = positions.getX(i + 1)
                    end.y = positions.getY(i + 1)
                    end.z = positions.getZ(i + 1)
                    start.multiplyScalar(75)
                    end.multiplyScalar(75)
                    var object = new this.$THREE.Mesh(boxGeometry, new this.$THREE.MeshPhongMaterial(0xffffff))
                    object.position.copy(start)
                    object.position.lerp(end, 0.5)
                    object.scale.set(5, 5, start.distanceTo(end))
                    object.lookAt(end)
                    this.root.add(object)
                }
                this.render()
            })
        },
        onWindowResize() {
            if (window.innerWidth >= 640) {
                document.getElementById('menu').style.bottom = '20px'
            } else {
                document.getElementById('menu').style.bottom = '69px'
            }
            var x
            if (window.innerWidth >= 640) {
                x = 281
            } else {
                x = 0
            }
            this.$onWindowResize(this.camera, this.renderer)
            this.labelRenderer.setSize(window.innerWidth - x, window.innerHeight)
            this.render()
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            var time = Date.now() * 0.0004
            this.root.rotation.x = time
            this.root.rotation.y = time * 0.7
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
            this.labelRenderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglLoaderPdb-container {
    position: relative;
    width: 100%;
}
#menu {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    padding: 0;
    margin: 0;
}

button {
    color: rgb(255,255,255);
    background: transparent;
    border: 0px;
    padding: 5px 10px;
    cursor: pointer;
}
button:hover {
    background-color: rgba(0,255,255,0.5);
}
button:active {
    color: #000000;
    background-color: rgba(0,255,255,1);
}

.label {
    text-shadow: -1px 1px 1px rgb(0,0,0);
    margin-left: 25px;
    font-size: 20px;
}
</style>
