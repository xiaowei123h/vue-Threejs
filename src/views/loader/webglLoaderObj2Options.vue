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
import { TrackballControls } from "@/components/jsm/controls/TrackballControls.js"
import { VertexNormalsHelper } from "@/components/jsm/helpers/VertexNormalsHelper.js"
import { MTLLoader } from "@/components/jsm/loaders/MTLLoader.js"
import { MtlObjBridge } from "@/components/jsm/loaders/obj2/bridge/MtlObjBridge.js"
import { OBJLoader2 } from "@/components/jsm/loaders/OBJLoader2.js"
import { OBJLoader2Parallel } from "@/components/jsm/loaders/OBJLoader2Parallel.js"
import { LoadedMeshUserOverride } from "@/components/jsm/loaders/obj2/shared/MeshReceiver.js"
export default {
    data() {
        return {

        }
    }
}
</script>

<style scoped>
.webglLoaderObj2Options-container {
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
