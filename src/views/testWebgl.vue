<template>
    <div id="webgl-container">
    </div>
</template>
<script>
export default {
    data() {
        return {
            vertexShader: '',
            fragmentShader: ''
        }
    },
    created() {
        this.$nextTick(() => {
            // 检测浏览器是否支持webgl2
            if ( this.$WEBGL.isWebGL2Available() === false ) {
                document.body.appendChild(this.$WEBGL.getWebGL2ErrorMessage())
            } else {
                // 创建一个canvas元素
                var canvas = document.createElement( 'canvas' )
                var context = canvas.getContext( 'webgl2', { alpha: false } )
                var renderer = new this.$THREE.WebGLRenderer( { canvas: canvas, context: context } )
                // console.log('11111111')
                // console.log(document.getElementById('vs'))
                // var material = new THREE.ShaderMaterial( {
                //     vertexShader: document.getElementById( 'vs' ).textContent.trim(),
                //     fragmentShader: document.getElementById( 'fs' ).textContent.trim()
                // } )
            }
        })
        console.log('22222222')
        console.log(document.getElementById('vs'))
    },
    mounted() {
        this.initShaderMaterialsData()
        var material = new this.$THREE.ShaderMaterial( {
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        } )
    },
    methods: {
        // 初始化着色器材质
        initShaderMaterialsData() {
            this.vertexShader = `
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`
            this.fragmentShader = `
                precision highp float;
                precision highp int;
                out vec4 out_FragColor;

                void main() {

                    out_FragColor = vec4( 1.0 );

                }`
        }
    }
}
</script>

<style scoped>
#webgl-container {
    width: 100%;
    height: 100%;
}
</style>
