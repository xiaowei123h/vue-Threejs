import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Layout from '@/layout'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Layout,
      children: [
        {
          path: '/webglGeometryText',
          name: 'Setone',
          component: () => import('@/views/text/webglGeometryText'),
          meta: {title: 'webgl_geometry_text', icon: 'webgl_geometry_text'}
        }
      ]
    },
    {
      path: '/set',
      name: 'set',
      component: Layout,
      children: [
        {
          path: '/set',
          name: 'Set',
          component: () => import('@/views/test'),
          meta: {title: '个人中心', icon: 'form'}
        },
        {
          path: '/setone',
          name: 'Setone',
          component: () => import('@/views/text/webglGeometryText'),
          meta: {title: '123', icon: 'form'}
        }
      ]
    },
    {
      path: '/webgl2',
      name: 'webgl2',
      component: () => import('@/views/testWebgl')
    },
    {
      // 初始化着色器材质使用方法
      path: '/demo',
      name: 'demo',
      component: () => import('@/views/demo')
    },
    {
      path: '/testLine',
      name: 'testLine',
      component: () => import('@/views/testLine')
    },
    {
      // 创建文字，改变文字字体大小粗细颜色
      path: '/webglGeometryText',
      name: 'webglGeometryText',
      component: () => import('@/views/text/webglGeometryText')
    },
    {
      // 文字
      path: '/webglGeometryTextStroke',
      name: 'webglGeometryTextStroke',
      component: () => import('@/views/text/webglGeometryTextStroke')
    },
    {
      // 文字
      path: '/webglGeometryTextShapes',
      name: 'webglGeometryTextShapes',
      component: () => import('@/views/text/webglGeometryTextShapes')
    },
    {
      path: '/webglAnimationCloth',
      name: 'webglAnimationCloth',
      component: () => import('@/views/animation/webglAnimationCloth')
    },
    {
      path: '/webglAnimationKeyframes',
      name: 'webglAnimationKeyframes',
      component: () => import('@/views/animation/webglAnimationKeyframes')
    },
    // {
    //   path: '/webglAnimationSkinningBlending',
    //   name: 'webglAnimationSkinningBlending',
    //   component: () => import('@/views/animation/webglAnimationSkinningBlending')
    // },
    {
      // 导入GLTF模型，打光两个方块,OrbitControls（轨道控制）
      path: '/webglMaterialsLightmap',
      name: 'webglMaterialsLightmap',
      component: () => import('@/views/webglMaterialsLightmap')
    },
    {
      path: '/hello',
      name: 'HelloWorld',
      component: HelloWorld
    },
    
  ]
})
