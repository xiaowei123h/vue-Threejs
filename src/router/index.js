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
          component: () => import('@/views/geometries/webglGeometryText'),
          meta: {title: 'geometry_text', icon: 'webgl_geometry_text'}
        },
        {
          path: '/webglGeometryTextStroke',
          name: 'webglGeometryTextStroke',
          component: () => import('@/views/geometries/webglGeometryTextStroke'),
          meta: {title: 'geometry_text_stroke', icon: 'webgl_geometry_text_stroke'}
        },
        {
          path: '/webglGeometryTextShapes',
          name: 'webglGeometryTextShapes',
          component: () => import('@/views/geometries/webglGeometryTextShapes'),
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
        {
            path: '/webglCameraCinematic',
            name: 'webglCameraCinematic',
            component: () => import('@/views/camera/webglCameraCinematic'),
            meta: {title: 'camera_cinematic', icon: 'webgl_camera_cinematic'}
        },
        {
            path: '/webglClipping',
            name: 'webglClipping',
            component: () => import('@/views/clipping/webglClipping'),
            meta: {title: 'clipping', icon: 'webgl_clipping'}
        },
        {
            path: '/webglClippingIntersection',
            name: 'webglClippingIntersection',
            component: () => import('@/views/clipping/webglClippingIntersection'),
            meta: {title: 'webgl_clipping_intersection', icon: 'webgl_clipping_intersection'}
        },
        {
            path: '/webglCustomAttributesLines',
            name: 'webglCustomAttributesLines',
            component: () => import('@/views/custom/webglCustomAttributesLines'),
            meta: {title: 'custom_attributes_lines', icon: 'webgl_custom_attributes_lines'}
        },
        {
            path: '/webglCustomAttributes',
            name: 'webglCustomAttributes',
            component: () => import('@/views/custom/webglCustomAttributes'),
            meta: {title: 'custom_attributes', icon: 'webgl_custom_attributes'}
        },
        {
            path: '/webglCustomAttributesPoints',
            name: 'webglCustomAttributesPoints',
            component: () => import('@/views/custom/webglCustomAttributesPoints'),
            meta: {title: 'custom_attributes_points', icon: 'webgl_custom_attributes_points'}
        },
        {
            path: '/webglCustomAttributesPoints2',
            name: 'webglCustomAttributesPoints2',
            component: () => import('@/views/custom/webglCustomAttributesPoints2'),
            meta: {title: 'custom_attributes_points2', icon: 'webgl_custom_attributes_points2'}
        },
        {
            path: '/webglCustomAttributesPoints3',
            name: 'webglCustomAttributesPoints3',
            component: () => import('@/views/custom/webglCustomAttributesPoints3'),
            meta: {title: 'custom_attributes_points3', icon: 'webgl_custom_attributes_points3'}
        },
        {
            path: '/webglDepthTexture',
            name: 'webglDepthTexture',
            component: () => import('@/views/depth/webglDepthTexture'),
            meta: {title: 'depth_texture', icon: 'webgl_depth_texture'}
        },
        {
            path: '/webglEffectsAscii',
            name: 'webglEffectsAscii',
            component: () => import('@/views/effects/webglEffectsAscii'),
            meta: {title: 'effects_ascii', icon: 'webgl_effects_ascii'}
        },
        {
            path: '/webglFurnaceTest',
            name: 'webglFurnaceTest',
            component: () => import('@/views/furnace/webglFurnaceTest'),
            meta: {title: 'furnace_test', icon: 'webgl_furnace_test'}
        },
        {
            path: '/webglGeometriesParametric',
            name: 'webglGeometriesParametric',
            component: () => import('@/views/geometries/webglGeometriesParametric'),
            meta: {title: 'geometries_parametric', icon: 'webgl_geometries_parametric'}
        },
        {
            path: '/webglGeometries',
            name: 'webglGeometries',
            component: () => import('@/views/geometries/webglGeometries'),
            meta: {title: 'geometries', icon: 'webgl_geometries'}
        },
        {
            path: '/webglGeometryColorsLookuptable',
            name: 'webglGeometryColorsLookuptable',
            component: () => import('@/views/geometries/webglGeometryColorsLookuptable'),
            meta: {title: 'geometry_colors_lookuptable', icon: 'webgl_geometry_colors_lookuptable'}
        },
        {
            path: '/webglGeometryColors',
            name: 'webglGeometryColors',
            component: () => import('@/views/geometries/webglGeometryColors'),
            meta: {title: 'webgl_geometry_colors', icon: 'webgl_geometry_colors'}
        },
        {
            path: '/webglGeometryConvex',
            name: 'webglGeometryConvex',
            component: () => import('@/views/geometries/webglGeometryConvex'),
            meta: {title: 'webgl_geometry_convex', icon: 'webgl_geometry_convex'}
        },
        {
            path: '/webglGeometryCube',
            name: 'webglGeometryCube',
            component: () => import('@/views/geometries/webglGeometryCube'),
            meta: {title: 'geometry_cube', icon: 'webgl_geometry_cube'}
        },
        {
            path: '/webglGeometryDynamic',
            name: 'webglGeometryDynamic',
            component: () => import('@/views/geometries/webglGeometryDynamic'),
            meta: {title: 'geometry_dynamic', icon: 'webgl_geometry_dynamic'}
        },
        {
            path: '/webglGeometryExtrudeShapes',
            name: 'webglGeometryExtrudeShapes',
            component: () => import('@/views/geometries/webglGeometryExtrudeShapes'),
            meta: {title: 'geometry_extrude_shapes', icon: 'webgl_geometry_extrude_shapes'}
        },
        {
            path: '/webglGeometryExtrudeSplines',
            name: 'webglGeometryExtrudeSplines',
            component: () => import('@/views/geometries/webglGeometryExtrudeSplines'),
            meta: {title: 'geometry_extrude_splines', icon: 'webgl_geometry_extrude_splines'}
        },
        {
            path: '/webglGeometryHierarchy',
            name: 'webglGeometryHierarchy',
            component: () => import('@/views/geometries/webglGeometryHierarchy'),
            meta: {title: 'geometry_hierarchy', icon: 'webgl_geometry_hierarchy'}
        },
        {
            path: '/webglGeometryHierarchy2',
            name: 'webglGeometryHierarchy2',
            component: () => import('@/views/geometries/webglGeometryHierarchy2'),
            meta: {title: 'geometry_hierarchy2', icon: 'webgl_geometry_hierarchy2'}
        },
        {
            path: '/webglGeometryMinecraftAo',
            name: 'webglGeometryMinecraftAo',
            component: () => import('@/views/geometries/webglGeometryMinecraftAo'),
            meta: {title: 'geometry_minecraft_ao', icon: 'webgl_geometry_minecraft_ao'}
        },
        {
            path: '/webglGeometryMinecraft',
            name: 'webglGeometryMinecraft',
            component: () => import('@/views/geometries/webglGeometryMinecraft'),
            meta: {title: 'geometry_minecraft', icon: 'webgl_geometry_minecraft'}
        },
        {
            path: '/webglGeometryNormals',
            name: 'webglGeometryNormals',
            component: () => import('@/views/geometries/webglGeometryNormals'),
            meta: {title: 'geometry_normals', icon: 'webgl_geometry_normals'}
        },
        {
            path: '/webglGeometryShapes',
            name: 'webglGeometryShapes',
            component: () => import('@/views/geometries/webglGeometryShapes'),
            meta: {title: 'geometry_shapes', icon: 'webgl_geometry_shapes'}
        },
        {
            path: '/webglGeometrySplineEditor',
            name: 'webglGeometrySplineEditor',
            component: () => import('@/views/geometries/webglGeometrySplineEditor'),
            meta: {title: 'geometry_spline_editor', icon: 'webgl_geometry_spline_editor'}
        },
        {
            path: '/webglGeometryTeapot',
            name: 'webglGeometryTeapot',
            component: () => import('@/views/geometries/webglGeometryTeapot'),
            meta: {title: 'geometry_teapot', icon: 'webgl_geometry_teapot'}
        },
        {
            path: '/webglGeometryTerrainFog',
            name: 'webglGeometryTerrainFog',
            component: () => import('@/views/geometries/webglGeometryTerrainFog'),
            meta: {title: 'geometry_terrain_fog', icon: 'webgl_geometry_terrain_fog'}
        },
        {
            path: '/webglGeometryTerrainRaycast',
            name: 'webglGeometryTerrainRaycast',
            component: () => import('@/views/geometries/webglGeometryTerrainRaycast'),
            meta: {title: 'geometry_terrain_raycast', icon: 'webgl_geometry_terrain_raycast'}
        },
        {
            path: '/webglGeometryTerrain',
            name: 'webglGeometryTerrain',
            component: () => import('@/views/geometries/webglGeometryTerrain'),
            meta: {title: 'geometry_terrain', icon: 'webgl_geometry_terrain'}
        },
        {
            path: '/webglGpgpuBirdsGltf',
            name: 'webglGpgpuBirdsGltf',
            component: () => import('@/views/gpgpu/webglGpgpuBirdsGltf'),
            meta: {title: 'gpgpu_birds_gltf', icon: 'webgl_gpgpu_birds_gltf'}
        },
        {
            path: '/webglGpgpuWater',
            name: 'webglGpgpuWater',
            component: () => import('@/views/gpgpu/webglGpgpuWater'),
            meta: {title: 'gpgpu_water', icon: 'webgl_gpgpu_water'}
        },
        {
            path: '/webglHelpers',
            name: 'webglHelpers',
            component: () => import('@/views/helpers/webglHelpers'),
            meta: {title: 'helpers', icon: 'webgl_helpers'}
        },
        {
            path: '/webglInstancingRaycast',
            name: 'webglInstancingRaycast',
            component: () => import('@/views/instancing/webglInstancingRaycast'),
            meta: {title: 'instancing_raycast', icon: 'webgl_instancing_raycast'}
        },
        {
            path: '/webglInstancingScatter',
            name: 'webglInstancingScatter',
            component: () => import('@/views/instancing/webglInstancingScatter'),
            meta: {title: 'instancing_scatter', icon: 'webgl_instancing_scatter'}
        },
        {
            path: '/webglInteractiveBuffergeometry',
            name: 'webglInteractiveBuffergeometry',
            component: () => import('@/views/interactive/webglInteractiveBuffergeometry'),
            meta: {title: 'webgl_interactive_buffergeometry', icon: 'webgl_interactive_buffergeometry'}
        },
        {
            path: '/webglInteractiveCubesGpu',
            name: 'webglInteractiveCubesGpu',
            component: () => import('@/views/interactive/webglInteractiveCubesGpu'),
            meta: {title: 'interactive_cubes_gpu', icon: 'webgl_interactive_cubes_gpu'}
        },
        {
            path: '/webglInteractiveCubesOrtho',
            name: 'webglInteractiveCubesOrtho',
            component: () => import('@/views/interactive/webglInteractiveCubesOrtho'),
            meta: {title: 'interactive_cubes_ortho', icon: 'webgl_interactive_cubes_ortho'}
        },
        {
            path: '/webglInteractiveCubes',
            name: 'webglInteractiveCubes',
            component: () => import('@/views/interactive/webglInteractiveCubes'),
            meta: {title: 'interactive_cubes', icon: 'webgl_interactive_cubes'}
        },
        {
            path: '/webglInteractiveLines',
            name: 'webglInteractiveLines',
            component: () => import('@/views/interactive/webglInteractiveLines'),
            meta: {title: 'interactive_lines', icon: 'webgl_interactive_lines'}
        },
        {
            path: '/webglInteractivePoints',
            name: 'webglInteractivePoints',
            component: () => import('@/views/interactive/webglInteractivePoints'),
            meta: {title: 'interactive_points', icon: 'webgl_interactive_points'}
        },
        {
            path: '/webglInteractiveRaycastingPoints',
            name: 'webglInteractiveRaycastingPoints',
            component: () => import('@/views/interactive/webglInteractiveRaycastingPoints'),
            meta: {title: 'interactive_raycasting_points', icon: 'webgl_interactive_raycasting_points'}
        },
        {
            path: '/webglInteractiveVoxelpainter',
            name: 'webglInteractiveVoxelpainter',
            component: () => import('@/views/interactive/webglInteractiveVoxelpainter'),
            meta: {title: 'interactive_voxelpainter', icon: 'webgl_interactive_voxelpainter'}
        },
        {
            path: '/webglLayers',
            name: 'webglLayers',
            component: () => import('@/views/layers/webglLayers'),
            meta: {title: 'layers', icon: 'webgl_layers'}
        },
        {
            path: '/webglLightprobeCubecamera',
            name: 'webglLightprobeCubecamera',
            component: () => import('@/views/lightprobe/webglLightprobeCubecamera'),
            meta: {title: 'lightprobe_cubecamera', icon: 'webgl_lightprobe_cubecamera'}
        },
        {
            path: '/webglLightprobe',
            name: 'webglLightprobe',
            component: () => import('@/views/lightprobe/webglLightprobe'),
            meta: {title: 'lightprobe', icon: 'webgl_lightprobe'}
        },
        {
            path: '/webglLightsHemisphere',
            name: 'webglLightsHemisphere',
            component: () => import('@/views/lights/webglLightsHemisphere'),
            meta: {title: 'lights_hemisphere', icon: 'webgl_lights_hemisphere'}
        },
        {
            path: '/webglLightsPhysical',
            name: 'webglLightsPhysical',
            component: () => import('@/views/lights/webglLightsPhysical'),
            meta: {title: 'lights_physical', icon: 'webgl_lights_physical'}
        },
        {
            path: '/webglLightsPointlights',
            name: 'webglLightsPointlights',
            component: () => import('@/views/lights/webglLightsPointlights'),
            meta: {title: 'lights_pointlights', icon: 'webgl_lights_pointlights'}
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
    //     path: '/webglLightsPointlights',
    //     name: 'webglLightsPointlights',
    //     component: () => import('@/views/lights/webglLightsPointlights'),
    //     meta: {title: 'lights_pointlights', icon: 'webgl_lights_pointlights'}
    // },


    // {
    //     path: '/webglLightningstrike',
    //     name: 'webglLightningstrike',
    //     component: () => import('@/views/lightningstrike/webglLightningstrike'),
    //     meta: {title: 'lightningstrike', icon: 'webgl_lightningstrike'}
    // },
    // {
    //     path: '/webglLensflares',
    //     name: 'webglLensflares',
    //     component: () => import('@/views/lensflares/webglLensflares'),
    //     meta: {title: 'lensflares', icon: 'webgl_lensflares'}
    // },
    // {
    //     path: '/webglInstancingPerformance',
    //     name: 'webglInstancingPerformance',
    //     component: () => import('@/views/instancing/webglInstancingPerformance'),
    //     meta: {title: 'instancing_performance', icon: 'webgl_instancing_performance'}
    // },
    // {
    //     path: '/webglInstancingModified',
    //     name: 'webglInstancingModified',
    //     component: () => import('@/views/instancing/webglInstancingModified'),
    //     meta: {title: 'instancing_modified', icon: 'webgl_instancing_modified'}
    // },
    // {
    //     path: '/webglInstancingDynamic',
    //     name: 'webglInstancingDynamic',
    //     component: () => import('@/views/instancing/webglInstancingDynamic'),
    //     meta: {title: 'instancing_dynamic', icon: 'webgl_instancing_dynamic'}
    // },
    // {
    //     path: '/webglGpgpuProtoplanet',
    //     name: 'webglGpgpuProtoplanet',
    //     component: () => import('@/views/gpgpu/webglGpgpuProtoplanet'),
    //     meta: {title: 'gpgpu_protoplanet', icon: 'webgl_gpgpu_protoplanet'}
    // },
    // {
    //     path: '/webglGeometryNurbs',
    //     name: 'webglGeometryNurbs',
    //     component: () => import('@/views/geometries/webglGeometryNurbs'),
    //     meta: {title: 'geometry_nurbs', icon: 'webgl_geometry_nurbs'}
    // },
    // {
    //     path: '/webglGeometryExtrudeShapes2',
    //     name: 'webglGeometryExtrudeShapes2',
    //     component: () => import('@/views/geometries/webglGeometryExtrudeShapes2'),
    //     meta: {title: 'geometry_extrude_shapes2', icon: 'webgl_geometry_extrude_shapes2'}
    // },
    // {
    //     path: '/webglAnimationMultiple',
    //     name: 'webglAnimationMultiple',
    //     component: () => import('@/views/animation/webglAnimationMultiple'),
    //     meta: {title: 'animation_multiple', icon: 'webgl_animation_multiple'}
    // },
    // {
    //     path: '/webglBuffergeometryPoints',
    //     name: 'webglBuffergeometryPoints',
    //     component: () => import('@/views/buffergeometry/webglBuffergeometryPoints'),
    //     meta: {title: 'buffergeometry_points', icon: 'webgl_buffergeometry_points'}
    // },
    // {
    //     path: '/webglCameraArray',
    //     name: 'webglCameraArray',
    //     component: () => import('@/views/camera/webglCameraArray'),
    //     meta: {title: 'camera_array', icon: 'webgl_camera_array'}
    // },
    // {
    //     path: '/webglCamera',
    //     name: 'webglCamera',
    //     component: () => import('@/views/camera/webglCamera'),
    //     meta: {title: 'camera', icon: 'webgl_camera'}
    // },
    // {
    //     path: '/webglClippingStencil',
    //     name: 'webglClippingStencil',
    //     component: () => import('@/views/clipping/webglClippingStencil'),
    //     meta: {title: 'clipping_stencil', icon: 'webgl_clipping_stencil'}
    // },
    // {
    //     path: '/webglDecals',
    //     name: 'webglDecals',
    //     component: () => import('@/views/decals/webglDecals'),
    //     meta: {title: 'decals', icon: 'webgl_decals'}
    // },
    // {
    //     path: '/webglEffectsAnaglyph',
    //     name: 'webglEffectsAnaglyph',
    //     component: () => import('@/views/effects/webglEffectsAnaglyph'),
    //     meta: {title: 'effects_anaglyph', icon: 'webgl_effects_anaglyph'}
    // },
    // {
    //     path: '/webglEffectsParallaxbarrier',
    //     name: 'webglEffectsParallaxbarrier',
    //     component: () => import('@/views/effects/webglEffectsParallaxbarrier'),
    //     meta: {title: 'effects_parallaxbarrier', icon: 'webgl_effects_parallaxbarrier'}
    // },
    // {
    //     path: '/webglEffectsPeppersghost',
    //     name: 'webglEffectsPeppersghost',
    //     component: () => import('@/views/effects/webglEffectsPeppersghost'),
    //     meta: {title: 'effects_peppersghost', icon: 'webgl_effects_peppersghost'}
    // },
    // {
    //     path: '/webglEffectsStereo',
    //     name: 'webglEffectsStereo',
    //     component: () => import('@/views/effects/webglEffectsStereo'),
    //     meta: {title: 'webgl_effects_stereo', icon: 'webgl_effects_stereo'}
    // },
    // {
    //     path: '/webglFramebufferTexture',
    //     name: 'webglFramebufferTexture',
    //     component: () => import('@/views/framebuffer/webglFramebufferTexture'),
    //     meta: {title: 'webgl_framebuffer_texture', icon: 'webgl_framebuffer_texture'}
    // },
    // {
    //     path: '/webglClippingAdvanced',
    //     name: 'webglClippingAdvanced',
    //     component: () => import('@/views/clipping/webglClippingAdvanced'),
    //     meta: {title: 'clipping_advanced', icon: 'webgl_clipping_advanced'}
    // },
    // {
    //     path: '/webglCameraLogarithmicdepthbuffer',
    //     name: 'webglCameraLogarithmicdepthbuffer',
    //     component: () => import('@/views/camera/webglCameraLogarithmicdepthbuffer'),
    //     meta: {title: 'camera_logarithmicdepthbuffer', icon: 'webgl_camera_logarithmicdepthbuffer'}
    // },
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
