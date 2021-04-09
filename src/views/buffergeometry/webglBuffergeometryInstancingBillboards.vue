<template>
    <div class="webglBuffergeometryInstancingBillboards-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - instanced circle billboards - colors
            <div id="notSupported" style="display:none">Sorry, your graphics card + browser does not support hardware instancing</div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            vshader: null,
            fshader: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            geometry: null,
            material: null,
            mesh: null,
        }
    },
    mounted() {
        this.vshader = `
            precision highp float;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform float time;
            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 translate;
            varying vec2 vUv;
            varying float vScale;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
                vec3 trTime = vec3(translate.x + time,translate.y + time,translate.z + time);
                float scale =  sin( trTime.x * 2.1 ) + sin( trTime.y * 3.2 ) + sin( trTime.z * 4.3 );
                vScale = scale;
                scale = scale * 10.0 + 10.0;
                mvPosition.xyz += position * scale;
                vUv = uv;
                gl_Position = projectionMatrix * mvPosition;
            }`
        this.fshader = `
            precision highp float;
            uniform sampler2D map;
            varying vec2 vUv;
            varying float vScale;
            // HSL to RGB Convertion helpers
            vec3 HUEtoRGB(float H){
                H = mod(H,1.0);
                float R = abs(H * 6.0 - 3.0) - 1.0;
                float G = 2.0 - abs(H * 6.0 - 2.0);
                float B = 2.0 - abs(H * 6.0 - 4.0);
                return clamp(vec3(R,G,B),0.0,1.0);
            }
            vec3 HSLtoRGB(vec3 HSL){
                vec3 RGB = HUEtoRGB(HSL.x);
                float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
                return (RGB - 0.5) * C + HSL.z;
            }
            void main() {
                vec4 diffuseColor = texture2D( map, vUv );
                gl_FragColor = vec4( diffuseColor.xyz * HSLtoRGB(vec3(vScale/5.0, 1.0, 0.5)), diffuseColor.w );

                if ( diffuseColor.w < 0.5 ) discard;
            }`
        if (this.init()) {
			this.animate()
		}
    },
    methods: {
        init() {
			this.renderer = new this.$THREE.WebGLRenderer()
			if (this.renderer.capabilities.isWebGL2 === false && this.renderer.extensions.has('ANGLE_instanced_arrays') === false) {
				document.getElementById('notSupported').style.display = ''
				return false
			}
			this.container = document.createElement('div')
			document.getElementsByClassName('webglBuffergeometryInstancingBillboards-container')[0].appendChild(this.container)
			this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 5000)
			this.camera.position.z = 1400
			this.scene = new this.$THREE.Scene()
			var circleGeometry = new this.$THREE.CircleBufferGeometry(1, 6)
			this.geometry = new this.$THREE.InstancedBufferGeometry()
			this.geometry.index = circleGeometry.index
			this.geometry.attributes = circleGeometry.attributes
			var particleCount = 75000
			var translateArray = new Float32Array(particleCount * 3)
			for (let i = 0, i3 = 0, l = particleCount; i < l; i ++, i3 += 3) {
				translateArray[ i3 + 0 ] = Math.random() * 2 - 1
				translateArray[ i3 + 1 ] = Math.random() * 2 - 1
				translateArray[ i3 + 2 ] = Math.random() * 2 - 1
			}
			this.geometry.setAttribute('translate', new this.$THREE.InstancedBufferAttribute(translateArray, 3))
			this.material = new this.$THREE.RawShaderMaterial({
				uniforms: {
					"map": { value: new this.$THREE.TextureLoader().load('static/textures/sprites/circle.png') },
					"time": { value: 0.0 }
				},
				vertexShader: this.vshader,
				fragmentShader: this.fshader,
				depthTest: true,
				depthWrite: true
			})
			this.mesh = new this.$THREE.Mesh(this.geometry, this.material)
			this.mesh.scale.set(500, 500, 500)
			this.scene.add(this.mesh)
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.container.appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
			this.container.appendChild(this.stats.dom)
			window.addEventListener('resize', this.onWindowResize, false)
			return true
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
			requestAnimationFrame(this.animate)
			this.render()
			this.stats.update()
        },
        render() {
			var time = performance.now() * 0.0005
			this.material.uniforms[ "time" ].value = time
			this.mesh.rotation.x = time * 0.2
			this.mesh.rotation.y = time * 0.4
			this.renderer.render(this.scene, this.camera)
		}
    }
}
</script>

<style scoped>
.webglBuffergeometryInstancingBillboards-container {
    position: relative;
    width: 100%;
}
</style>
