<template>
    <div class="webglShadersVector-container">
        <div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - Resolution-Independent Vector Fonts. <a href="https://github.com/mrdoob/three.js/issues/4746">info</a>.
		</div>
    </div>
</template>

<script>
import { OrbitControls } from '@/components/jsm/controls/OrbitControls.js'
export default {
    data() {
        return {
            fs: null,
            vs: null,
            stats: null,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
			group: null,
			loader: null,
        }
    },
    mounted() {
        this.fs = `
            varying vec2 vUv;
			varying float flip;
			uniform vec3 color;
			float inCurve(vec2 uv) {
				return uv.x * uv.x - uv.y;
			}
			float delta = 0.1;
			void main() {
				float x = inCurve(vUv);
				if (x * flip > 0.) discard;
				gl_FragColor = vec4(color, 1.);
            }`
        this.vs = `
            varying vec2 vUv;
			attribute float invert;
			varying float flip;
			void main() {
				vUv = uv;
				flip = invert;
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_Position = projectionMatrix * mvPosition;
            }`
        this.loader = new this.$THREE.FontLoader();
        this.loader.load('static/fonts/helvetiker_regular.typeface.json', (font) => {
            this.init(font);
            this.animate();
        })
    },
    methods: {
        init(font) {
            this.camera = new this.$THREE.PerspectiveCamera(50, this.$webglInnerWidth / window.innerHeight, 1, 10000);
            this.camera.position.set(50, 100, 500);
            this.scene = new this.$THREE.Scene();
            this.scene.background = new this.$THREE.Color(0xf0f0f0);
            var theText = '&'; // i % & j b 8
            this.group = new this.$THREE.Group();
            this.scene.add(this.group);
            var textMaterial = new this.$THREE.MeshBasicMaterial({
                color: new this.$THREE.Color(0, 0, 1),
                side: this.$THREE.DoubleSide,
                wireframe: true
            });
            var textShapes = font.generateShapes(theText, 180);
            var geometry = new this.$THREE.ShapeBufferGeometry(textShapes);
            var text = new this.$THREE.Mesh(geometry, textMaterial);
            text.position.x = - 200;
            this.group.add(text);
            //
            var vA = new this.$THREE.Vector2();
            var vB = new this.$THREE.Vector2();
            var that = this
            function processShape(path) {
                var pts = []; // bigger area (convex hull)
                var pts2 = []; // smaller area (full solid shapes)
                var beziers = []; // quad bezier points
                var invert = [];
                var z;
                var wind;
                pts.push(path[ 0 ].getPoint(0, new that.$THREE.Vector2()));
                pts2.push(path[ 0 ].getPoint(0, new that.$THREE.Vector2()));
                for (var i = 0; i < path.length; i ++) {
                    var curve = path[ i ];
                    if (curve instanceof that.$THREE.LineCurve) {
                        pts.push(curve.v2);
                        pts2.push(curve.v2);
                    } else if (curve instanceof that.$THREE.QuadraticBezierCurve) {
                        vA = vA.subVectors(curve.v1, curve.v0);
                        vB = vB.subVectors(curve.v2, curve.v1);
                        z = vA.x * vB.y - vA.y * vB.x; // z component of cross Production
                        wind = z < 0; // clockwise/anticlock wind
                        if (wind) {
                            pts.push(curve.v1);
                            pts.push(curve.v2);
                            pts2.push(curve.v2);
                        } else {
                            pts.push(curve.v2);
                            pts2.push(curve.v1);
                            pts2.push(curve.v2);
                        }
                        var flip = wind ? 1 : - 1;
                        // if (reverse) flip *= -1;
                        invert.push(flip, flip, flip);
                        beziers.push(curve.v0, curve.v1, curve.v2);
                    }
                }
                return {
                    pts: pts,
                    pts2: pts2,
                    beziers: beziers,
                    invert: invert
                };
            }
            var pts, pts2;
            var subshape;
            var convexhullShape;
            var solidShape;
            var convexhullShapeGroup = [];
            var solidShapeGroup = [];
            var beziers = [], invert = [];
            var process;
            var hole;
            for (var s = 0; s < textShapes.length; s ++) {
                subshape = textShapes[ s ];
                process = processShape(subshape.curves);
                pts = process.pts;
                pts2 = process.pts2;
                beziers = beziers.concat(process.beziers);
                invert = invert.concat(process.invert);
                convexhullShape = new this.$THREE.Shape(pts);
                solidShape = new this.$THREE.Shape(pts2);
                convexhullShapeGroup.push(convexhullShape);
                solidShapeGroup.push(solidShape);
                for (var i = 0; i < subshape.holes.length; i ++) {
                    hole = subshape.holes[ i ];
                    process = processShape(hole.curves);
                    pts = process.pts;
                    pts2 = process.pts2;
                    beziers = beziers.concat(process.beziers);
                    invert = invert.concat(process.invert);
                    convexhullShape.holes.push(new this.$THREE.Shape(pts));
                    solidShape.holes.push(new this.$THREE.Shape(pts2));
                }
            } // end of subshape
            var bezierGeometry = new this.$THREE.BufferGeometry();
            var vertices = [];
            var uvs = [];
            for (var i = 0; i < beziers.length; i ++) {
                var p = beziers[ i ];
                vertices.push(p.x, p.y, 0);
            }
            for (var i = 0; i < beziers.length; i += 3) {
                uvs.push(0, 0, 0.5, 0, 1, 1);
            }
            bezierGeometry.setAttribute('position', new this.$THREE.Float32BufferAttribute(vertices, 3));
            bezierGeometry.setAttribute('uv', new this.$THREE.Float32BufferAttribute(uvs, 2));
            bezierGeometry.setAttribute('invert', new this.$THREE.Float32BufferAttribute(invert, 1));
            geometry = new this.$THREE.ShapeBufferGeometry(convexhullShapeGroup);
            text = new this.$THREE.Mesh(geometry, textMaterial);
            text.position.x = 200;
            this.group.add(text);
            geometry = new this.$THREE.ShapeBufferGeometry(solidShapeGroup);
            text = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ color: new this.$THREE.Color(1, 0, 0), side: this.$THREE.DoubleSide, wireframe: true }));
            text.position.x = 200;
            this.group.add(text);
            //
            var newMaterial = new this.$THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new this.$THREE.Color(0.45 * 0xffffff) }
                },
                vertexShader: this.vs,
                fragmentShader: this.fs,
                side: this.$THREE.DoubleSide
            });
            text = new this.$THREE.Mesh(bezierGeometry, newMaterial);
            text.rotation.y = Math.PI * 2;
            this.group.add(text);
            //
            geometry = new this.$THREE.ShapeBufferGeometry(solidShapeGroup);
            text = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ color: 0.45 * 0xffffff, side: this.$THREE.DoubleSide }));
            text.rotation.y = Math.PI * 2;
            this.group.add(text);
            //
            this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$webglInnerWidth, window.innerHeight);
            document.getElementsByClassName('webglShadersVector-container')[0].appendChild(this.renderer.domElement);
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.set(50, 100, 0);
            this.controls.update();
            this.stats = new this.$Stats();
            this.$statsPosition(this.stats)
            document.getElementsByClassName('webglShadersVector-container')[0].appendChild(this.stats.dom);
            window.addEventListener('resize', this.onWindowResize, false);
        },
        onWindowResize() {
            this.$onWindowResize(this.camera, this.renderer)
            this.$statsPosition(this.stats)
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.render();
            this.stats.update();
        },
        render() {
            this.renderer.render(this.scene, this.camera);
        }
    },
}
</script>

<style scoped>
.webglShadersVector-contianer {
    position: relative;
    width: 100%;
}
#info {
    background-color: #f0f0f0;
    color: #444;
}
#info a {
    color: #08f;
}
</style>
