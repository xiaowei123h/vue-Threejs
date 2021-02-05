<template>
    <div class="webglMaterialsModified-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> wegbl - modified material.
			<a href="http://graphics.cs.williams.edu/data/meshes.xml#14" target="_blank" rel="noopener">Lee Perry-Smith</a> head.
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$THREE.PerspectiveCamera(27, this.$webglInnerWidth / window.innerHeight, 0.1, 100)
            this.camera.position.z = 20
            this.scene = new this.$THREE.Scene()
            var loader = new GLTFLoader()
            loader.load('static/models/gltf/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
                var geometry = gltf.scene.children[ 0 ].geometry
                var mesh = new this.$THREE.Mesh(geometry, this.buildTwistMaterial(2.0))
                mesh.position.x = - 3.5
                mesh.position.y = - 0.5
                this.scene.add(mesh)
                mesh = new this.$THREE.Mesh(geometry, this.buildTwistMaterial(- 2.0))
                mesh.position.x = 3.5
                mesh.position.y = - 0.5
                this.scene.add(mesh)
            })
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglMaterialsModified-container')[0].appendChild(this.renderer.domElement)
            var controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.minDistance = 10
            controls.maxDistance = 50
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglMaterialsModified-container')[0].appendChild(this.stats.dom)
            // EVENTS
            window.addEventListener('resize', this.onWindowResize, false)
        },
        buildTwistMaterial(amount) {
            var material = new this.$THREE.MeshNormalMaterial()
            material.onBeforeCompile = (shader) => {
                shader.uniforms.time = { value: 0 }
                shader.vertexShader = 'uniform float time;\n' + shader.vertexShader
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    [
                        `float theta = sin(time + position.y) / ${ amount.toFixed(1) };`,
                        'float c = cos(theta);',
                        'float s = sin(theta);',
                        'mat3 m = mat3(c, 0, s, 0, 1, 0, -s, 0, c);',
                        'vec3 transformed = vec3(position) * m;',
                        'vNormal = vNormal * m;'
                    ].join('\n')
                )
                material.userData.shader = shader
            }
            // Make sure WebGLRenderer doesnt reuse a single program
            material.customProgramCacheKey = () => {
                return amount
            }
            return material
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
            this.stats.update()
        },
        render() {
            this.scene.traverse((child) => {
                if (child.isMesh) {
                    var shader = child.material.userData.shader
                    if (shader) {
                        shader.uniforms.time.value = performance.now() / 1000
                    }
                }
            })
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsModified-container {
    width: 100%;
}
</style>
