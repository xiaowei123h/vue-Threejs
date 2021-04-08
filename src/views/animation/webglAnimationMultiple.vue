<template>
    <div class="webglAnimationMultiple-container">
        <div id="container"></div>
		<div id="info">
			This demo shows how clone a skinned 3d model using <strong>SkeletonUtils.clone()</strong><br/>
			Soldier model from <a href="https://www.mixamo.com" target="_blank" rel="noopener">https://www.mixamo.com</a>.
		</div>
    </div>
</template>

<script>
import { GLTFLoader } from '@/components/jsm/loaders/GLTFLoader.js'
import { SkeletonUtils } from '@/components/jsm/utils/SkeletonUtils.js'
export default {
    data() {
        return {
            worldScene: null, // THREE.Scene where it all will be rendered
			renderer: null,
			camera: null,
			clock: null,
            mixers: [], // All the THREE.AnimationMixer objects for all the animations in the scene
            MODELS: [
				{
                    name: "Soldier"
                },
				{
                    name: "Parrot"
                },
				// { name: "RiflePunch" },
            ],
            UNITS: [
				{
					modelName: "Soldier", // Will use the 3D model from file models/gltf/Soldier.glb
					meshName: "vanguard_Mesh", // Name of the main mesh to animate
					position: { x: 0, y: 0, z: 0 }, // Where to put the unit in the scene
					scale: 1, // Scaling of the unit. 1.0 means: use original size, 0.1 means "10 times smaller", etc.
					animationName: "Idle" // Name of animation to run
				},
				{
					modelName: "Soldier",
					meshName: "vanguard_Mesh",
					position: { x: 3, y: 0, z: 0 },
					scale: 2,
					animationName: "Walk"
				},
				{
					modelName: "Soldier",
					meshName: "vanguard_Mesh",
					position: { x: 1, y: 0, z: 0 },
					scale: 1,
					animationName: "Run"
				},
				{
					modelName: "Parrot",
					meshName: "mesh_0",
					position: { x: - 4, y: 0, z: 0 },
					rotation: { x: 0, y: Math.PI, z: 0 },
					scale: 0.01,
					animationName: "parrot_A_"
				},
				{
					modelName: "Parrot",
					meshName: "mesh_0",
					position: { x: - 2, y: 0, z: 0 },
					rotation: { x: 0, y: Math.PI / 2, z: 0 },
					scale: 0.02,
					animationName: null
				},
            ],
            numLoadedModels: 0
        }
    },
    mounted() {
        this.initScene()
        this.initRenderer()
        this.loadModels()
        this.animate()
    },
    methods: {
        /**
			 * Initialize ThreeJS THREE.Scene
        */
        initScene() {
            this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 10000)
            this.camera.position.set( 3, 6, - 10 )
            this.camera.lookAt( 0, 1, 0 )
            this.clock = new this.$moduleTHREE.Clock()
            this.worldScene = new this.$moduleTHREE.Scene()
            this.worldScene.background = new this.$moduleTHREE.Color(0xa0a0a0)
            this.worldScene.fog = new this.$moduleTHREE.Fog(0xa0a0a0, 10, 22)
            const hemiLight = new this.$moduleTHREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 20, 0)
            this.worldScene.add(hemiLight)
            const dirLight = new this.$moduleTHREE.DirectionalLight(0xffffff)
            dirLight.position.set(-3, 10, -10)
            dirLight.castShadow = true
            dirLight.shadow.camera.top = 10
            dirLight.shadow.camera.bottom = -10
            dirLight.shadow.camera.left = - 10
            dirLight.shadow.camera.right = 10
            dirLight.shadow.camera.near = 0.1
            dirLight.shadow.camera.far = 40
            this.worldScene.add(dirLight)
            // ground
            const groundMesh = new this.$moduleTHREE.Mesh(
                new this.$moduleTHREE.PlaneBufferGeometry( 40, 40 ),
                new this.$moduleTHREE.MeshPhongMaterial({
                    color: 0x999999,
                    depthWrite: false
                })
            )
            groundMesh.rotation.x = - Math.PI / 2
            groundMesh.receiveShadow = true
            this.worldScene.add(groundMesh)
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
        },
        //////////////////////////////
        // General Three.JS stuff
        //////////////////////////////
        // This part is not anyhow related to the cloning of models, it's just setting up the scene.
        /**
         * Initialize ThreeJS scene renderer
         */
        initRenderer() {
            const container = document.getElementById('container')
            this.renderer = new this.$moduleTHREE.WebGLRenderer({antialias: true})
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.outputEncoding = this.$moduleTHREE.sRGBEncoding
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = this.$moduleTHREE.PCFSoftShadowMap
            container.appendChild(this.renderer.domElement)
        },
        //////////////////////////////
        // Function implementations
        //////////////////////////////
        /**
         * Function that starts loading process for the next model in the queue. The loading process is
         * asynchronous: it happens "in the background". Therefore we don't load all the models at once. We load one,
         * wait until it is done, then load the next one. When all models are loaded, we call loadUnits().
         */
        loadModels() {
            for(var i = 0; i < this.MODELS.length; ++ i) {
                var m = this.MODELS[i]
                this.loadGltfModel( m, () => {
                    ++this.numLoadedModels
                    if(this.numLoadedModels === this.MODELS.length) {
                        console.log("All models loaded, time to instantiate units...")
                        this.instantiateUnits()
                    }
                })
            }
        },
        /**
			 * Load a 3D model from a GLTF file. Use the GLTFLoader.
			 * @param model {object} Model config, one item from the MODELS array. It will be updated inside the function!
			 * @param onLoaded {function} A callback function that will be called when the model is loaded
        */
        loadGltfModel(model, onLoaded) {
            var loader = new GLTFLoader()
            var modelName = "static/models/gltf/" + model.name + ".glb"
            loader.load(modelName, (gltf) => {
                var scene = gltf.scene
                model.animations = gltf.animations
                model.scene = scene
                // Enable Shadows
                gltf.scene.traverse((object) => {
                    if(object.isMesh) {
                        object.castShadow = true
                    }
                })
                console.log("Done loading model", model.name)
                onLoaded()
            })

        },
        animate() {
            requestAnimationFrame(this.animate)
            // Get the time elapsed since the last frame
            var mixerUpdateDelta = this.clock.getDelta()
            // Update all the animation frames
            for (var i = 0; i < this.mixers.length; ++i) {
                this.mixers[i].update(mixerUpdateDelta)
            }
            this.renderer.render(this.worldScene, this.camera)
        },
        /**
         * Look at UNITS configuration, clone necessary 3D model scenes, place the armatures and meshes in the scene and
         * launch necessary animations
         */
        instantiateUnits() {
            var numSuccess = 0
            for (var i = 0; i < this.UNITS.length; ++ i) {
                var u = this.UNITS[i]
                var model = this.getModelByName(u.modelName)
                if (model) {
                    var clonedScene = SkeletonUtils.clone(model.scene)
                    if (clonedScene) {
                        // THREE.Scene is cloned properly, let's find one mesh and launch animation for it
                        var clonedMesh = clonedScene.getObjectByName(u.meshName)
                        if (clonedMesh) {
                            var mixer = this.startAnimation(clonedMesh, model.animations, u.animationName)
                            // Save the animation mixer in the list, will need it in the animation loop
                            this.mixers.push(mixer)
                            numSuccess++
                        }
                        // Different models can have different configurations of armatures and meshes. Therefore,
                        // We can't set position, scale or rotation to individual mesh objects. Instead we set
                        // it to the whole cloned scene and then add the whole scene to the game world
                        // Note: this may have weird effects if you have lights or other items in the GLTF file's scene!
                        this.worldScene.add(clonedScene)
                        if (u.position) {
                            clonedScene.position.set(u.position.x, u.position.y, u.position.z)
                        }
                        if (u.scale) {
                            clonedScene.scale.set(u.scale, u.scale, u.scale)
                        }
                        if (u.rotation) {
                            clonedScene.rotation.x = u.rotation.x
                            clonedScene.rotation.y = u.rotation.y
                            clonedScene.rotation.z = u.rotation.z
                        }
                        }
                } else {
                    console.error("Can not find model", u.modelName)
                }
            }
            console.log(`Successfully instantiated ${numSuccess} units`)
        },
        /**
             * Find a model object by name
             * @param name
             * @returns {object|null}
        */
		getModelByName(name) {
            for(var i = 0; i < this.MODELS.length; ++ i) {
                if(this.MODELS[ i ].name === name) {
                    return this.MODELS[i]
                }
            }
            return null
        },
        /**
			 * Start animation for a specific mesh object. Find the animation by name in the 3D model's animation array
			 * @param skinnedMesh {THREE.SkinnedMesh} The mesh to animate
			 * @param animations {Array} Array containing all the animations for this model
			 * @param animationName {string} Name of the animation to launch
			 * @return {THREE.AnimationMixer} Mixer to be used in the render loop
        */
        startAnimation(skinnedMesh, animations, animationName) {
            var mixer = new this.$moduleTHREE.AnimationMixer(skinnedMesh)
            var clip = this.$moduleTHREE.AnimationClip.findByName(animations, animationName)
            if (clip) {
                var action = mixer.clipAction(clip)
                action.play()
            }
            return mixer
        }
    }
}
</script>

<style scoped>
.webglAnimationMultiple-container {
    width: 100%;
}
</style>
