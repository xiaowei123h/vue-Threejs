<template>
    <div class="webglShaderLava-container">
        <div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - shader material demo. featuring lava shader by <a href="http://irrlicht.sourceforge.net/phpBB2/viewtopic.php?t=21057" target="_blank" rel="noopener">TheGameMaker</a></div>
    </div>
</template>

<script>
import { EffectComposer } from '@/components/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/components/jsm/postprocessing/RenderPass.js'
import { FilmPass } from '@/components/jsm/postprocessing/FilmPass.js'
import { BloomPass } from '@/components/jsm/postprocessing/BloomPass.js'
export default {
    data() {
        return {
            fragmentShader: null,
            vertexShader: null,
            camera: null,
            renderer: null,
            composer: null,
            clock: null,
            uniforms: null,
            mesh: null,
        }
    },
    mounted() {
        this.fragmentShader = `
            uniform float time;
			uniform float fogDensity;
			uniform vec3 fogColor;
			uniform sampler2D texture1;
			uniform sampler2D texture2;
			varying vec2 vUv;
			void main(void) {
				vec2 position = - 1.0 + 2.0 * vUv;
				vec4 noise = texture2D(texture1, vUv);
				vec2 T1 = vUv + vec2(1.5, - 1.5) * time * 0.02;
				vec2 T2 = vUv + vec2(- 0.5, 2.0) * time * 0.01;
				T1.x += noise.x * 2.0;
				T1.y += noise.y * 2.0;
				T2.x -= noise.y * 0.2;
				T2.y += noise.z * 0.2;
				float p = texture2D(texture1, T1 * 2.0).a;
				vec4 color = texture2D(texture2, T2 * 2.0);
				vec4 temp = color * (vec4(p, p, p, p) * 2.0) + (color * color - 0.1);
				if(temp.r > 1.0) { temp.bg += clamp(temp.r - 2.0, 0.0, 100.0); }
				if(temp.g > 1.0) { temp.rb += temp.g - 1.0; }
				if(temp.b > 1.0) { temp.rg += temp.b - 1.0; }
				gl_FragColor = temp;
				float depth = gl_FragCoord.z / gl_FragCoord.w;
				var float LOG2 = 1.442695;
				float fogFactor = exp2(- fogDensity * fogDensity * depth * depth * LOG2);
				fogFactor = 1.0 - clamp(fogFactor, 0.0, 1.0);
				gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
            }`
        this.vertexShader = `
            uniform vec2 uvScale;
			varying vec2 vUv;
			void main()
			{
				vUv = uvScale * uv;
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.init()
		this.animate()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            this.camera = new this.$THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 3000)
            this.camera.position.z = 4
            var scene = new this.$THREE.Scene()
            this.clock = new this.$THREE.Clock()
            var textureLoader = new this.$THREE.TextureLoader()
            this.uniforms = {
                "fogDensity": { value: 0.45 },
                "fogColor": { value: new this.$THREE.Vector3(0, 0, 0) },
                "time": { value: 1.0 },
                "uvScale": { value: new this.$THREE.Vector2(3.0, 1.0) },
                "texture1": { value: textureLoader.load('static/textures/lava/cloud.png') },
                "texture2": { value: textureLoader.load('static/textures/lava/lavatile.jpg') }
            }
            this.uniforms[ "texture1" ].value.wrapS = this.uniforms[ "texture1" ].value.wrapT = this.$THREE.RepeatWrapping
            this.uniforms[ "texture2" ].value.wrapS = this.uniforms[ "texture2" ].value.wrapT = this.$THREE.RepeatWrapping
            var size = 0.65
            var material = new this.$THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader
            })
            this.mesh = new this.$THREE.Mesh(new this.$THREE.TorusBufferGeometry(size, 0.3, 30, 30), material)
            this.mesh.rotation.x = 0.3
            scene.add(this.mesh)
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            container.appendChild(this.renderer.domElement)
            this.renderer.autoClear = false
            //
            var renderModel = new RenderPass(scene, this.camera)
            var effectBloom = new BloomPass(1.25)
            var effectFilm = new FilmPass(0.35, 0.95, 2048, false)
            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(renderModel)
            this.composer.addPass(effectBloom)
            this.composer.addPass(effectFilm)
            //
            this.onWindowResize()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.composer.setSize(window.innerWidth, window.innerHeight)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var delta = 5 * this.clock.getDelta()
            this.uniforms[ 'time' ].value += 0.2 * delta
            this.mesh.rotation.y += 0.0125 * delta
            this.mesh.rotation.x += 0.05 * delta
            this.renderer.clear()
            this.composer.render(0.01)
        }
    },
}
</script>

<style scoped>
.webglShaderLava-container {
    width: 100%;
}
</style>
