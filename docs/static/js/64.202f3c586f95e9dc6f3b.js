webpackJsonp([64],{"0lrR":function(e,t){},"LZ/k":function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=i("QEtz"),r=i("wIBv"),s={data:function(){return{container:null,camera:null,scene:null,renderer:null,mesh:null,gui:null}},mounted:function(){this.init()},beforeDestroy:function(){this.gui.destroy()},methods:{init:function(){var e=this;this.scene=new this.$THREE.Scene,this.scene.background=new this.$THREE.Color(9419988),this.scene.add(new this.$THREE.AmbientLight(9419988,.4)),this.container=document.getElementById("container"),this.camera=new this.$THREE.PerspectiveCamera(45,this.$webglInnerWidth/window.innerHeight,1,20),this.camera.position.z=10,this.scene.add(this.camera);var t=new this.$THREE.PointLight(16777215,1);this.camera.add(t);var i=this.createGeometry(),n=new this.$THREE.MeshPhongMaterial({color:16711680,flatShading:!0,morphTargets:!0});this.mesh=new this.$THREE.Mesh(i,n),this.scene.add(this.mesh),this.initGUI(),this.renderer=new this.$THREE.WebGLRenderer({antialias:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.setSize(this.$webglInnerWidth,window.innerHeight),this.renderer.setAnimationLoop(function(){e.renderer.render(e.scene,e.camera)}),this.container.appendChild(this.renderer.domElement),new r.a(this.camera,this.renderer.domElement).enableZoom=!1,window.addEventListener("resize",this.onWindowResize,!1)},onWindowResize:function(){this.$onWindowResize(this.camera,this.renderer)},initGUI:function(){var e=this,t={Spherify:0,Twist:0};this.gui=new n.a;var i=this.gui.addFolder("Morph Targets");i.add(t,"Spherify",0,1).step(.01).onChange(function(t){e.mesh.morphTargetInfluences[0]=t}),i.add(t,"Twist",0,1).step(.01).onChange(function(t){e.mesh.morphTargetInfluences[1]=t}),i.open()},createGeometry:function(){var e=new this.$THREE.BoxBufferGeometry(2,2,2,32,32,32);e.morphAttributes.position=[];for(var t=e.attributes.position.array,i=[],n=[],r=new this.$THREE.Vector3(1,0,0).normalize(),s=new this.$THREE.Vector3,h=0;h<t.length;h+=3){var a=t[h],o=t[h+1],d=t[h+2];i.push(a*Math.sqrt(1-o*o/2-d*d/2+o*o*d*d/3),o*Math.sqrt(1-d*d/2-a*a/2+d*d*a*a/3),d*Math.sqrt(1-a*a/2-o*o/2+a*a*o*o/3)),s.set(2*a,o,d),s.applyAxisAngle(r,Math.PI*a/2).toArray(n,n.length)}return e.morphAttributes.position[0]=new this.$THREE.Float32BufferAttribute(i,3),e.morphAttributes.position[1]=new this.$THREE.Float32BufferAttribute(n,3),e}}},h={render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"webglBuffergeometryMorphtargets-container"},[t("div",{attrs:{id:"container"}}),this._v(" "),t("div",{attrs:{id:"info"}},[t("a",{attrs:{href:"https://threejs.org",target:"_blank",rel:"noopener"}},[this._v("three.js")]),this._v(" - buffergeometry - morph targets"),t("br"),this._v("\n\t\t\tby "),t("a",{attrs:{href:"https://discoverthreejs.com/",target:"_blank",rel:"noopener"}},[this._v("Discover three.js")])])])}]};var a=i("VU/8")(s,h,!1,function(e){i("0lrR")},"data-v-7538fe59",null);t.default=a.exports}});
//# sourceMappingURL=64.202f3c586f95e9dc6f3b.js.map