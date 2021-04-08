<template>
    <div class="threejs-container">
        1111
    </div>
</template>

<script>
// import * as this.$THREE from "@/components/build/three.module.js"
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
import { FBXLoader } from '@/components/jsm/loaders/FBXLoader.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            clock: null,
            mixer: null,
            obj: null,
        }
    },
    mounted() {
        this.clock = new this.$THREE.Clock()
        this.init()
        this.loadModel('static/model/QiCai/QiCai.fbx')
        this.update()
    },
    methods: {
        init() {
            const container = document.createElement('div')
            document.getElementsByClassName('threejs-container')[0].appendChild(container)
            this.camera = new this.$THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 20000)
            this.camera.position.set(100, 200, 300)
            this.scene = new this.$THREE.Scene()
            this.scene.background = new this.$THREE.Color(0xa0a0a0)
            this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 500, 1000)
            // const hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            // hemiLight.position.set(0, 200, 0)
            // this.scene.add(hemiLight)
            var ambientLight = new this.$THREE.AmbientLight(0xffffff, 0.5)
            this.scene.add(ambientLight)
            var heimiSphereLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444)
            this.scene.add(heimiSphereLight)
            //创建平行光
            const dirLight = new this.$THREE.DirectionalLight(0xffffff,0.7)
            dirLight.position.set(0, 200, 100)
            dirLight.castShadow = true
            dirLight.shadow.camera.top = 180
            dirLight.shadow.camera.bottom = - 100
            dirLight.shadow.camera.left = - 120
            dirLight.shadow.camera.right = 120
            this.scene.add(dirLight)
            // this.scene.add(new this.$THREE.CameraHelper(dirLight.shadow.camera))
            // ground
            // const mesh = new this.$THREE.Mesh(new this.$THREE.PlaneGeometry(2000, 2000), new this.$THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
            // mesh.rotation.x = - Math.PI / 2
            // mesh.receiveShadow = true
            // this.scene.add(mesh)
            const grid = new this.$THREE.GridHelper(2000, 20, 0x000000, 0x000000)
            grid.material.opacity = 0.2
            grid.material.transparent = true
            this.scene.add(grid)
            //设置天空盒
            var cubetextureLoader = new this.$THREE.CubeTextureLoader()
            var cubetexture = cubetextureLoader.load([
                "@/assets/skybox/px.jpg",
                "@/assets/skybox/nx.jpg",
                "@/assets/skybox/py.jpg",
                "@/assets/skybox/ny.jpg",
                "@/assets/skybox/pz.jpg",
                "@/assets/skybox/nz.jpg"
            ])
            this.scene.background = cubetexture
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.shadowMap.enabled = true
            container.appendChild(this.renderer.domElement)
            const controls = new OrbitControls(this.camera, this.renderer.domElement)
            controls.target.set(0, 100, 0)
            controls.update()
            window.addEventListener('resize', this.onWindowResize)
        },
        loadModel(url) {
            // model
            const loader = new FBXLoader()
            loader.load(url, (object) => {
                obj = object
                this.mixer = new this.$THREE.AnimationMixer(object)
                //测试播放动画
                this.playAnim(0)
                //测试获取动画名称
                // var ss=getAnimNames()
                // for (let i = 0 i < ss.length i++)
                // {
                // 	console.log(ss[i])
                // }
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                this.scene.add(object)
            })
        },
        getAnimNames() {
            var names = new Array()
            if (obj) {
                for (let i = 0; i < obj.animations.length; i++)
                {
                    names[i] = obj.animations[i].name
                }
            }
            return names
        },
        playAnim(index) {
            if (obj&&obj.animations.length>0&&index>=0&&index<obj.animations.length) {
                const action = this.mixer.clipAction(obj.animations[ index ])
                action.play()
            }
        },
        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        },
        update() {
            requestAnimationFrame(this.update)
            const delta = this.clock.getDelta()
            if (this.mixer) this.mixer.update(delta)
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.threejs-container {
    width: 100%;
}
</style>
