<template>
    <div class="webglWorkerOffscreencanvas-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> - offscreen canvas (<a href="https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas" target="_blank" rel="noopener noreferrer">about</a>)<br/>
			<p id="message">Your browser does not support OffscreenCanvas. Check the browser support <a href="https://caniuse.com/#feat=offscreencanvas" target="_blank" rel="noopener noreferrer">here</a></p>
		</div>

		<div id="container">
			<canvas id="canvas1" style="width: 50%; height: 100%"></canvas><canvas id="canvas2" style="width: 50%; height: 100%"></canvas>
		</div>
		<div id="ui">
			<button id="button">START JANK</button><br/>
			<span id="result"></span>
		</div>
    </div>
</template>

<script>
import initJank from '@/components/jsm/offscreen/jank.js'
import init from '@/components/jsm/offscreen/scene.js'
export default {
    data() {
        return {
            // onscreen
			canvas1: null,
			canvas2: null,
			width: null,
			height: null,
			pixelRatio: null,
        }
    },
    mounted() {
        this.canvas1 = document.getElementById('canvas1')
        this.canvas2 = document.getElementById('canvas2')
        this.width = canvas1.clientWidth
        this.height = canvas1.clientHeight
        this.pixelRatio = window.devicePixelRatio
        init(this.canvas1, this.width, this.height, this.pixelRatio, './')
        initJank()
        this.offscreen()
    },
    methods: {
        offscreen() {
            if ('transferControlToOffscreen' in this.canvas2) {
				const offscreen = this.canvas2.transferControlToOffscreen()
                const worker = new Worker('components/jsm/offscreen/offscreen.js', { type: 'module' })
				worker.postMessage({
					drawingSurface: offscreen,
					width: this.canvas2.clientWidth,
					height: this.canvas2.clientHeight,
					pixelRatio: window.devicePixelRatio,
					path: './'
                }, [ offscreen ])
			} else {
				document.getElementById('message').style.display = 'block'
			}
        }
    },
}
</script>

<style scoped>
.webglWorkerOffscreencanvas-container {
    position: relative;
    width: 100%;
}
</style>

<style>
.webglWorkerOffscreencanvas-container #info {
    background-color: #fff;
    color: #444;
}
.webglWorkerOffscreencanvas-container #info a {
    color: #08f;
}
.webglWorkerOffscreencanvas-container canvas {
    display: inline-block;
}
.webglWorkerOffscreencanvas-container #message {
    color: #ff0000;
    display: none;
}
.webglWorkerOffscreencanvas-container #message > a {
    color: #ff0000;
}
.webglWorkerOffscreencanvas-container #container {
    position: absolute;
    top: 50px;
    bottom: 70px;
    width: 100%;
}
.webglWorkerOffscreencanvas-container #ui {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
}
.webglWorkerOffscreencanvas-container #button {
    border: 0;
    padding: 4px 6px;
    background: #dddddd;
    outline: none;
}
</style>
