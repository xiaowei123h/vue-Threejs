webpackJsonp([10],{M2Ih:function(t,e,i){"use strict";i.d(e,"a",function(){return r});var n=i("6+nK"),r=function(t,e,i){this.variables=[],this.currentTextureIndex=0;var r=n.N,a=new n._65,o=new n.l;o.position.z=1;var s={passThruTexture:{value:null}},l=d("uniform sampler2D passThruTexture;\n\nvoid main() {\n\n\tvec2 uv = gl_FragCoord.xy / resolution.xy;\n\n\tgl_FragColor = texture2D( passThruTexture, uv );\n\n}\n",s),u=new n._22(new n._43(2,2),l);function h(i){i.defines.resolution="vec2( "+t.toFixed(1)+", "+e.toFixed(1)+" )"}function d(t,e){e=e||{};var i=new n._67({uniforms:e,vertexShader:"void main()\t{\n\n\tgl_Position = vec4( position, 1.0 );\n\n}\n",fragmentShader:t});return h(i),i}a.add(u),this.setDataType=function(t){return r=t,this},this.addVariable=function(t,e,i){var r={name:t,initialValueTexture:i,material:this.createShaderMaterial(e),dependencies:null,renderTargets:[],wrapS:null,wrapT:null,minFilter:n._29,magFilter:n._29};return this.variables.push(r),r},this.setVariableDependencies=function(t,e){t.dependencies=e},this.init=function(){if(!1===i.capabilities.isWebGL2&&!1===i.extensions.has("OES_texture_float"))return"No OES_texture_float support for float textures.";if(0===i.capabilities.maxVertexTextures)return"No support for vertex shader textures.";for(var n=0;n<this.variables.length;n++){var r=this.variables[n];r.renderTargets[0]=this.createRenderTarget(t,e,r.wrapS,r.wrapT,r.minFilter,r.magFilter),r.renderTargets[1]=this.createRenderTarget(t,e,r.wrapS,r.wrapT,r.minFilter,r.magFilter),this.renderTexture(r.initialValueTexture,r.renderTargets[0]),this.renderTexture(r.initialValueTexture,r.renderTargets[1]);var a=r.material,o=a.uniforms;if(null!==r.dependencies)for(var s=0;s<r.dependencies.length;s++){var l=r.dependencies[s];if(l.name!==r.name){for(var u=!1,h=0;h<this.variables.length;h++)if(l.name===this.variables[h].name){u=!0;break}if(!u)return"Variable dependency not found. Variable="+r.name+", dependency="+l.name}o[l.name]={value:null},a.fragmentShader="\nuniform sampler2D "+l.name+";\n"+a.fragmentShader}}return this.currentTextureIndex=0,null},this.compute=function(){for(var t=this.currentTextureIndex,e=0===this.currentTextureIndex?1:0,i=0,n=this.variables.length;i<n;i++){var r=this.variables[i];if(null!==r.dependencies)for(var a=r.material.uniforms,o=0,s=r.dependencies.length;o<s;o++){var l=r.dependencies[o];a[l.name].value=l.renderTargets[t].texture}this.doRenderTarget(r.material,r.renderTargets[e])}this.currentTextureIndex=e},this.getCurrentRenderTarget=function(t){return t.renderTargets[this.currentTextureIndex]},this.getAlternateRenderTarget=function(t){return t.renderTargets[0===this.currentTextureIndex?1:0]},this.addResolutionDefine=h,this.createShaderMaterial=d,this.createRenderTarget=function(i,a,o,s,l,u){return i=i||t,a=a||e,o=o||n.n,s=s||n.n,l=l||n._29,u=u||n._29,new n._95(i,a,{wrapS:o,wrapT:s,minFilter:l,magFilter:u,format:n._50,type:r,depthBuffer:!1})},this.createTexture=function(){var i=new Float32Array(t*e*4);return new n.z(i,t,e,n._50,n.N)},this.renderTexture=function(t,e){s.passThruTexture.value=t,this.doRenderTarget(l,e),s.passThruTexture.value=null},this.doRenderTarget=function(t,e){var n=i.getRenderTarget();u.material=t,i.setRenderTarget(e),i.render(a,o),u.material=l,i.setRenderTarget(n)}}},mAUU:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=i("QEtz"),r=i("qxm1"),a=i("M2Ih"),o={data:function(){return{fragmentShaderPosition:null,fragmentShaderVelocity:null,WIDTH:64,BIRDS:null,BirdGeometry:null,textureAnimation:null,durationAnimation:null,birdMesh:null,materialShader:null,vertexPerBird:null,gltfs:null,colors:null,sizes:null,selectModel:null,container:null,stats:null,camera:null,scene:null,renderer:null,mouseX:0,mouseY:0,windowHalfX:null,windowHalfY:null,BOUNDS:800,BOUNDS_HALF:null,last:null,gpuCompute:null,velocityVariable:null,positionVariable:null,positionUniforms:null,velocityUniforms:null,gui:null}},mounted:function(){var t=this;this.fragmentShaderPosition="\n            uniform float time;\n\t\t\tuniform float delta;\n\t\t\tvoid main()\t{\n\t\t\t\tvec2 uv = gl_FragCoord.xy / resolution.xy;\n\t\t\t\tvec4 tmpPos = texture2D(texturePosition, uv);\n\t\t\t\tvec3 position = tmpPos.xyz;\n\t\t\t\tvec3 velocity = texture2D(textureVelocity, uv).xyz;\n\t\t\t\tfloat phase = tmpPos.w;\n\t\t\t\tphase = mod((phase + delta +\n\t\t\t\t\tlength(velocity.xz) * delta * 3. +\n\t\t\t\t\tmax(velocity.y, 0.0) * delta * 6.), 62.83);\n\t\t\t\tgl_FragColor = vec4(position + velocity * delta * 15. , phase);\n            }",this.fragmentShaderVelocity="\n            uniform float time;\n\t\t\tuniform float testing;\n\t\t\tuniform float delta; // about 0.016\n\t\t\tuniform float separationDistance; // 20\n\t\t\tuniform float alignmentDistance; // 40\n\t\t\tuniform float cohesionDistance; //\n\t\t\tuniform float freedomFactor;\n\t\t\tuniform vec3 predator;\n\t\t\tconst float width = resolution.x;\n\t\t\tconst float height = resolution.y;\n\t\t\tconst float PI = 3.141592653589793;\n\t\t\tconst float PI_2 = PI * 2.0;\n\t\t\t// const float VISION = PI * 0.55;\n\t\t\tfloat zoneRadius = 40.0;\n\t\t\tfloat zoneRadiusSquared = 1600.0;\n\t\t\tfloat separationThresh = 0.45;\n\t\t\tfloat alignmentThresh = 0.65;\n\t\t\tconst float UPPER_BOUNDS = BOUNDS;\n\t\t\tconst float LOWER_BOUNDS = -UPPER_BOUNDS;\n\t\t\tconst float SPEED_LIMIT = 9.0;\n\t\t\tfloat rand(vec2 co){\n\t\t\t\treturn fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);\n\t\t\t}\n\t\t\tvoid main() {\n\t\t\t\tzoneRadius = separationDistance + alignmentDistance + cohesionDistance;\n\t\t\t\tseparationThresh = separationDistance / zoneRadius;\n\t\t\t\talignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;\n\t\t\t\tzoneRadiusSquared = zoneRadius * zoneRadius;\n\t\t\t\tvec2 uv = gl_FragCoord.xy / resolution.xy;\n\t\t\t\tvec3 birdPosition, birdVelocity;\n\t\t\t\tvec3 selfPosition = texture2D(texturePosition, uv).xyz;\n\t\t\t\tvec3 selfVelocity = texture2D(textureVelocity, uv).xyz;\n\t\t\t\tfloat dist;\n\t\t\t\tvec3 dir; // direction\n\t\t\t\tfloat distSquared;\n\t\t\t\tfloat separationSquared = separationDistance * separationDistance;\n\t\t\t\tfloat cohesionSquared = cohesionDistance * cohesionDistance;\n\t\t\t\tfloat f;\n\t\t\t\tfloat percent;\n\t\t\t\tvec3 velocity = selfVelocity;\n\t\t\t\tfloat limit = SPEED_LIMIT;\n\t\t\t\tdir = predator * UPPER_BOUNDS - selfPosition;\n\t\t\t\tdir.z = 0.;\n\t\t\t\t// dir.z *= 0.6;\n\t\t\t\tdist = length(dir);\n\t\t\t\tdistSquared = dist * dist;\n\t\t\t\tfloat preyRadius = 150.0;\n\t\t\t\tfloat preyRadiusSq = preyRadius * preyRadius;\n\t\t\t\t// move birds away from predator\n\t\t\t\tif (dist < preyRadius) {\n\t\t\t\t\tf = (distSquared / preyRadiusSq - 1.0) * delta * 100.;\n\t\t\t\t\tvelocity += normalize(dir) * f;\n\t\t\t\t\tlimit += 5.0;\n\t\t\t\t}\n\t\t\t\t// if (testing == 0.0) {}\n\t\t\t\t// if (rand(uv + time) < freedomFactor) {}\n\t\t\t\t// Attract flocks to the center\n\t\t\t\tvec3 central = vec3(0., 0., 0.);\n\t\t\t\tdir = selfPosition - central;\n\t\t\t\tdist = length(dir);\n\t\t\t\tdir.y *= 2.5;\n\t\t\t\tvelocity -= normalize(dir) * delta * 5.;\n\t\t\t\tfor (float y = 0.0; y < height; y++) {\n\t\t\t\t\tfor (float x = 0.0; x < width; x++) {\n\t\t\t\t\t\tvec2 ref = vec2(x + 0.5, y + 0.5) / resolution.xy;\n\t\t\t\t\t\tbirdPosition = texture2D(texturePosition, ref).xyz;\n\t\t\t\t\t\tdir = birdPosition - selfPosition;\n\t\t\t\t\t\tdist = length(dir);\n\t\t\t\t\t\tif (dist < 0.0001) continue;\n\t\t\t\t\t\tdistSquared = dist * dist;\n\t\t\t\t\t\tif (distSquared > zoneRadiusSquared) continue;\n\t\t\t\t\t\tpercent = distSquared / zoneRadiusSquared;\n\t\t\t\t\t\tif (percent < separationThresh) { // low\n\t\t\t\t\t\t\t// Separation - Move apart for comfort\n\t\t\t\t\t\t\tf = (separationThresh / percent - 1.0) * delta;\n\t\t\t\t\t\t\tvelocity -= normalize(dir) * f;\n\t\t\t\t\t\t} else if (percent < alignmentThresh) { // high\n\t\t\t\t\t\t\t// Alignment - fly the same direction\n\t\t\t\t\t\t\tfloat threshDelta = alignmentThresh - separationThresh;\n\t\t\t\t\t\t\tfloat adjustedPercent = (percent - separationThresh) / threshDelta;\n\t\t\t\t\t\t\tbirdVelocity = texture2D(textureVelocity, ref).xyz;\n\t\t\t\t\t\t\tf = (0.5 - cos(adjustedPercent * PI_2) * 0.5 + 0.5) * delta;\n\t\t\t\t\t\t\tvelocity += normalize(birdVelocity) * f;\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t// Attraction / Cohesion - move closer\n\t\t\t\t\t\t\tfloat threshDelta = 1.0 - alignmentThresh;\n\t\t\t\t\t\t\tfloat adjustedPercent;\n\t\t\t\t\t\t\tif(threshDelta == 0.) adjustedPercent = 1.;\n\t\t\t\t\t\t\telse adjustedPercent = (percent - alignmentThresh) / threshDelta;\n\t\t\t\t\t\t\tf = (0.5 - (cos(adjustedPercent * PI_2) * -0.5 + 0.5)) * delta;\n\t\t\t\t\t\t\tvelocity += normalize(dir) * f;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t// this make tends to fly around than down or up\n\t\t\t\t// if (velocity.y > 0.) velocity.y *= (1. - 0.2 * delta);\n\t\t\t\t// Speed Limits\n\t\t\t\tif (length(velocity) > limit) {\n\t\t\t\t\tvelocity = normalize(velocity) * limit;\n\t\t\t\t}\n\t\t\t\tgl_FragColor = vec4(velocity, 1.0);\n            }",this.BIRDS=this.WIDTH*this.WIDTH,this.BirdGeometry=new this.$THREE.BufferGeometry,Math.lerp=function(t,e,i){return t+(e-t)*(i=Math.max(Math.min(i,1),0))},this.gltfs=["static/models/gltf/Parrot.glb","static/models/gltf/Flamingo.glb"],this.colors=[13434879,16768767],this.sizes=[.2,.1],this.selectModel=Math.floor(Math.random()*this.gltfs.length),this.windowHalfX=this.$webglInnerWidth/2,this.windowHalfY=window.innerHeight/2,this.BOUNDS_HALF=this.BOUNDS/2,this.last=performance.now(),(new r.a).load(this.gltfs[this.selectModel],function(e){var i=e.animations;t.durationAnimation=Math.round(60*i[0].duration);var n=e.scene.children[0].geometry,r=n.morphAttributes.position,a=t.nextPowerOf2(t.durationAnimation),o=t.nextPowerOf2(n.getAttribute("position").count);t.vertexPerBird=n.getAttribute("position").count;for(var s=new Float32Array(3*o*a),l=0;l<o;l++)for(var u=0;u<a;u++){var h,d,c=u*o*3,m=Math.floor(u/t.durationAnimation*r.length),f=(Math.floor(u/t.durationAnimation*r.length)+1)%r.length,v=u/t.durationAnimation*r.length%1;if(u<t.durationAnimation)h=r[m].array[3*l],d=r[f].array[3*l],void 0!==h&&void 0!==d&&(s[c+3*l]=Math.lerp(h,d,v)),h=r[m].array[3*l+1],d=r[f].array[3*l+1],void 0!==h&&void 0!==d&&(s[c+3*l+1]=Math.lerp(h,d,v)),h=r[m].array[3*l+2],d=r[f].array[3*l+2],void 0!==h&&void 0!==d&&(s[c+3*l+2]=Math.lerp(h,d,v))}t.textureAnimation=new t.$THREE.DataTexture(s,o,a,t.$THREE.RGBFormat,t.$THREE.FloatType),t.textureAnimation.needsUpdate=!0;var p=[],g=[],y=[],x=[],w=[],T=3*n.getAttribute("position").count*t.BIRDS;for(l=0;l<T;l++){var b=l%(3*n.getAttribute("position").count);p.push(n.getAttribute("position").array[b]),g.push(n.getAttribute("color").array[b])}var S=Math.random();for(l=0;l<n.getAttribute("position").count*t.BIRDS;l++){b=l%n.getAttribute("position").count;var D=Math.floor(l/n.getAttribute("position").count);0==b&&(S=Math.random());var R=(u=~~D)%t.WIDTH/t.WIDTH,P=~~(u/t.WIDTH)/t.WIDTH;y.push(R,P,b/o,t.durationAnimation/a),x.push(D,S,Math.random(),Math.random())}for(l=0;l<n.index.array.length*t.BIRDS;l++){c=Math.floor(l/n.index.array.length)*n.getAttribute("position").count;w.push(n.index.array[l%n.index.array.length]+c)}t.BirdGeometry.setAttribute("position",new t.$THREE.BufferAttribute(new Float32Array(p),3)),t.BirdGeometry.setAttribute("birdColor",new t.$THREE.BufferAttribute(new Float32Array(g),3)),t.BirdGeometry.setAttribute("color",new t.$THREE.BufferAttribute(new Float32Array(g),3)),t.BirdGeometry.setAttribute("reference",new t.$THREE.BufferAttribute(new Float32Array(y),4)),t.BirdGeometry.setAttribute("seeds",new t.$THREE.BufferAttribute(new Float32Array(x),4)),t.BirdGeometry.setIndex(w),t.init(),t.animate()})},beforeDestroy:function(){this.gui.destroy()},methods:{nextPowerOf2:function(t){return Math.pow(2,Math.ceil(Math.log(t)/Math.log(2)))},init:function(){var t=this;this.container=document.createElement("div"),document.getElementsByClassName("webglGpgpuBirdsGltf-container")[0].appendChild(this.container),this.camera=new this.$THREE.PerspectiveCamera(75,this.$webglInnerWidth/window.innerHeight,1,3e3),this.camera.position.z=350,this.scene=new this.$THREE.Scene,this.scene.background=new this.$THREE.Color(this.colors[this.selectModel]),this.scene.fog=new this.$THREE.Fog(this.colors[this.selectModel],100,1e3);var e=new this.$THREE.HemisphereLight(this.colors[this.selectModel],16777215,1.6);e.color.setHSL(.6,1,.6),e.groundColor.setHSL(.095,1,.75),e.position.set(0,50,0),this.scene.add(e);var i=new this.$THREE.DirectionalLight(52945,.6);i.color.setHSL(.1,1,.95),i.position.set(-1,1.75,1),i.position.multiplyScalar(30),this.scene.add(i),this.renderer=new this.$THREE.WebGLRenderer({antialias:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.setSize(this.$webglInnerWidth,window.innerHeight),this.container.appendChild(this.renderer.domElement),this.initComputeRenderer(),this.stats=new this.$Stats,this.stats.dom.style.left="280px",this.container.appendChild(this.stats.dom),this.container.style.touchAction="none",this.container.addEventListener("pointermove",this.onPointerMove,!1),window.addEventListener("resize",this.onWindowResize,!1),this.gui=new n.a;var r={separation:20,alignment:20,cohesion:20,freedom:.75,size:this.sizes[this.selectModel],count:this.BIRDS},a=function(){t.velocityUniforms.separationDistance.value=r.separation,t.velocityUniforms.alignmentDistance.value=r.alignment,t.velocityUniforms.cohesionDistance.value=r.cohesion,t.velocityUniforms.freedomFactor.value=r.freedom,t.materialShader&&(t.materialShader.uniforms.size.value=r.size),t.BirdGeometry.setDrawRange(0,t.vertexPerBird*r.count)};a(),this.gui.add(r,"separation",0,100,1).onChange(a),this.gui.add(r,"alignment",0,100,.001).onChange(a),this.gui.add(r,"cohesion",0,100,.025).onChange(a),this.gui.add(r,"size",0,1,.01).onChange(a),this.gui.add(r,"count",0,this.BIRDS,1).onChange(a),this.gui.close(),this.initBirds(r)},initComputeRenderer:function(){this.gpuCompute=new a.a(this.WIDTH,this.WIDTH,this.renderer),this.isSafari()&&this.gpuCompute.setDataType(this.$THREE.HalfFloatType);var t=this.gpuCompute.createTexture(),e=this.gpuCompute.createTexture();this.fillPositionTexture(t),this.fillVelocityTexture(e),this.velocityVariable=this.gpuCompute.addVariable("textureVelocity",this.fragmentShaderVelocity,e),this.positionVariable=this.gpuCompute.addVariable("texturePosition",this.fragmentShaderPosition,t),this.gpuCompute.setVariableDependencies(this.velocityVariable,[this.positionVariable,this.velocityVariable]),this.gpuCompute.setVariableDependencies(this.positionVariable,[this.positionVariable,this.velocityVariable]),this.positionUniforms=this.positionVariable.material.uniforms,this.velocityUniforms=this.velocityVariable.material.uniforms,this.positionUniforms.time={value:0},this.positionUniforms.delta={value:0},this.velocityUniforms.time={value:1},this.velocityUniforms.delta={value:0},this.velocityUniforms.testing={value:1},this.velocityUniforms.separationDistance={value:1},this.velocityUniforms.alignmentDistance={value:1},this.velocityUniforms.cohesionDistance={value:1},this.velocityUniforms.freedomFactor={value:1},this.velocityUniforms.predator={value:new this.$THREE.Vector3},this.velocityVariable.material.defines.BOUNDS=this.BOUNDS.toFixed(2),this.velocityVariable.wrapS=this.$THREE.RepeatWrapping,this.velocityVariable.wrapT=this.$THREE.RepeatWrapping,this.positionVariable.wrapS=this.$THREE.RepeatWrapping,this.positionVariable.wrapT=this.$THREE.RepeatWrapping;var i=this.gpuCompute.init();null!==i&&console.error(i)},isSafari:function(){return!!navigator.userAgent.match(/Safari/i)&&!navigator.userAgent.match(/Chrome/i)},initBirds:function(t){var e=this,i=this.BirdGeometry,n=new this.$THREE.MeshStandardMaterial({vertexColors:!0,flatShading:!0,roughness:1,metalness:0});n.onBeforeCompile=function(i){i.uniforms.texturePosition={value:null},i.uniforms.textureVelocity={value:null},i.uniforms.textureAnimation={value:e.textureAnimation},i.uniforms.time={value:1},i.uniforms.size={value:t.size},i.uniforms.delta={value:0};var n="#define STANDARD",r="\n                    attribute vec4 reference;\n                    attribute vec4 seeds;\n                    attribute vec3 birdColor;\n                    uniform sampler2D texturePosition;\n                    uniform sampler2D textureVelocity;\n                    uniform sampler2D textureAnimation;\n                    uniform float size;\n                    uniform float time;\n                ";i.vertexShader=i.vertexShader.replace(n,n+r),n="#include <begin_vertex>",r="\n                    vec4 tmpPos = texture2D(texturePosition, reference.xy);\n                    vec3 pos = tmpPos.xyz;\n                    vec3 velocity = normalize(texture2D(textureVelocity, reference.xy).xyz);\n                    vec3 aniPos = texture2D(textureAnimation, vec2(reference.z, mod(time + (seeds.x) * ((0.0004 + seeds.y / 10000.0) + normalize(velocity) / 20000.0), reference.w))).xyz;\n                    vec3 newPosition = position;\n                    newPosition = mat3(modelMatrix) * (newPosition + aniPos);\n                    newPosition *= size + seeds.y * size * 0.2;\n                    velocity.z *= -1.;\n                    float xz = length(velocity.xz);\n                    float xyz = 1.;\n                    float x = sqrt(1. - velocity.y * velocity.y);\n                    float cosry = velocity.x / xz;\n                    float sinry = velocity.z / xz;\n                    float cosrz = x / xyz;\n                    float sinrz = velocity.y / xyz;\n                    mat3 maty =  mat3(cosry, 0, -sinry, 0    , 1, 0     , sinry, 0, cosry);\n                    mat3 matz =  mat3(cosrz , sinrz, 0, -sinrz, cosrz, 0, 0     , 0    , 1);\n                    newPosition =  maty * matz * newPosition;\n                    newPosition += pos;\n                    vec3 transformed = vec3(newPosition);\n                ",i.vertexShader=i.vertexShader.replace(n,r),e.materialShader=i},this.birdMesh=new this.$THREE.Mesh(i,n),this.birdMesh.rotation.y=Math.PI/2,this.birdMesh.castShadow=!0,this.birdMesh.receiveShadow=!0,this.scene.add(this.birdMesh)},fillPositionTexture:function(t){for(var e=t.image.data,i=0,n=e.length;i<n;i+=4){var r=Math.random()*this.BOUNDS-this.BOUNDS_HALF,a=Math.random()*this.BOUNDS-this.BOUNDS_HALF,o=Math.random()*this.BOUNDS-this.BOUNDS_HALF;e[i+0]=r,e[i+1]=a,e[i+2]=o,e[i+3]=1}},fillVelocityTexture:function(t){for(var e=t.image.data,i=0,n=e.length;i<n;i+=4){var r=Math.random()-.5,a=Math.random()-.5,o=Math.random()-.5;e[i+0]=10*r,e[i+1]=10*a,e[i+2]=10*o,e[i+3]=1}},onWindowResize:function(){this.windowHalfX=(window.innerWidth-281)/2,this.windowHalfY=window.innerHeight/2,this.$onWindowResize(this.camera,this.renderer)},onPointerMove:function(t){!1!==t.isPrimary&&(this.mouseX=t.clientX-this.windowHalfX,this.mouseY=t.clientY-this.windowHalfY)},animate:function(){requestAnimationFrame(this.animate),this.render(),this.stats.update()},render:function(){var t=performance.now(),e=(t-this.last)/1e3;e>1&&(e=1),this.last=t,this.positionUniforms.time.value=t,this.positionUniforms.delta.value=e,this.velocityUniforms.time.value=t,this.velocityUniforms.delta.value=e,this.materialShader&&(this.materialShader.uniforms.time.value=t/1e3),this.materialShader&&(this.materialShader.uniforms.delta.value=e),this.velocityUniforms.predator.value.set(.5*this.mouseX/this.windowHalfX,-.5*this.mouseY/this.windowHalfY,0),this.mouseX=1e4,this.mouseY=1e4,this.gpuCompute.compute(),this.materialShader&&(this.materialShader.uniforms.texturePosition.value=this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture),this.materialShader&&(this.materialShader.uniforms.textureVelocity.value=this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture),this.renderer.render(this.scene,this.camera)}}},s={render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"webglGpgpuBirdsGltf-container"},[e("div",{attrs:{id:"info"}},[e("a",{attrs:{href:"https://threejs.org",target:"_blank",rel:"noopener"}},[this._v("three.js")]),this._v(" - webgl gpgpu birds + GLTF mesh"),e("br"),this._v("\n\t\t\tFlamingo by "),e("a",{attrs:{href:"https://mirada.com/",target:"_blank",rel:"noopener"}},[this._v("mirada")]),this._v(" from "),e("a",{attrs:{href:"http://www.ro.me/",target:"_blank",rel:"noopener"}},[this._v("rome")]),e("br"),this._v("\n\t\t\tMove mouse to disturb birds.\n\t\t")])])}]};var l=i("VU/8")(o,s,!1,function(t){i("sixs")},"data-v-1bf61302",null);e.default=l.exports},sixs:function(t,e){}});
//# sourceMappingURL=10.738169b6e812f7bc3233.js.map