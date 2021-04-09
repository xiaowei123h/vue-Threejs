<template>
    <div class="webglBuffergeometryInstancing-container">
        <div id="container"></div>
        <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - instancing demo (single triangle)
            <div id="notSupported" style="display:none">Sorry your graphics card + browser does not support hardware instancing</div>
        </div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
export default {
    data() {
        return {
            vertexShader: null,
            fragmentShader: null,
            container: null,
            stats: null,
            camera: null,
            scene: null,
			renderer: null,
			gui: null
        }
    },
    mounted() {
        this.vertexShader = `
            precision highp float;
            uniform float sineTime;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            attribute vec3 position;
            attribute vec3 offset;
            attribute vec4 color;
            attribute vec4 orientationStart;
            attribute vec4 orientationEnd;
            varying vec3 vPosition;
            varying vec4 vColor;
            void main(){
                vPosition = offset * max( abs( sineTime * 2.0 + 1.0 ), 0.5 ) + position;
                vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) );
                vec3 vcV = cross( orientation.xyz, vPosition );
                vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );
                vColor = color;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
            }`
        this.fragmentShader = `
            precision highp float;
            uniform float time;
            varying vec3 vPosition;
            varying vec4 vColor;
            void main() {
                vec4 color = vec4( vColor );
                color.r += sin( vPosition.x * 10.0 + time ) * 0.5;
                gl_FragColor = color;
            }`
        this.init()
        this.animate()
	},
	beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
			this.container = document.getElementById('container')
			this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 10)
			this.camera.position.z = 2
			this.scene = new this.$THREE.Scene()
			// geometry
			var vector = new this.$THREE.Vector4()
			var instances = 50000
			var positions = []
			var offsets = []
			var colors = []
			var orientationsStart = []
			var orientationsEnd = []
			positions.push(0.025, - 0.025, 0)
			positions.push(- 0.025, 0.025, 0)
			positions.push(0, 0, 0.025)
			// instanced attributes
			for (var i = 0; i < instances; i ++) {
				// offsets
				offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
				// colors
				colors.push(Math.random(), Math.random(), Math.random(), Math.random())
				// orientation start
				vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
				vector.normalize()
				orientationsStart.push(vector.x, vector.y, vector.z, vector.w)
				// orientation end
				vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
				vector.normalize()
				orientationsEnd.push(vector.x, vector.y, vector.z, vector.w)
			}
			var geometry = new this.$THREE.InstancedBufferGeometry()
			geometry.instanceCount = instances // set so its initalized for dat.GUI, will be set in first draw otherwise
			geometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(positions, 3))
			geometry.setAttribute('offset', new this.$THREE.InstancedBufferAttribute(new Float32Array(offsets), 3))
			geometry.setAttribute('color', new this.$THREE.InstancedBufferAttribute(new Float32Array(colors), 4))
			geometry.setAttribute('orientationStart', new this.$THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4))
			geometry.setAttribute('orientationEnd', new this.$THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4))
			// material
			var material = new this.$THREE.RawShaderMaterial({
				uniforms: {
					"time": { value: 1.0 },
					"sineTime": { value: 1.0 }
				},
				vertexShader: this.vertexShader,
				fragmentShader: this.fragmentShader,
				side: this.$THREE.DoubleSide,
				transparent: true
			})
			//
			var mesh = new this.$THREE.Mesh(geometry, material)
			this.scene.add(mesh)
			//
			this.renderer = new this.$THREE.WebGLRenderer()
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.container.appendChild(this.renderer.domElement)
			if (this.renderer.capabilities.isWebGL2 === false && this.renderer.extensions.has('ANGLE_instanced_arrays') === false) {
				document.getElementById('notSupported').style.display = ''
				return
			}
			//
			this.gui = new GUI({ width: 350 })
			this.gui.add(geometry, 'instanceCount', 0, instances)
			//
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
			this.container.appendChild(this.stats.dom)
			//
			window.addEventListener('resize', this.onWindowResize, false)
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
			var time = performance.now()
			var object = this.scene.children[0]
			object.rotation.y = time * 0.0005
			object.material.uniforms["time"].value = time * 0.005
			object.material.uniforms["sineTime"].value = Math.sin(object.material.uniforms["time"].value * 0.05)
			this.renderer.render(this.scene, this.camera)
		}
    }
}
</script>

<style scoped>
.webglBuffergeometryInstancing-container {
	position: relative;
    width: 100%;
}
</style>
