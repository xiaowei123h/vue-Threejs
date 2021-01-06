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
        },
        {
            path: '/webglAnimationMultiple',
            name: 'webglAnimationMultiple',
            component: () => import('@/views/animation/webglAnimationMultiple'),
            meta: {title: 'animation_multiple', icon: 'webgl_animation_multiple'}
        },
        {
            path: '/webglAnimationSkinningMorph',
            name: 'webglAnimationSkinningMorph',
            component: () => import('@/views/animation/webglAnimationSkinningMorph'),
            meta: {title: 'animation_skinning_morph', icon: 'webgl_animation_skinning_morph'}
        },
        {
            path: '/webglBuffergeometryConstructedFromGeometry',
            name: 'webglBuffergeometryConstructedFromGeometry',
            component: () => import('@/views/buffergeometry/webglBuffergeometryConstructedFromGeometry'),
            meta: {title: 'buffergeometry_constructed_from_geometry', icon: 'webgl_buffergeometry_constructed_from_geometry'}
        },
        {
            path: '/webglBuffergeometryGlbufferattribute',
            name: 'webglBuffergeometryGlbufferattribute',
            component: () => import('@/views/buffergeometry/webglBuffergeometryGlbufferattribute'),
            meta: {title: 'buffergeometry_glbufferattribute', icon: 'webgl_buffergeometry_glbufferattribute'}
        },
        {
            path: '/webglBuffergeometryIndexed',
            name: 'webglBuffergeometryIndexed',
            component: () => import('@/views/buffergeometry/webglBuffergeometryIndexed'),
            meta: {title: 'buffergeometry_indexed', icon: 'webgl_buffergeometry_indexed'}
        },
        {
            path: '/webglBuffergeometryInstancingInterleaved',
            name: 'webglBuffergeometryInstancingInterleaved',
            component: () => import('@/views/buffergeometry/webglBuffergeometryInstancingInterleaved'),
            meta: {title: 'buffergeometry_instancing_interleaved', icon: 'webgl_buffergeometry_instancing_interleaved'}
        },
        {
            path: '/webglBuffergeometryInstancing',
            name: 'webglBuffergeometryInstancing',
            component: () => import('@/views/buffergeometry/webglBuffergeometryInstancing'),
            meta: {title: 'buffergeometry_instancing', icon: 'webgl_buffergeometry_instancing'}
        },
        {
            path: '/webglBuffergeometryLinesIndexed',
            name: 'webglBuffergeometryLinesIndexed',
            component: () => import('@/views/buffergeometry/webglBuffergeometryLinesIndexed'),
            meta: {title: 'buffergeometry_lines_indexed', icon: 'webgl_buffergeometry_lines_indexed'}
        },
        {
            path: '/webglBuffergeometryLines',
            name: 'webglBuffergeometryLines',
            component: () => import('@/views/buffergeometry/webglBuffergeometryLines'),
            meta: {title: 'buffergeometry_lines', icon: 'webgl_buffergeometry_lines'}
        },
        {
            path: '/webglBuffergeometryMorphtargets',
            name: 'webglBuffergeometryMorphtargets',
            component: () => import('@/views/buffergeometry/webglBuffergeometryMorphtargets'),
            meta: {title: 'buffergeometry_morphtargets', icon: 'webgl_buffergeometry_morphtargets'}
        },
        {
            path: '/webglBuffergeometryPointsInterleaved',
            name: 'webglBuffergeometryPointsInterleaved',
            component: () => import('@/views/buffergeometry/webglBuffergeometryPointsInterleaved'),
            meta: {title: 'buffergeometry_points_interleaved', icon: 'webgl_buffergeometry_points_interleaved'}
        },
        {
            path: '/webglBuffergeometryPoints',
            name: 'webglBuffergeometryPoints',
            component: () => import('@/views/buffergeometry/webglBuffergeometryPoints'),
            meta: {title: 'buffergeometry_points', icon: 'webgl_buffergeometry_points'}
        },
        {
            path: '/webglBuffergeometryRawshader',
            name: 'webglBuffergeometryRawshader',
            component: () => import('@/views/buffergeometry/webglBuffergeometryRawshader'),
            meta: {title: 'buffergeometry_rawshader', icon: 'webgl_buffergeometry_rawshader'}
        },
        {
            path: '/webglBuffergeometrySelectiveDraw',
            name: 'webglBuffergeometrySelectiveDraw',
            component: () => import('@/views/buffergeometry/webglBuffergeometrySelectiveDraw'),
            meta: {title: 'buffergeometry_selective_draw', icon: 'webgl_buffergeometry_selective_draw'}
        },
        {
            path: '/webglBuffergeometryUint',
            name: 'webglBuffergeometryUint',
            component: () => import('@/views/buffergeometry/webglBuffergeometryUint'),
            meta: {title: 'buffergeometry_uint', icon: 'webgl_buffergeometry_uint'}
        },
        {
            path: '/webglBuffergeometry',
            name: 'webglBuffergeometry',
            component: () => import('@/views/buffergeometry/webglBuffergeometry'),
            meta: {title: 'buffergeometry', icon: 'webgl_buffergeometry'}
        },
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
    //     path: '/webglBuffergeometryInstancingBillboards',
    //     name: 'webglBuffergeometryInstancingBillboards',
    //     component: () => import('@/views/buffergeometry/webglBuffergeometryInstancingBillboards'),
    //     meta: {title: 'buffergeometry_instancing_billboards', icon: 'webgl_buffergeometry_instancing_billboards'}
    // },
    // {
    //     path: '/webglBuffergeometryDrawrange',
    //     name: 'webglBuffergeometryDrawrange',
    //     component: () => import('@/views/buffergeometry/webglBuffergeometryDrawrange'),
    //     meta: {title: 'buffergeometry_drawrange', icon: 'webgl_buffergeometry_drawrange'}
    // },
    // {
    //     path: '/webglBuffergeometryCustomAttributesParticles',
    //     name: 'webglBuffergeometryCustomAttributesParticles',
    //     component: () => import('@/views/buffergeometry/webglBuffergeometryCustomAttributesParticles'),
    //     meta: {title: 'buffergeometry_custom_attributes_particles', icon: 'webgl_buffergeometry_custom_attributes_particles'}
    // },
    // {
    //     path: '/webglBuffergeometryCompression',
    //     name: 'webglBuffergeometryCompression',
    //     component: () => import('@/views/buffergeometry/webglBuffergeometryCompression'),
    //     meta: {title: 'buffergeometry_compression', icon: 'webgl_buffergeometry_compression'}
    // },
    // {
    //     path: '/webglAnimationSkinningAdditiveBlending',
    //     name: 'webglAnimationSkinningAdditiveBlending',
    //     component: () => import('@/views/animation/webglAnimationSkinningAdditiveBlending'),
    //     meta: {title: 'skinning_additive_blending', icon: 'webgl_animation_skinning_additive_blending'}
    // },
    // {
    //   path: '/webglAnimationSkinningBlending',
    //   name: 'webglAnimationSkinningBlending',
    //   component: () => import('@/views/animation/webglAnimationSkinningBlending')
    // },
  ]
})
