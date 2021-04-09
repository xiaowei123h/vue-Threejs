<template>
    <div class="text-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - procedural 3D text by <a href="http://www.lab4games.net/zz85/blog" target="_blank" rel="noopener">zz85</a> &amp; alteredq<br/>
			type to enter new text, drag to spin the text<br/>
            <el-button type="primary" size="mini" @click="handleColor">change color</el-button>
            <el-button type="primary" size="mini" @click="handleFont">change font</el-button>
            <el-button type="primary" size="mini" @click="handleWeight">change weight</el-button>
            <el-button type="primary" size="mini" @click="handleBevel">change bevel</el-button>
            <br/>
			<a id="permalink" href="#">permalink</a>
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            container: '',
            stats: '',
            permalink: '',
            hex: '',
            camera: '',
            cameraTarget: '',
            scene: '',
            renderer: '',
            group: '',
            textMesh1: '',
            textMesh2: '',
            textGeo: '',
            materials: '',
            firstLetter: true,
            text: 'three.js',
            bevelEnabled: true,
            font: undefined,
            fontName: 'optimer',
            fontWeight: 'bold',
            height: 20,
            size: 70,
            hover: 30,
            curveSegments: 4,
            bevelThickness: 2,
            bevelSize: 1.5,
            mirror: true,
            fontMap: {
                helvetiker: 0,
                optimer: 1,
                gentilis: 2,
                "droid/droid_sans": 3,
				"droid/droid_serif": 4
            },
            weightMap: {
                regular: 0,
                bold: 1
            },
            reverseFontMap: [],
            reverseWeightMap: [],
            targetRotation: 0,
            targetRotationOnPointerDown: 0,
            pointerX: 0,
            pointerXOnPointerDown: 0,
            windowHalfX: 0,
            fontIndex: 1,
            dirLight: '',
            pointLight: '',
            hash: '',
            colorhash: '',
            fonthash: '',
            weighthash: '',
            bevelhash: '',
            texthash: '',
            plane: '',
            link: '',
            loader: '',
            triangle: '',
            triangleAreaHeuristics: '',
            face: '',
            centerOffset: ''
        }
    },
    mounted() {
        this.prefabricate()
        this.init()
        this.animate()
    },
    methods: {
        prefabricate() {
            // 将对象的key顺序放到数组中
            for (var i in this.fontMap) {
                this.reverseFontMap[ this.fontMap[ i ] ] = i
            }
			for (var i in this.weightMap) {
                this.reverseWeightMap[ this.weightMap[ i ] ] = i
            }
            this.windowHalfX = (this.$webglInnerWidth) / 2
        },
        init() {
            this.container = document.createElement( 'div' )
            document.getElementsByClassName('text-container')[0].appendChild(this.container)
            this.permalink = document.getElementById("permalink")
            // CAMERA
            this.camera = new this.$THREE.PerspectiveCamera(30, (this.$webglInnerWidth) / window.innerHeight, 1, 1500)
            this.camera.position.set(0, 400, 700)
            this.cameraTarget = new this.$THREE.Vector3(0, 150, 0)
            // SCENE
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0x000000)
            this.scene.fog = new this.$THREE.Fog(0x000000, 250, 1400)
            // LIGHTS
            this.dirLight = new this.$THREE.DirectionalLight(0xffffff, 0.125)
            this.dirLight.position.set(0, 0, 1).normalize()
            this.scene.add(this.dirLight)
            this.pointLight = new this.$THREE.PointLight(0xffffff, 1.5)
            this.pointLight.position.set(0, 100, 90)
            this.scene.add(this.pointLight)
            // Get text from hash
            this.hash = document.location.hash.substr(1)
            if (this.hash.length !== 0) {
                // this.colorhash = this.hash.substring(0, 6)
                // this.fonthash = this.hash.substring(6, 7)
                // this.weighthash = this.hash.substring(7, 8)
                // this.bevelhash = this.hash.substring(8, 9)
                // this.texthash = this.hash.substring(10)
                // this.hex = this.colorhash
                // this.pointLight.color.setHex(parseInt(this.colorhash, 16))
                // this.fontName = this.reverseFontMap[parseInt(this.fonthash)]
                // this.fontWeight = this.reverseWeightMap[parseInt(this.weighthash)]
                // this.bevelEnabled = parseInt(this.bevelhash)
                // this.text = decodeURI(this.texthash)
                // this.updatePermalink()
            } else {
                this.pointLight.color.setHSL(Math.random(), 1, 0.5)
                this.hex = decimalToHex(this.pointLight.color.getHex())
            }
            this.materials = [
                new this.$THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true}), // front
                new this.$THREE.MeshPhongMaterial({color: 0xffffff}) // side
            ]
            this.group = new this.$THREE.Group()
            this.group.position.y = 100
            this.scene.add(this.group)
            this.loadFont()
            this.plane = new this.$THREE.Mesh(
                new this.$THREE.PlaneBufferGeometry(10000, 10000),
                new this.$THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.5, transparent: true})
            )
            this.plane.position.y = 100
            this.plane.rotation.x = - Math.PI / 2
            this.scene.add(this.plane)
            // RENDERER
            this.renderer = new this.$THREE.WebGLRenderer({antialias: true})
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            // STATS
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            // EVENTS
            this.container.style.touchAction = 'none'
            this.container.addEventListener('pointerdown', this.onPointerDown, false)
            this.container.setAttribute('tabindex', '0');
            this.container.focus()
            this.container.addEventListener('keypress', this.onDocumentKeyPress, false)
            this.container.addEventListener('keydown', this.onDocumentKeyDown, false)
            window.addEventListener( 'resize', this.onWindowResize, false )
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.group.rotation.y += (this.targetRotation - this.group.rotation.y) * 0.05
            this.camera.lookAt(this.cameraTarget)
            this.renderer.clear()
            this.renderer.render(this.scene, this.camera)
        },
        onWindowResize() {
            this.windowHalfX = (this.$webglInnerWidth) / 2
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        onPointerDown(event) {
            if (event.isPrimary === false) {
                return
            }
            this.pointerXOnPointerDown = event.clientX - this.windowHalfX
            this.targetRotationOnPointerDown = this.targetRotation
            document.addEventListener('pointermove', this.onPointerMove, false)
            document.addEventListener('pointerup', this.onPointerUp, false)
        },
        onDocumentKeyPress(event) {
            var keyCode = event.which
            // backspace
            if ( keyCode == 8 ) {
                event.preventDefault()
            } else {
                var ch = String.fromCharCode( keyCode )
                this.text += ch
                this.refreshText()
            }
        },
        onDocumentKeyDown(event) {
            if ( this.firstLetter ) {
                this.firstLetter = false
                this.text = ""
            }
            var keyCode = event.keyCode
            // backspace
            if ( keyCode == 8 ) {
                event.preventDefault()
                this.text = this.text.substring( 0, this.text.length - 1 )
                this.refreshText()
                return false
            }
        },
        onPointerMove(event) {
            if (event.isPrimary === false) {
                return
            }
            this.pointerX = event.clientX - this.windowHalfX
            this.targetRotation = this.targetRotationOnPointerDown + (this.pointerX - this.pointerXOnPointerDown) * 0.02
        },
        onPointerUp() {
            if (event.isPrimary === false) {
                return
            }
            document.removeEventListener('pointermove', this.onPointerMove)
            document.removeEventListener('pointerup', this.onPointerUp)
        },
        decimalToHex(d) {
            // 将十进制数字转换为十六进制数并转化为字符串
            var hex = Number(d).toString(16)
            // 将输入的d转换为六位十六进制字符串
            hex = "000000".substr(0, 6 - hex.length) + hex
            // 将六位十六进制里的字符转换成大写返回
            return hex.toUpperCase()
        },
        // 更新id为permalink的a标签href
        updatePermalink() {
            // encodeURI() 函数可把字符串作为 URI 进行编码，将网址转换成放入浏览器地址栏后的内容
            this.link = this.hex + this.fontMap[this.fontName] + this.weightMap[this.fontWeight] + this.boolToNum(this.bevelEnabled) + "#" + encodeURI(this.text)
            this.permalink.href = "#" + this.link
            window.location.hash = this.link
        },
        loadFont() {
            this.loader = new this.$THREE.FontLoader()
            // 'static/fonts/gentilis_bold.typeface.json'
            // this.loader.load('../fonts/' + this.fontName + '_' + this.fontWeight + '.typeface.json', (response) => {
            this.loader.load('static/fonts/' + this.fontName + '_' + this.fontWeight + '.typeface.json', (response) => {
                this.font = response
                this.refreshText()
            })
        },
        // b为true是1为false是0
        boolToNum(b) {
            return b ? 1 : 0
        },
        handleColor() {
            this.pointLight.color.setHSL(Math.random(), 1, 0.5)
            this.hex = this.decimalToHex(this.pointLight.color.getHex())
            // this.updatePermalink()
        },
        handleFont() {
            this.fontIndex++
            this.fontName = this.reverseFontMap[this.fontIndex % this.reverseFontMap.length]
            this.loadFont()
        },
        handleWeight() {
            if (this.fontWeight === "bold") {
                this.fontWeight = "regular"
            } else {
                this.fontWeight = "bold"
            }
            this.loadFont()
        },
        handleBevel() {
            this.bevelEnabled = !this.bevelEnabled
            this.refreshText()
        },
        refreshText() {
            // this.updatePermalink()
            this.group.remove(this.textMesh1)
            if (this.mirror) {
                this.group.remove(this.textMesh2)
            }
            if (!this.text) {
                return
            }
            this.createText()
        },
        createText() {
            this.textGeo = new this.$THREE.TextGeometry(this.text, {
                font: this.font,
                size: this.size,
                height: this.height,
                curveSegments: this.curveSegments,
                bevelThickness: this.bevelThickness,
                bevelSize: this.bevelSize,
                bevelEnabled: this.bevelEnabled
            } )
            this.textGeo.computeBoundingBox()
            this.textGeo.computeVertexNormals()
            this.triangle = new this.$THREE.Triangle()
            // "fix" side normals by removing z-component of normals for side faces
            // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
            if (! this.bevelEnabled) {
                this.triangleAreaHeuristics = 0.1 * ( this.height * this.size )
                for (var i = 0; i < this.textGeo.faces.length; i ++) {
                    this.face = this.textGeo.faces[i]
                    if ( this.face.materialIndex == 1 ) {
                        for (var j = 0; j < this.face.vertexNormals.length; j ++) {
                            this.face.vertexNormals[j].z = 0
                            this.face.vertexNormals[j].normalize()
                        }
                        var va = this.textGeo.vertices[this.face.a]
                        var vb = this.textGeo.vertices[this.face.b]
                        var vc = this.textGeo.vertices[this.face.c]
                        var s = this.triangle.set(va, vb, vc).getArea()
                        if (s > this.triangleAreaHeuristics) {
                            for (var j = 0; j < this.face.vertexNormals.length; j ++) {
                                this.face.vertexNormals[j].copy(this.face.normal)
                            }
                        }
                    }
                }
            }
            this.centerOffset = - 0.5 * (this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x)
            this.textGeo = new this.$THREE.BufferGeometry().fromGeometry(this.textGeo)
            this.textMesh1 = new this.$THREE.Mesh(this.textGeo, this.materials)
            this.textMesh1.position.x = this.centerOffset
            this.textMesh1.position.y = this.hover
            this.textMesh1.position.z = 0
            this.textMesh1.rotation.x = 0
            this.textMesh1.rotation.y = Math.PI * 2
            this.group.add(this.textMesh1)
            if (this.mirror) {
                this.textMesh2 = new this.$THREE.Mesh(this.textGeo, this.materials)
                this.textMesh2.position.x = this.centerOffset
                this.textMesh2.position.y = - this.hover
                this.textMesh2.position.z = this.height
                this.textMesh2.rotation.x = Math.PI
                this.textMesh2.rotation.y = Math.PI * 2
                this.group.add(this.textMesh2)
            }
        }
    }
}
</script>

<style scoped>
.text-container {
    position: relative;
    width: 100%;
    height: 100%;
}
#info {
    margin-left: -221px;
}
</style>
