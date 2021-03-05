<template>
    <div class="webglRaycastTexture-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - raycast texture<br>Left to right: buffer geometry - geometry - indexed buffer geometry
			<fieldset id="controls">
				<legend>Circle</legend>
				<div class="control">
					WrapS : <select id="setwrapS">
						<option value="1001">ClampToEdgeWrapping</option>
						<option value="1000" selected>RepeatWrapping</option>
						<option value="1002">MirroredRepeatWrapping</option>
					</select>
				</div>
				<div class="control">
					WrapT : <select id="setwrapT">
						<option value="1001">ClampToEdgeWrapping</option>
						<option value="1000" selected>RepeatWrapping</option>
						<option value="1002">MirroredRepeatWrapping</option>
					</select>
				</div>
				<div class="control">
					Offset : X <input id="setOffsetU" type="number" value="0" step="0.05" />
					Y <input id="setOffsetV" type="number" value="0" step="0.05" /><br />
				</div>
				<div class="control">
					Repeat : X <input id="setRepeatU" type="number" value="1" step="0.1" />
					Y <input id="setRepeatV" type="number" value="1" step="0.1" />
				</div>
				<div class="control">
					Rotation : <input id="setRotation" type="number" value="0" step="0.1" />
				</div>
			</fieldset>
		</div>
    </div>
</template>

<script>
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
.webglRaycastTexture-container {
    width: 100%;
    background-color: #fff;
}
#info {
    color: #444;
}

#info a {
    color: #08f;
}

#controls {
    position: absolute;
    text-align:left;
    top: 60px;
    left: 5px;
    padding: 5px;
}

.control { margin-bottom: 3px; }

input { width: 50px; }
</style>
