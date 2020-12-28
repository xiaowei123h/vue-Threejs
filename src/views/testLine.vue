<template>
    <div class="line-container">
        <div id="line-cont"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            scene: '',
            camera: '',
            renderer: '',
            material: '',
            geometry: '',
            line: ''
        }
    },
    mounted() {
        this.initScene()
        this.initCamera()
        this.createRender()
        this.createGeometry()
        this.createMaterial()
        this.createLine()
        this.render()
    },
    methods: {
        initScene() {
            this.scene = new this.$THREE.Scene()
        },
        initCamera() {
            this.camera = new this.$THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 )
            this.camera.position.set( 0, 0, 100 )
            this.camera.lookAt( 0, 0, 0 )
        },
        createRender() {
            var element = document.getElementById('line-cont')
            this.renderer = new this.$THREE.WebGLRenderer()
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            element.appendChild(this.renderer.domElement)
        },
        createMaterial() {
            this.material = new this.$THREE.LineBasicMaterial( { color: 0x0000ff } )
        },
        createGeometry() {
            this.geometry = new this.$THREE.Geometry()
            this.geometry.vertices.push(new this.$THREE.Vector3( -10, 0, 0) )
            this.geometry.vertices.push(new this.$THREE.Vector3( 0, 10, 0) )
            this.geometry.vertices.push(new this.$THREE.Vector3( 10, 0, 0) )
        },
        createLine() {
            this.line = new this.$THREE.Line( this.geometry, this.material )
        },
        render() {
            this.scene.add( this.line )
            this.renderer.render( this.scene, this.camera )
        }
    }
}
</script>

<style scoped>

</style>
