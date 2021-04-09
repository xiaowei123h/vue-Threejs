<template>
    <div class="miscUvTests-container">
        <div class="canvas-container"></div>
    </div>
</template>

<script>
import { UVsDebug } from '@/components/jsm/utils/UVsDebug.js'
export default {
    data() {
        return {
            points: [],
        }
    },
    mounted() {
        for (var i = 0; i < 10; i ++) {
            this.points.push(new this.$THREE.Vector2(Math.sin(i * 0.2) * 15 + 50, (i - 5) * 2))
        }
        //
        this.test('new THREE.PlaneBufferGeometry(100, 100, 4, 4)', new this.$THREE.PlaneBufferGeometry(100, 100, 4, 4))
        this.test('new THREE.SphereBufferGeometry(75, 12, 6)', new this.$THREE.SphereBufferGeometry(75, 12, 6))
        this.test('new THREE.IcosahedronBufferGeometry(30, 1)', new this.$THREE.IcosahedronBufferGeometry(30, 1))
        this.test('new THREE.OctahedronBufferGeometry(30, 2)', new this.$THREE.OctahedronBufferGeometry(30, 2))
        this.test('new THREE.CylinderBufferGeometry(25, 75, 100, 10, 5)', new this.$THREE.CylinderBufferGeometry(25, 75, 100, 10, 5))
        this.test('new THREE.BoxBufferGeometry(100, 100, 100, 4, 4, 4)', new this.$THREE.BoxBufferGeometry(100, 100, 100, 4, 4, 4))
        this.test('new THREE.LatheBufferGeometry(points, 8)', new this.$THREE.LatheBufferGeometry(this.points, 8))
        this.test('new THREE.TorusBufferGeometry(50, 20, 8, 8)', new this.$THREE.TorusBufferGeometry(50, 20, 8, 8))
        this.test('new THREE.TorusKnotBufferGeometry(50, 10, 12, 6)', new this.$THREE.TorusKnotBufferGeometry(50, 10, 12, 6))
    },
    methods: {
        test(name, geometry) {
            var d = document.createElement('div')
            d.innerHTML = '<h3>' + name + '</h3>'
            d.appendChild(UVsDebug(geometry))
            console.log(UVsDebug(geometry))
            document.getElementsByClassName('canvas-container')[0].appendChild(d)
        }
    },
}
</script>

<style scoped>
.miscUvTests-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: auto;
    background: #ffffff;
    color: #000000;
    text-align: center;
    font-family: sans-serif;
}
h3 {
    margin-top: 60px;
    margin-bottom: 30px;
    font-weight: normal;
}
</style>

<style>
.canvas-container canvas {
    width: 100%;
}
</style>
