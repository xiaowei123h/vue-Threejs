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
        {
            path: '/webglLightsPointlights2',
            name: 'webglLightsPointlights2',
            component: () => import('@/views/lights/webglLightsPointlights2'),
            meta: {title: 'lights_pointlights2', icon: 'webgl_lights_pointlights2'}
        },
        {
            path: '/webglLightsRectarealight',
            name: 'webglLightsRectarealight',
            component: () => import('@/views/lights/webglLightsRectarealight'),
            meta: {title: 'lights_rectarealight', icon: 'webgl_lights_rectarealight'}
        },
        {
            path: '/webglLightsSpotlight',
            name: 'webglLightsSpotlight',
            component: () => import('@/views/lights/webglLightsSpotlight'),
            meta: {title: 'lights_spotlight', icon: 'webgl_lights_spotlight'}
        },
        {
            path: '/webglLightsSpotlights',
            name: 'webglLightsSpotlights',
            component: () => import('@/views/lights/webglLightsSpotlights'),
            meta: {title: 'lights_spotlights', icon: 'webgl_lights_spotlights'}
        },
        {
            path: '/webglLinesColors',
            name: 'webglLinesColors',
            component: () => import('@/views/lines/webglLinesColors'),
            meta: {title: 'lines_colors', icon: 'webgl_lines_colors'}
        },
        {
            path: '/webglLinesDashed',
            name: 'webglLinesDashed',
            component: () => import('@/views/lines/webglLinesDashed'),
            meta: {title: 'lines_dashed', icon: 'webgl_lines_dashed'}
        },
        {
            path: '/webglLinesFatWireframe',
            name: 'webglLinesFatWireframe',
            component: () => import('@/views/lines/webglLinesFatWireframe'),
            meta: {title: 'lines_fat_wireframe', icon: 'webgl_lines_fat_wireframe'}
        },
        {
            path: '/webglLinesFat',
            name: 'webglLinesFat',
            component: () => import('@/views/lines/webglLinesFat'),
            meta: {title: 'lines_fat', icon: 'webgl_lines_fat'}
        },
        {
            path: '/webglLinesSphere',
            name: 'webglLinesSphere',
            component: () => import('@/views/lines/webglLinesSphere'),
            meta: {title: 'lines_sphere', icon: 'webgl_lines_sphere'}
        },
        {
            path: '/webglLoader3ds',
            name: 'webglLoader3ds',
            component: () => import('@/views/loader/webglLoader3ds'),
            meta: {title: 'loader_3ds', icon: 'webgl_loader_3ds'}
        },
        {
            path: '/webglLoader3mfMaterials',
            name: 'webglLoader3mfMaterials',
            component: () => import('@/views/loader/webglLoader3mfMaterials'),
            meta: {title: 'loader_3mf_materials', icon: 'webgl_loader_3mf_materials'}
        },
        {
            path: '/webglLoaderAmf',
            name: 'webglLoaderAmf',
            component: () => import('@/views/loader/webglLoaderAmf'),
            meta: {title: 'loader_amf', icon: 'webgl_loader_amf'}
        },
        {
            path: '/webglLoaderBvh',
            name: 'webglLoaderBvh',
            component: () => import('@/views/loader/webglLoaderBvh'),
            meta: {title: 'loader_bvh', icon: 'webgl_loader_bvh'}
        },
        {
            path: '/webglLoaderColladaKnematics',
            name: 'webglLoaderColladaKnematics',
            component: () => import('@/views/loader/webglLoaderColladaKnematics'),
            meta: {title: 'loader_collada_kinematics', icon: 'webgl_loader_collada_kinematics'}
        },
        {
            path: '/webglLoaderGcode',
            name: 'webglLoaderGcode',
            component: () => import('@/views/loader/webglLoaderGcode'),
            meta: {title: 'loader_gcode', icon: 'webgl_loader_gcode'}
        },
        {
            path: '/webglLoaderGltf',
            name: 'webglLoaderGltf',
            component: () => import('@/views/loader/webglLoaderGltf'),
            meta: {title: 'loader_gltf', icon: 'webgl_loader_gltf'}
        },
        {
            path: '/webglLoaderImagebitmap',
            name: 'webglLoaderImagebitmap',
            component: () => import('@/views/loader/webglLoaderImagebitmap'),
            meta: {title: 'loader_imagebitmap', icon: 'webgl_loader_imagebitmap'}
        },
        {
            path: '/webglLoaderKmz',
            name: 'webglLoaderKmz',
            component: () => import('@/views/loader/webglLoaderKmz'),
            meta: {title: 'loader_kmz', icon: 'webgl_loader_kmz'}
        },
        {
            path: '/webglLoaderLwo',
            name: 'webglLoaderLwo',
            component: () => import('@/views/loader/webglLoaderLwo'),
            meta: {title: 'loader_lwo', icon: 'webgl_loader_lwo'}
        },
        {
            path: '/webglLoaderMd2',
            name: 'webglLoaderMd2',
            component: () => import('@/views/loader/webglLoaderMd2'),
            meta: {title: 'loader_md2', icon: 'webgl_loader_md2'}
        },
        {
            path: '/webglLoaderMdd',
            name: 'webglLoaderMdd',
            component: () => import('@/views/loader/webglLoaderMdd'),
            meta: {title: 'loader_mdd', icon: 'webgl_loader_mdd'}
        },
        {
            path: '/webglLoaderNodes',
            name: 'webglLoaderNodes',
            component: () => import('@/views/loader/webglLoaderNodes'),
            meta: {title: 'loader_nodes', icon: 'webgl_loader_nodes'}
        },
        {
            path: '/webglLoaderNrrd',
            name: 'webglLoaderNrrd',
            component: () => import('@/views/loader/webglLoaderNrrd'),
            meta: {title: 'loader_nrrd', icon: 'webgl_loader_nrrd'}
        },
        {
            path: '/webglLoaderObjMtl',
            name: 'webglLoaderObjMtl',
            component: () => import('@/views/loader/webglLoaderObjMtl'),
            meta: {title: 'loader_obj_mtl', icon: 'webgl_loader_obj_mtl'}
        },
        {
            path: '/webglLoaderPcd',
            name: 'webglLoaderPcd',
            component: () => import('@/views/loader/webglLoaderPcd'),
            meta: {title: 'loader_pcd', icon: 'webgl_loader_pcd'}
        },
        {
            path: '/webglLoaderPly',
            name: 'webglLoaderPly',
            component: () => import('@/views/loader/webglLoaderPly'),
            meta: {title: 'loader_ply', icon: 'webgl_loader_ply'}
        },
        {
            path: '/webglLoaderStl',
            name: 'webglLoaderStl',
            component: () => import('@/views/loader/webglLoaderStl'),
            meta: {title: 'loader_stl', icon: 'webgl_loader_stl'}
        },
        {
            path: '/webglLoaderTextureExr',
            name: 'webglLoaderTextureExr',
            component: () => import('@/views/loader/webglLoaderTextureExr'),
            meta: {title: 'loader_texture_exr', icon: 'webgl_loader_texture_exr'}
        },
        {
            path: '/webglLoaderTextureHdr',
            name: 'webglLoaderTextureHdr',
            component: () => import('@/views/loader/webglLoaderTextureHdr'),
            meta: {title: 'loader_texture_hdr', icon: 'webgl_loader_texture_hdr'}
        },
        {
            path: '/webglLoaderTextureKtx',
            name: 'webglLoaderTextureKtx',
            component: () => import('@/views/loader/webglLoaderTextureKtx'),
            meta: {title: 'loader_texture_ktx', icon: 'webgl_loader_texture_ktx'}
        },
        {
            path: '/webglLoaderTextureRgbm',
            name: 'webglLoaderTextureRgbm',
            component: () => import('@/views/loader/webglLoaderTextureRgbm'),
            meta: {title: 'webgl_loader_texture_rgbm', icon: 'webgl_loader_texture_rgbm'}
        },
        {
            path: '/webglLoaderTextureTga',
            name: 'webglLoaderTextureTga',
            component: () => import('@/views/loader/webglLoaderTextureTga'),
            meta: {title: 'webgl_loader_texture_tga', icon: 'webgl_loader_texture_tga'}
        },
        {
            path: '/webglLoaderTtf',
            name: 'webglLoaderTtf',
            component: () => import('@/views/loader/webglLoaderTtf'),
            meta: {title: 'loader_ttf', icon: 'webgl_loader_ttf'}
        },
        {
            path: '/webglLoaderVox',
            name: 'webglLoaderVox',
            component: () => import('@/views/loader/webglLoaderVox'),
            meta: {title: 'loader_vox', icon: 'webgl_loader_vox'}
        },
        {
            path: '/webglLoaderVrml',
            name: 'webglLoaderVrml',
            component: () => import('@/views/loader/webglLoaderVrml'),
            meta: {title: 'webgl_loader_vrml', icon: 'webgl_loader_vrml'}
        },
        {
            path: '/webglLoaderXyz',
            name: 'webglLoaderXyz',
            component: () => import('@/views/loader/webglLoaderXyz'),
            meta: {title: 'webgl_loader_xyz', icon: 'webgl_loader_xyz'}
        },
        {
            path: '/webglLod',
            name: 'webglLod',
            component: () => import('@/views/lod/webglLod'),
            meta: {title: 'lod', icon: 'webgl_lod'}
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
    //     path: '/webglLod',
    //     name: 'webglLod',
    //     component: () => import('@/views/lod/webglLod'),
    //     meta: {title: 'lod', icon: 'webgl_lod'}
    // },



    // {
    //     path: '/webglLoaderX',
    //     name: 'webglLoaderX',
    //     component: () => import('@/views/loader/webglLoaderX'),
    //     meta: {title: 'webgl_loader_x', icon: 'webgl_loader_x'}
    // },
    // {
    //     path: '/webglLoaderVtk',
    //     name: 'webglLoaderVtk',
    //     component: () => import('@/views/loader/webglLoaderVtk'),
    //     meta: {title: 'webgl_loader_vtk', icon: 'webgl_loader_vtk'}
    // },
    // {
    //     path: '/webglLoaderVrm',
    //     name: 'webglLoaderVrm',
    //     component: () => import('@/views/loader/webglLoaderVrm'),
    //     meta: {title: 'webgl_loader_vrm', icon: 'webgl_loader_vrm'}
    // },
    // {
    //     path: '/webglLoaderTexturePvrtc',
    //     name: 'webglLoaderTexturePvrtc',
    //     component: () => import('@/views/loader/webglLoaderTexturePvrtc'),
    //     meta: {title: 'webgl_loader_texture_pvrtc', icon: 'webgl_loader_texture_pvrtc'}
    // },
    // {
    //     path: '/webglLoaderTextureLottie',
    //     name: 'webglLoaderTextureLottie',
    //     component: () => import('@/views/loader/webglLoaderTextureLottie'),
    //     meta: {title: 'webgl_loader_texture_lottie', icon: 'webgl_loader_texture_lottie'}
    // },
    // {
    //     path: '/webglLoaderTextureKtx2',
    //     name: 'webglLoaderTextureKtx2',
    //     component: () => import('@/views/loader/webglLoaderTextureKtx2'),
    //     meta: {title: 'webgl_loader_texture_ktx2', icon: 'webgl_loader_texture_ktx2'}
    // },
    // {
    //     path: '/webglLoaderTextureDds',
    //     name: 'webglLoaderTextureDds',
    //     component: () => import('@/views/loader/webglLoaderTextureDds'),
    //     meta: {title: 'loader_texture_dds', icon: 'webgl_loader_texture_dds'}
    // },
    // {
    //     path: '/webglLoaderTextureBasis',
    //     name: 'webglLoaderTextureBasis',
    //     component: () => import('@/views/loader/webglLoaderTextureBasis'),
    //     meta: {title: 'loader_texture_basis', icon: 'webgl_loader_texture_basis'}
    // },
    // {
    //     path: '/webglLoaderSvg',
    //     name: 'webglLoaderSvg',
    //     component: () => import('@/views/loader/webglLoaderSvg'),
    //     meta: {title: 'loader_svg', icon: 'webgl_loader_svg'}
    // },
    // {
    //     path: '/webglLoaderPrwm',
    //     name: 'webglLoaderPrwm',
    //     component: () => import('@/views/loader/webglLoaderPrwm'),
    //     meta: {title: 'loader_prwm', icon: 'webgl_loader_prwm'}
    // },
    // {
    //     path: '/webglLoaderPdb',
    //     name: 'webglLoaderPdb',
    //     component: () => import('@/views/loader/webglLoaderPdb'),
    //     meta: {title: 'loader_pdb', icon: 'webgl_loader_pdb'}
    // },
    // {
    //     path: '/webgLloaderObj2',
    //     name: 'webgLloaderObj2',
    //     component: () => import('@/views/loader/webgLloaderObj2'),
    //     meta: {title: 'loader_obj2', icon: 'webgl_loader_obj2'}
    // },
    // {
    //     path: '/webglLoaderObj2Options',
    //     name: 'webglLoaderObj2Options',
    //     component: () => import('@/views/loader/webglLoaderObj2Options'),
    //     meta: {title: 'loader_obj2_options', icon: 'webgl_loader_obj2_options'}
    // },
    // {
    //     path: '/webglLoaderObj',
    //     name: 'webglLoaderObj',
    //     component: () => import('@/views/loader/webglLoaderObj'),
    //     meta: {title: 'loader_obj', icon: 'webgl_loader_obj'}
    // },
    // {
    //     path: '/webglLoaderMmd',
    //     name: 'webglLoaderMmd',
    //     component: () => import('@/views/loader/webglLoaderMmd'),
    //     meta: {title: 'loader_mmd', icon: 'webgl_loader_mmd'}
    // },
    // {
    //     path: '/webglLoaderMmdPose',
    //     name: 'webglLoaderMmdPose',
    //     component: () => import('@/views/loader/webglLoaderMmdPose'),
    //     meta: {title: 'loader_mmd_pose', icon: 'webgl_loader_mmd_pose'}
    // },
    // {
    //     path: '/webglLoaderMmdAudio',
    //     name: 'webglLoaderMmdAudio',
    //     component: () => import('@/views/loader/webglLoaderMmdAudio'),
    //     meta: {title: 'loader_mmd_audio', icon: 'webgl_loader_mmd_audio'}
    // },
    // {
    //     path: '/webglLoaderMd2Control',
    //     name: 'webglLoaderMd2Control',
    //     component: () => import('@/views/loader/webglLoaderMd2Control'),
    //     meta: {title: 'loader_md2_control', icon: 'webgl_loader_md2_control'}
    // },
    // {
    //     path: '/webglLoaderLdraw',
    //     name: 'webglLoaderLdraw',
    //     component: () => import('@/views/loader/webglLoaderLdraw'),
    //     meta: {title: 'loader_ldraw', icon: 'webgl_loader_ldraw'}
    // },
    // {
    //     path: '/webglLoaderGltfExtensions',
    //     name: 'webglLoaderGltfExtensions',
    //     component: () => import('@/views/loader/webglLoaderGltfExtensions'),
    //     meta: {title: 'loader_gltf_extensions', icon: 'webgl_loader_gltf_extensions'}
    // },
    // {
    //     path: '/webglLoaderFbx',
    //     name: 'webglLoaderFbx',
    //     component: () => import('@/views/loader/webglLoaderFbx'),
    //     meta: {title: 'loader_fbx', icon: 'webgl_loader_fbx'}
    // },
    // {
    //     path: '/webglLoaderFbxNurbs',
    //     name: 'webglLoaderFbxNurbs',
    //     component: () => import('@/views/loader/webglLoaderFbxNurbs'),
    //     meta: {title: 'loader_fbx_nurbs', icon: 'webgl_loader_fbx_nurbs'}
    // },
    // {
    //     path: '/webglLoaderDraco',
    //     name: 'webglLoaderDraco',
    //     component: () => import('@/views/loader/webglLoaderDraco'),
    //     meta: {title: 'webgl_loader_draco', icon: 'webgl_loader_draco'}
    // },
    // {
    //     path: '/webglLoaderCollada',
    //     name: 'webglLoaderCollada',
    //     component: () => import('@/views/loader/webglLoaderCollada'),
    //     meta: {title: 'webgl_loader_collada', icon: 'webgl_loader_collada'}
    // },
    // {
    //     path: '/webglLoaderColladaSkinning',
    //     name: 'webglLoaderColladaSkinning',
    //     component: () => import('@/views/loader/webglLoaderColladaSkinning'),
    //     meta: {title: 'webgl_loader_collada_skinning', icon: 'webgl_loader_collada_skinning'}
    // },
    // {
    //     path: '/webglLoaderAssimp',
    //     name: 'webglLoaderAssimp',
    //     component: () => import('@/views/loader/webglLoaderAssimp'),
    //     meta: {title: 'loader_assimp', icon: 'webgl_loader_assimp'}
    // },
    // {
    //     path: '/webglLoader3mf',
    //     name: 'webglLoader3mf',
    //     component: () => import('@/views/loader/webglLoader3mf'),
    //     meta: {title: 'loader_3mf', icon: 'webgl_loader_3mf'}
    // },
    // {
    //     path: '/webglLoader3dm',
    //     name: 'webglLoader3dm',
    //     component: () => import('@/views/loader/webglLoader3dm'),
    //     meta: {title: 'loader_3dm', icon: 'webgl_loader_3dm'}
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
