<template>
    <div class="webglRaycastTexture-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - raycast texture<br>Left to right: buffer geometry - geometry - indexed buffer geometry
			<fieldset id="controls">
				<legend>Circle</legend>
				<div class="control">
					WrapS : <select id="setwrapS">
						<option value="1001">ClampToEdgeWrapping</option>
						<option value="1000" selected>RepeatWrapping</option>
						<option value="1002">MirroredRepeatWrapping</option>
					</select>
				</div>
				<div class="control">
					WrapT : <select id="setwrapT">
						<option value="1001">ClampToEdgeWrapping</option>
						<option value="1000" selected>RepeatWrapping</option>
						<option value="1002">MirroredRepeatWrapping</option>
					</select>
				</div>
				<div class="control">
					Offset : X <input id="setOffsetU" type="number" value="0" step="0.05" />
					Y <input id="setOffsetV" type="number" value="0" step="0.05" /><br />
				</div>
				<div class="control">
					Repeat : X <input id="setRepeatU" type="number" value="1" step="0.1" />
					Y <input id="setRepeatV" type="number" value="1" step="0.1" />
				</div>
				<div class="control">
					Rotation : <input id="setRotation" type="number" value="0" step="0.1" />
				</div>
			</fieldset>
		</div>
    </div>
</template>

<script>
import { CanvasTexture } from '@/utils/webglRaycastTexture.js'
export default {
    data() {
        return {
            width: window.innerWidth,
			height: window.innerHeight,
			canvas: null,
			planeTexture: null,
			cubeTexture: null,
			circleTexture: null,
			container: null,
			camera: null,
			scene: null,
			renderer: null,
			raycaster: null,
			mouse: null,
			onClickPosition: null,
        }
    },
    mounted() {
		this.width = this.$webglInnerWidth
		this.height = window.innerHeight
		this.raycaster = new this.$THREE.Raycaster()
		this.mouse = new this.$THREE.Vector2()
		this.onClickPosition = new this.$THREE.Vector2()
		this.init()
		this.render()
    },
    methods: {
        init() {
			this.container = document.getElementById("container")
			this.scene = new this.$THREE.Scene()
			this.scene.background = new this.$THREE.Color(0xeeeeee)
			this.camera = new this.$THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000)
			this.camera.position.x = - 30
			this.camera.position.y = 40
			this.camera.position.z = 50
			this.camera.lookAt(this.scene.position)
			this.renderer = new this.$THREE.WebGLRenderer()
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.width, this.height)
			this.container.appendChild(this.renderer.domElement)
			// A cube, in the middle.
			this.cubeTexture = new this.$THREE.Texture(undefined, this.$THREE.UVMapping, this.$THREE.RepeatWrapping, this.$THREE.RepeatWrapping)
			this.canvas = new CanvasTexture(this.cubeTexture)
			var cubeMaterial = new this.$THREE.MeshBasicMaterial({ map: this.cubeTexture })
			var cubeGeometry = new this.$THREE.BoxBufferGeometry(20, 20, 20)
			var uvs = cubeGeometry.attributes.uv.array
			// Set a specific texture mapping.
			for (var i = 0; i < uvs.length; i ++) {
				uvs[ i ] *= 2
			}
			var cube = new this.$THREE.Mesh(cubeGeometry, cubeMaterial)
			cube.position.x = 4
			cube.position.y = - 5
			cube.position.z = 0
			this.scene.add(cube)
			// A plane on the left
			this.planeTexture = new this.$THREE.Texture(undefined, this.$THREE.UVMapping, this.$THREE.MirroredRepeatWrapping, this.$THREE.MirroredRepeatWrapping)
			this.canvas.addParent(this.planeTexture)
			var planeMaterial = new this.$THREE.MeshBasicMaterial({ map: this.planeTexture })
			var planeGeometry = new this.$THREE.PlaneBufferGeometry(25, 25, 1, 1)
			uvs = planeGeometry.attributes.uv.array
			// Set a specific texture mapping.
			for (var i = 0; i < uvs.length; i ++) {
				uvs[ i ] *= 2
			}
			var plane = new this.$THREE.Mesh(planeGeometry, planeMaterial)
			plane.position.x = - 16
			plane.position.y = - 5
			plane.position.z = 0
			this.scene.add(plane)
			// A circle on the right.
			this.circleTexture = new this.$THREE.Texture(undefined, this.$THREE.UVMapping, this.$THREE.RepeatWrapping, this.$THREE.RepeatWrapping)
			this.canvas.addParent(this.circleTexture)
			var circleMaterial = new this.$THREE.MeshBasicMaterial({ map: this.circleTexture })
			var circleGeometry = new this.$THREE.CircleBufferGeometry(25, 40, 0, Math.PI * 2)
			uvs = circleGeometry.attributes.uv.array
			// Set a specific texture mapping.
			for (var i = 0; i < uvs.length; i ++) {
				uvs[ i ] = (uvs[ i ] - 0.25) * 2
			}
			var circle = new this.$THREE.Mesh(circleGeometry, circleMaterial)
			circle.position.x = 24
			circle.position.y = - 5
			circle.position.z = 0
			this.scene.add(circle)
			window.addEventListener('resize', this.onWindowResize, false)
			this.container.addEventListener('mousemove', this.onMouseMove, false)
			document.getElementById('setwrapS').addEventListener('change', this.setwrapS)
			document.getElementById('setwrapT').addEventListener('change', this.setwrapT)
			document.getElementById('setOffsetU').addEventListener('change', this.setOffsetU)
			document.getElementById('setOffsetV').addEventListener('change', this.setOffsetV)
			document.getElementById('setRepeatU').addEventListener('change', this.setRepeatU)
			document.getElementById('setRepeatV').addEventListener('change', this.setRepeatV)
			document.getElementById('setRotation').addEventListener('change', this.setRotation)
		},
		onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
		},
		onMouseMove(evt) {
			evt.preventDefault()
			var array = this.getMousePosition(this.container, evt.clientX, evt.clientY)
			this.onClickPosition.fromArray(array)
			var intersects = this.getIntersects(this.onClickPosition, this.scene.children)
			if (intersects.length > 0 && intersects[ 0 ].uv) {
				var uv = intersects[ 0 ].uv
				intersects[ 0 ].object.material.map.transformUv(uv)
				this.canvas.setCrossPosition(uv.x, uv.y)
			}
		},
		getMousePosition(dom, x, y) {
			var rect = dom.getBoundingClientRect()
			return [ (x - rect.left) / rect.width, (y - rect.top) / rect.height ]
		},
		getIntersects(point, objects) {
			this.mouse.set((point.x * 2) - 1, - (point.y * 2) + 1)
			this.raycaster.setFromCamera(this.mouse, this.camera)
			return this.raycaster.intersectObjects(objects)
		},
		render() {
			requestAnimationFrame(this.render)
			this.renderer.render(this.scene, this.camera)
		},
		setwrapS(event) {
			this.circleTexture.wrapS = parseFloat(event.target.value)
			this.circleTexture.needsUpdate = true
		},
		setwrapT(event) {
			this.circleTexture.wrapT = parseFloat(event.target.value)
			this.circleTexture.needsUpdate = true
		},
		setOffsetU(event) {
			this.circleTexture.offset.x = parseFloat(event.target.value)
		},
		setOffsetV(event) {
			this.circleTexture.offset.y = parseFloat(event.target.value)
		},
		setRepeatU(event) {
			this.circleTexture.repeat.x = parseFloat(event.target.value)
		},
		setRepeatV(event) {
			this.circleTexture.repeat.y = parseFloat(event.target.value)
		},
		setRotation(event) {
			this.circleTexture.rotation = parseFloat(event.target.value)
		}
    },
}
</script>

<style scoped>
.webglRaycastTexture-container {
	position: relative;
    width: 100%;
    background-color: #fff;
}
#info {
    color: #444;
}

#info a {
    color: #08f;
}

#controls {
    position: absolute;
    text-align:left;
    top: 60px;
    left: 5px;
    padding: 5px;
}

.control { margin-bottom: 3px; }

input { width: 50px; }
</style>
