<template>
    <div class="webglMaterialsTextureCanvas-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl - canvas as a texture
			<div>click and draw in the white box</div>
		</div>
		<canvas id="drawing-canvas" height="128" width="128"></canvas>
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,
            material: null,
			drawStartPos: null,
        }
    },
    mounted() {
        this.drawStartPos = new this.$THREE.Vector2()
        this.init()
        this.setupCanvasDrawing()
        this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 2000)
            this.camera.position.z = 500
            this.scene = new this.$THREE.Scene()
            this.material = new this.$THREE.MeshBasicMaterial()
            this.mesh = new this.$THREE.Mesh(new this.$THREE.BoxBufferGeometry(200, 200, 200), this.material)
            this.scene.add(this.mesh)
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsTextureCanvas-container')[0].appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        setupCanvasDrawing() {
            // get canvas and context
            var drawingCanvas = document.getElementById('drawing-canvas')
            var drawingContext = drawingCanvas.getContext('2d')
            // draw white background
            drawingContext.fillStyle = '#FFFFFF'
            drawingContext.fillRect(0, 0, 128, 128)
            // set canvas as this.material.map (this could be done to any map, bump, displacement etc.)
            this.material.map = new this.$THREE.CanvasTexture(drawingCanvas)
            // set the variable to keep track of when to draw
            var paint = false
            // add canvas event listeners
            drawingCanvas.addEventListener('pointerdown', (e) => {
                paint = true
                this.drawStartPos.set(e.offsetX, e.offsetY)
            })
            drawingCanvas.addEventListener('pointermove', (e) => {
                if (paint) this.draw(drawingContext, e.offsetX, e.offsetY)
            })
            drawingCanvas.addEventListener('pointerup', () => {
                paint = false
            })
            drawingCanvas.addEventListener('pointerleave', () => {
                paint = false
            })
        },
        draw(drawContext, x, y) {
            drawContext.moveTo(this.drawStartPos.x, this.drawStartPos.y)
            drawContext.strokeStyle = '#000000'
            drawContext.lineTo(x, y)
            drawContext.stroke()
            // reset drawing start position to current position.
            this.drawStartPos.set(x, y)
            // need to flag the map as needing updating.
            this.material.map.needsUpdate = true
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.mesh.rotation.x += 0.01
            this.mesh.rotation.y += 0.01
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsTextureCanvas-container {
    position: relative;
    width: 100%;
}
#drawing-canvas {
    position: absolute;
    background-color: #000000;
    top: 0px;
    right: 0px;
    z-index: 3000;
    cursor: crosshair;
    touch-action: none;
}
</style>
