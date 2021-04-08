<template>
    <div class="css3dMolecules-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> css3d - molecules</div>
		<div id="topmenu">
			<button id="b_a">Atoms</button><button id="b_b">Bonds</button><button id="b_ab">Atoms + Bonds</button>
		</div>
		<div id="menu"></div>
    </div>
</template>

<script>
import { TrackballControls } from '@/components/jsm/controls/TrackballControls.js'
import { PDBLoader } from '@/components/jsm/loaders/PDBLoader.js'
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from '@/components/jsm/renderers/CSS3DRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			controls: null,
			root: null,
			objects: [],
			tmpVec1: null,
			tmpVec2: null,
			tmpVec3: null,
			tmpVec4: null,
			offset: null,
			visualizationType: 2,
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
				//"Diamond": "diamond.pdb",
				"Graphite": "graphite.pdb"
			},
			loader: null,
			colorSpriteMap: {},
			baseSprite: null,
			menu: null,
        }
    },
    mounted() {
        this.tmpVec1 = new this.$THREE.Vector3()
        this.tmpVec2 = new this.$THREE.Vector3()
        this.tmpVec3 = new this.$THREE.Vector3()
        this.tmpVec4 = new this.$THREE.Vector3()
        this.offset = new this.$THREE.Vector3()
        this.loader = new PDBLoader()
        this.baseSprite = document.createElement('img')
        this.menu = document.getElementById("menu")
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(70, this.$webglInnerWidth / window.innerHeight, 1, 5000)
            this.camera.position.z = 1000
            this.scene = new this.$THREE.Scene()
            this.root = new this.$THREE.Object3D()
            this.scene.add(this.root)
            //
            this.renderer = new CSS3DRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementById('container').appendChild(this.renderer.domElement)
            //
            this.controls = new TrackballControls(this.camera, this.renderer.domElement)
            this.controls.rotateSpeed = 0.5
            //
            this.baseSprite.onload = () => {
                this.loadMolecule("static/models/pdb/caffeine.pdb")
                this.createMenu()
            }
            this.baseSprite.src = 'static/textures/sprites/ball.png'
            //
            window.addEventListener('resize', this.onWindowResize, false)
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
                var url = "static/models/pdb/" + this.MOLECULES[ m ]
                button.addEventListener('click', this.generateButtonCallback(url), false)
            }
            var b_a = document.getElementById("b_a")
            var b_b = document.getElementById("b_b")
            var b_ab = document.getElementById("b_ab")
            b_a.addEventListener('click', () => {
                this.visualizationType = 0
                this.showAtoms()
            })
            b_b.addEventListener('click', () => {
                this.visualizationType = 1
                this.showBonds()
            })
            b_ab.addEventListener('click', () => {
                this.visualizationType = 2
                this.showAtomsBonds()
            })
        },
        showAtoms() {
            for (var i = 0; i < this.objects.length; i ++) {
                var object = this.objects[ i ]
                if (object instanceof CSS3DSprite) {
                    object.element.style.display = ""
                    object.visible = true
                } else {
                    object.element.style.display = "none"
                    object.visible = false
                }
            }
        },
        showBonds() {
            for (var i = 0; i < this.objects.length; i ++) {
                var object = this.objects[ i ]
                if (object instanceof CSS3DSprite) {
                    object.element.style.display = "none"
                    object.visible = false
                } else {
                    object.element.style.display = ""
                    object.element.style.height = object.userData.bondLengthFull
                    object.visible = true
                }
            }
        },
        showAtomsBonds() {
            for (var i = 0; i < this.objects.length; i ++) {
                var object = this.objects[ i ]
                object.element.style.display = ""
                object.visible = true
                if (! (object instanceof CSS3DSprite)) {
                    object.element.style.height = object.userData.bondLengthShort
                }
            }
        },
        colorify(ctx, width, height, color) {
            var r = color.r, g = color.g, b = color.b
            var imageData = ctx.getImageData(0, 0, width, height)
            var data = imageData.data
            for (var i = 0, l = data.length; i < l; i += 4) {
                data[ i + 0 ] *= r
                data[ i + 1 ] *= g
                data[ i + 2 ] *= b
            }
            ctx.putImageData(imageData, 0, 0)
        },
        imageToCanvas(image) {
            var width = image.width
            var height = image.height
            var canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            var context = canvas.getContext('2d')
            context.drawImage(image, 0, 0, width, height)
            return canvas
        },
        loadMolecule(url) {
            for (var i = 0; i < this.objects.length; i ++) {
                var object = this.objects[ i ]
                object.parent.remove(object)
            }
            this.objects.length = 0
            this.loader.load(url, (pdb) => {
                var geometryAtoms = pdb.geometryAtoms
                var geometryBonds = pdb.geometryBonds
                var json = pdb.json
                geometryAtoms.computeBoundingBox()
                geometryAtoms.boundingBox.getCenter(this.offset).negate()
                geometryAtoms.translate(this.offset.x, this.offset.y, this.offset.z)
                geometryBonds.translate(this.offset.x, this.offset.y, this.offset.z)
                var positionAtoms = geometryAtoms.getAttribute('position')
                var colorAtoms = geometryAtoms.getAttribute('color')
                var position = new this.$THREE.Vector3()
                var color = new this.$THREE.Color()
                for (var i = 0; i < positionAtoms.count; i ++) {
                    position.fromBufferAttribute(positionAtoms, i)
                    color.fromBufferAttribute(colorAtoms, i)
                    var atomJSON = json.atoms[ i ]
                    var element = atomJSON[ 4 ]
                    if (! this.colorSpriteMap[ element ]) {
                        var canvas = this.imageToCanvas(this.baseSprite)
                        var context = canvas.getContext('2d')
                        this.colorify(context, canvas.width, canvas.height, color)
                        var dataUrl = canvas.toDataURL()
                        this.colorSpriteMap[ element ] = dataUrl
                    }
                    var colorSprite = this.colorSpriteMap[ element ]
                    var atom = document.createElement('img')
                    atom.src = colorSprite
                    var object = new CSS3DSprite(atom)
                    object.position.copy(position)
                    object.position.multiplyScalar(75)
                    object.matrixAutoUpdate = false
                    object.updateMatrix()
                    this.root.add(object)
                    this.objects.push(object)
                }
                var positionBonds = geometryBonds.getAttribute('position')
                var start = new this.$THREE.Vector3()
                var end = new this.$THREE.Vector3()
                for (var i = 0; i < positionBonds.count; i += 2) {
                    start.fromBufferAttribute(positionBonds, i)
                    end.fromBufferAttribute(positionBonds, i + 1)
                    start.multiplyScalar(75)
                    end.multiplyScalar(75)
                    this.tmpVec1.subVectors(end, start)
                    var bondLength = this.tmpVec1.length() - 50
                    //
                    var bond = document.createElement('div')
                    bond.className = "bond"
                    bond.style.height = bondLength + "px"
                    var object = new CSS3DObject(bond)
                    object.position.copy(start)
                    object.position.lerp(end, 0.5)
                    object.userData.bondLengthShort = bondLength + "px"
                    object.userData.bondLengthFull = (bondLength + 55) + "px"
                    //
                    var axis = this.tmpVec2.set(0, 1, 0).cross(this.tmpVec1)
                    var radians = Math.acos(this.tmpVec3.set(0, 1, 0).dot(this.tmpVec4.copy(this.tmpVec1).normalize()))
                    var objMatrix = new this.$THREE.Matrix4().makeRotationAxis(axis.normalize(), radians)
                    object.matrix.copy(objMatrix)
                    object.quaternion.setFromRotationMatrix(object.matrix)
                    object.matrixAutoUpdate = false
                    object.updateMatrix()
                    this.root.add(object)
                    this.objects.push(object)
                    //
                    bond = document.createElement('div')
                    bond.className = "bond"
                    bond.style.height = bondLength + "px"
                    var joint = new this.$THREE.Object3D(bond)
                    joint.position.copy(start)
                    joint.position.lerp(end, 0.5)
                    joint.matrix.copy(objMatrix)
                    joint.quaternion.setFromRotationMatrix(joint.matrix)
                    joint.matrixAutoUpdate = false
                    joint.updateMatrix()
                    object = new CSS3DObject(bond)
                    object.rotation.y = Math.PI / 2
                    object.matrixAutoUpdate = false
                    object.updateMatrix()
                    object.userData.bondLengthShort = bondLength + "px"
                    object.userData.bondLengthFull = (bondLength + 55) + "px"
                    object.userData.joint = joint
                    joint.add(object)
                    this.root.add(joint)
                    this.objects.push(object)
                }
                //console.log("CSS3DObjects:", objects.length)
                switch (this.visualizationType) {
                    case 0:
                        this.showAtoms()
                        break
                    case 1:
                        this.showBonds()
                        break
                    case 2:
                        this.showAtomsBonds()
                        break
                }
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
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
        }
    },
}
</script>

<style scoped>
.css3dMolecules-container {
    position: relative;
    width: 100%;
    background-color: #050505;
    background: radial-gradient(ellipse at center,  rgba(43,45,48,1) 0%,rgba(0,0,0,1) 100%);
}
</style>

<style>
.css3dMolecules-container #topmenu {
    position: absolute;
    top: 50px;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    text-align: center;
}
.css3dMolecules-container #menu {
    position: absolute;
    bottom: 20px;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    text-align: center;
}
.css3dMolecules-container button {
    color: rgb(255,255,255);
    background: rgb(255,255,255,0.1);
    border: 0px;
    padding: 5px 10px;
    margin: 2px;
    font-size: 14px;
    cursor: pointer;
}
.css3dMolecules-container button:hover {
    background-color: rgba(0,255,255,0.5);
}
.css3dMolecules-container button:active {
    color: #000000;
    background-color: rgba(0,255,255,1);
}
.css3dMolecules-container .bond {
    width: 5px;
    height: 10px;
    background: #eee;
    display: block;
}
</style>
