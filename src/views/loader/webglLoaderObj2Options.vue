<template>
    <div class="webglLoaderObj2Options-container">
        <div id="glFullscreen">
			<canvas id="example"></canvas>
		</div>
		<div id="dat" class="dg ac"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - OBJLoader2 usage options<br>Use module workers with Chromium based browser (80+)
			<div id="feedback"></div>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { WWOBJLoader2Example } from '@/utils/webglLoaderObj2Options.js'
export default {
    data() {
        return {
            app: null,
            wwObjLoader2Control: null,
            menuDiv: null,
            gui: null,
            folderRenderingOptions: null,
            controlFlat: null,
            controlDouble: null,
            folderObjLoader2ParallelOptions: null,
            controlJsmWorker: null,
            folderExecution: null,
            handleExecuteLoading: null,
        }
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    mounted() {
        this.app = new WWOBJLoader2Example(document.getElementById('example'), this.$THREE)
        var that = this
        this.wwObjLoader2Control = {
            flatShading: this.app.flatShading,
            doubleSide: this.app.doubleSide,
            useJsmWorker: this.app.useJsmWorker,
            blockEvent: function (event) {
                event.stopPropagation()
            },
            disableElement: function (elementHandle) {
                elementHandle.domElement.addEventListener('click', this.blockEvent, true)
                elementHandle.domElement.parentElement.style.pointerEvents = 'none'
                elementHandle.domElement.parentElement.style.opacity = 0.5
            },
            executeLoading: function () {
                that.app.executeLoading()
                this.disableElement(that.handleExecuteLoading)
            },
        }
        this.menuDiv = document.getElementById('dat')
        this.gui = new GUI({
            autoPlace: false,
            width: 320
        })
        this.menuDiv.appendChild(this.gui.domElement)
        this.folderRenderingOptions = this.gui.addFolder('Rendering Options')
        this.controlFlat = this.folderRenderingOptions.add(this.wwObjLoader2Control, 'flatShading').name('Flat Shading')
        this.controlFlat.onChange((value) => {
            console.log('Setting flatShading to: ' + value)
            this.app.alterShading()
        })
        this.controlDouble = this.folderRenderingOptions.add(this.wwObjLoader2Control, 'doubleSide').name('Double Side Materials')
        this.controlDouble.onChange((value) => {
            console.log('Setting doubleSide to: ' + value)
            this.app.alterDouble()
        })
        this.folderObjLoader2ParallelOptions = this.gui.addFolder('OBJLoader2Parallel Options')
        this.controlJsmWorker = this.folderObjLoader2ParallelOptions.add(this.wwObjLoader2Control, 'useJsmWorker').name('Use Module Workers')
        this.controlJsmWorker.onChange((value) => {
            console.log('Setting useJsmWorker to: ' + value)
            this.app.useJsmWorker = value
        })
        this.folderExecution = this.gui.addFolder('Execution')
        this.handleExecuteLoading = this.folderExecution.add(this.wwObjLoader2Control, 'executeLoading').name('Run')
        this.handleExecuteLoading.domElement.id = 'startButton'
        this.folderRenderingOptions.open()
        this.folderObjLoader2ParallelOptions.open()
        this.folderExecution.open()
        window.addEventListener('resize', this.resizeWindow, false)
        console.log('Starting initialisation phase...')
        this.app.initGL()
        this.app.resizeDisplayGL()
        // kick render loop
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
.webglLoaderObj2Options-container {
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
