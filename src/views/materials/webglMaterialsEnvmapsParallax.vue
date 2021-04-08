<template>
    <div class="webglMaterialsEnvmapsParallax-container">
        <div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - box projected cubemap environment mapping. <br> created by <a href="https://codercat.tk" target="_blank" rel="noopener">codercat</a>
		</div>
    </div>
</template>

<script>
import { GUI } from '@/components/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from '@/components/jsm/helpers/RectAreaLightHelper.js'
import { RectAreaLightUniformsLib } from '@/components/jsm/lights/RectAreaLightUniformsLib.js'
export default {
    data() {
        return {
            worldposReplace: null,
            envmapPhysicalParsReplace: null,
            WIDTH: null,
			HEIGHT: null,
			// camera
			VIEW_ANGLE: 45,
			ASPECT: null,
			NEAR: 1,
			FAR: 800,
            camera: null,
            cubeCamera: null,
            scene: null,
            renderer: null,
			cameraControls: null,
            groundPlane: null,
            wallMat: null,
            gui: null,
        }
    },
    mounted() {
        // shader injection for box projected cube environment mapping
        this.worldposReplace = /* glsl */`
            #define BOX_PROJECTED_ENV_MAP
            #if defined(USE_ENVMAP) || defined(DISTANCE) || defined (USE_SHADOWMAP)
                vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
                #ifdef BOX_PROJECTED_ENV_MAP
                    vWorldPosition = worldPosition.xyz;
                #endif
            #endif
            `

        this.envmapPhysicalParsReplace = /* glsl */`
            #if defined(USE_ENVMAP)
                #define BOX_PROJECTED_ENV_MAP
                #ifdef BOX_PROJECTED_ENV_MAP
                    uniform vec3 cubeMapSize;
                    uniform vec3 cubeMapPos;
                    varying vec3 vWorldPosition;
                    vec3 parallaxCorrectNormal(vec3 v, vec3 cubeSize, vec3 cubePos) {
                        vec3 nDir = normalize(v);
                        vec3 rbmax = (.5 * cubeSize + cubePos - vWorldPosition) / nDir;
                        vec3 rbmin = (-.5 * cubeSize + cubePos - vWorldPosition) / nDir;
                        vec3 rbminmax;
                        rbminmax.x = (nDir.x > 0.) ? rbmax.x : rbmin.x;
                        rbminmax.y = (nDir.y > 0.) ? rbmax.y : rbmin.y;
                        rbminmax.z = (nDir.z > 0.) ? rbmax.z : rbmin.z;
                        float correction = min(min(rbminmax.x, rbminmax.y), rbminmax.z);
                        vec3 boxIntersection = vWorldPosition + nDir * correction;
                        return boxIntersection - cubePos;
                    }
                #endif
                #ifdef ENVMAP_MODE_REFRACTION
                    uniform float refractionRatio;
                #endif
                vec3 getLightProbeIndirectIrradiance(/*cont in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in int maxMIPLevel) {
                    vec3 worldNormal = inverseTransformDirection(geometry.normal, viewMatrix);
                    #ifdef ENVMAP_TYPE_CUBE
                        #ifdef BOX_PROJECTED_ENV_MAP
                            worldNormal = parallaxCorrectNormal(worldNormal, cubeMapSize, cubeMapPos);
                        #endif
                        vec3 queryVec = vec3(flipEnvMap * worldNormal.x, worldNormal.yz);
                        // TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
                        // of a specular cubemap, or just the default level of a specially created irradiance cubemap.
                        #ifdef TEXTURE_LOD_EXT
                            vec4 envMapColor = textureCubeLodEXT(envMap, queryVec, float(maxMIPLevel));
                        #else
                            // force the bias high to get the last LOD level as it is the most blurred.
                            vec4 envMapColor = textureCube(envMap, queryVec, float(maxMIPLevel));
                        #endif
                        envMapColor.rgb = envMapTexelToLinear(envMapColor).rgb;
                    #elif defined(ENVMAP_TYPE_CUBE_UV)
                        vec4 envMapColor = textureCubeUV(envMap, worldNormal, 1.0);
                    #else
                        vec4 envMapColor = vec4(0.0);
                    #endif
                    return PI * envMapColor.rgb * envMapIntensity;
                }
                // Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
                float getSpecularMIPLevel(const in float roughness, const in int maxMIPLevel) {
                    float maxMIPLevelScalar = float(maxMIPLevel);
                    float sigma = PI * roughness * roughness / (1.0 + roughness);
                    float desiredMIPLevel = maxMIPLevelScalar + log2(sigma);
                    // clamp to allowable LOD ranges.
                    return clamp(desiredMIPLevel, 0.0, maxMIPLevelScalar);
                }
                vec3 getLightProbeIndirectRadiance(/*const in SpecularLightProbe specularLightProbe,*/ const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel) {
                    #ifdef ENVMAP_MODE_REFLECTION
                        vec3 reflectVec = reflect(-viewDir, normal);
                        // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
                        reflectVec = normalize(mix(reflectVec, normal, roughness * roughness));
                    #else
                        vec3 reflectVec = refract(-viewDir, normal, refractionRatio);
                    #endif
                    reflectVec = inverseTransformDirection(reflectVec, viewMatrix);
                    float specularMIPLevel = getSpecularMIPLevel(roughness, maxMIPLevel);
                    #ifdef ENVMAP_TYPE_CUBE
                        #ifdef BOX_PROJECTED_ENV_MAP
                            reflectVec = parallaxCorrectNormal(reflectVec, cubeMapSize, cubeMapPos);
                        #endif
                        vec3 queryReflectVec = vec3(flipEnvMap * reflectVec.x, reflectVec.yz);
                        #ifdef TEXTURE_LOD_EXT
                            vec4 envMapColor = textureCubeLodEXT(envMap, queryReflectVec, specularMIPLevel);
                        #else
                            vec4 envMapColor = textureCube(envMap, queryReflectVec, specularMIPLevel);
                        #endif
                        envMapColor.rgb = envMapTexelToLinear(envMapColor).rgb;
                    #elif defined(ENVMAP_TYPE_CUBE_UV)
                        vec4 envMapColor = textureCubeUV(envMap, reflectVec, roughness);
                    #endif
                    return envMapColor.rgb * envMapIntensity;
                }
            #endif
            `
        // scene size
        this.WIDTH = this.$webglInnerWidth
        this.HEIGHT = window.innerHeight
        // camera
        this.ASPECT = this.WIDTH / this.HEIGHT
        this.init()
    },
    beforeDestroy() {
        this.gui.destroy()
    },
    methods: {
        init() {
            var container = document.getElementById('container')
            // renderer
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.WIDTH, this.HEIGHT)
            container.appendChild(this.renderer.domElement)
            // gui controls
            this.gui = new GUI()
            var params = {
                'box projected': true
            }
            var bpcemGui = this.gui.add(params, 'box projected')
            bpcemGui.onChange((value) => {
                if (value) {
                    this.groundPlane.material = boxProjectedMat
                } else {
                    this.groundPlane.material = defaultMat
                }
                this.render()
            })
            // scene
            this.scene = new this.$THREE.Scene()
            // camera
            this.camera = new this.$THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR)
            this.camera.position.set(280, 106, - 5)
            this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement)
            this.cameraControls.target.set(0, - 10, 0)
            this.cameraControls.maxDistance = 400
            this.cameraControls.minDistance = 10
            this.cameraControls.addEventListener('change', this.render)
            this.cameraControls.update()
            // cube this.camera for environment map
            var cubeRenderTarget = new this.$THREE.WebGLCubeRenderTarget(512, {
                format: this.$THREE.RGBFormat,
                generateMipmaps: true,
                minFilter: this.$THREE.LinearMipmapLinearFilter
            })
            this.cubeCamera = new this.$THREE.CubeCamera(1, 1000, cubeRenderTarget)
            this.cubeCamera.position.set(0, - 100, 0)
            this.scene.add(this.cubeCamera)
            // ground floor (with box projected environment mapping)
            var loader = new this.$THREE.TextureLoader()
            var rMap = loader.load('static/textures/lava/lavatile.jpg')
            rMap.wrapS = this.$THREE.RepeatWrapping
            rMap.wrapT = this.$THREE.RepeatWrapping
            rMap.repeat.set(2, 1)
            var defaultMat = new this.$THREE.MeshPhysicalMaterial({
                roughness: 1,
                envMap: cubeRenderTarget.texture,
                roughnessMap: rMap
            })
            var that = this
            var boxProjectedMat = new this.$THREE.MeshPhysicalMaterial({
                color: new this.$THREE.Color('#ffffff'),
                roughness: 1,
                envMap: cubeRenderTarget.texture,
                roughnessMap: rMap
            });
            boxProjectedMat.onBeforeCompile = function (shader) {
                //these parameters are for the this.cubeCamera texture
                shader.uniforms.cubeMapSize = { value: new that.$THREE.Vector3(200, 200, 100) }
                shader.uniforms.cubeMapPos = { value: new that.$THREE.Vector3(0, - 50, 0) }
                //replace shader chunks with box projection chunks
                shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <worldpos_vertex>',
                    that.worldposReplace
                )
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <envmap_physical_pars_fragment>',
                    that.envmapPhysicalParsReplace
                )
            }
            this.groundPlane = new this.$THREE.Mesh(new this.$THREE.PlaneBufferGeometry(200, 100, 100), boxProjectedMat)
            this.groundPlane.rotateX(- Math.PI / 2)
            this.groundPlane.position.set(0, - 49, 0)
            this.scene.add(this.groundPlane)
            // walls
            var diffuseTex = loader.load('static/textures/brick_diffuse.jpg', () => {
                this.updateCubeMap()
            })
            var bumpTex = loader.load('static/textures/brick_bump.jpg', () => {
                this.updateCubeMap()
            })
            this.wallMat = new this.$THREE.MeshPhysicalMaterial({
                map: diffuseTex,
                bumpMap: bumpTex,
                bumpScale: 0.3,
            })
            var planeGeo = new this.$THREE.PlaneBufferGeometry(100, 100)
            var planeBack1 = new this.$THREE.Mesh(planeGeo, this.wallMat)
            planeBack1.position.z = - 50
            planeBack1.position.x = - 50
            this.scene.add(planeBack1)
            var planeBack2 = new this.$THREE.Mesh(planeGeo, this.wallMat)
            planeBack2.position.z = - 50
            planeBack2.position.x = 50
            this.scene.add(planeBack2)
            var planeFront1 = new this.$THREE.Mesh(planeGeo, this.wallMat)
            planeFront1.position.z = 50
            planeFront1.position.x = - 50
            planeFront1.rotateY(Math.PI)
            this.scene.add(planeFront1)
            var planeFront2 = new this.$THREE.Mesh(planeGeo, this.wallMat)
            planeFront2.position.z = 50
            planeFront2.position.x = 50
            planeFront2.rotateY(Math.PI)
            this.scene.add(planeFront2)
            var planeRight = new this.$THREE.Mesh(planeGeo, this.wallMat)
            planeRight.position.x = 100
            planeRight.rotateY(- Math.PI / 2)
            this.scene.add(planeRight)
            var planeLeft = new this.$THREE.Mesh(planeGeo, this.wallMat)
            planeLeft.position.x = - 100
            planeLeft.rotateY(Math.PI / 2)
            this.scene.add(planeLeft)
            //lights
            var width = 50
            var height = 50
            var intensity = 10
            RectAreaLightUniformsLib.init()
            var blueRectLight = new this.$THREE.RectAreaLight(0xf3aaaa, intensity, width, height)
            blueRectLight.position.set(99, 5, 0)
            blueRectLight.lookAt(0, 5, 0)
            this.scene.add(blueRectLight)
            var blueRectLightHelper = new RectAreaLightHelper(blueRectLight)
            blueRectLight.add(blueRectLightHelper)
            var redRectLight = new this.$THREE.RectAreaLight(0x9aaeff, intensity, width, height)
            redRectLight.position.set(- 99, 5, 0)
            redRectLight.lookAt(0, 5, 0)
            this.scene.add(redRectLight)
            var redRectLightHelper = new RectAreaLightHelper(redRectLight)
            redRectLight.add(redRectLightHelper)
            this.render()
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        updateCubeMap() {
            //disable specular highlights on walls in the environment map
            this.wallMat.roughness = 1
            this.groundPlane.visible = false
            this.cubeCamera.position.copy(this.groundPlane.position)
            this.cubeCamera.update(this.renderer, this.scene)
            this.wallMat.roughness = 0.6
            this.groundPlane.visible = true
            this.render()
        },
        render() {
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.webglMaterialsEnvmapsParallax-container {
    width: 100%;
}
</style>
