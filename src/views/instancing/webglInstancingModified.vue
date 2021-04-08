<template>
    <div class="webglInstancingModified-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl instancing - modified
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
            stats: null,
			mesh: null,
			dummy: null,
			amount: 8,
			count: null,
        }
    },
    mounted() {
        this.dummy = new this.$THREE.Object3D()
        this.count = Math.pow(this.amount, 3)
        this.init()
        this.animate()
    },
    methods: {
        init() {
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: false }) // false improves the frame rate
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('webglInstancingModified-container')[0].appendChild(this.renderer.domElement)
            this.renderer.outputEncoding = this.$THREE.sRGBEncoding
            this.scene = new this.$THREE.Scene()
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 100)
            this.camera.position.set(0, 0, 20)
            new this.$THREE.BufferGeometryLoader().load('static/models/json/suzanne_buffergeometry.json', (geometry) => {
                var instanceColors = []
                for (var i = 0; i < this.count; i ++) {
                    instanceColors.push(Math.random())
                    instanceColors.push(Math.random())
                    instanceColors.push(Math.random())
                }
                geometry.setAttribute('instanceColor', new this.$THREE.InstancedBufferAttribute(new Float32Array(instanceColors), 3))
                geometry.computeVertexNormals()
                geometry.scale(0.5, 0.5, 0.5)
                //console.log(geometry)
                //
                new this.$THREE.TextureLoader().load('static/textures/matcaps/matcap-porcelain-white.jpg', (texture) => {
                    texture.encoding = this.$THREE.sRGBEncoding
                    var material = new this.$THREE.MeshMatcapMaterial({ color: 0xaaaaff, matcap: texture })
                    const colorParsChunk = [
                        'attribute vec3 instanceColor;',
                        'varying vec3 vInstanceColor;',
                        '#include <common>'
                    ].join( '\n' )
                    const instanceColorChunk = [
                        '#include <begin_vertex>',
                        '\tvInstanceColor = instanceColor;'
                    ].join( '\n' )
                    const fragmentParsChunk = [
                        'varying vec3 vInstanceColor;',
                        '#include <common>'
                    ].join( '\n' )
                    const colorChunk = [
                        'vec4 diffuseColor = vec4( diffuse * vInstanceColor, opacity );'
                    ].join( '\n' )
                    material.onBeforeCompile = function ( shader ) {
                        shader.vertexShader = shader.vertexShader
                            .replace( '#include <common>', colorParsChunk )
                            .replace( '#include <begin_vertex>', instanceColorChunk );
                        shader.fragmentShader = shader.fragmentShader
                            .replace( '#include <common>', fragmentParsChunk )
                            .replace( 'vec4 diffuseColor = vec4( diffuse, opacity );', colorChunk );
                        //console.log( shader.uniforms );
                        //console.log( shader.vertexShader );
                        //console.log( shader.fragmentShader );
                    }
                    this.mesh = new this.$THREE.InstancedMesh(geometry, material, this.count)
                    this.mesh.instanceMatrix.setUsage(this.$THREE.DynamicDrawUsage) // will be updated every frame
                    this.scene.add(this.mesh)
                })
            })
            //
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
            document.getElementsByClassName('webglInstancingModified-container')[0].appendChild(this.stats.dom)
            //
            window.addEventListener('resize', this.onWindowResize, false)
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
            if (this.mesh) {
                var time = Date.now() * 0.001
                this.mesh.rotation.x = Math.sin(time / 4)
                this.mesh.rotation.y = Math.sin(time / 2)
                var i = 0
                var offset = (this.amount - 1) / 2
                for (var x = 0; x < this.amount; x ++) {
                    for (var y = 0; y < this.amount; y ++) {
                        for (var z = 0; z < this.amount; z ++) {
                            this.dummy.position.set(offset - x, offset - y, offset - z)
                            this.dummy.rotation.y = (Math.sin(x / 4 + time) + Math.sin(y / 4 + time) + Math.sin(z / 4 + time))
                            this.dummy.rotation.z = this.dummy.rotation.y * 2
                            this.dummy.updateMatrix()
                            this.mesh.setMatrixAt(i ++, this.dummy.matrix)
                        }
                    }
                }
                this.mesh.instanceMatrix.needsUpdate = true
            }
            this.renderer.render(this.scene, this.camera)
        }
    }
}
</script>

<style scoped>
.webglInstancingModified-container {
    width: 100%;
}
#info {
    margin-left: 0;
}
</style>
