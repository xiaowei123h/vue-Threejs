webpackJsonp([84],{IPvw:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s=i("QEtz"),n=i("wIBv"),a=i("6+nK"),r=i("p8Aj"),o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},h=function(e,t){this.manager=void 0!==e?e:a.C,this.nodes={},this.materials={},this.passes={},this.names={},this.library=t||{}};Object.assign(h.prototype,{load:function(e,t,i,s){var n=this,r=new a.L(n.manager);return r.setPath(n.path),r.load(e,function(e){t(n.parse(JSON.parse(e)))},i,s),this},setPath:function(e){return this.path=e,this},getObjectByName:function(e){return this.names[e]},getObjectById:function(e){return this.library[e]||this.nodes[e]||this.materials[e]||this.passes[e]||this.names[e]},getNode:function(e){var t=this.getObjectById(e);return t||console.warn('Node "'+e+'" not found.'),t},resolve:function(e){switch(void 0===e?"undefined":o(e)){case"boolean":case"number":return e;case"string":return/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/i.test(e)||this.library[e]?this.getNode(e):e;default:if(Array.isArray(e))for(var t=0;t<e.length;t++)e[t]=this.resolve(e[t]);else for(var i in e)"uuid"!==i&&(e[i]=this.resolve(e[i]))}return e},declare:function(e){var t,i,s;for(t in e.nodes)i=e.nodes[t],s=new r[i.nodeType+"Node"],i.name&&(s.name=i.name,this.names[s.name]=s),this.nodes[t]=s;for(t in e.materials)i=e.materials[t],s=new r[i.type],i.name&&(s.name=i.name,this.names[s.name]=s),this.materials[t]=s;for(t in e.passes)i=e.passes[t],s=new r[i.type],i.name&&(s.name=i.name,this.names[s.name]=s),this.passes[t]=s;return e.material&&(this.material=this.materials[e.material]),e.pass&&(this.pass=this.passes[e.pass]),e},parse:function(e){var t;for(t in(e=this.resolve(this.declare(e))).nodes)this.nodes[t].copy(e.nodes[t]);for(t in e.materials)this.materials[t].copy(e.materials[t]);for(t in e.passes)this.passes[t].copy(e.passes[t]);return this.material||this.pass||this}});var l=i("WvuV"),c=i("cPA5"),d=i("l/b+"),u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},m={data:function(){return{container:null,renderer:null,scene:null,camera:null,clock:null,frame:null,teapot:null,mesh:null,cloud:null,controls:null,gui:null,param:{load:"caustic"}}},mounted:function(){this.container=document.getElementById("container"),this.clock=new this.$THREE.Clock,this.fov=50,this.frame=new c.a,window.addEventListener("load",this.init)},beforeDestroy:function(){this.gui.destroy()},methods:{init:function(){this.renderer=new this.$THREE.WebGLRenderer({antialias:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.setSize(window.innerWidth,window.innerHeight),this.container.appendChild(this.renderer.domElement),this.scene=new this.$THREE.Scene,this.camera=new this.$THREE.PerspectiveCamera(this.fov,window.innerWidth/window.innerHeight,1,1e3),this.camera.position.x=50,this.camera.position.z=-50,this.camera.position.y=30,this.camera.target=new this.$THREE.Vector3,this.cloud=(new this.$THREE.TextureLoader).load("static/textures/lava/cloud.png"),this.cloud.wrapS=this.cloud.wrapT=this.$THREE.RepeatWrapping,this.controls=new n.a(this.camera,this.renderer.domElement),this.controls.minDistance=50,this.controls.maxDistance=200,this.scene.add(new this.$THREE.AmbientLight(4605510));var e=new this.$THREE.DirectionalLight(16768460,1);e.position.set(1,.75,.5),this.scene.add(e);var t=new this.$THREE.DirectionalLight(13421823,1);t.position.set(-1,.75,-.5),this.scene.add(t),this.teapot=new l.a(15,18),this.mesh=new this.$THREE.Mesh(this.teapot),this.scene.add(this.mesh),window.addEventListener("resize",this.onWindowResize,!1),this.updateMaterial(),this.onWindowResize(),this.animate()},clearGui:function(){var e=this;this.gui&&this.gui.destroy(),this.gui=new s.a,this.gui.add(this.param,"load",{caustic:"caustic",displace:"displace",wave:"wave",xray:"xray"}).onFinishChange(function(){e.updateMaterial()}),this.gui.open()},addGui:function(e,t,i,s,n,a){var r=this;return this.param[e]=t,s?this.gui.addColor(this.param,e).onChange(function(){i(r.param[e])}):"object"==(void 0===t?"undefined":u(t))?this.gui.add(this.param,e,t).onChange(function(){i(r.param[e])}):this.gui.add(this.param,e,n,a).onChange(function(){i(r.param[e])})},updateMaterial:function(){var e=this;this.mesh.material&&this.mesh.material.dispose(),this.clearGui();var t="static/nodes/"+this.param.load+".json",i={cloud:this.cloud},s=new h(void 0,i).load(t,function(){var t=s.getObjectByName("time");t&&(t.timeScale=!0,e.addGui("timeScale",t.scale,function(e){t.scale=e},!1,-2,2)),e.mesh.material=s.material})},onWindowResize:function(){this.$onWindowResize(this.camera,this.renderer)},animate:function(){var e=this.clock.getDelta();this.mesh.material instanceof d.a&&this.frame.update(e).updateNode(this.mesh.material),this.renderer.render(this.scene,this.camera),requestAnimationFrame(this.animate)}}},p={render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"webglLoaderNodes-container"},[t("div",{attrs:{id:"container"}}),this._v(" "),t("div",{attrs:{id:"info"}},[t("a",{attrs:{href:"https://threejs.org",target:"_blank",rel:"noopener"}},[this._v("three.js")]),this._v(" - Node-Based Material"),t("br"),this._v("\n\t\t\tSerialized using "),t("a",{attrs:{href:"webgl_materials_nodes.html"}},[this._v("webgl_materials_nodes.html")])])])}]};var f=i("VU/8")(m,p,!1,function(e){i("kp19")},"data-v-62076acc",null);t.default=f.exports},kp19:function(e,t){}});
//# sourceMappingURL=84.56846536d720e1e85219.js.map