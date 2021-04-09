<template>
    <div class="miscAnimationKeys-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - animation - basic use
		</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            stats: null,
            clock: null,
            scene: null,
            camera: null,
            renderer: null,
            mixer: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.scene = new this.$THREE.Scene()
            //
            this.camera = new this.$THREE.PerspectiveCamera(40, this.$webglInnerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(25, 25, 50)
            this.camera.lookAt(this.scene.position)
            //
            var axesHelper = new this.$THREE.AxesHelper(10)
            this.scene.add(axesHelper)
            //
            var geometry = new this.$THREE.BoxBufferGeometry(5, 5, 5)
            var material = new this.$THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
            var mesh = new this.$THREE.Mesh(geometry, material)
            this.scene.add(mesh)
            // create a keyframe track (i.e. a timed sequence of keyframes) for each animated property
            // Note: the keyframe track type should correspond to the type of the property being animated
            // POSITION
            var positionKF = new this.$THREE.VectorKeyframeTrack('.position', [ 0, 1, 2 ], [ 0, 0, 0, 30, 0, 0, 0, 0, 0 ])
            // SCALE
            var scaleKF = new this.$THREE.VectorKeyframeTrack('.scale', [ 0, 1, 2 ], [ 1, 1, 1, 2, 2, 2, 1, 1, 1 ])
            // ROTATION
            // Rotation should be performed using quaternions, using a this.$THREE.QuaternionKeyframeTrack
            // Interpolating Euler angles (.rotation property) can be problematic and is currently not supported
            // set up rotation about x axis
            var xAxis = new this.$THREE.Vector3(1, 0, 0)
            var qInitial = new this.$THREE.Quaternion().setFromAxisAngle(xAxis, 0)
            var qFinal = new this.$THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI)
            var quaternionKF = new this.$THREE.QuaternionKeyframeTrack('.quaternion', [ 0, 1, 2 ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w ])
            // COLOR
            var colorKF = new this.$THREE.ColorKeyframeTrack('.material.color', [ 0, 1, 2 ], [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], this.$THREE.InterpolateDiscrete)
            // OPACITY
            var opacityKF = new this.$THREE.NumberKeyframeTrack('.material.opacity', [ 0, 1, 2 ], [ 1, 0, 1 ])
            // create an animation sequence with the tracks
            // If a negative time value is passed, the duration will be calculated from the times of the passed tracks array
            var clip = new this.$THREE.AnimationClip('Action', 3, [ scaleKF, positionKF, quaternionKF, colorKF, opacityKF ])
            // setup the this.$THREE.AnimationMixer
            this.mixer = new this.$THREE.AnimationMixer(mesh)
            // create a ClipAction and set it to play
            var clipAction = this.mixer.clipAction(clip)
            clipAction.play()
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('miscAnimationKeys-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('miscAnimationKeys-container')[0].appendChild(this.stats.dom)
            //
            this.clock = new this.$THREE.Clock()
            //
            window.addEventListener('resize', this.onWindowResize, false)
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate)
            this.render()
        },
        render() {
            var delta = this.clock.getDelta()
            if (this.mixer) {
                this.mixer.update(delta)
            }
            this.renderer.render(this.scene, this.camera)
            this.stats.update()
        }
    },
}
</script>

<style scoped>
.miscAnimationKeys-container {
    position: relative;
    width: 100%;
}
</style>
