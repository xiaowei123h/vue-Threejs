import Vue from 'vue'
import Router from 'vue-router'
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
          meta: {title: 'geometry_text', icon: 'webgl_geometry_text'}
        },
        {
          path: '/webglGeometryTextStroke',
          name: 'webglGeometryTextStroke',
          component: () => import('@/views/text/webglGeometryTextStroke'),
          meta: {title: 'geometry_text_stroke', icon: 'webgl_geometry_text_stroke'}
        },
        {
          path: '/webglGeometryTextShapes',
          name: 'webglGeometryTextShapes',
          component: () => import('@/views/text/webglGeometryTextShapes'),
          meta: {title: 'geometry_text_shapes', icon: 'webgl_geometry_text_shapes'}
        },
        {
          path: '/webglAnimationCloth',
          name: 'webglAnimationCloth',
          component: () => import('@/views/animation/webglAnimationCloth'),
          meta: {title: 'animation_cloth', icon: 'webgl_animation_cloth'}
        },
        {
          path: '/webglAnimationKeyframes',
          name: 'webglAnimationKeyframes',
          component: () => import('@/views/animation/webglAnimationKeyframes'),
          meta: {title: 'animation_keyframes', icon: 'webgl_animation_keyframes'}
        },
        {
          // 导入GLTF模型，打光两个方块,OrbitControls（轨道控制）
          path: '/webglMaterialsLightmap',
          name: 'webglMaterialsLightmap',
          component: () => import('@/views/webglMaterialsLightmap'),
          meta: {title: 'materials_lightmap', icon: 'webgl_materials_lightmap'}
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
    // {
    //   path: '/webglAnimationSkinningBlending',
    //   name: 'webglAnimationSkinningBlending',
    //   component: () => import('@/views/animation/webglAnimationSkinningBlending')
    // },
  ]
})
