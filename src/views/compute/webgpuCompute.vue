<template>
    <div class="webgpuCompute-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> WebGPU - Compute<br/>(Chrome Canary with flag: --enable-unsafe-webgpu)
		</div>
    </div>
</template>

<script>
import WebGPURenderer from '@/components/jsm/renderers/webgpu/WebGPURenderer.js'
import WebGPU from '@/components/jsm/renderers/webgpu/WebGPU.js'
import WebGPUStorageBuffer from '@/components/jsm/renderers/webgpu/WebGPUStorageBuffer.js'
import WebGPUUniformsGroup from '@/components/jsm/renderers/webgpu/WebGPUUniformsGroup.js'
import { Vector2Uniform } from '@/components/jsm/renderers/webgpu/WebGPUUniform.js'
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
.webgpuCompute-container {
    width: 100%;
}
</style>
