webpackJsonp([119],{OQZB:function(e,t){},i9sc:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=r("QEtz"),a=r("wIBv"),i=r("zCdm"),o={data:function(){return{vertexShaderRaw:null,fragmentShaderRaw:null,gui:null,camera:null,scene:null,renderer:null,ninjaMeshRaw:null,curvatureAttribute:null,bufferGeo:null}},mounted:function(){this.vertexShaderRaw="\n            attribute float curvature;\n            varying float vCurvature;\n            void main() {\n                vec3 p = position;\n                vec4 modelViewPosition = modelViewMatrix * vec4(p , 1.0);\n                gl_Position = projectionMatrix * modelViewPosition;\n                vCurvature = curvature;\n            }",this.fragmentShaderRaw="\n            varying vec3 vViewPosition;\n            varying float vCurvature;\n            void main() {\n                    gl_FragColor = vec4(vCurvature * 2.0, 0.0, 0.0, 0.0);\n            }",this.init(),this.animate()},beforeDestroy:function(){this.gui.destroy()},methods:{average:function(e){var t=0,r=0;return Object.keys(e).forEach(function(n){t+=e[n],r++}),t/r},clamp:function(e,t,r){return Math.max(t,Math.min(e,r))},filterConcave:function(e){for(var t=0;t<e.length;t++)e[t]=Math.abs(this.clamp(e[t],-1,0))},filterConvex:function(e){for(var t=0;t<e.length;t++)e[t]=this.clamp(e[t],0,1)},filterBoth:function(e){for(var t=0;t<e.length;t++)e[t]=Math.abs(e[t])},init:function(){var e=this;this.scene=new this.$THREE.Scene,this.camera=new this.$THREE.PerspectiveCamera(75,this.$webglInnerWidth/window.innerHeight,.1,1e3),this.camera.position.x=-23,this.camera.position.y=2,this.camera.position.z=24,this.renderer=new this.$THREE.WebGLRenderer,this.renderer.setSize(this.$webglInnerWidth,window.innerHeight),this.renderer.autoClear=!1,document.getElementsByClassName("webglMaterialsCurvature-container")[0].appendChild(this.renderer.domElement);var t=new a.a(this.camera,this.renderer.domElement);t.minDistance=20,t.maxDistance=100,(new i.a).load("static/models/obj/ninja/ninjaHead_Low.obj",function(t){t.traverse(function(t){if(t.isMesh){e.bufferGeo=t.geometry,e.bufferGeo.center();for(var r={},n=0;n<e.bufferGeo.attributes.position.count;n+=3){var a=e.bufferGeo.attributes.position.array,i=e.bufferGeo.attributes.normal.array,o=new e.$THREE.Vector3(a[3*n],a[3*n+1],a[3*n+2]),u=new e.$THREE.Vector3(a[3*(n+1)],a[3*(n+1)+1],a[3*(n+1)+2]),s=new e.$THREE.Vector3(a[3*(n+2)],a[3*(n+2)+1],a[3*(n+2)+2]),c=new e.$THREE.Vector3(i[3*n],i[3*n+1],i[3*n+2]).normalize(),f=new e.$THREE.Vector3(i[3*(n+1)],i[3*(n+1)+1],i[3*(n+1)+2]).normalize(),v=new e.$THREE.Vector3(i[3*(n+2)],i[3*(n+2)+1],i[3*(n+2)+2]).normalize(),h=o.toArray().toString(),l=u.toArray().toString(),d=s.toArray().toString(),b=(new e.$THREE.Vector3).subVectors(u,o),m=(new e.$THREE.Vector3).subVectors(u,s),w=(new e.$THREE.Vector3).subVectors(s,o),E=f.dot(b.normalize()),g=f.dot(m.normalize()),y=v.dot(w.normalize()),p=-c.dot(b.normalize()),R=-v.dot(m.normalize()),C=-c.dot(w.normalize());void 0===r[h]&&(r[h]={}),void 0===r[l]&&(r[l]={}),void 0===r[d]&&(r[d]={}),r[h][l]=p,r[h][d]=C,r[l][h]=E,r[l][d]=g,r[d][h]=y,r[d][l]=R}var $={},A=10,H=0;Object.keys(r).forEach(function(t){$[t]=e.average(r[t])});var j=Object.create($);Object.keys(r).forEach(function(e){var t=0,n=0;Object.keys(r[e]).forEach(function(e){n+=j[e],t++}),j[e]=n/t}),$=j,Object.keys($).forEach(function(e){var t=Math.abs($[e]);t<A&&(A=t),t>H&&(H=t)});var z=H-A;Object.keys($).forEach(function(e){var t=Math.abs($[e]);$[e]<0?$[e]=(A-t)/z:$[e]=(t-A)/z}),e.curvatureAttribute=new Float32Array(e.bufferGeo.attributes.position.count);for(n=0;n<e.bufferGeo.attributes.position.count;n++){a=e.bufferGeo.attributes.position.array;var G=new e.$THREE.Vector3(a[3*n],a[3*n+1],a[3*n+2]).toArray().toString();e.curvatureAttribute[n]=$[G]}e.bufferGeo.setAttribute("curvature",new e.$THREE.BufferAttribute(e.curvatureAttribute,1));var V=new Float32Array(e.curvatureAttribute);e.filterBoth(V);var M=new e.$THREE.ShaderMaterial({vertexShader:e.vertexShaderRaw,fragmentShader:e.fragmentShaderRaw});e.ninjaMeshRaw=new e.$THREE.Mesh(e.bufferGeo,M)}}),e.scene.add(e.ninjaMeshRaw)});var r={filterConvex:function(){var t=new Float32Array(e.curvatureAttribute);e.filterConvex(t),e.bufferGeo.attributes.curvature.array=t,e.bufferGeo.attributes.curvature.needsUpdate=!0},filterConcave:function(){var t=new Float32Array(e.curvatureAttribute);e.filterConcave(t),e.bufferGeo.attributes.curvature.array=t,e.bufferGeo.attributes.curvature.needsUpdate=!0},filterBoth:function(){var t=new Float32Array(e.curvatureAttribute);e.filterBoth(t),e.bufferGeo.attributes.curvature.array=t,e.bufferGeo.attributes.curvature.needsUpdate=!0}};this.gui=new n.a;var o=this.gui.addFolder("Topology");o.add(r,"filterConvex"),o.add(r,"filterConcave"),o.add(r,"filterBoth"),o.open(),this.onWindowResize(),window.addEventListener("resize",this.onWindowResize,!1)},onWindowResize:function(){this.$onWindowResize(this.camera,this.renderer)},animate:function(){requestAnimationFrame(this.animate),this.render()},render:function(){this.renderer.render(this.scene,this.camera)}}},u={render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"webglMaterialsCurvature-container"},[t("div",{attrs:{id:"container"}}),this._v(" "),t("div",{attrs:{id:"info"}},[t("a",{attrs:{href:"https://threejs.org",target:"_blank",rel:"noopener"}},[this._v("three.js")]),this._v(" - curvature estimation of a geometry"),t("br"),this._v("\n\t\t\tby "),t("a",{attrs:{href:"http://codercat.club",target:"_blank",rel:"noopener"}},[this._v("CoderCat")])])])}]};var s=r("VU/8")(o,u,!1,function(e){r("OQZB")},"data-v-2f3d6530",null);t.default=s.exports}});
//# sourceMappingURL=119.011841717765a9618ea1.js.map