webpackJsonp([16],{H59c:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("QEtz"),r=n("wIBv"),s=n("RmjB"),a={data:function(){return{mesh:null,renderer:null,scene:null,camera:null,gui:null,lightProbe:null,directionalLight:null,API:null}},mounted:function(){this.API={lightProbeIntensity:1,directionalLightIntensity:.2,envMapIntensity:1},this.init()},beforeDestroy:function(){this.gui.destroy()},methods:{init:function(){var e=this;this.renderer=new this.$THREE.WebGLRenderer({antialias:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.setSize(this.$webglInnerWidth,window.innerHeight),document.getElementsByClassName("webglLightprobe-container")[0].appendChild(this.renderer.domElement),this.renderer.toneMapping=this.$THREE.NoToneMapping,this.renderer.outputEncoding=this.$THREE.sRGBEncoding,this.scene=new this.$THREE.Scene,this.camera=new this.$THREE.PerspectiveCamera(40,this.$webglInnerWidth/window.innerHeight,1,1e3),this.camera.position.set(0,0,30);var t=new r.a(this.camera,this.renderer.domElement);t.addEventListener("change",this.render),t.minDistance=10,t.maxDistance=50,t.enablePan=!1,this.lightProbe=new this.$THREE.LightProbe,this.scene.add(this.lightProbe),this.directionalLight=new this.$THREE.DirectionalLight(16777215,this.API.directionalLightIntensity),this.directionalLight.position.set(10,10,10),this.scene.add(this.directionalLight);var n,a,o=[(n="static/textures/cube/pisa/")+"px"+(a=".png"),n+"nx"+a,n+"py"+a,n+"ny"+a,n+"pz"+a,n+"nz"+a];(new this.$THREE.CubeTextureLoader).load(o,function(t){t.encoding=e.$THREE.sRGBEncoding,e.scene.background=t,e.lightProbe.copy(s.a.fromCubeTexture(t));var n=new e.$THREE.SphereBufferGeometry(5,64,32),i=new e.$THREE.MeshStandardMaterial({color:16777215,metalness:0,roughness:0,envMap:t,envMapIntensity:e.API.envMapIntensity});e.mesh=new e.$THREE.Mesh(n,i),e.scene.add(e.mesh),e.render()}),this.gui=new i.a,this.gui.width=300,this.gui.domElement.style.userSelect="none";var h=this.gui.addFolder("Intensity");h.add(this.API,"lightProbeIntensity",0,1,.02).name("light probe").onChange(function(){e.lightProbe.intensity=e.API.lightProbeIntensity,e.render()}),h.add(this.API,"directionalLightIntensity",0,1,.02).name("directional light").onChange(function(){e.directionalLight.intensity=e.API.directionalLightIntensity,e.render()}),h.add(this.API,"envMapIntensity",0,1,.02).name("envMap").onChange(function(){e.mesh.material.envMapIntensity=e.API.envMapIntensity,e.render()}),h.open(),window.addEventListener("resize",this.onWindowResize,!1)},onWindowResize:function(){this.$onWindowResize(this.camera,this.renderer),this.render()},render:function(){this.renderer.render(this.scene,this.camera)}}},o={render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"webglLightprobe-container"},[t("div",{attrs:{id:"info"}},[t("a",{attrs:{href:"https://threejs.org",target:"_blank",rel:"noopener"}},[this._v("three.js")]),this._v(" webgl - light probe\n\t\t")])])}]};var h=n("VU/8")(a,o,!1,function(e){n("Vi6N")},"data-v-42c9ca61",null);t.default=h.exports},RmjB:function(e,t,n){"use strict";n.d(t,"a",function(){return r});var i=n("6+nK"),r={fromCubeTexture:function(e){for(var t,n,r,a=0,o=new i._92,h=new i._92,c=new i.p,d=[0,0,0,0,0,0,0,0,0],l=new i._75,g=l.coefficients,u=0;u<6;u++){var w=e.image[u],f=w.width,b=w.height,m=document.createElement("canvas");m.width=f,m.height=b;var p=m.getContext("2d");p.drawImage(w,0,0,f,b);for(var v=p.getImageData(0,0,f,b),E=v.data,I=v.width,y=2/I,R=0,P=E.length;R<P;R+=4){c.setRGB(E[R]/255,E[R+1]/255,E[R+2]/255),s(c,e.encoding);var _=R/4,L=(_%I+.5)*y-1,M=1-(Math.floor(_/I)+.5)*y;switch(u){case 0:o.set(-1,M,-L);break;case 1:o.set(1,M,L);break;case 2:o.set(-L,1,-M);break;case 3:o.set(-L,-1,M);break;case 4:o.set(-L,M,1);break;case 5:o.set(L,M,-1)}n=o.lengthSq(),a+=r=4/(Math.sqrt(n)*n),h.copy(o).normalize(),i._75.getBasisAt(h,d);for(var T=0;T<9;T++)g[T].x+=d[T]*c.r*r,g[T].y+=d[T]*c.g*r,g[T].z+=d[T]*c.b*r}}t=4*Math.PI/a;for(T=0;T<9;T++)g[T].x*=t,g[T].y*=t,g[T].z*=t;return new i._4(l)},fromCubeRenderTarget:function(e,t){for(var n,r,a,o=0,h=new i._92,c=new i._92,d=new i.p,l=[0,0,0,0,0,0,0,0,0],g=new i._75,u=g.coefficients,w=0;w<6;w++){var f=t.width,b=new Uint8Array(f*f*4);e.readRenderTargetPixels(t,0,0,f,f,b,w);for(var m=2/f,p=0,v=b.length;p<v;p+=4){d.setRGB(b[p]/255,b[p+1]/255,b[p+2]/255),s(d,t.texture.encoding);var E=p/4,I=(E%f+.5)*m-1,y=1-(Math.floor(E/f)+.5)*m;switch(w){case 0:h.set(1,y,-I);break;case 1:h.set(-1,y,I);break;case 2:h.set(I,1,-y);break;case 3:h.set(I,-1,y);break;case 4:h.set(I,y,1);break;case 5:h.set(-I,y,-1)}r=h.lengthSq(),o+=a=4/(Math.sqrt(r)*r),c.copy(h).normalize(),i._75.getBasisAt(c,l);for(var R=0;R<9;R++)u[R].x+=l[R]*d.r*a,u[R].y+=l[R]*d.g*a,u[R].z+=l[R]*d.b*a}}n=4*Math.PI/o;for(R=0;R<9;R++)u[R].x*=n,u[R].y*=n,u[R].z*=n;return new i._4(g)}},s=function(e,t){switch(t){case i._97:e.convertSRGBToLinear();break;case i._10:break;default:console.warn("WARNING: LightProbeGenerator convertColorToLinear() encountered an unsupported encoding.")}return e}},Vi6N:function(e,t){}});
//# sourceMappingURL=16.9d8f1cf11880961ab592.js.map