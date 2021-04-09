<template>
    <div class="svgSandbox-container">
        <div id="line-cont"></div>
    </div>
</template>

<script>
import { SVGRenderer, SVGObject } from '@/components/jsm/renderers/SVGRenderer.js'
export default {
    data() {
        return {
            camera: null,
            scene: null,
            renderer: null,
            stats: null,
			group: null,
        }
    },
    mounted() {
        this.init()
		this.animate()
    },
    methods: {
        init() {
            this.camera = new this.$moduleTHREE.PerspectiveCamera( 75, this.$webglInnerWidth / window.innerHeight, 1, 10000 )
            this.camera.position.z = 500
            this.scene = new this.$moduleTHREE.Scene()
            this.scene.background = new this.$moduleTHREE.Color(0xf0f0f0)
            // QRCODE
            var loader = new this.$moduleTHREE.BufferGeometryLoader()
            loader.load('static/models/json/QRCode_buffergeometry.json', (geometry) => {
                mesh = new this.$moduleTHREE.Mesh(geometry, new this.$moduleTHREE.MeshLambertMaterial({ vertexColors: true }))
                mesh.scale.x = mesh.scale.y = mesh.scale.z = 2
                this.scene.add(mesh)
            })
            // CUBES
            var boxGeometry = new this.$moduleTHREE.BoxBufferGeometry(100, 100, 100)
            var mesh = new this.$moduleTHREE.Mesh(boxGeometry, new this.$moduleTHREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true }))
            mesh.position.x = 500
            mesh.rotation.x = Math.random()
            mesh.rotation.y = Math.random()
            mesh.scale.x = mesh.scale.y = mesh.scale.z = 2
            this.scene.add(mesh)
            mesh = new this.$moduleTHREE.Mesh(boxGeometry, new this.$moduleTHREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }))
            mesh.position.x = 500
            mesh.position.y = 500
            mesh.rotation.x = Math.random()
            mesh.rotation.y = Math.random()
            mesh.scale.x = mesh.scale.y = mesh.scale.z = 2
            this.scene.add(mesh)
            // PLANE
            mesh = new this.$moduleTHREE.Mesh(new this.$moduleTHREE.PlaneBufferGeometry(100, 100), new this.$moduleTHREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: this.$moduleTHREE.DoubleSide }))
            mesh.position.y = - 500
            mesh.scale.x = mesh.scale.y = mesh.scale.z = 2
            this.scene.add(mesh)
            // CYLINDER
            mesh = new this.$moduleTHREE.Mesh(new this.$moduleTHREE.CylinderBufferGeometry(20, 100, 200, 10), new this.$moduleTHREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }))
            mesh.position.x = - 500
            mesh.rotation.x = - Math.PI / 2
            mesh.scale.x = mesh.scale.y = mesh.scale.z = 2
            this.scene.add(mesh)
            // POLYFIELD
            var geometry = new this.$moduleTHREE.BufferGeometry()
            var material = new this.$moduleTHREE.MeshBasicMaterial({ vertexColors: true, side: this.$moduleTHREE.DoubleSide })
            var v = new this.$moduleTHREE.Vector3()
            var v0 = new this.$moduleTHREE.Vector3()
            var v1 = new this.$moduleTHREE.Vector3()
            var v2 = new this.$moduleTHREE.Vector3()
            var color = new this.$moduleTHREE.Color()
            var vertices = []
            var colors = []
            for (var i = 0; i < 100; i ++) {
                v.set(
                    Math.random() * 1000 - 500,
                    Math.random() * 1000 - 500,
                    Math.random() * 1000 - 500
                )
                v0.set(
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50
                )
                v1.set(
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50
                )
                v2.set(
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50
                )
                v0.add(v)
                v1.add(v)
                v2.add(v)
                color.setHex(Math.random() * 0xffffff)
                // create a single triangle
                vertices.push(v0.x, v0.y, v0.z)
                vertices.push(v1.x, v1.y, v1.z)
                vertices.push(v2.x, v2.y, v2.z)
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
                colors.push(color.r, color.g, color.b)
            }
            geometry.setAttribute('position', new this.$moduleTHREE.Float32BufferAttribute(vertices, 3))
            geometry.setAttribute('color', new this.$moduleTHREE.Float32BufferAttribute(colors, 3))
            this.group = new this.$moduleTHREE.Mesh(geometry, material)
            this.group.scale.set(2, 2, 2)
            console.log(this.group)
            this.scene.add(this.group)
            // SPRITES
            for (var i = 0; i < 50; i ++) {
                var material = new this.$moduleTHREE.SpriteMaterial({ color: Math.random() * 0xffffff })
                var sprite = new this.$moduleTHREE.Sprite(material)
                sprite.position.x = Math.random() * 1000 - 500
                sprite.position.y = Math.random() * 1000 - 500
                sprite.position.z = Math.random() * 1000 - 500
                sprite.scale.set(64, 64, 1)
                this.scene.add(sprite)
            }
            // // CUSTOM
            var node = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            node.setAttribute('stroke', 'black')
            node.setAttribute('fill', 'red')
            node.setAttribute('r', '40')
            for (var i = 0; i < 50; i ++) {
                var object = new SVGObject(node.cloneNode())
                object.position.x = Math.random() * 1000 - 500
                object.position.y = Math.random() * 1000 - 500
                object.position.z = Math.random() * 1000 - 500
                this.scene.add(object)
            }
            // CUSTOM FROM FILE
            var fileLoader = new this.$moduleTHREE.FileLoader()
            fileLoader.load('static/models/svg/hexagon.svg', (svg) => {
                var node = document.createElementNS('http://www.w3.org/2000/svg', 'g')
                var parser = new DOMParser()
                var doc = parser.parseFromString(svg, 'image/svg+xml')
                node.appendChild(doc.documentElement)
                var object = new SVGObject(node)
                object.position.x = 500
                this.scene.add(object)
            })
            // LIGHTS
            var ambient = new this.$moduleTHREE.AmbientLight(0x80ffff)
            this.scene.add(ambient)
            var directional = new this.$moduleTHREE.DirectionalLight(0xffff00)
            directional.position.set(- 1, 0.5, 0)
            this.scene.add(directional)
            this.renderer = new SVGRenderer()
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight)
            this.renderer.setQuality('low')
            document.getElementsByClassName('svgSandbox-container')[0].appendChild(this.renderer.domElement)
            this.stats = new this.$Stats()
            this.$statsPosition(this.stats)
            document.getElementsByClassName('svgSandbox-container')[0].appendChild(this.stats.dom)
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
            this.stats.update()
        },
        render() {
            var time = Date.now() * 0.0002
            this.camera.position.x = Math.sin(time) * 500
            this.camera.position.z = Math.cos(time) * 500
            this.camera.lookAt(this.scene.position)
            this.group.rotation.x += 0.01
            this.renderer.render(this.scene, this.camera)
        }
    },
}
</script>

<style scoped>
.svgSandbox-container {
    position: relative;
    width: 100%;
}
.svgSandbox-container svg {
    display: block;
}
</style>
