<template>
    <div class="webglNearestneighbour-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - typed arrays<br/>
			nearest neighbour for 500,000 sprites
		</div>
    </div>
</template>

<script>
import { FirstPersonControls } from '@/components/jsm/controls/FirstPersonControls.js'
import { TypedArrayUtils } from '@/components/jsm/utils/TypedArrayUtils.js'
export default {
    data() {
        return {
            vertexshader: null,
            fragmentshader: null,
            camera: null,
            scene: null,
            renderer: null,
			controls: null,
            amountOfParticles: 500000,
            maxDistance: null,
            positions: null,
            alphas: null,
            particles: null,
            _particleGeom: null,
			kdtree: null,
			clock: null,
        }
    },
    mounted() {
        this.vertexshader = `
            //uniform float zoom;
			attribute float alpha;
			varying float vAlpha;
			void main() {
				vAlpha = 1.0 - alpha;
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = 4.0 * (300.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.fragmentshader = `
            uniform sampler2D tex1;
			varying float vAlpha;
			void main() {
				gl_FragColor = texture2D(tex1, gl_PointCoord);
				gl_FragColor.r = (1.0 - gl_FragColor.r) * vAlpha + gl_FragColor.r;
            }`
        this.maxDistance = Math.pow(120, 2)
        this.clock = new this.$THREE.Clock()
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(75, this.$webglInnerWidth / window.innerHeight, 1, 1000000)
            this.scene = new this.$THREE.Scene()
            // add a skybox background
            var cubeTextureLoader = new this.$THREE.CubeTextureLoader()
            cubeTextureLoader.setPath('static/textures/cube/skyboxsun25deg/')
            var cubeTexture = cubeTextureLoader.load([
                'px.jpg', 'nx.jpg',
                'py.jpg', 'ny.jpg',
                'pz.jpg', 'nz.jpg',
            ])
            this.scene.background = cubeTexture
            //
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglNearestneighbour-container')[0].appendChild(this.renderer.domElement)
            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)
            this.controls.movementSpeed = 100
            this.controls.lookSpeed = 0.1
            this.controls.lookAt(500, 500, 500)
            // create the custom shader
            var textureLoader = new this.$THREE.TextureLoader()
            var imagePreviewTexture = textureLoader.load('static/textures/crate.gif')
            imagePreviewTexture.minFilter = this.$THREE.LinearMipmapLinearFilter
            imagePreviewTexture.magFilter = this.$THREE.LinearFilter
            var pointShaderMaterial = new this.$THREE.ShaderMaterial({
                uniforms: {
                    tex1: { value: imagePreviewTexture },
                    zoom: { value: 9.0 }
                },
                vertexShader: this.vertexshader,
                fragmentShader: this.fragmentshader,
                transparent: true
            })
            //create particles with buffer geometry
            this.positions = new Float32Array(this.amountOfParticles * 3)
            this.alphas = new Float32Array(this.amountOfParticles)
            this._particleGeom = new this.$THREE.BufferGeometry()
            this._particleGeom.setAttribute('position', new this.$THREE.BufferAttribute(this.positions, 3))
            this._particleGeom.setAttribute('alpha', new this.$THREE.BufferAttribute(this.alphas, 1))
            this.particles = new this.$THREE.Points(this._particleGeom, pointShaderMaterial)
            for (var x = 0; x < this.amountOfParticles; x ++) {
                this.positions[ x * 3 + 0 ] = Math.random() * 1000
                this.positions[ x * 3 + 1 ] = Math.random() * 1000
                this.positions[ x * 3 + 2 ] = Math.random() * 1000
                this.alphas[ x ] = 1.0
            }
            var measureStart = new Date().getTime()
            // creating the kdtree takes a lot of time to execute, in turn the nearest neighbour search will be much faster
            this.kdtree = new TypedArrayUtils.Kdtree(this.positions, this.distanceFunction, 3)
            console.log('TIME building kdtree', new Date().getTime() - measureStart)
            // display this.particles after the kd-tree was generated and the sorting of the positions-array is done
            this.scene.add(this.particles)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.controls.handleResize()
        },
        animate() {
            requestAnimationFrame(this.animate)
            //
            this.displayNearest(this.camera.position)
            this.controls.update(this.clock.getDelta())
            this.renderer.render(this.scene, this.camera)
        },
        displayNearest(position) {
            // take the nearest 200 around him. distance^2 'cause we use the manhattan distance and no square is applied in the distance function
            var imagePositionsInRange = this.kdtree.nearest([ position.x, position.y, position.z ], 100, this.maxDistance)
            // We combine the nearest neighbour with a view frustum. Doesn't make sense if we change the sprites not in our view... well maybe it does. Whatever you want.
            var _frustum = new this.$THREE.Frustum()
            var _projScreenMatrix = new this.$THREE.Matrix4()
            _projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
            _frustum.setFromProjectionMatrix(_projScreenMatrix)
            for (var i = 0, il = imagePositionsInRange.length; i < il; i ++) {
                var object = imagePositionsInRange[ i ]
                var objectPoint = new this.$THREE.Vector3().fromArray(object[ 0 ].obj)
                if (_frustum.containsPoint(objectPoint)) {
                    var objectIndex = object[ 0 ].pos
                    // set the alpha according to distance
                    this.alphas[ objectIndex ] = 1.0 / this.maxDistance * object[ 1 ]
                    // update the attribute
                    this._particleGeom.attributes.alpha.needsUpdate = true
                }
            }
        },
        distanceFunction(a, b) {
            return Math.pow(a[ 0 ] - b[ 0 ], 2) + Math.pow(a[ 1 ] - b[ 1 ], 2) + Math.pow(a[ 2 ] - b[ 2 ], 2)
        }
    },
}
</script>

<style scoped>
.webglNearestneighbour-container {
    width: 100%;
}
</style>
