<template>
  <div id="container"></div>
</template>

<script>
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
export default {
  data () {
    return {
      vertexShader: '',
      shaderMaterials: {},
      cube: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 初始化
    init () {
      this.initShaderMaterialsData() // 初始化着色器材质
      this.createScene() // 创建场景
      this.createMesh() // 创建网格模型
      this.createLight() // 创建光源
      this.createCamera() // 创建相机
      this.createRender() // 创建渲染器
      this.createControls() // 创建控件对象
      this.render() // 渲染
    },
    initShaderMaterialsData () {
      this.vertexShader = `    
        uniform float time;
        varying vec2 vUv;
        void main()
        {
            vec3 posChanged = position;
            posChanged.x = posChanged.x*(abs(sin(time*1.0)));
            posChanged.y = posChanged.y*(abs(cos(time*1.0)));
            posChanged.z = posChanged.z*(abs(sin(time*1.0)));
            //gl_Position = projectionMatrix * modelViewMatrix * vec4(position*(abs(sin(time)/2.0)+0.5),1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(posChanged,1.0);
        }`
      this.shaderMaterials['fragment-shader-1'] = `precision highp float;
        uniform float time;
        uniform float alpha;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main2(void)
        {
            vec2 position = vUv;
            float red = 1.0;
            float green = 0.25 + sin(time) * 0.25;
            float blue = 0.0;
            vec3 rgb = vec3(red, green, blue);
            vec4 color = vec4(rgb, alpha);
            gl_FragColor = color;
        }

        #define PI 3.14159
        #define TWO_PI (PI*2.0)
        #define N 68.5

        void main(void)
        {
            vec2 center = (gl_FragCoord.xy);
            center.x=-10.12*sin(time/200.0);
            center.y=-10.12*cos(time/200.0);

            vec2 v = (gl_FragCoord.xy - resolution/20.0) / min(resolution.y,resolution.x) * 15.0;
            v.x=v.x-10.0;
            v.y=v.y-200.0;
            float col = 0.0;

            for(float i = 0.0; i < N; i++)
            {
            float a = i * (TWO_PI/N) * 61.95;
            col += cos(TWO_PI*(v.y * cos(a) + v.x * sin(a) + sin(time*0.004)*100.0 ));
            }
            col /= 5.0;
            gl_FragColor = vec4(col*1.0, -col*1.0,-col*4.0, 1.0);
        }`
      this.shaderMaterials['fragment-shader-2'] = `
        uniform float time;
        uniform vec2 resolution;
        #define CGFloat float
        #define M_PI 3.14159265359

        vec3 hsvtorgb(float h, float s, float v)
        {
            float c = v * s;
            h = mod((h * 6.0), 6.0);
            float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
            vec3 color;

            if (0.0 <= h && h < 1.0)
            {
            color = vec3(c, x, 0.0);
            }
            else if (1.0 <= h && h < 2.0)
            {
            color = vec3(x, c, 0.0);
            }
            else if (2.0 <= h && h < 3.0)
            {
            color = vec3(0.0, c, x);
            }
            else if (3.0 <= h && h < 4.0)
            {
            color = vec3(0.0, x, c);
            }
            else if (4.0 <= h && h < 5.0)
            {
            color = vec3(x, 0.0, c);
            }
            else if (5.0 <= h && h < 6.0)
            {
            color = vec3(c, 0.0, x);
            }
            else
            {
            color = vec3(0.0);
            }

            color += v - c;

            return color;
        }

        void main(void)
        {

            vec2 position = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;
            float x = position.x;
            float y = position.y;

            CGFloat a = atan(x, y);

            CGFloat d = sqrt(x*x+y*y);
            CGFloat d0 = 0.5*(sin(d-time)+1.5)*d;
            CGFloat d1 = 5.0;

            CGFloat u = mod(a*d1+sin(d*10.0+time), M_PI*2.0)/M_PI*0.5 - 0.5;
            CGFloat v = mod(pow(d0*4.0, 0.75),1.0) - 0.5;

            CGFloat dd = sqrt(u*u+v*v);

            CGFloat aa = atan(u, v);

            CGFloat uu = mod(aa*3.0+3.0*cos(dd*30.0-time), M_PI*2.0)/M_PI*0.5 - 0.5;

            CGFloat d2 = sqrt(uu*uu+v*v)*1.5;

            gl_FragColor = vec4( hsvtorgb(dd+time*0.5/d1, sin(dd*time), d2), 1.0 );
        }`
      this.shaderMaterials['fragment-shader-3'] = `uniform vec2 resolution;
        uniform float time;
        vec2 rand(vec2 pos)
        {
            return fract( 0.00005 * (pow(pos+2.0, pos.yx + 1.0) * 22222.0));
        }
        vec2 rand2(vec2 pos)
        {
            return rand(rand(pos));
        }

        float softnoise(vec2 pos, float scale)
        {
            vec2 smplpos = pos * scale;
            float c0 = rand2((floor(smplpos) + vec2(0.0, 0.0)) / scale).x;
            float c1 = rand2((floor(smplpos) + vec2(1.0, 0.0)) / scale).x;
            float c2 = rand2((floor(smplpos) + vec2(0.0, 1.0)) / scale).x;
            float c3 = rand2((floor(smplpos) + vec2(1.0, 1.0)) / scale).x;

            vec2 a = fract(smplpos);
            return mix(
            mix(c0, c1, smoothstep(0.0, 1.0, a.x)),
            mix(c2, c3, smoothstep(0.0, 1.0, a.x)),
            smoothstep(0.0, 1.0, a.y));
        }

        void main(void)
        {
            vec2 pos = gl_FragCoord.xy / resolution.y;
            pos.x += time * 0.1;
            float color = 0.0;
            float s = 1.0;
            for(int i = 0; i < 8; i++)
            {
            color += softnoise(pos+vec2(i)*0.02, s * 4.0) / s / 2.0;
            s *= 2.0;
            }
            gl_FragColor = vec4(color);
        }`
      this.shaderMaterials['fragment-shader-4'] = `uniform float time;
        uniform vec2 resolution;
        vec2 rand(vec2 pos)
        {
            return fract((pow(pos+2.0,pos.yx+2.0)*555555.0));
        }

        vec2 rand2(vec2 pos)
        {
            return rand(rand(pos));
        }

        float softnoise(vec2 pos, float scale) {
            vec2 smplpos = pos * scale;
            float c0 = rand2((floor(smplpos) + vec2(0.0, 0.0)) / scale).x;
            float c1 = rand2((floor(smplpos) + vec2(1.0, 0.0)) / scale).x;
            float c2 = rand2((floor(smplpos) + vec2(0.0, 1.0)) / scale).x;
            float c3 = rand2((floor(smplpos) + vec2(1.0, 1.0)) / scale).x;

            vec2 a = fract(smplpos);
            return mix(mix(c0, c1, smoothstep(0.0, 1.0, a.x)),
            mix(c2, c3, smoothstep(0.0, 1.0, a.x)),
            smoothstep(0.0, 1.0, a.x));
        }

        void main( void ) {
            vec2 pos = gl_FragCoord.xy / resolution.y - time * 0.4;

            float color = 0.0;
            float s = 1.0;
            for (int i = 0; i < 6; ++i) {
            color += softnoise(pos + vec2(0.01 * float(i)), s * 4.0) / s / 2.0;
            s *= 2.0;
            }
            gl_FragColor = vec4(color,mix(color,cos(color),sin(color)),color,1);
        }`
      this.shaderMaterials['fragment-shader-5'] = `uniform float time;
        uniform vec2 resolution;
        void main( void ) {

            vec3 color = vec3(1.0, 0., 0.);
            vec2 pos = (( 1.4 * gl_FragCoord.xy - resolution.xy) / resolution.xx)*1.5;
            float r=sqrt(pos.x*pos.x+pos.y*pos.y)/15.0;
            float size1=2.0*cos(time/60.0);
            float size2=2.5*sin(time/12.1);

            float rot1=13.00; //82.0+16.0*sin(time/4.0);
            float rot2=-50.00; //82.0+16.0*sin(time/8.0);
            float t=sin(time);
            float a = (60.0)*sin(rot1*atan(pos.x-size1*pos.y/r,pos.y+size1*pos.x/r)+time);
            a += 200.0*acos(pos.x*2.0+cos(time/2.0))+asin(pos.y*5.0+sin(time/2.0));
            a=a*(r/50.0);
            a=200.0*sin(a*5.0)*(r/30.0);
            if(a>5.0) a=a/200.0;
            if(a<0.5) a=a*22.5;
            gl_FragColor = vec4( cos(a/20.0),a*cos(a/200.0),sin(a/8.0), 1.0 );
        }`
      this.shaderMaterials['fragment-shader-6'] = `uniform float time;
        uniform vec2 resolution;
        void main( void )
        {

            vec2 uPos = ( gl_FragCoord.xy / resolution.xy );//normalize wrt y axis
            //suPos -= vec2((resolution.x/resolution.y)/2.0, 0.0);//shift origin to center

            uPos.x -= 1.0;
            uPos.y -= 0.5;

            vec3 color = vec3(0.0);
            float vertColor = 2.0;
            for( float i = 0.0; i < 15.0; ++i )
            {
            float t = time * (0.9);
            uPos.y += sin( uPos.x*i + t+i/2.0 ) * 0.1;
            float fTemp = abs(1.0 / uPos.y / 100.0);
            vertColor += fTemp;
            color += vec3( fTemp*(10.0-i)/10.0, fTemp*i/10.0, pow(fTemp,1.5)*1.5 );
            }
            vec4 color_final = vec4(color, 1.0);
            gl_FragColor = color_final;
        }`
    },
    // 创建场景
    createScene () {
      this.scene = new this.$THREE.Scene()
    },
    // 创建网格模型
    createMesh () {
      const cubeGeometry = new this.$THREE.BoxGeometry(20, 20, 20) // 创建方块几何对象

      const meshMaterial1 = this.createMaterial('fragment-shader-1')
      const meshMaterial2 = this.createMaterial('fragment-shader-2')
      const meshMaterial3 = this.createMaterial('fragment-shader-3')
      const meshMaterial4 = this.createMaterial('fragment-shader-4')
      const meshMaterial5 = this.createMaterial('fragment-shader-5')
      const meshMaterial6 = this.createMaterial('fragment-shader-6')

      const material = [
        meshMaterial1,
        meshMaterial2,
        meshMaterial3,
        meshMaterial4,
        meshMaterial5,
        meshMaterial6
      ]

      this.cube = new this.$THREE.Mesh(cubeGeometry, material)

      // 方块添加到场景
      this.scene.add(this.cube)
    },
    // 创建着色器材质
    createMaterial (fragmentShader) {
      // 通过uniforms属性传递的变量可以在着色器程序中使用
      const uniforms = {
        time: {
          type: 'f',
          value: 0.2
        },
        scale: {
          type: 'f',
          value: 0.2
        },
        alpha: {
          type: 'f',
          value: 0.6
        },
        resolution: {
          type: 'v2',
          value: new this.$THREE.Vector2()
        }
      }

      const element = document.getElementById('container')
      uniforms.resolution.value.x = element.clientWidth
      uniforms.resolution.value.y = element.clientHeight

      const meshMaterial = new this.$THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: this.vertexShader,
        fragmentShader: this.shaderMaterials[fragmentShader],
        transparent: true
      })

      return meshMaterial
    },

    // 创建光源
    createLight () {
      // 环境光
      const ambientLight = new this.$THREE.AmbientLight(0xffffff, 0.1) // 创建环境光
      this.scene.add(ambientLight) // 将环境光添加到场景

      const spotLight = new this.$THREE.SpotLight(0xffffff) // 创建聚光灯
      spotLight.position.set(-40, 60, -10)
      spotLight.castShadow = true
      this.scene.add(spotLight)
    },
    // 创建相机
    createCamera () {
      const element = document.getElementById('container')
      const width = element.clientWidth // 窗口宽度
      const height = element.clientHeight // 窗口高度
      const k = width / height // 窗口宽高比
      // PerspectiveCamera( fov, aspect, near, far )
      this.camera = new this.$THREE.PerspectiveCamera(35, k, 0.1, 1000)
      this.camera.position.set(-80, 60, 40) // 设置相机位置

      this.camera.lookAt(new this.$THREE.Vector3(10, 0, 0)) // 设置相机方向
      this.scene.add(this.camera)
    },
    // 创建渲染器
    createRender () {
      const element = document.getElementById('container')
      this.renderer = new this.$THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setSize(element.clientWidth, element.clientHeight) // 设置渲染区域尺寸
      this.renderer.shadowMap.enabled = true // 显示阴影
      this.renderer.shadowMap.type = this.$THREE.PCFSoftShadowMap
      this.renderer.setClearColor(new this.$THREE.Color(0x000000, 1.0)) // 设置背景颜色
      element.appendChild(this.renderer.domElement)
    },

    // 更新属性
    updateFun () {
      this.cube.rotation.y += 0.01
      this.cube.rotation.x += 0.01
      this.cube.rotation.z += 0.01
      this.cube.material.forEach(function (e) {
        e.uniforms.time.value += 0.01
      })
    },
    render () {
      this.updateFun()
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.render)
    },
    // 创建控件对象
    createControls () {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    }
  }
}
</script>
<style>
#container {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>