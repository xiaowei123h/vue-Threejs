<template>
    <div class="webglTiledForward-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">threejs</a> - Tiled forward lighting<br/>
			Created by <a href="https://github.com/wizgrav" target="_blank" rel="noopener">wizgrav</a>.
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { OBJLoader } from '@/components/jsm/loaders/OBJLoader.js'
import { UnrealBloomPass } from '@/components/jsm/postprocessing/UnrealBloomPass.js'
export default {
    data() {
        return {
            RADIUS: 75,
            lights: [],
            State: null,
            lightBounds: null,
            container: null,
            camera: null,
            scene: null,
            renderer: null,
            renderTarget: null,
            bloom: null,
            stats: null,
            controls: null,
            materials: [],
            Heads: null,
            loader: null,
        }
    },
    mounted() {
        this.$THREE.ShaderChunk[ 'lights_pars_begin' ] += [
            '',
            '#if defined TILED_FORWARD',
            'uniform vec4 tileData;',
            'uniform sampler2D tileTexture;',
            'uniform sampler2D lightTexture;',
            '#endif'
        ].join('\n')
        this.$THREE.ShaderChunk[ 'lights_fragment_end' ] += [
            '',
            '#if defined TILED_FORWARD',
            'vec2 tUv = floor(gl_FragCoord.xy / tileData.xy * 32.) / 32. + tileData.zw;',
            'vec4 tile = texture2D(tileTexture, tUv);',
            'for (int i=0; i < 4; i++) {',
            '	float tileVal = tile.x * 255.;',
            '  	tile.xyzw = tile.yzwx;',
            '	if(tileVal == 0.){ continue; }',
            '  	float tileDiv = 128.;',
            '	for (int j=0; j < 8; j++) {',
            '  		if (tileVal < tileDiv) {  tileDiv *= 0.5; continue; }',
            '		tileVal -= tileDiv;',
            '		tileDiv *= 0.5;',
            '  		PointLight pointlight;',
            '		float uvx = (float(8 * i + j) + 0.5) / 32.;',
            '  		vec4 lightData = texture2D(lightTexture, vec2(uvx, 0.));',
            '  		vec4 lightColor = texture2D(lightTexture, vec2(uvx, 1.));',
            '  		pointlight.position = lightData.xyz;',
            '  		pointlight.distance = lightData.w;',
            '  		pointlight.color = lightColor.rgb;',
            '  		pointlight.decay = lightColor.a;',
            '  		getPointDirectLightIrradiance(pointlight, geometry, directLight);',
            '		RE_Direct(directLight, geometry, material, reflectedLight);',
            '	}',
            '}',
            '#endif'
        ].join('\n')
        this.State = {
            rows: 0,
            cols: 0,
            width: 0,
            height: 0,
            tileData: { value: null },
            tileTexture: { value: null },
            lightTexture: {
                value: new this.$THREE.DataTexture(new Float32Array(32 * 2 * 4), 32, 2, this.$THREE.RGBAFormat, this.$THREE.FloatType)
            },
        }
        this.lightBounds = () => {
            var v = new this.$THREE.Vector3()
            return (camera, pos, r) => {
                var minX = this.State.width, maxX = 0, minY = this.State.height, maxY = 0
                var hw = this.State.width / 2, hh = this.State.height / 2
                for (var i = 0; i < 8; i ++) {
                    v.copy(pos)
                    v.x += i & 1 ? r : - r
                    v.y += i & 2 ? r : - r
                    v.z += i & 4 ? r : - r
                    var vector = v.project(camera)
                    var x = (vector.x * hw) + hw
                    var y = (vector.y * hh) + hh
                    minX = Math.min(minX, x)
                    maxX = Math.max(maxX, x)
                    minY = Math.min(minY, y)
                    maxY = Math.max(maxY, y)
                }
                return [ minX, maxX, minY, maxY ]
            }
        }
        this.lightBounds()
        this.container = document.createElement('div')
        document.getElementsByClassName('webglTiledForward-container')[0].appendChild(this.container)
        this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 2000)
        this.camera.position.set(0.0, 0.0, 240.0)
        this.scene = new this.$THREE.Scene()
        this.scene.background = new this.$THREE.Color(0x111111)
        this.renderer = new this.$THREE.WebGLRenderer()
        this.renderer.toneMapping = this.$THREE.NoToneMapping
        this.container.appendChild(this.renderer.domElement)
        this.renderTarget = new this.$THREE.WebGLRenderTarget()
        this.scene.add(new this.$THREE.AmbientLight(0xffffff, 0.33))
        // At least one regular Pointlight is needed to activate light support
        this.scene.add(new this.$THREE.PointLight(0xff0000, 0.1, 0.1))
        this.bloom = new UnrealBloomPass(new this.$THREE.Vector2(this.$webglInnerWidth, window.innerHeight), 0.8, 0.6, 0.8)
        this.bloom.renderToScreen = true
        this.stats = new this.$Stats()
        this.$statsPosition(this.stats)
        this.container.appendChild(this.stats.dom)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.minDistance = 120
        this.controls.maxDistance = 320
        this.Heads = [
            { type: 'physical', uniforms: { "diffuse": 0x888888, "metalness": 1.0, "roughness": 0.66 }, defines: {} },
            { type: 'standard', uniforms: { "diffuse": 0x666666, "metalness": 0.1, "roughness": 0.33 }, defines: {} },
            { type: 'phong', uniforms: { "diffuse": 0x777777, "shininess": 20 }, defines: {} },
            { type: 'phong', uniforms: { "diffuse": 0x555555, "shininess": 10 }, defines: { TOON: 1 } }
        ]
        this.scene.onBeforeRender = this.tileLights
        this.scene.onAfterRender = this.postEffect
        this.loader = new OBJLoader()
        this.loader.load('static/models/obj/walt/WaltHead.obj', (object) => {
            var geometry = object.children[ 0 ].geometry
            window.addEventListener('resize', this.resize)
            this.init(geometry)
            this.resize()
            this.renderer.setAnimationLoop((time) => {
                this.update(time / 1000)
                this.stats.begin()
                this.renderer.setRenderTarget(this.renderTarget)
                this.renderer.render(this.scene, this.camera)
                this.stats.end()
            })
        })
    },
    methods: {
        resizeTiles() {
            var width = window.innerWidth - 281
            var height = window.innerHeight
            this.State.width = width
            this.State.height = height
            this.State.cols = Math.ceil(width / 32)
            this.State.rows = Math.ceil(height / 32)
            this.State.tileData.value = [ width, height, 0.5 / Math.ceil(width / 32), 0.5 / Math.ceil(height / 32) ]
            this.State.tileTexture.value = new this.$THREE.DataTexture(new Uint8Array(this.State.cols * this.State.rows * 4), this.State.cols, this.State.rows)
        },
        tileLights(renderer, scene, camera) {
            if (! camera.projectionMatrix) return
            var d = this.State.tileTexture.value.image.data
            var ld = this.State.lightTexture.value.image.data
            var viewMatrix = camera.matrixWorldInverse
            d.fill(0)
            var vector = new this.$THREE.Vector3()
            this.lights.forEach((light, index) => {
                vector.setFromMatrixPosition(light.matrixWorld)
                var bs = this.lightBounds(camera, vector, light._light.radius)
                vector.applyMatrix4(viewMatrix)
                vector.toArray(ld, 4 * index)
                ld[ 4 * index + 3 ] = light._light.radius
                light._light.color.toArray(ld, 32 * 4 + 4 * index)
                ld[ 32 * 4 + 4 * index + 3 ] = light._light.decay
                if (bs[ 1 ] < 0 || bs[ 0 ] > this.State.width || bs[ 3 ] < 0 || bs[ 2 ] > this.State.height) return
                if (bs[ 0 ] < 0) bs[ 0 ] = 0
                if (bs[ 1 ] > this.State.width) bs[ 1 ] = this.State.width
                if (bs[ 2 ] < 0) bs[ 2 ] = 0
                if (bs[ 3 ] > this.State.height) bs[ 3 ] = this.State.height
                var i4 = Math.floor(index / 8), i8 = 7 - (index % 8)
                for (var i = Math.floor(bs[ 2 ] / 32); i <= Math.ceil(bs[ 3 ] / 32); i ++) {
                    for (var j = Math.floor(bs[ 0 ] / 32); j <= Math.ceil(bs[ 1 ] / 32); j ++) {
                        d[ (this.State.cols * i + j) * 4 + i4 ] |= 1 << i8
                    }
                }
            })
            this.State.tileTexture.value.needsUpdate = true
            this.State.lightTexture.value.needsUpdate = true
        },
        init(geom) {
            var sphereGeom = new this.$THREE.SphereBufferGeometry(0.5, 32, 32)
            var tIndex = Math.round(Math.random() * 3)
            Object.keys(this.Heads).forEach((t, index) => {
                var g = new this.$THREE.Group()
                var conf = this.Heads[ t ]
                var ml = this.$THREE.ShaderLib[ conf.type ]
                var mtl = new this.$THREE.ShaderMaterial({
                    lights: true,
                    fragmentShader: ml.fragmentShader,
                    vertexShader: ml.vertexShader,
                    uniforms: this.$THREE.UniformsUtils.clone(ml.uniforms),
                    defines: conf.defines,
                    transparent: tIndex === index ? true : false,
                })
                mtl.extensions.derivatives = true
                mtl.uniforms[ "opacity" ].value = tIndex === index ? 0.9 : 1
                mtl.uniforms[ "tileData" ] = this.State.tileData
                mtl.uniforms[ "tileTexture" ] = this.State.tileTexture
                mtl.uniforms[ "lightTexture" ] = this.State.lightTexture
                for (var u in conf.uniforms) {
                    var vu = conf.uniforms[ u ]
                    if (mtl.uniforms[ u ].value.set) {
                        mtl.uniforms[ u ].value.set(vu)
                    } else {
                        mtl.uniforms[ u ].value = vu
                    }
                }
                mtl.defines[ 'TILED_FORWARD' ] = 1
                this.materials.push(mtl)
                var obj = new this.$THREE.Mesh(geom, mtl)
                obj.position.y = - 37
                mtl.side = tIndex === index ? this.$THREE.FrontSide : this.$THREE.DoubleSide
                g.rotation.y = index * Math.PI / 2
                g.position.x = Math.sin(index * Math.PI / 2) * this.RADIUS
                g.position.z = Math.cos(index * Math.PI / 2) * this.RADIUS
                g.add(obj)
                for (var i = 0; i < 8; i ++) {
                    var color = new this.$THREE.Color().setHSL(Math.random(), 1.0, 0.5)
                    var l = new this.$THREE.Group()
                    l.add(new this.$THREE.Mesh(
                        sphereGeom,
                        new this.$THREE.MeshBasicMaterial({
                            color: color
                        })
                    ))
                    l.add(new this.$THREE.Mesh(
                        sphereGeom,
                        new this.$THREE.MeshBasicMaterial({
                            color: color,
                            transparent: true,
                            opacity: 0.033
                        })
                    ))
                    l.children[ 1 ].scale.set(6.66, 6.66, 6.66)
                    l._light = {
                        color: color,
                        radius: this.RADIUS,
                        decay: 1,
                        sy: Math.random(),
                        sr: Math.random(),
                        sc: Math.random(),
                        py: Math.random() * Math.PI,
                        pr: Math.random() * Math.PI,
                        pc: Math.random() * Math.PI,
                        dir: Math.random() > 0.5 ? 1 : - 1
                    }
                    this.lights.push(l)
                    g.add(l)
                }
                this.scene.add(g)
            })
        },
        update(now) {
            this.lights.forEach((l) => {
                var ld = l._light
                var radius = 0.8 + 0.2 * Math.sin(ld.pr + (0.6 + 0.3 * ld.sr) * now)
                l.position.x = (Math.sin(ld.pc + (0.8 + 0.2 * ld.sc) * now * ld.dir)) * radius * this.RADIUS
                l.position.z = (Math.cos(ld.pc + (0.8 + 0.2 * ld.sc) * now * ld.dir)) * radius * this.RADIUS
                l.position.y = Math.sin(ld.py + (0.8 + 0.2 * ld.sy) * now) * radius * 32
            })
        },
        resize() {
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderTarget.setSize(window.innerWidth - 281, window.innerHeight)
            this.bloom.setSize(window.innerWidth - 281, window.innerHeight)
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
            this.resizeTiles()
        },
        postEffect(renderer) {
            this.bloom.render(renderer, null, this.renderTarget)
        }
    },
}
</script>

<style scoped>
.webglTiledForward-container {
    position: relative;
    width: 100%;
}
</style>
