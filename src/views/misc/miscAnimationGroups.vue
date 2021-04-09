<template>
    <div class="miscAnimationGroups-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - animation - groups
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
            this.camera.position.set(50, 50, 100)
            this.camera.lookAt(this.scene.position)
            // all objects of this animation group share a common animation state
            var animationGroup = new this.$THREE.AnimationObjectGroup()
            //
            var geometry = new this.$THREE.BoxBufferGeometry(5, 5, 5)
            var material = new this.$THREE.MeshBasicMaterial({ transparent: true })
            //
            for (var i = 0; i < 5; i ++) {
                for (var j = 0; j < 5; j ++) {
                    var mesh = new this.$THREE.Mesh(geometry, material)
                    mesh.position.x = 32 - (16 * i)
                    mesh.position.y = 0
                    mesh.position.z = 32 - (16 * j)
                    this.scene.add(mesh)
                    animationGroup.add(mesh)
                }
            }
            // create some keyframe tracks
            var xAxis = new this.$THREE.Vector3(1, 0, 0)
            var qInitial = new this.$THREE.Quaternion().setFromAxisAngle(xAxis, 0)
            var qFinal = new this.$THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI)
            var quaternionKF = new this.$THREE.QuaternionKeyframeTrack('.quaternion', [ 0, 1, 2 ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w ])
            var colorKF = new this.$THREE.ColorKeyframeTrack('.material.color', [ 0, 1, 2 ], [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], this.$THREE.InterpolateDiscrete)
            var opacityKF = new this.$THREE.NumberKeyframeTrack('.material.opacity', [ 0, 1, 2 ], [ 1, 0, 1 ])
            // create clip
            var clip = new this.$THREE.AnimationClip('default', 3, [ quaternionKF, colorKF, opacityKF ])
            // apply the animation group to the mixer as the root object
            this.mixer = new this.$THREE.AnimationMixer(animationGroup)
            var clipAction = this.mixer.clipAction(clip)
            clipAction.play()
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            document.getElementsByClassName('miscAnimationGroups-container')[0].appendChild(this.renderer.domElement)
            //
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('miscAnimationGroups-container')[0].appendChild(this.stats.dom)
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
.miscAnimationGroups-container {
    position: relative;
    width: 100%;
}
</style>
