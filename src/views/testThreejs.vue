<template>
    <div id="three-container">

    </div>
</template>

<script>
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            scene: new this.$THREE.Scene(),
            camera: new this.$THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
            renderer: new this.$THREE.WebGLRenderer(),
            geometry: new this.$THREE.BoxGeometry( 1, 1, 1 ),
            material: new this.$THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
            cube: null
        }
    },
    created() {
        console.log('11111111')
        console.log(OrbitControls)
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.$nextTick(() => {
            document.getElementById('three-container').appendChild(this.renderer.domElement)
            // 检测浏览器是否支持webgl2
            if ( WEBGL.isWebGL2Available() === false ) {
                document.body.appendChild(WEBGL.getWebGL2ErrorMessage())
            }
        })
        // document.body.appendChild( this.renderer.domElement )
        this.cube = new this.$THREE.Mesh( this.geometry, this.material )
        this.scene.add( this.cube )
        this.camera.position.z = 5
        this.animate()
    },
    methods: {
        animate() {
            requestAnimationFrame( this.animate )
            this.cube.rotation.x += 0.01
            this.cube.rotation.y += 0.01
            this.renderer.render( this.scene, this.camera )
        }
    }
}
</script>

<style scoped>
#three-container {
    width: 100%;
    height: 100%;
}
</style>
