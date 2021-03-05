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
            
        }
    },
    mounted() {
        
    },
    methods: {
        
    },
}
</script>

<style scoped>
.webglWorkerOffscreencanvas-container {
    width: 100%;
}
#info {
    background-color: #fff;
    color: #444;
}

#info a {
    color: #08f;
}

canvas {
    display: inline-block;
}

#message {
    color: #ff0000;
    display: none;
}

#message > a {
    color: #ff0000;
}

#container {
    position: absolute;
    top: 50px;
    bottom: 70px;
    width: 100%;
}

#ui {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
}

#button {
    border: 0;
    padding: 4px 6px;
    background: #dddddd;
    outline: none;
}
</style>
