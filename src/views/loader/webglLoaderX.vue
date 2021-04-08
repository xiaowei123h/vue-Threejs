<template>
    <div class="webglLoaderX-container">
        <div id="info">
            <a href="https://threejs.org" target="_blank">three.js</a> - X-File Loader <br>
            <a href="https://github.com/adrs2002/threeXfileLoader" target="_new">see more info and samples</a> <br /><br/>
            <select id="mech1_anime">
                <option value="stand">stand</option>
                <option value="wark">walk</option>
                <option value="attack">attack</option>
            </select>
        </div>
        <div id="canvase3d"></div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { XLoader } from '@/components/jsm/loaders/XLoader.js'
export default {
    data() {
        return {
            container: null,
            stats: null,
            controls: null,
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
            manager: null,
            skeletonHelper: null,
            animates: [],
            actions: [],
            Models: [],
        }
    },
    mounted() {
        this.clock = new this.$moduleTHREE.Clock()
        this.init()
    },
    methods: {
        onProgress(xhr) {
			if (xhr.lengthComputable) {
				var percentComplete = xhr.loaded / xhr.total * 100
				console.log(Math.round(percentComplete, 2) + '% downloaded')
			}
        },
        onError() {},
        init() {
			this.container = document.createElement('div')
			document.getElementsByClassName('webglLoaderX-container')[0].appendChild(this.container)
			this.scene = new this.$moduleTHREE.Scene()
			this.scene.add(new this.$moduleTHREE.AmbientLight(0xaaaaaa))
			// grid
			var gridHelper = new this.$moduleTHREE.GridHelper(14, 1, 0x303030, 0x303030)
			this.scene.add(gridHelper)
			// stats
            this.stats = new this.$Stats()
            this.stats.dom.style.left = '280px'
			this.container.appendChild(this.stats.dom)
			this.renderer = new this.$moduleTHREE.WebGLRenderer()
			this.renderer.setPixelRatio(window.devicePixelRatio)
			this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
			this.renderer.setClearColor(0x666666)
			this.container.appendChild(this.renderer.domElement)
			this.camera = new this.$moduleTHREE.PerspectiveCamera(45, this.$webglInnerWidth / window.innerHeight, 1, 2000)
			this.camera.position.set(2, 10, - 28)
			this.camera.up.set(0, 1, 0)
			this.controls = new OrbitControls(this.camera, this.renderer.domElement)
			this.controls.target.set(0, 5, 0)
			this.controls.update()
			var light = new this.$moduleTHREE.DirectionalLight(0xffffff, 1)
			light.position.set(10, 100, - 10).normalize()
			this.scene.add(light)
			var light2 = new this.$moduleTHREE.DirectionalLight(0x777666, 1)
			light2.position.set(- 1, - 1, - 1).normalize()
			this.scene.add(light2)
			window.addEventListener('resize', this.onWindowResize, false)
			this.animate()
			// model loading
			this.manager = new this.$moduleTHREE.LoadingManager()
			this.manager.onProgress = (item, loaded, total) => {
				console.log(item, loaded, total)
			}
			var loader = new XLoader(this.manager)
			this.actions[ 0 ] = {}
			//download Model file
			loader.load([ 'static/models/xfile/SSR06_model.x' ], (object) => {
				for (var i = 0; i < object.models.length; i ++) {
					var model = object.models[ i ]
					model.scale.x *= - 1
					this.Models.push(model)
				}
				this.loadAnimation('stand', 0, () => {
					this.scene.add(this.Models[ 0 ])
					if (this.Models[ 0 ] instanceof this.$moduleTHREE.SkinnedMesh) {
						this.skeletonHelper = new this.$moduleTHREE.SkeletonHelper(this.Models[ 0 ])
						this.scene.add(this.skeletonHelper)
					}
					this.actions[ 0 ][ 'stand' ].play()
				})
				object = null
			}, this.onProgress, this.onError)
			//
			var animationSelection = document.getElementById('mech1_anime')
			animationSelection.addEventListener('change', this.mech1_changeAnime)
        },
        onWindowResize() {
			this.$onWindowResize(this.camera, this.renderer)
        },
        animate() {
			requestAnimationFrame(this.animate)
			var delta = this.clock.getDelta()
			if (this.animates != null && this.animates.length > 0) {
				for (var i = 0; i < this.animates.length; i ++) {
					this.animates[ i ].update(delta * 1000)
				}
			}
			this.stats.update()
			this.render()
        },
        render() {
			this.renderer.render(this.scene, this.camera)
        },
        loadAnimation(animeName, modelId, _callback) {
			if (this.actions[ modelId ][ animeName ]) {
				if (_callback) {
					_callback()
				}
			} else {
				var loader2 = new XLoader(this.manager)
				loader2.load([ 'static/models/xfile/' + animeName + '.x', { putPos: false, putScl: false } ], () => {
					// !! important!
					// associate divided model and animation.
					loader2.assignAnimation(this.Models[ modelId ])
					if (! this.animates[ modelId ]) {
						this.animates[ modelId ] = this.Models[ modelId ].animationMixer
					}
					this.actions[ modelId ][ animeName ] = this.Models[ modelId ].animationMixer.clipAction(animeName)
					if (animeName == 'stand') {
						this.actions[ modelId ][ animeName ].setLoop(this.$moduleTHREE.LoopOnce)
					}
					this.actions[ modelId ][ animeName ].clampWhenFinished = true
					if (_callback) {
						_callback(); return
					}
					this.actions[ modelId ][ animeName ].play()
				}, this.onProgress, this.onError)
			}
        },
        mech1_changeAnime(event) {
			var val = event.target.value
			this.loadAnimation(val, 0, () => {
				Object.keys(this.actions[ 0 ]).forEach((p) => {
					if (p == val) {
						this.actions[ 0 ][ p ].play()
					} else {
						this.actions[ 0 ][ p ].stop()
					}
				})
			})
		}
    },
}
</script>

<style scoped>
.webglLoaderX-container {
    width: 100%;
}
#info {
	margin-left: 35px;
}
</style>
