<template>
    <div class="webglMaterialsBlendingCustom-container">
        <div id="images" class="menu">
			Foreground
			<a id="img_0" href="#"><img src="static/textures/disturb.jpg" /></a>
			<a id="img_1" href="#"><img src="static/textures/sprite0.jpg" /></a>
			<a id="img_2" href="#"><img src="static/textures/sprite0.png" /></a>
			<a id="img_3" href="#"><img src="static/textures/lensflare/lensflare0.png" /></a>
			<a id="img_4" href="#"><img src="static/textures/lensflare/lensflare0_alpha.png" /></a>
			<a id="img_5" href="#"><img src="static/textures/sprites/ball.png" /></a>
			<a id="img_6" href="#"><img src="static/textures/sprites/snowflake7_alpha.png" /></a>
		</div>

		<div id="backgrounds" class="menu">
			Background
			<a id="bg_0" href="#"><img src="static/textures/disturb.jpg" /></a>
			<a id="bg_1" href="#"></a>
			<a id="bg_2" href="#"></a>
			<a id="bg_3" href="#"><img src="static/textures/crate.gif" /></a>
			<a id="bg_4" href="#"><img src="static/textures/lava/lavatile.jpg" /></a>
			<a id="bg_5" href="#"><img src="static/textures/water.jpg" /></a>
			<a id="bg_6" href="#"><img src="static/textures/lava/cloud.png" /></a>
		</div>

		<div id="labels" class="menu">
			Equation<br/><br/>
			<div class="lbl btn" id="btn_add">Add</div>
			<div class="lbl btn" id="btn_sub">Subtract</div>
			<div class="lbl btn" id="btn_rsub">ReverseSubtract</div>
			<div class="lbl btn" id="btn_min">Min</div>
			<div class="lbl btn" id="btn_max">Max</div>

			Premultiply alpha<br/><br/>
			<div class="lbl btn" id="btn_pre">On</div>
			<div class="lbl btn" id="btn_nopre">Off</div>

			Labels<br/><br/>
			<div class="lbl" id="lbl_src">Source</div>
			<div class="lbl" id="lbl_dst">Destination</div>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
			materialBg: null,
			materials: [],
			mapsPre: [],
			mapsNoPre: [],
			currentMaps: null,
			currentIndex: 4,
        }
    },
    mounted() {
        this.currentMaps = this.mapsNoPre
        this.init()
        this.animate()
    },
    methods: {
        init() {
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(80, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.z = 700
            // SCENE
            this.scene = new this.$THREE.Scene()
            // TEXTURE LOADER
            var textureLoader = new this.$THREE.TextureLoader()
            // BACKGROUND IMAGES
            var canvas1 = document.createElement('canvas')
            var ctx1 = canvas1.getContext('2d')
            canvas1.width = canvas1.height = 128
            ctx1.fillStyle = '#eee'
            ctx1.fillRect(0, 0, 128, 128)
            ctx1.fillStyle = '#999'
            ctx1.fillRect(0, 0, 64, 64)
            ctx1.fillStyle = '#aaa'
            ctx1.fillRect(32, 32, 32, 32)
            ctx1.fillStyle = '#999'
            ctx1.fillRect(64, 64, 64, 64)
            ctx1.fillStyle = '#bbb'
            ctx1.fillRect(96, 96, 32, 32)
            document.getElementById('bg_1').appendChild(canvas1)
            var canvas2 = document.createElement('canvas')
            var ctx2 = canvas2.getContext('2d')
            canvas2.width = canvas2.height = 128
            ctx2.fillStyle = '#444'
            ctx2.fillRect(0, 0, 128, 128)
            ctx2.fillStyle = '#000'
            ctx2.fillRect(0, 0, 64, 64)
            ctx2.fillStyle = '#111'
            ctx2.fillRect(32, 32, 32, 32)
            ctx2.fillStyle = '#000'
            ctx2.fillRect(64, 64, 64, 64)
            ctx2.fillStyle = '#222'
            ctx2.fillRect(96, 96, 32, 32)
            document.getElementById('bg_2').appendChild(canvas2)
            var mapBg0 = new this.$THREE.CanvasTexture(canvas1)
            mapBg0.wrapS = mapBg0.wrapT = this.$THREE.RepeatWrapping
            mapBg0.repeat.set(128, 64)
            var mapBg1 = new this.$THREE.CanvasTexture(canvas2)
            mapBg1.wrapS = mapBg1.wrapT = this.$THREE.RepeatWrapping
            mapBg1.repeat.set(128, 64)
            var mapBg2 = textureLoader.load('static/textures/disturb.jpg')
            mapBg2.wrapS = mapBg2.wrapT = this.$THREE.RepeatWrapping
            mapBg2.repeat.set(8, 4)
            var mapBg3 = textureLoader.load('static/textures/crate.gif')
            mapBg3.wrapS = mapBg3.wrapT = this.$THREE.RepeatWrapping
            mapBg3.repeat.set(32, 16)
            var mapBg4 = textureLoader.load('static/textures/lava/lavatile.jpg')
            mapBg4.wrapS = mapBg4.wrapT = this.$THREE.RepeatWrapping
            mapBg4.repeat.set(8, 4)
            var mapBg5 = textureLoader.load('static/textures/water.jpg')
            mapBg5.wrapS = mapBg5.wrapT = this.$THREE.RepeatWrapping
            mapBg5.repeat.set(8, 4)
            var mapBg6 = textureLoader.load('static/textures/lava/cloud.png')
            mapBg6.wrapS = mapBg6.wrapT = this.$THREE.RepeatWrapping
            mapBg6.repeat.set(2, 1)
            // BACKGROUND
            this.materialBg = new this.$THREE.MeshBasicMaterial({ map: mapBg1 })
            var meshBg = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(4000, 2000), this.materialBg)
            meshBg.position.set(0, 0, - 1)
            this.scene.add(meshBg)
            // FOREGROUND IMAGES
            var images = [ 'static/textures/disturb.jpg',
                'static/textures/sprite0.jpg',
                'static/textures/sprite0.png',
                'static/textures/lensflare/lensflare0.png',
                'static/textures/lensflare/lensflare0_alpha.png',
                'static/textures/sprites/ball.png',
                'static/textures/sprites/snowflake7_alpha.png' ]
            for (var i = 0; i < images.length; i ++) {
                var map = textureLoader.load(images[ i ])
                this.mapsNoPre.push(map)
                var mapPre = textureLoader.load(images[ i ])
                mapPre.premultiplyAlpha = true
                mapPre.needsUpdate = true
                this.mapsPre.push(mapPre)
            }
            // FOREGROUND OBJECTS
            var src = [
                { name: 'Zero', constant: this.$THREE.ZeroFactor },
                { name: 'One', constant: this.$THREE.OneFactor },
                { name: 'SrcColor', constant: this.$THREE.SrcColorFactor },
                { name: 'OneMinusSrcColor', constant: this.$THREE.OneMinusSrcColorFactor },
                { name: 'SrcAlpha', constant: this.$THREE.SrcAlphaFactor },
                { name: 'OneMinusSrcAlpha', constant: this.$THREE.OneMinusSrcAlphaFactor },
                { name: 'DstAlpha', constant: this.$THREE.DstAlphaFactor },
                { name: 'OneMinusDstAlpha', constant: this.$THREE.OneMinusDstAlphaFactor },
                { name: 'DstColor', constant: this.$THREE.DstColorFactor },
                { name: 'OneMinusDstColor', constant: this.$THREE.OneMinusDstColorFactor },
                { name: 'SrcAlphaSaturate', constant: this.$THREE.SrcAlphaSaturateFactor }
            ]
            var dst = [
                { name: 'Zero', constant: this.$THREE.ZeroFactor },
                { name: 'One', constant: this.$THREE.OneFactor },
                { name: 'SrcColor', constant: this.$THREE.SrcColorFactor },
                { name: 'OneMinusSrcColor', constant: this.$THREE.OneMinusSrcColorFactor },
                { name: 'SrcAlpha', constant: this.$THREE.SrcAlphaFactor },
                { name: 'OneMinusSrcAlpha', constant: this.$THREE.OneMinusSrcAlphaFactor },
                { name: 'DstAlpha', constant: this.$THREE.DstAlphaFactor },
                { name: 'OneMinusDstAlpha', constant: this.$THREE.OneMinusDstAlphaFactor },
                { name: 'DstColor', constant: this.$THREE.DstColorFactor },
                { name: 'OneMinusDstColor', constant: this.$THREE.OneMinusDstColorFactor }
            ]
            var geo1 = new this.$THREE.PlaneBufferGeometry(100, 100)
            var geo2 = new this.$THREE.PlaneBufferGeometry(100, 25)
            for (var i = 0; i < dst.length; i ++) {
                var blendDst = dst[ i ]
                for (var j = 0; j < src.length; j ++) {
                    var blendSrc = src[ j ]
                    var material = new this.$THREE.MeshBasicMaterial({ map: this.currentMaps[ this.currentIndex ] })
                    material.transparent = true
                    material.blending = this.$THREE.CustomBlending
                    material.blendSrc = blendSrc.constant
                    material.blendDst = blendDst.constant
                    material.blendEquation = this.$THREE.AddEquation
                    var x = (j - src.length / 2) * 110
                    var z = 0
                    var y = (i - dst.length / 2) * 110 + 50
                    var mesh = new this.$THREE.Mesh(geo1, material)
                    mesh.position.set(x, - y, z)
                    mesh.matrixAutoUpdate = false
                    mesh.updateMatrix()
                    this.scene.add(mesh)
                    this.materials.push(material)
                }
            }
            for (var j = 0; j < src.length; j ++) {
                var blendSrc = src[ j ]
                var x = (j - src.length / 2) * 110
                var z = 0
                var y = (0 - dst.length / 2) * 110 + 50
                var mesh = new this.$THREE.Mesh(geo2, this.generateLabelMaterial(blendSrc.name, 'rgba(0, 150, 0, 1)'))
                mesh.position.set(x, - (y - 70), z)
                mesh.matrixAutoUpdate = false
                mesh.updateMatrix()
                this.scene.add(mesh)
            }
            for (var i = 0; i < dst.length; i ++) {
                var blendDst = dst[ i ]
                var x = (0 - src.length / 2) * 110 - 125
                var z = 0
                var y = (i - dst.length / 2) * 110 + 165
                var mesh = new this.$THREE.Mesh(geo2, this.generateLabelMaterial(blendDst.name, 'rgba(150, 0, 0, 1)'))
                mesh.position.set(x, - (y - 120), z)
                mesh.matrixAutoUpdate = false
                mesh.updateMatrix()
                this.scene.add(mesh)
            }
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.domElement.style.position = 'absolute'
            this.renderer.domElement.style.left = '215px'
            document.getElementsByClassName('webglMaterialsBlendingCustom-container')[0].appendChild(this.renderer.domElement)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
            this.addImgHandler('img_0', 0)
            this.addImgHandler('img_1', 1)
            this.addImgHandler('img_2', 2)
            this.addImgHandler('img_3', 3)
            this.addImgHandler('img_4', 4)
            this.addImgHandler('img_5', 5)
            this.addImgHandler('img_6', 6)
            this.addBgHandler('bg_0', mapBg2)
            this.addBgHandler('bg_1', mapBg0)
            this.addBgHandler('bg_2', mapBg1)
            this.addBgHandler('bg_3', mapBg3)
            this.addBgHandler('bg_4', mapBg4)
            this.addBgHandler('bg_5', mapBg5)
            this.addBgHandler('bg_6', mapBg6)
            this.addEqHandler('btn_add', this.$THREE.AddEquation)
            this.addEqHandler('btn_sub', this.$THREE.SubtractEquation)
            this.addEqHandler('btn_rsub', this.$THREE.ReverseSubtractEquation)
            this.addEqHandler('btn_min', this.$THREE.MinEquation)
            this.addEqHandler('btn_max', this.$THREE.MaxEquation)
            this.addPreHandler('btn_pre', this.mapsPre)
            this.addPreHandler('btn_nopre', this.mapsNoPre)
        },
        addImgHandler(id, index) {
            var el = document.getElementById(id)
            el.addEventListener('click', () => {
                for (var i = 0; i < this.materials.length; i ++) {
                    this.materials[ i ].map = this.currentMaps[ index ]
                }
                this.currentIndex = index
            })
        },
        addEqHandler(id, eq) {
            var el = document.getElementById(id)
            el.addEventListener('click',  () => {
                for (var i = 0; i < this.materials.length; i ++) {
                    this.materials[ i ].blendEquation = eq
                }
                document.getElementById('btn_add').style.backgroundColor = 'transparent'
                document.getElementById('btn_sub').style.backgroundColor = 'transparent'
                document.getElementById('btn_rsub').style.backgroundColor = 'transparent'
                document.getElementById('btn_min').style.backgroundColor = 'transparent'
                document.getElementById('btn_max').style.backgroundColor = 'transparent'
                el.style.backgroundColor = 'darkorange'
            })
        },
        addBgHandler(id, map) {
            var el = document.getElementById(id)
            el.addEventListener('click', () => {
                this.materialBg.map = map
            })
        },
        addPreHandler(id, marray) {
            var el = document.getElementById(id)
            el.addEventListener('click', () => {
                this.currentMaps = marray
                for (var i = 0; i < this.materials.length; i ++) {
                    this.materials[ i ].map = this.currentMaps[ this.currentIndex ]
                }
                document.getElementById('btn_pre').style.backgroundColor = 'transparent'
                document.getElementById('btn_nopre').style.backgroundColor = 'transparent'
                el.style.backgroundColor = 'darkorange'
            })
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        generateLabelMaterial(text, bg) {
            var canvas = document.createElement('canvas')
            var ctx = canvas.getContext('2d')
            canvas.width = 128
            canvas.height = 32
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, 128, 32)
            ctx.fillStyle = 'white'
            ctx.font = '12pt arial bold'
            ctx.fillText(text, 8, 22)
            var map = new this.$THREE.CanvasTexture(canvas)
            var material = new this.$THREE.MeshBasicMaterial({ map: map, transparent: true })
            return material
        },
        animate() {
            requestAnimationFrame(this.animate)
            var time = Date.now() * 0.00025
            var ox = (time * - 0.01 * this.materialBg.map.repeat.x) % 1
            var oy = (time * - 0.01 * this.materialBg.map.repeat.y) % 1
            this.materialBg.map.offset.set(ox, oy)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsBlendingCustom-container {
    width: 100%;
    margin: 0px;
    background-color: #111;
    overflow: hidden;
    font-family: arial;
}

.menu { color: #fff; font-weight: bold; font-size: 12px; z-index: 100; width: 75px; position: absolute; top: 0px; padding: 16px; }
.menu img, .menu canvas { width: 75px; margin: 10px 0 }

#images { background: rgba(0,0,0,0); left: 0px; }
#backgrounds { background: rgba(0,0,0,0.0); left: 107px; }
#labels { background: rgba(0,0,0,0.75); left: 214px; width: 100px }

.lbl { color: #fff; z-index: 150; float:left; padding: 0.25em; width: 75px; display: block  }
#lbl_dst { background:#800; }
#lbl_src { background:green; }

.btn { background: darkorange; width: 100px; cursor: pointer }

#btn_sub { background: transparent }
#btn_rsub { background: transparent }
#btn_min { background: transparent }
#btn_max { background: transparent }

#btn_pre { background: transparent }

#btn_max, #btn_nopre { margin-bottom: 2em }
</style>
