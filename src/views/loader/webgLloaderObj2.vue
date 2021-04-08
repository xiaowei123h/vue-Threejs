<template>
    <div class="webgLloaderObj2-container">
        <div id="glFullscreen">
			<canvas id="example"></canvas>
		</div>
		<div id="dat">

		</div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - OBJLoader2 direct loader test
			<div id="feedback"></div>
		</div>
    </div>
</template>

<script>
import { OBJLoader2Example } from '@/utils/webglLoaderObj2.js'
export default {
    data() {
        return {
            app: null
        }
    },
    mounted() {
        this.app = new OBJLoader2Example(document.getElementById('example'), this.$THREE)
        window.addEventListener('resize', this.resizeWindow, false)
        console.log('Starting initialisation phase...')
        this.app.initGL()
        this.app.resizeDisplayGL()
        this.app.initContent()
        this.render()
    },
    methods: {
        resizeWindow() {
            this.app.resizeDisplayGL()
        },
        render() {
            requestAnimationFrame(this.render)
            this.app.render()
        }
    },
}
</script>

<style scoped>
.webgLloaderObj2-container{
    position: relative;
    width: 100%;
}
#glFullscreen {
    width: 100%;
    height: 100vh;
    min-width: 640px;
    min-height: 360px;
    position: relative;
    overflow: hidden;
    z-index: 0;
}
#example {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #000000;
}
#feedback {
    color: darkorange;
}
#dat {
    user-select: none;
    position: absolute;
    left: 0;
    top: 0;
    z-Index: 200;
}
</style>
