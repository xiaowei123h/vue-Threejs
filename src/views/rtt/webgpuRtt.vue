<template>
    <div class="webgpuRtt-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> WebGPU - RTT<br/>(Chrome Canary with flag: --enable-unsafe-webgpu)
		</div>
    </div>
</template>

<script>
import WebGPURenderer from '@/components/jsm/renderers/webgpu/WebGPURenderer.js'
import WebGPUTextureRenderer from '@/components/jsm/renderers/webgpu/WebGPUTextureRenderer.js'
import WebGPU from '@/components/jsm/renderers/webgpu/WebGPU.js'
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
.webgpuRtt-container {
    position: relative;
    width: 100%;
}
</style>
