<template>
    <div>
        <div id="panel">
			<div id="header">
				<h1><a href="https://threejs.org">three.js</a></h1>
				<div id="sections">
					<a href="../docs/index.html#manual/introduction/Creating-a-scene">docs</a>
					<span class="selected">examples</span>
				</div>
				<div id="expandButton"></div>
			</div>
			<div id="panelScrim"></div>
			<div id="contentWrapper">
				<div id="inputWrapper">
					<input placeholder="" type="text" id="filterInput" autocorrect="off" autocapitalize="off" spellcheck="false" />
					<div id="exitSearchButton"></div>
				</div>
				<div id="content">
					<img id="previewsToggler" src="@/assets/images/thumbnails.svg" width="20" height="20" />
				</div>
			</div>
		</div>
		<iframe id="viewer" name="viewer" allowfullscreen allowvr onmousewheel=""></iframe>
		<a id="button" target="_blank"><img src="@/assets/files/ic_code_black_24dp.svg"></a>
    </div>
</template>

<script>
export default {
    data() {
        return {
            panel: null,
		    content: null,
		    viewer: document.getElementById( 'viewer' ),
		    filterInput: document.getElementById( 'filterInput' ),
		    exitSearchButton: document.getElementById( 'exitSearchButton' ),
		    expandButton: document.getElementById( 'expandButton' ),
		    viewSrcButton: document.getElementById( 'button' ),
		    panelScrim: document.getElementById( 'panelScrim' ),
		    previewsToggler: document.getElementById( 'previewsToggler' ),
		    links: {},
		    validRedirects: new Map(),
		    container: document.createElement( 'div' ),
		    selected: null,
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.panel = document.getElementById( 'panel' )
            this.container = document.getElementById( 'content' )
        })
    }
}
</script>


<style scoped src="@/assets/files/main.css"></style>
<style scoped>

</style>
