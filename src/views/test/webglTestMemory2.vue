<template>
    <div class="webglTestMemory2-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - memory test II
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            fragmentShader: null,
            vertexShader: null,
            N: 100,
			container: null,
            camera: null,
            scene: null,
            renderer: null,
			geometry: null,
			meshes: [],
            fragmentShader: null,
            vertexShader: null,
        }
    },
    mounted() {
        this.fragmentShader = `
            void main() {
				if (mod (gl_FragCoord.x, 4.0001) < 1.0 || mod (gl_FragCoord.y, 4.0001) < 1.0)
					gl_FragColor = vec4(XXX, 1.0);
				else
					gl_FragColor = vec4(1.0);
            }`
        this.vertexShader = `
            void main() {
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.init()
		setInterval(this.render, 1000 / 60)
    },
    methods: {
        init() {
            this.container = document.createElement('div')
            document.getElementsByClassName('webglTestMemory2-container')[0].appendChild(this.container)
            // vertexShader = document.getElementById("vertexShader").textContent
            // fragmentShader = document.getElementById("fragmentShader").textContent
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.z = 2000
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xffffff)
            this.geometry = new this.$THREE.SphereBufferGeometry(15, 64, 32)
            for (var i = 0; i < this.N; i ++) {
                var material = new this.$THREE.ShaderMaterial({ vertexShader: this.vertexShader, fragmentShader: this.generateFragmentShader() })
                var mesh = new this.$THREE.Mesh(this.geometry, material)
                mesh.position.x = (0.5 - Math.random()) * 1000
                mesh.position.y = (0.5 - Math.random()) * 1000
                mesh.position.z = (0.5 - Math.random()) * 1000
                this.scene.add(mesh)
                this.meshes.push(mesh)
            }
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.container.appendChild(this.renderer.domElement)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        generateFragmentShader() {
            return this.fragmentShader.replace("XXX", Math.random() + "," + Math.random() + "," + Math.random())
        },
        render() {
            for (var i = 0; i < this.N; i ++) {
                var mesh = this.meshes[ i ]
                mesh.material = new this.$THREE.ShaderMaterial({ vertexShader: this.vertexShader, fragmentShader: this.generateFragmentShader() })
            }
            this.renderer.render(this.scene, this.camera)
            console.log("before", this.renderer.info.programs.length)
            for (var i = 0; i < this.N; i ++) {
                var mesh = this.meshes[ i ]
                mesh.material.dispose()
            }
            console.log("after", this.renderer.info.programs.length)
        }
    },
}
</script>

<style scoped>
.webglTestMemory2-container {
    width: 100%;
}
#info {
    background-color: #fff;
    color: #000;
    margin-left: 45px;
}
#info a {
    color: #08f;
}
</style>
