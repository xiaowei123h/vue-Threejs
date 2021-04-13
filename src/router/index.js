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
                    path: '/webglMarchingcubes',
                    name: 'webglMarchingcubes',
                    component: () => import('@/views/marchingcubes/webglMarchingcubes'),
                    meta: {title: 'marchingcubes', icon: 'webgl_marchingcubes'}
                },
                {
                    path: '/webglMaterialsBlending',
                    name: 'webglMaterialsBlending',
                    component: () => import('@/views/materials/webglMaterialsBlending'),
                    meta: {title: 'materials_blending', icon: 'webgl_materials_blending'}
                },
                {
                    path: '/webglMaterialsBumpmap',
                    name: 'webglMaterialsBumpmap',
                    component: () => import('@/views/materials/webglMaterialsBumpmap'),
                    meta: {title: 'materials_bumpmap', icon: 'webgl_materials_bumpmap'}
                },
                {
                    path: '/webglMaterialsChannels',
                    name: 'webglMaterialsChannels',
                    component: () => import('@/views/materials/webglMaterialsChannels'),
                    meta: {title: 'materials_channels', icon: 'webgl_materials_channels'}
                },
                {
                    path: '/webglMaterialsCompile',
                    name: 'webglMaterialsCompile',
                    component: () => import('@/views/materials/webglMaterialsCompile'),
                    meta: {title: 'materials_compile', icon: 'webgl_materials_compile'}
                },
                {
                    path: '/webglMaterialsCubemapBallsReflection',
                    name: 'webglMaterialsCubemapBallsReflection',
                    component: () => import('@/views/materials/webglMaterialsCubemapBallsReflection'),
                    meta: {title: 'materials_cubemap_balls_reflection', icon: 'webgl_materials_cubemap_balls_reflection'}
                },
                {
                    path: '/webglMaterialsCubemapBallsRefraction',
                    name: 'webglMaterialsCubemapBallsRefraction',
                    component: () => import('@/views/materials/webglMaterialsCubemapBallsRefraction'),
                    meta: {title: 'materials_cubemap_balls_refraction', icon: 'webgl_materials_cubemap_balls_refraction'}
                },
                {
                    path: '/webglMaterialsCubemapDynamic',
                    name: 'webglMaterialsCubemapDynamic',
                    component: () => import('@/views/materials/webglMaterialsCubemapDynamic'),
                    meta: {title: 'materials_cubemap_dynamic', icon: 'webgl_materials_cubemap_dynamic'}
                },
                {
                    path: '/webglMaterialsCubemapRefraction',
                    name: 'webglMaterialsCubemapRefraction',
                    component: () => import('@/views/materials/webglMaterialsCubemapRefraction'),
                    meta: {title: 'materials_cubemap_refraction', icon: 'webgl_materials_cubemap_refraction'}
                },
                {
                    path: '/webglMaterialsCurvature',
                    name: 'webglMaterialsCurvature',
                    component: () => import('@/views/materials/webglMaterialsCurvature'),
                    meta: {title: 'materials_curvature', icon: 'webgl_materials_curvature'}
                },
                {
                    path: '/webglMaterialsDisplacementmap',
                    name: 'webglMaterialsDisplacementmap',
                    component: () => import('@/views/materials/webglMaterialsDisplacementmap'),
                    meta: {title: 'materials_displacementmap', icon: 'webgl_materials_displacementmap'}
                },
                {
                    path: '/webglMaterialsEnvmapsExr',
                    name: 'webglMaterialsEnvmapsExr',
                    component: () => import('@/views/materials/webglMaterialsEnvmapsExr'),
                    meta: {title: 'materials_envmaps_exr', icon: 'webgl_materials_envmaps_exr'}
                },
                {
                    path: '/webglMaterialsEnvmapsHdrNodes',
                    name: 'webglMaterialsEnvmapsHdrNodes',
                    component: () => import('@/views/materials/webglMaterialsEnvmapsHdrNodes'),
                    meta: {title: 'materials_envmaps_hdr_nodes', icon: 'webgl_materials_envmaps_hdr_nodes'}
                },
                {
                    path: '/webglMaterialsEnvmapsHdr',
                    name: 'webglMaterialsEnvmapsHdr',
                    component: () => import('@/views/materials/webglMaterialsEnvmapsHdr'),
                    meta: {title: 'materials_envmaps_hdr', icon: 'webgl_materials_envmaps_hdr'}
                },
                {
                    path: '/webglMaterialsEnvmaps',
                    name: 'webglMaterialsEnvmaps',
                    component: () => import('@/views/materials/webglMaterialsEnvmaps'),
                    meta: {title: 'materials_envmaps', icon: 'webgl_materials_envmaps'}
                },
                {
                    path: '/webglMaterialsGrass',
                    name: 'webglMaterialsGrass',
                    component: () => import('@/views/materials/webglMaterialsGrass'),
                    meta: {title: 'materials_grass', icon: 'webgl_materials_grass'}
                },
                {
                    path: '/webglMaterialsLightmap',
                    name: 'webglMaterialsLightmap',
                    component: () => import('@/views/materials/webglMaterialsLightmap'),
                    meta: {title: 'materials_lightmap', icon: 'webgl_materials_lightmap'}
                },
                {
                    path: '/webglMaterialsMatcap',
                    name: 'webglMaterialsMatcap',
                    component: () => import('@/views/materials/webglMaterialsMatcap'),
                    meta: {title: 'materials_matcap', icon: 'webgl_materials_matcap'}
                },
                {
                    path: '/webglMaterialsModified',
                    name: 'webglMaterialsModified',
                    component: () => import('@/views/materials/webglMaterialsModified'),
                    meta: {title: 'materials_modified', icon: 'webgl_materials_modified'}
                },
                {
                    path: '/webglMaterialsNormalmapObjectSpace',
                    name: 'webglMaterialsNormalmapObjectSpace',
                    component: () => import('@/views/materials/webglMaterialsNormalmapObjectSpace'),
                    meta: {title: 'materials_normalmap_object_space', icon: 'webgl_materials_normalmap_object_space'}
                },
                {
                    path: '/webglMaterialsNormalmap',
                    name: 'webglMaterialsNormalmap',
                    component: () => import('@/views/materials/webglMaterialsNormalmap'),
                    meta: {title: 'materials_normalmap', icon: 'webgl_materials_normalmap'}
                },
                {
                    path: '/webglMaterialsParallaxmap',
                    name: 'webglMaterialsParallaxmap',
                    component: () => import('@/views/materials/webglMaterialsParallaxmap'),
                    meta: {title: 'materials_parallaxmap', icon: 'webgl_materials_parallaxmap'}
                },
                {
                    path: '/webglMaterialsPhysicalClearcoat',
                    name: 'webglMaterialsPhysicalClearcoat',
                    component: () => import('@/views/materials/webglMaterialsPhysicalClearcoat'),
                    meta: {title: 'materials_physical_clearcoat', icon: 'webgl_materials_physical_clearcoat'}
                },
                {
                    path: '/webglMaterialsPhysicalSheen',
                    name: 'webglMaterialsPhysicalSheen',
                    component: () => import('@/views/materials/webglMaterialsPhysicalSheen'),
                    meta: {title: 'materials_physical_sheen', icon: 'webgl_materials_physical_sheen'}
                },
                {
                    path: '/webglMaterialsPhysicalTransmission',
                    name: 'webglMaterialsPhysicalTransmission',
                    component: () => import('@/views/materials/webglMaterialsPhysicalTransmission'),
                    meta: {title: 'materials_physical_transmission', icon: 'webgl_materials_physical_transmission'}
                },
                {
                    path: '/webglMaterialsShadersFresnel',
                    name: 'webglMaterialsShadersFresnel',
                    component: () => import('@/views/materials/webglMaterialsShadersFresnel'),
                    meta: {title: 'materials_shaders_fresnel', icon: 'webgl_materials_shaders_fresnel'}
                },
                {
                    path: '/webglMaterialsStandard',
                    name: 'webglMaterialsStandard',
                    component: () => import('@/views/materials/webglMaterialsStandard'),
                    meta: {title: 'materials_standard', icon: 'webgl_materials_standard'}
                },
                {
                    path: '/webglMaterialsTextureCanvas',
                    name: 'webglMaterialsTextureCanvas',
                    component: () => import('@/views/materials/webglMaterialsTextureCanvas'),
                    meta: {title: 'materials_texture_canvas', icon: 'webgl_materials_texture_canvas'}
                },
                {
                    path: '/webglMaterialsTexturePartialupdate',
                    name: 'webglMaterialsTexturePartialupdate',
                    component: () => import('@/views/materials/webglMaterialsTexturePartialupdate'),
                    meta: {title: 'materials_texture_partialupdate', icon: 'webgl_materials_texture_partialupdate'}
                },
                {
                    path: '/webglMaterialsTextureRotation',
                    name: 'webglMaterialsTextureRotation',
                    component: () => import('@/views/materials/webglMaterialsTextureRotation'),
                    meta: {title: 'materials_texture_rotation', icon: 'webgl_materials_texture_rotation'}
                },
                {
                    path: '/webglMaterialsVariationsBasic',
                    name: 'webglMaterialsVariationsBasic',
                    component: () => import('@/views/materials/webglMaterialsVariationsBasic'),
                    meta: {title: 'materials_variations_basic', icon: 'webgl_materials_variations_basic'}
                },
                {
                    path: '/webglMaterialsVariationsLambert',
                    name: 'webglMaterialsVariationsLambert',
                    component: () => import('@/views/materials/webglMaterialsVariationsLambert'),
                    meta: {title: 'materials_variations_lambert', icon: 'webgl_materials_variations_lambert'}
                },
                {
                    path: '/webglMaterialsVariationsPhong',
                    name: 'webglMaterialsVariationsPhong',
                    component: () => import('@/views/materials/webglMaterialsVariationsPhong'),
                    meta: {title: 'materials_variations_phong', icon: 'webgl_materials_variations_phong'}
                },
                {
                    path: '/webglMaterialsVariationsPhysical',
                    name: 'webglMaterialsVariationsPhysical',
                    component: () => import('@/views/materials/webglMaterialsVariationsPhysical'),
                    meta: {title: 'materials_variations_physical', icon: 'webgl_materials_variations_physical'}
                },
                {
                    path: '/webglMaterialsVariationsStandard',
                    name: 'webglMaterialsVariationsStandard',
                    component: () => import('@/views/materials/webglMaterialsVariationsStandard'),
                    meta: {title: 'materials_variations_standard', icon: 'webgl_materials_variations_standard'}
                },
                {
                    path: '/webglMaterialsVariationsToon',
                    name: 'webglMaterialsVariationsToon',
                    component: () => import('@/views/materials/webglMaterialsVariationsToon'),
                    meta: {title: 'materials_variations_toon', icon: 'webgl_materials_variations_toon'}
                },
                {
                    path: '/webglMaterialsVideo',
                    name: 'webglMaterialsVideo',
                    component: () => import('@/views/materials/webglMaterialsVideo'),
                    meta: {title: 'materials_video', icon: 'webgl_materials_video'}
                },
                {
                    path: '/webglMaterialsWireframe',
                    name: 'webglMaterialsWireframe',
                    component: () => import('@/views/materials/webglMaterialsWireframe'),
                    meta: {title: 'materials_wireframe', icon: 'webgl_materials_wireframe'}
                },
                {
                    path: '/webglMaterials',
                    name: 'webglMaterials',
                    component: () => import('@/views/materials/webglMaterials'),
                    meta: {title: 'materials', icon: 'webgl_materials'}
                },
                {
                    path: '/webglMathObb',
                    name: 'webglMathObb',
                    component: () => import('@/views/math/webglMathObb'),
                    meta: {title: 'math_obb', icon: 'webgl_math_obb'}
                },
                {
                    path: '/webglMathOrientationTransform',
                    name: 'webglMathOrientationTransform',
                    component: () => import('@/views/math/webglMathOrientationTransform'),
                    meta: {title: 'math_orientation_transform', icon: 'webgl_math_orientation_transform'}
                },
                {
                    path: '/webglMirrorNodes',
                    name: 'webglMirrorNodes',
                    component: () => import('@/views/mirror/webglMirrorNodes'),
                    meta: {title: 'mirror_nodes', icon: 'webgl_mirror_nodes'}
                },
                {
                    path: '/webglMirror',
                    name: 'webglMirror',
                    component: () => import('@/views/mirror/webglMirror'),
                    meta: {title: 'mirror', icon: 'webgl_mirror'}
                },
                {
                    path: '/webglModifierCurve',
                    name: 'webglModifierCurve',
                    component: () => import('@/views/modifier/webglModifierCurve'),
                    meta: {title: 'modifier_curve', icon: 'webgl_modifier_curve'}
                },
                {
                    path: '/webglModifierSubdivision',
                    name: 'webglModifierSubdivision',
                    component: () => import('@/views/modifier/webglModifierSubdivision'),
                    meta: {title: 'modifier_subdivision', icon: 'webgl_modifier_subdivision'}
                },
                {
                    path: '/webglMorphtargetsHorse',
                    name: 'webglMorphtargetsHorse',
                    component: () => import('@/views/morphtargets/webglMorphtargetsHorse'),
                    meta: {title: 'morphtargets_horse', icon: 'webgl_morphtargets_horse'}
                },
                {
                    path: '/webglMorphtargetsSphere',
                    name: 'webglMorphtargetsSphere',
                    component: () => import('@/views/morphtargets/webglMorphtargetsSphere'),
                    meta: {title: 'morphtargets_sphere', icon: 'webgl_morphtargets_sphere'}
                },
                {
                    path: '/webglPanoramaCube',
                    name: 'webglPanoramaCube',
                    component: () => import('@/views/panorama/webglPanoramaCube'),
                    meta: {title: 'panorama_cube', icon: 'webgl_panorama_cube'}
                },
                {
                    path: '/webglPanoramaEquirectangular',
                    name: 'webglPanoramaEquirectangular',
                    component: () => import('@/views/panorama/webglPanoramaEquirectangular'),
                    meta: {title: 'panorama_equirectangular', icon: 'webgl_panorama_equirectangular'}
                },
                {
                    path: '/webglPerformanceStatic',
                    name: 'webglPerformanceStatic',
                    component: () => import('@/views/performance/webglPerformanceStatic'),
                    meta: {title: 'performance_static', icon: 'webgl_performance_static'}
                },
                {
                    path: '/webglPerformance',
                    name: 'webglPerformance',
                    component: () => import('@/views/performance/webglPerformance'),
                    meta: {title: 'performance', icon: 'webgl_performance'}
                },
                {
                    path: '/webglPmremTest',
                    name: 'webglPmremTest',
                    component: () => import('@/views/pmrem/webglPmremTest'),
                    meta: {title: 'pmrem_test', icon: 'webgl_pmrem_test'}
                },
                {
                    path: '/webglPointsBillboards',
                    name: 'webglPointsBillboards',
                    component: () => import('@/views/points/webglPointsBillboards'),
                    meta: {title: 'points_billboards', icon: 'webgl_points_billboards'}
                },
                {
                    path: '/webglPointsDynamic',
                    name: 'webglPointsDynamic',
                    component: () => import('@/views/points/webglPointsDynamic'),
                    meta: {title: 'points_dynamic', icon: 'webgl_points_dynamic'}
                },
                {
                    path: '/webglPointsSprites',
                    name: 'webglPointsSprites',
                    component: () => import('@/views/points/webglPointsSprites'),
                    meta: {title: 'points_sprites', icon: 'webgl_points_sprites'}
                },
                {
                    path: '/webglPointsWaves',
                    name: 'webglPointsWaves',
                    component: () => import('@/views/points/webglPointsWaves'),
                    meta: {title: 'points_waves', icon: 'webgl_points_waves'}
                },
                {
                    path: '/webglPostprocessing3dlut',
                    name: 'webglPostprocessing3dlut',
                    component: () => import('@/views/postprocessing/webglPostprocessing3dlut'),
                    meta: {title: 'postprocessing_3dlut', icon: 'webgl_postprocessing_3dlut'}
                },
                {
                    path: '/webglPostprocessingAdvanced',
                    name: 'webglPostprocessingAdvanced',
                    component: () => import('@/views/postprocessing/webglPostprocessingAdvanced'),
                    meta: {title: 'postprocessing_advanced', icon: 'webgl_postprocessing_advanced'}
                },
                {
                    path: '/webglPostprocessingAfterimage',
                    name: 'webglPostprocessingAfterimage',
                    component: () => import('@/views/postprocessing/webglPostprocessingAfterimage'),
                    meta: {title: 'postprocessing_afterimage', icon: 'webgl_postprocessing_afterimage'}
                },
                {
                    path: '/webglPostprocessingBackgrounds',
                    name: 'webglPostprocessingBackgrounds',
                    component: () => import('@/views/postprocessing/webglPostprocessingBackgrounds'),
                    meta: {title: 'postprocessing_backgrounds', icon: 'webgl_postprocessing_backgrounds'}
                },
                {
                    path: '/webglPostprocessingDof',
                    name: 'webglPostprocessingDof',
                    component: () => import('@/views/postprocessing/webglPostprocessingDof'),
                    meta: {title: 'postprocessing_dof', icon: 'webgl_postprocessing_dof'}
                },
                {
                    path: '/webglPostprocessingDof2',
                    name: 'webglPostprocessingDof2',
                    component: () => import('@/views/postprocessing/webglPostprocessingDof2'),
                    meta: {title: 'postprocessing_dof2', icon: 'webgl_postprocessing_dof2'}
                },
                {
                    path: '/webglPostprocessingGlitch',
                    name: 'webglPostprocessingGlitch',
                    component: () => import('@/views/postprocessing/webglPostprocessingGlitch'),
                    meta: {title: 'postprocessing_glitch', icon: 'webgl_postprocessing_glitch'}
                },
                {
                    path: '/webglPostprocessingGodrays',
                    name: 'webglPostprocessingGodrays',
                    component: () => import('@/views/postprocessing/webglPostprocessingGodrays'),
                    meta: {title: 'postprocessing_godrays', icon: 'webgl_postprocessing_godrays'}
                },
                {
                    path: '/webglPostprocessingMasking',
                    name: 'webglPostprocessingMasking',
                    component: () => import('@/views/postprocessing/webglPostprocessingMasking'),
                    meta: {title: 'postprocessing_masking', icon: 'webgl_postprocessing_masking'}
                },
                {
                    path: '/webglPostprocessingOutline',
                    name: 'webglPostprocessingOutline',
                    component: () => import('@/views/postprocessing/webglPostprocessingOutline'),
                    meta: {title: 'postprocessing_outline', icon: 'webgl_postprocessing_outline'}
                },
                {
                    path: '/webglPostprocessingPixel',
                    name: 'webglPostprocessingPixel',
                    component: () => import('@/views/postprocessing/webglPostprocessingPixel'),
                    meta: {title: 'postprocessing_pixel', icon: 'webgl_postprocessing_pixel'}
                },
                {
                    path: '/webglPostprocessingProcedural',
                    name: 'webglPostprocessingProcedural',
                    component: () => import('@/views/postprocessing/webglPostprocessingProcedural'),
                    meta: {title: 'postprocessing_procedural', icon: 'webgl_postprocessing_procedural'}
                },
                {
                    path: '/webglPostprocessingRgbHalftone',
                    name: 'webglPostprocessingRgbHalftone',
                    component: () => import('@/views/postprocessing/webglPostprocessingRgbHalftone'),
                    meta: {title: 'postprocessing_rgb_halftone', icon: 'webgl_postprocessing_rgb_halftone'}
                },
                {
                    path: '/webglPostprocessingSao',
                    name: 'webglPostprocessingSao',
                    component: () => import('@/views/postprocessing/webglPostprocessingSao'),
                    meta: {title: 'postprocessing_sao', icon: 'webgl_postprocessing_sao'}
                },
                {
                    path: '/webglPostprocessingSmaa',
                    name: 'webglPostprocessingSmaa',
                    component: () => import('@/views/postprocessing/webglPostprocessingSmaa'),
                    meta: {title: 'postprocessing_smaa', icon: 'webgl_postprocessing_smaa'}
                },
                {
                    path: '/webglPostprocessingSobel',
                    name: 'webglPostprocessingSobel',
                    component: () => import('@/views/postprocessing/webglPostprocessingSobel'),
                    meta: {title: 'postprocessing_sobel', icon: 'webgl_postprocessing_sobel'}
                },
                {
                    path: '/webglPostprocessingSsaaUnbiased',
                    name: 'webglPostprocessingSsaaUnbiased',
                    component: () => import('@/views/postprocessing/webglPostprocessingSsaaUnbiased'),
                    meta: {title: 'postprocessing_ssaa_unbiased', icon: 'webgl_postprocessing_ssaa_unbiased'}
                },
                {
                    path: '/webglPostprocessingSsaa',
                    name: 'webglPostprocessingSsaa',
                    component: () => import('@/views/postprocessing/webglPostprocessingSsaa'),
                    meta: {title: 'postprocessing_ssaa', icon: 'webgl_postprocessing_ssaa'}
                },
                {
                    path: '/webglPostprocessingSsao',
                    name: 'webglPostprocessingSsao',
                    component: () => import('@/views/postprocessing/webglPostprocessingSsao'),
                    meta: {title: 'postprocessing_ssao', icon: 'webgl_postprocessing_ssao'}
                },
                {
                    path: '/webglPostprocessingTaa',
                    name: 'webglPostprocessingTaa',
                    component: () => import('@/views/postprocessing/webglPostprocessingTaa'),
                    meta: {title: 'postprocessing_taa', icon: 'webgl_postprocessing_taa'}
                },
                {
                    path: '/webglPostprocessingUnrealBloomSelective',
                    name: 'webglPostprocessingUnrealBloomSelective',
                    component: () => import('@/views/postprocessing/webglPostprocessingUnrealBloomSelective'),
                    meta: {title: 'postprocessing_unreal_bloom_selective', icon: 'webgl_postprocessing_unreal_bloom_selective'}
                },
                {
                    path: '/webglPostprocessingUnrealBloom',
                    name: 'webglPostprocessingUnrealBloom',
                    component: () => import('@/views/postprocessing/webglPostprocessingUnrealBloom'),
                    meta: {title: 'postprocessing_unreal_bloom', icon: 'webgl_postprocessing_unreal_bloom'}
                },
                {
                    path: '/webglPostprocessing',
                    name: 'webglPostprocessing',
                    component: () => import('@/views/postprocessing/webglPostprocessing'),
                    meta: {title: 'postprocessing', icon: 'webgl_postprocessing'}
                },
                {
                    path: '/webglRaycastSprite',
                    name: 'webglRaycastSprite',
                    component: () => import('@/views/raycast/webglRaycastSprite'),
                    meta: {title: 'raycast_sprite', icon: 'webgl_raycast_sprite'}
                },
                {
                    path: '/webglRaymarchingReflect',
                    name: 'webglRaymarchingReflect',
                    component: () => import('@/views/raymarching/webglRaymarchingReflect'),
                    meta: {title: 'raymarching_reflect', icon: 'webgl_raymarching_reflect'}
                },
                {
                    path: '/webglRefraction',
                    name: 'webglRefraction',
                    component: () => import('@/views/refraction/webglRefraction'),
                    meta: {title: 'webgl_refraction', icon: 'webgl_refraction'}
                },
                {
                    path: '/webglRtt',
                    name: 'webglRtt',
                    component: () => import('@/views/rtt/webglRtt'),
                    meta: {title: 'rtt', icon: 'webgl_rtt'}
                },
                {
                    path: '/webglSandbox',
                    name: 'webglSandbox',
                    component: () => import('@/views/sandbox/webglSandbox'),
                    meta: {title: 'sandbox', icon: 'webgl_sandbox'}
                },
                {
                    path: '/webglShader',
                    name: 'webglShader',
                    component: () => import('@/views/shader/webglShader'),
                    meta: {title: 'shader', icon: 'webgl_shader'}
                },
                {
                    path: '/webglShadersOcean',
                    name: 'webglShadersOcean',
                    component: () => import('@/views/shaders/webglShadersOcean'),
                    meta: {title: 'shaders_ocean', icon: 'webgl_shaders_ocean'}
                },
                {
                    path: '/webglShadersSky',
                    name: 'webglShadersSky',
                    component: () => import('@/views/shaders/webglShadersSky'),
                    meta: {title: 'shaders_sky', icon: 'webgl_shaders_sky'}
                },
                {
                    path: '/webglShadersVector',
                    name: 'webglShadersVector',
                    component: () => import('@/views/shaders/webglShadersVector'),
                    meta: {title: 'shaders_vector', icon: 'webgl_shaders_vector'}
                },
                {
                    path: '/webglShadowContact',
                    name: 'webglShadowContact',
                    component: () => import('@/views/shadow/webglShadowContact'),
                    meta: {title: 'shadow_contact', icon: 'webgl_shadow_contact'}
                },
                {
                    path: '/webglShadowmapCsm',
                    name: 'webglShadowmapCsm',
                    component: () => import('@/views/shadowmap/webglShadowmapCsm'),
                    meta: {title: 'shadowmap_csm', icon: 'webgl_shadowmap_csm'}
                },
                {
                    path: '/webglShadowmapPcss',
                    name: 'webglShadowmapPcss',
                    component: () => import('@/views/shadowmap/webglShadowmapPcss'),
                    meta: {title: 'shadowmap_pcss', icon: 'webgl_shadowmap_pcss'}
                },
                {
                    path: '/webglShadowmapPerformance',
                    name: 'webglShadowmapPerformance',
                    component: () => import('@/views/shadowmap/webglShadowmapPerformance'),
                    meta: {title: 'shadowmap_performance', icon: 'webgl_shadowmap_performance'}
                },
                {
                    path: '/webglShadowmapPointlight',
                    name: 'webglShadowmapPointlight',
                    component: () => import('@/views/shadowmap/webglShadowmapPointlight'),
                    meta: {title: 'shadowmap_pointlight', icon: 'webgl_shadowmap_pointlight'}
                },
                {
                    path: '/webglShadowmapViewer',
                    name: 'webglShadowmapViewer',
                    component: () => import('@/views/shadowmap/webglShadowmapViewer'),
                    meta: {title: 'shadowmap_viewer', icon: 'webgl_shadowmap_viewer'}
                },
                {
                    path: '/webglShadowmapVsm',
                    name: 'webglShadowmapVsm',
                    component: () => import('@/views/shadowmap/webglShadowmapVsm'),
                    meta: {title: 'shadowmap_vsm', icon: 'webgl_shadowmap_vsm'}
                },
                {
                    path: '/webglShadowmap',
                    name: 'webglShadowmap',
                    component: () => import('@/views/shadowmap/webglShadowmap'),
                    meta: {title: 'shadowmap', icon: 'webgl_shadowmap'}
                },
                {
                    path: '/webglShadowmesh',
                    name: 'webglShadowmesh',
                    component: () => import('@/views/shadowmesh/webglShadowmesh'),
                    meta: {title: 'shadowmesh', icon: 'webgl_shadowmesh'}
                },
                {
                    path: '/webglSimpleGi',
                    name: 'webglSimpleGi',
                    component: () => import('@/views/simple/webglSimpleGi'),
                    meta: {title: 'simple_gi', icon: 'webgl_simple_gi'}
                },
                {
                    path: '/webglSpritesNodes',
                    name: 'webglSpritesNodes',
                    component: () => import('@/views/sprites/webglSpritesNodes'),
                    meta: {title: 'sprites_nodes', icon: 'webgl_sprites_nodes'}
                },
                {
                    path: '/webglSprites',
                    name: 'webglSprites',
                    component: () => import('@/views/sprites/webglSprites'),
                    meta: {title: 'sprites', icon: 'webgl_sprites'}
                },
                {
                    path: '/webglTiledForward',
                    name: 'webglTiledForward',
                    component: () => import('@/views/tiled/webglTiledForward'),
                    meta: {title: 'tiled_forward', icon: 'webgl_tiled_forward'}
                },
                {
                    path: '/webglTrails',
                    name: 'webglTrails',
                    component: () => import('@/views/trails/webglTrails'),
                    meta: {title: 'trails', icon: 'webgl_trails'}
                },
                {
                    path: '/webglVideoKinect',
                    name: 'webglVideoKinect',
                    component: () => import('@/views/video/webglVideoKinect'),
                    meta: {title: 'video_kinect', icon: 'webgl_video_kinect'}
                },
                {
                    path: '/webglVideoPanoramaEquirectangular',
                    name: 'webglVideoPanoramaEquirectangular',
                    component: () => import('@/views/video/webglVideoPanoramaEquirectangular'),
                    meta: {title: 'video_panorama_equirectangular', icon: 'webgl_video_panorama_equirectangular'}
                },
                {
                    path: '/webglWaterFlowmap',
                    name: 'webglWaterFlowmap',
                    component: () => import('@/views/water/webglWaterFlowmap'),
                    meta: {title: 'water_flowmap', icon: 'webgl_water_flowmap'}
                },
                {
                    path: '/webglWater',
                    name: 'webglWater',
                    component: () => import('@/views/water/webglWater'),
                    meta: {title: 'water', icon: 'webgl_water'}
                },
                {
                    path: '/webgl2BuffergeometryAttributesInteger',
                    name: 'webgl2BuffergeometryAttributesInteger',
                    component: () => import('@/views/buffergeometry/webgl2BuffergeometryAttributesInteger'),
                    meta: {title: 'buffergeometry_attributes_integer', icon: 'webgl2_buffergeometry_attributes_integer'}
                },
                {
                    path: '/webgl2MaterialsTexture2darray',
                    name: 'webgl2MaterialsTexture2darray',
                    component: () => import('@/views/materials/webgl2MaterialsTexture2darray'),
                    meta: {title: 'materials_texture2darray', icon: 'webgl2_materials_texture2darray'}
                },
                {
                    path: '/webgl2MaterialsTexture3d',
                    name: 'webgl2MaterialsTexture3d',
                    component: () => import('@/views/materials/webgl2MaterialsTexture3d'),
                    meta: {title: 'materials_texture3d', icon: 'webgl2_materials_texture3d'}
                },
                {
                    path: '/webgl2VolumeCloud',
                    name: 'webgl2VolumeCloud',
                    component: () => import('@/views/volume/webgl2VolumeCloud'),
                    meta: {title: 'volume_cloud', icon: 'webgl2_volume_cloud'}
                },
                {
                    path: '/webgl2VolumeInstancing',
                    name: 'webgl2VolumeInstancing',
                    component: () => import('@/views/volume/webgl2VolumeInstancing'),
                    meta: {title: 'volume_instancing', icon: 'webgl2_volume_instancing'}
                },
                {
                    path: '/webgl2VolumePerlin',
                    name: 'webgl2VolumePerlin',
                    component: () => import('@/views/volume/webgl2VolumePerlin'),
                    meta: {title: 'volume_perlin', icon: 'webgl2_volume_perlin'}
                },
                {
                    path: '/css2dLabel',
                    name: 'css2dLabel',
                    component: () => import('@/views/css2d/css2dLabel'),
                    meta: {title: 'css2d_label', icon: 'css2d_label'}
                },
                {
                    path: '/css3dOrthographic',
                    name: 'css3dOrthographic',
                    component: () => import('@/views/css3d/css3dOrthographic'),
                    meta: {title: 'css3d_orthographic', icon: 'css3d_orthographic'}
                },
                {
                    path: '/css3dPanoramaDeviceorientation',
                    name: 'css3dPanoramaDeviceorientation',
                    component: () => import('@/views/css3d/css3dPanoramaDeviceorientation'),
                    meta: {title: 'css3d_panorama_deviceorientation', icon: 'css3d_panorama_deviceorientation'}
                },
                {
                    path: '/css3dPanorama',
                    name: 'css3dPanorama',
                    component: () => import('@/views/css3d/css3dPanorama'),
                    meta: {title: 'css3d_panorama', icon: 'css3d_panorama'}
                },
                {
                    path: '/css3dSandbox',
                    name: 'css3dSandbox',
                    component: () => import('@/views/css3d/css3dSandbox'),
                    meta: {title: 'css3d_sandbox', icon: 'css3d_sandbox'}
                },
                {
                    path: '/css3dYoutube',
                    name: 'css3dYoutube',
                    component: () => import('@/views/css3d/css3dYoutube'),
                    meta: {title: 'css3d_youtube', icon: 'css3d_youtube'}
                },
                {
                    path: '/miscAnimationGroups',
                    name: 'miscAnimationGroups',
                    component: () => import('@/views/misc/miscAnimationGroups'),
                    meta: {title: 'misc_animation_groups', icon: 'misc_animation_groups'}
                },
                {
                    path: '/miscAnimationKeys',
                    name: 'miscAnimationKeys',
                    component: () => import('@/views/misc/miscAnimationKeys'),
                    meta: {title: 'misc_animation_keys', icon: 'misc_animation_keys'}
                },
                {
                    path: '/miscControlsDeviceorientation',
                    name: 'miscControlsDeviceorientation',
                    component: () => import('@/views/misc/miscControlsDeviceorientation'),
                    meta: {title: 'misc_controls_deviceorientation', icon: 'misc_controls_deviceorientation'}
                },
                {
                    path: '/miscControlsDrag',
                    name: 'miscControlsDrag',
                    component: () => import('@/views/misc/miscControlsDrag'),
                    meta: {title: 'misc_controls_drag', icon: 'misc_controls_drag'}
                },
                {
                    path: '/miscControlsFly',
                    name: 'miscControlsFly',
                    component: () => import('@/views/misc/miscControlsFly'),
                    meta: {title: 'misc_controls_fly', icon: 'misc_controls_fly'}
                },
                {
                    path: '/miscControlsMap',
                    name: 'miscControlsMap',
                    component: () => import('@/views/misc/miscControlsMap'),
                    meta: {title: 'misc_controls_map', icon: 'misc_controls_map'}
                },
                {
                    path: '/miscControlsOrbit',
                    name: 'miscControlsOrbit',
                    component: () => import('@/views/misc/miscControlsOrbit'),
                    meta: {title: 'misc_controls_orbit', icon: 'misc_controls_orbit'}
                },
                {
                    path: '/miscControlsTrackball',
                    name: 'miscControlsTrackball',
                    component: () => import('@/views/misc/miscControlsTrackball'),
                    meta: {title: 'misc_controls_trackball', icon: 'misc_controls_trackball'}
                },
                {
                    path: '/miscControlsTransform',
                    name: 'miscControlsTransform',
                    component: () => import('@/views/misc/miscControlsTransform'),
                    meta: {title: 'misc_controls_transform', icon: 'misc_controls_transform'}
                },
                {
                    path: '/miscExporterCollada',
                    name: 'miscExporterCollada',
                    component: () => import('@/views/misc/miscExporterCollada'),
                    meta: {title: 'misc_exporter_collada', icon: 'misc_exporter_collada'}
                },
                {
                    path: '/miscExporterObj',
                    name: 'miscExporterObj',
                    component: () => import('@/views/misc/miscExporterObj'),
                    meta: {title: 'misc_exporter_obj', icon: 'misc_exporter_obj'}
                },
                {
                    path: '/miscExporterPly',
                    name: 'miscExporterPly',
                    component: () => import('@/views/misc/miscExporterPly'),
                    meta: {title: 'misc_exporter_ply', icon: 'misc_exporter_ply'}
                },
                {
                    path: '/miscExporterStl',
                    name: 'miscExporterStl',
                    component: () => import('@/views/misc/miscExporterStl'),
                    meta: {title: 'misc_exporter_stl', icon: 'misc_exporter_stl'}
                },
                {
                    path: '/miscLookat',
                    name: 'miscLookat',
                    component: () => import('@/views/misc/miscLookat'),
                    meta: {title: 'misc_lookat', icon: 'misc_lookat'}
                },
                {
                    path: '/webaudioOrientation',
                    name: 'webaudioOrientation',
                    component: () => import('@/views/webaudio/webaudioOrientation'),
                    meta: {title: 'webaudio_orientation', icon: 'webaudio_orientation'}
                },
                {
                    path: '/webaudioTiming',
                    name: 'webaudioTiming',
                    component: () => import('@/views/webaudio/webaudioTiming'),
                    meta: {title: 'webaudio_timing', icon: 'webaudio_timing'}
                },
                {
                    path: '/webaudioVisualizer',
                    name: 'webaudioVisualizer',
                    component: () => import('@/views/webaudio/webaudioVisualizer'),
                    meta: {title: 'webaudio_visualizer', icon: 'webaudio_visualizer'}
                },
                {
                    path: '/webaudioSandbox',
                    name: 'webaudioSandbox',
                    component: () => import('@/views/webaudio/webaudioSandbox'),
                    meta: {title: 'webaudio_sandbox', icon: 'webaudio_sandbox'}
                },
                {
                    path: '/svgSandbox',
                    name: 'svgSandbox',
                    component: () => import('@/views/svg/svgSandbox'),
                    meta: {title: 'svg_sandbox', icon: 'svg_sandbox'}
                },
                {
                    path: '/svgLines',
                    name: 'svgLines',
                    component: () => import('@/views/svg/svgLines'),
                    meta: {title: 'svg_lines', icon: 'svg_lines'}
                },
                {
                    path: '/physicsAmmoBreak',
                    name: 'physicsAmmoBreak',
                    component: () => import('@/views/physics/physicsAmmoBreak'),
                    meta: {title: 'physics_ammo_break', icon: 'physics_ammo_break'}
                },
                {
                    path: '/physicsAmmoCloth',
                    name: 'physicsAmmoCloth',
                    component: () => import('@/views/physics/physicsAmmoCloth'),
                    meta: {title: 'physics_ammo_cloth', icon: 'physics_ammo_cloth'}
                },
                {
                    path: '/physicsAmmoInstancing',
                    name: 'physicsAmmoInstancing',
                    component: () => import('@/views/physics/physicsAmmoInstancing'),
                    meta: {title: 'physics_ammo_instancing', icon: 'physics_ammo_instancing'}
                },
                {
                    path: '/physicsAmmoRope',
                    name: 'physicsAmmoRope',
                    component: () => import('@/views/physics/physicsAmmoRope'),
                    meta: {title: 'physics_ammo_rope', icon: 'physics_ammo_rope'}
                },
                {
                    path: '/physicsAmmoTerrain',
                    name: 'physicsAmmoTerrain',
                    component: () => import('@/views/physics/physicsAmmoTerrain'),
                    meta: {title: 'physics_ammo_terrain', icon: 'physics_ammo_terrain'}
                },
                {
                    path: '/physicsAmmoVolume',
                    name: 'physicsAmmoVolume',
                    component: () => import('@/views/physics/physicsAmmoVolume'),
                    meta: {title: 'physics_ammo_volume', icon: 'physics_ammo_volume'}
                },
                {
                    path: '/miscUvTests',
                    name: 'miscUvTests',
                    component: () => import('@/views/misc/miscUvTests'),
                    meta: {title: 'misc_uv_tests', icon: 'misc_uv_tests'}
                },
                {
                    path: '/miscLegacy',
                    name: 'miscLegacy',
                    component: () => import('@/views/misc/miscLegacy'),
                    meta: {title: 'misc_legacy', icon: 'misc_legacy'}
                },
                {
                    path: '/miscExporterDraco',
                    name: 'miscExporterDraco',
                    component: () => import('@/views/misc/miscExporterDraco'),
                    meta: {title: 'misc_exporter_draco', icon: 'misc_exporter_draco'}
                },
                {
                    path: '/miscControlsPointerlock',
                    name: 'miscControlsPointerlock',
                    component: () => import('@/views/misc/miscControlsPointerlock'),
                    meta: {title: 'misc_controls_pointerlock', icon: 'misc_controls_pointerlock'}
                },
                {
                    path: '/miscBoxselection',
                    name: 'miscBoxselection',
                    component: () => import('@/views/misc/miscBoxselection'),
                    meta: {title: 'misc_boxselection', icon: 'misc_boxselection'}
                },
                {
                    path: '/css3dSprites',
                    name: 'css3dSprites',
                    component: () => import('@/views/css3d/css3dSprites'),
                    meta: {title: 'css3d_sprites', icon: 'css3d_sprites'}
                },
                {
                    path: '/css3dPeriodictable',
                    name: 'css3dPeriodictable',
                    component: () => import('@/views/css3d/css3dPeriodictable'),
                    meta: {title: 'css3d_periodictable', icon: 'css3d_periodictable'}
                },
                {
                    path: '/css3dMolecules',
                    name: 'css3dMolecules',
                    component: () => import('@/views/css3d/css3dMolecules'),
                    meta: {title: 'css3d_molecules', icon: 'css3d_molecules'}
                },
                {
                    path: '/webxrVrVideo',
                    name: 'webxrVrVideo',
                    component: () => import('@/views/vr/webxrVrVideo'),
                    meta: {title: 'webxr_vr_video', icon: 'webxr_vr_video'}
                },
                {
                    path: '/webxrVrSculpt',
                    name: 'webxrVrSculpt',
                    component: () => import('@/views/vr/webxrVrSculpt'),
                    meta: {title: 'webxr_vr_sculpt', icon: 'webxr_vr_sculpt'}
                },
                {
                    path: '/webxrVrRollercoaster',
                    name: 'webxrVrRollercoaster',
                    component: () => import('@/views/vr/webxrVrRollercoaster'),
                    meta: {title: 'webxr_vr_rollercoaster', icon: 'webxr_vr_rollercoaster'}
                },
                {
                    path: '/webxrVrPanorama',
                    name: 'webxrVrPanorama',
                    component: () => import('@/views/vr/webxrVrPanorama'),
                    meta: {title: 'webxr_vr_panorama', icon: 'webxr_vr_panorama'}
                },
                {
                    path: '/webxrVrPanoramaDepth',
                    name: 'webxrVrPanoramaDepth',
                    component: () => import('@/views/vr/webxrVrPanoramaDepth'),
                    meta: {title: 'webxr_vr_panorama_depth', icon: 'webxr_vr_panorama_depth'}
                },
                {
                    path: '/webxrVrPaint',
                    name: 'webxrVrPaint',
                    component: () => import('@/views/vr/webxrVrPaint'),
                    meta: {title: 'webxr_vr_paint', icon: 'webxr_vr_paint'}
                },
                {
                    path: '/webxrVrLorenzattractor',
                    name: 'webxrVrLorenzattractor',
                    component: () => import('@/views/vr/webxrVrLorenzattractor'),
                    meta: {title: 'webxr_vr_lorenzattractor', icon: 'webxr_vr_lorenzattractor'}
                },
                {
                    path: '/webxrVrHaptics',
                    name: 'webxrVrHaptics',
                    component: () => import('@/views/vr/webxrVrHaptics'),
                    meta: {title: 'webxr_vr_haptics', icon: 'webxr_vr_haptics'}
                },
                {
                    path: '/webxrVrHandinput',
                    name: 'webxrVrHandinput',
                    component: () => import('@/views/vr/webxrVrHandinput'),
                    meta: {title: 'webxr_vr_handinput', icon: 'webxr_vr_handinput'}
                },
                {
                    path: '/webxrVrHandinputProfiles',
                    name: 'webxrVrHandinputProfiles',
                    component: () => import('@/views/vr/webxrVrHandinputProfiles'),
                    meta: {title: 'webxr_vr_handinput_profiles', icon: 'webxr_vr_handinput_profiles'}
                },
                {
                    path: '/webxrVrHandinputCubes',
                    name: 'webxrVrHandinputCubes',
                    component: () => import('@/views/vr/webxrVrHandinputCubes'),
                    meta: {title: 'webxr_vr_handinput_cubes', icon: 'webxr_vr_handinput_cubes'}
                },
                {
                    path: '/webxrVrDragging',
                    name: 'webxrVrDragging',
                    component: () => import('@/views/vr/webxrVrDragging'),
                    meta: {title: 'webxr_vr_dragging', icon: 'webxr_vr_dragging'}
                },
                {
                    path: '/webxrVrCubes',
                    name: 'webxrVrCubes',
                    component: () => import('@/views/vr/webxrVrCubes'),
                    meta: {title: 'webxr_vr_cubes', icon: 'webxr_vr_cubes'}
                },
                {
                    path: '/webxrVrBallshooter',
                    name: 'webxrVrBallshooter',
                    component: () => import('@/views/vr/webxrVrBallshooter'),
                    meta: {title: 'webxr_vr_ballshooter', icon: 'webxr_vr_ballshooter'}
                },
                {
                    path: '/webxrArPaint',
                    name: 'webxrArPaint',
                    component: () => import('@/views/ar/webxrArPaint'),
                    meta: {title: 'webxr_ar_paint', icon: 'webxr_ar_paint'}
                },
                {
                    path: '/webxrArHittest',
                    name: 'webxrArHittest',
                    component: () => import('@/views/ar/webxrArHittest'),
                    meta: {title: 'webxr_ar_hittest', icon: 'webxr_ar_hittest'}
                },
                {
                    path: '/webxrArCones',
                    name: 'webxrArCones',
                    component: () => import('@/views/ar/webxrArCones'),
                    meta: {title: 'webxr_ar_cones', icon: 'webxr_ar_cones'}
                },
                {
                    path: '/webgl2MultisampledRenderbuffers',
                    name: 'webgl2MultisampledRenderbuffers',
                    component: () => import('@/views/multisampled/webgl2MultisampledRenderbuffers'),
                    meta: {title: 'multisampled_renderbuffers', icon: 'webgl2_multisampled_renderbuffers'}
                },
                {
                    path: '/webglTonemapping',
                    name: 'webglTonemapping',
                    component: () => import('@/views/tonemapping/webglTonemapping'),
                    meta: {title: 'tonemapping', icon: 'webgl_tonemapping'}
                },
                {
                    path: '/webglTestMemory2',
                    name: 'webglTestMemory2',
                    component: () => import('@/views/test/webglTestMemory2'),
                    meta: {title: 'test_memory2', icon: 'webgl_test_memory2'}
                },
                {
                    path: '/webglTestMemory',
                    name: 'webglTestMemory',
                    component: () => import('@/views/test/webglTestMemory'),
                    meta: {title: 'test_memory', icon: 'webgl_test_memory'}
                },
                {
                    path: '/webglShadingPhysical',
                    name: 'webglShadingPhysical',
                    component: () => import('@/views/shading/webglShadingPhysical'),
                    meta: {title: 'shading_physical', icon: 'webgl_shading_physical'}
                },
                {
                    path: '/webglShadersOcean2',
                    name: 'webglShadersOcean2',
                    component: () => import('@/views/shaders/webglShadersOcean2'),
                    meta: {title: 'shaders_ocean2', icon: 'webgl_shaders_ocean2'}
                },
                {
                    path: '/webglShaderLava',
                    name: 'webglShaderLava',
                    component: () => import('@/views/shader/webglShaderLava'),
                    meta: {title: 'shader_lava', icon: 'webgl_shader_lava'}
                },
                {
                    path: '/webglReadFloatBuffer',
                    name: 'webglReadFloatBuffer',
                    component: () => import('@/views/read/webglReadFloatBuffer'),
                    meta: {title: 'read_float_buffer', icon: 'webgl_read_float_buffer'}
                },
                {
                    path: '/webglRaycastTexture',
                    name: 'webglRaycastTexture',
                    component: () => import('@/views/raycast/webglRaycastTexture'),
                    meta: {title: 'raycast_texture', icon: 'webgl_raycast_texture'}
                },
                {
                    path: '/webglPostprocessingNodes',
                    name: 'webglPostprocessingNodes',
                    component: () => import('@/views/postprocessing/webglPostprocessingNodes'),
                    meta: {title: 'postprocessing_nodes', icon: 'webgl_postprocessing_nodes'}
                },
                {
                    path: '/webglPostprocessingNodesPass',
                    name: 'webglPostprocessingNodesPass',
                    component: () => import('@/views/postprocessing/webglPostprocessingNodesPass'),
                    meta: {title: 'postprocessing_nodes_pass', icon: 'webgl_postprocessing_nodes_pass'}
                },
                {
                    path: '/webglPostprocessingCrossfade',
                    name: 'webglPostprocessingCrossfade',
                    component: () => import('@/views/postprocessing/webglPostprocessingCrossfade'),
                    meta: {title: 'postprocessing_crossfade', icon: 'webgl_postprocessing_crossfade'}
                },
                {
                    path: '/webglPerformanceNodes',
                    name: 'webglPerformanceNodes',
                    component: () => import('@/views/performance/webglPerformanceNodes'),
                    meta: {title: 'performance_nodes', icon: 'webgl_performance_nodes'}
                },
                {
                    path: '/webglNearestneighbour',
                    name: 'webglNearestneighbour',
                    component: () => import('@/views/nearestneighbour/webglNearestneighbour'),
                    meta: {title: 'nearestneighbour', icon: 'webgl_nearestneighbour'}
                },
                {
                    path: '/webglMultipleScenesComparison',
                    name: 'webglMultipleScenesComparison',
                    component: () => import('@/views/multiple/webglMultipleScenesComparison'),
                    meta: {title: 'multiple_scenes_comparison', icon: 'webgl_multiple_scenes_comparison'}
                },
                {
                    path: '/webglMultipleRenderers',
                    name: 'webglMultipleRenderers',
                    component: () => import('@/views/multiple/webglMultipleRenderers'),
                    meta: {title: 'multiple_renderers', icon: 'webgl_multiple_renderers'}
                },
                {
                    path: '/webglMultipleElements',
                    name: 'webglMultipleElements',
                    component: () => import('@/views/multiple/webglMultipleElements'),
                    meta: {title: 'multiple_elements', icon: 'webgl_multiple_elements'}
                },
                {
                    path: '/webglMultipleCanvasesGrid',
                    name: 'webglMultipleCanvasesGrid',
                    component: () => import('@/views/multiple/webglMultipleCanvasesGrid'),
                    meta: {title: 'multiple_canvases_grid', icon: 'webgl_multiple_canvases_grid'}
                },
                {
                    path: '/webglMultipleCanvasesComplex',
                    name: 'webglMultipleCanvasesComplex',
                    component: () => import('@/views/multiple/webglMultipleCanvasesComplex'),
                    meta: {title: 'multiple_canvases_complex', icon: 'webgl_multiple_canvases_complex'}
                },
                {
                    path: '/webglMultipleCanvasesCircle',
                    name: 'webglMultipleCanvasesCircle',
                    component: () => import('@/views/multiple/webglMultipleCanvasesCircle'),
                    meta: {title: 'multiple_canvases_circle', icon: 'webgl_multiple_canvases_circle'}
                },
                {
                    path: '/webglMorphtargets',
                    name: 'webglMorphtargets',
                    component: () => import('@/views/morphtargets/webglMorphtargets'),
                    meta: {title: 'morphtargets', icon: 'webgl_morphtargets'}
                },
                {
                    path: '/webglModifierSimplifier',
                    name: 'webglModifierSimplifier',
                    component: () => import('@/views/modifier/webglModifierSimplifier'),
                    meta: {title: 'modifier_simplifier', icon: 'webgl_modifier_simplifier'}
                },
                {
                    path: '/webglModifierEdgesplit',
                    name: 'webglModifierEdgesplit',
                    component: () => import('@/views/modifier/webglModifierEdgesplit'),
                    meta: {title: 'modifier_edgesplit', icon: 'webgl_modifier_edgesplit'}
                },
                {
                    path: '/webglModifierCurveInstanced',
                    name: 'webglModifierCurveInstanced',
                    component: () => import('@/views/modifier/webglModifierCurveInstanced'),
                    meta: {title: 'modifier_curve_instanced', icon: 'webgl_modifier_curve_instanced'}
                },
                {
                    path: '/webglMaterialsVideoWebcam',
                    name: 'webglMaterialsVideoWebcam',
                    component: () => import('@/views/materials/webglMaterialsVideoWebcam'),
                    meta: {title: 'materials_video_webcam', icon: 'webgl_materials_video_webcam'}
                },
                {
                    path: '/webglMaterialsTextureManualmipmap',
                    name: 'webglMaterialsTextureManualmipmap',
                    component: () => import('@/views/materials/webglMaterialsTextureManualmipmap'),
                    meta: {title: 'materials_texture_manualmipmap', icon: 'webgl_materials_texture_manualmipmap'}
                },
                {
                    path: '/webglMaterialsTextureFilters',
                    name: 'webglMaterialsTextureFilters',
                    component: () => import('@/views/materials/webglMaterialsTextureFilters'),
                    meta: {title: 'materials_texture_filters', icon: 'webgl_materials_texture_filters'}
                },
                {
                    path: '/webglMaterialsTextureAnisotropy',
                    name: 'webglMaterialsTextureAnisotropy',
                    component: () => import('@/views/materials/webglMaterialsTextureAnisotropy'),
                    meta: {title: 'materials_texture_anisotropy', icon: 'webgl_materials_texture_anisotropy'}
                },
                {
                    path: '/webglMaterialsSubsurfaceScattering',
                    name: 'webglMaterialsSubsurfaceScattering',
                    component: () => import('@/views/materials/webglMaterialsSubsurfaceScattering'),
                    meta: {title: 'materials_subsurface_scattering', icon: 'webgl_materials_subsurface_scattering'}
                },
                {
                    path: '/webglMaterialsPhysicalReflectivity',
                    name: 'webglMaterialsPhysicalReflectivity',
                    component: () => import('@/views/materials/webglMaterialsPhysicalReflectivity'),
                    meta: {title: 'materials_physical_reflectivity', icon: 'webgl_materials_physical_reflectivity'}
                },
                {
                    path: '/webglMaterialsEnvmapsPmremNodes',
                    name: 'webglMaterialsEnvmapsPmremNodes',
                    component: () => import('@/views/materials/webglMaterialsEnvmapsPmremNodes'),
                    meta: {title: 'materials_envmaps_pmrem_nodes', icon: 'webgl_materials_envmaps_pmrem_nodes'}
                },
                {
                    path: '/webglMaterialsEnvmapsParallax',
                    name: 'webglMaterialsEnvmapsParallax',
                    component: () => import('@/views/materials/webglMaterialsEnvmapsParallax'),
                    meta: {title: 'materials_envmaps_parallax', icon: 'webgl_materials_envmaps_parallax'}
                },
                {
                    path: '/webglMaterialsCubemap',
                    name: 'webglMaterialsCubemap',
                    component: () => import('@/views/materials/webglMaterialsCubemap'),
                    meta: {title: 'materials_cubemap', icon: 'webgl_materials_cubemap'}
                },
                {
                    path: '/webglMaterialsCubemapMipmaps',
                    name: 'webglMaterialsCubemapMipmaps',
                    component: () => import('@/views/materials/webglMaterialsCubemapMipmaps'),
                    meta: {title: 'materials_cubemap_mipmaps', icon: 'webgl_materials_cubemap_mipmaps'}
                },
                {
                    path: '/webglMaterialsCar',
                    name: 'webglMaterialsCar',
                    component: () => import('@/views/materials/webglMaterialsCar'),
                    meta: {title: 'materials_car', icon: 'webgl_materials_car'}
                },
                {
                    path: '/webglMaterialsBlendingCustom',
                    name: 'webglMaterialsBlendingCustom',
                    component: () => import('@/views/materials/webglMaterialsBlendingCustom'),
                    meta: {title: 'materials_blending_custom', icon: 'webgl_materials_blending_custom'}
                },
                {
                    path: '/webglLoaderX',
                    name: 'webglLoaderX',
                    component: () => import('@/views/loader/webglLoaderX'),
                    meta: {title: 'webgl_loader_x', icon: 'webgl_loader_x'}
                },
                {
                    path: '/webglLoaderVtk',
                    name: 'webglLoaderVtk',
                    component: () => import('@/views/loader/webglLoaderVtk'),
                    meta: {title: 'webgl_loader_vtk', icon: 'webgl_loader_vtk'}
                },
                {
                    path: '/webglLoaderVrm',
                    name: 'webglLoaderVrm',
                    component: () => import('@/views/loader/webglLoaderVrm'),
                    meta: {title: 'webgl_loader_vrm', icon: 'webgl_loader_vrm'}
                },
                {
                    path: '/webglLoaderTexturePvrtc',
                    name: 'webglLoaderTexturePvrtc',
                    component: () => import('@/views/loader/webglLoaderTexturePvrtc'),
                    meta: {title: 'webgl_loader_texture_pvrtc', icon: 'webgl_loader_texture_pvrtc'}
                },
                {
                    path: '/webglLoaderTextureLottie',
                    name: 'webglLoaderTextureLottie',
                    component: () => import('@/views/loader/webglLoaderTextureLottie'),
                    meta: {title: 'webgl_loader_texture_lottie', icon: 'webgl_loader_texture_lottie'}
                },
                {
                    path: '/webglLoaderTextureKtx2',
                    name: 'webglLoaderTextureKtx2',
                    component: () => import('@/views/loader/webglLoaderTextureKtx2'),
                    meta: {title: 'webgl_loader_texture_ktx2', icon: 'webgl_loader_texture_ktx2'}
                },
                {
                    path: '/webglLoaderTextureDds',
                    name: 'webglLoaderTextureDds',
                    component: () => import('@/views/loader/webglLoaderTextureDds'),
                    meta: {title: 'loader_texture_dds', icon: 'webgl_loader_texture_dds'}
                },
                {
                    path: '/webglLoaderTextureBasis',
                    name: 'webglLoaderTextureBasis',
                    component: () => import('@/views/loader/webglLoaderTextureBasis'),
                    meta: {title: 'loader_texture_basis', icon: 'webgl_loader_texture_basis'}
                },
                {
                    path: '/webglLoaderSvg',
                    name: 'webglLoaderSvg',
                    component: () => import('@/views/loader/webglLoaderSvg'),
                    meta: {title: 'loader_svg', icon: 'webgl_loader_svg'}
                },
                {
                    path: '/webglLoaderPrwm',
                    name: 'webglLoaderPrwm',
                    component: () => import('@/views/loader/webglLoaderPrwm'),
                    meta: {title: 'loader_prwm', icon: 'webgl_loader_prwm'}
                },
                {
                    path: '/webglLoaderPdb',
                    name: 'webglLoaderPdb',
                    component: () => import('@/views/loader/webglLoaderPdb'),
                    meta: {title: 'loader_pdb', icon: 'webgl_loader_pdb'}
                },
                {
                    path: '/webglLoaderObj2',
                    name: 'webglLoaderObj2',
                    component: () => import('@/views/loader/webglLoaderObj2'),
                    meta: {title: 'loader_obj2', icon: 'webgl_loader_obj2'}
                },
                {
                    path: '/webglLoaderObj2Options',
                    name: 'webglLoaderObj2Options',
                    component: () => import('@/views/loader/webglLoaderObj2Options'),
                    meta: {title: 'loader_obj2_options', icon: 'webgl_loader_obj2_options'}
                },
                {
                    path: '/webglLoaderObj',
                    name: 'webglLoaderObj',
                    component: () => import('@/views/loader/webglLoaderObj'),
                    meta: {title: 'loader_obj', icon: 'webgl_loader_obj'}
                },
                {
                    path: '/webglLoaderMmd',
                    name: 'webglLoaderMmd',
                    component: () => import('@/views/loader/webglLoaderMmd'),
                    meta: {title: 'loader_mmd', icon: 'webgl_loader_mmd'}
                },
                {
                    path: '/webglLoaderMmdPose',
                    name: 'webglLoaderMmdPose',
                    component: () => import('@/views/loader/webglLoaderMmdPose'),
                    meta: {title: 'loader_mmd_pose', icon: 'webgl_loader_mmd_pose'}
                },
                {
                    path: '/webglLoaderMmdAudio',
                    name: 'webglLoaderMmdAudio',
                    component: () => import('@/views/loader/webglLoaderMmdAudio'),
                    meta: {title: 'loader_mmd_audio', icon: 'webgl_loader_mmd_audio'}
                },
                {
                    path: '/webglLoaderGltfExtensions',
                    name: 'webglLoaderGltfExtensions',
                    component: () => import('@/views/loader/webglLoaderGltfExtensions'),
                    meta: {title: 'loader_gltf_extensions', icon: 'webgl_loader_gltf_extensions'}
                },
                {
                    path: '/webglLoaderFbx',
                    name: 'webglLoaderFbx',
                    component: () => import('@/views/loader/webglLoaderFbx'),
                    meta: {title: 'loader_fbx', icon: 'webgl_loader_fbx'}
                },
                {
                    path: '/webglLoaderFbxNurbs',
                    name: 'webglLoaderFbxNurbs',
                    component: () => import('@/views/loader/webglLoaderFbxNurbs'),
                    meta: {title: 'loader_fbx_nurbs', icon: 'webgl_loader_fbx_nurbs'}
                },
                {
                    path: '/webglLoaderDraco',
                    name: 'webglLoaderDraco',
                    component: () => import('@/views/loader/webglLoaderDraco'),
                    meta: {title: 'webgl_loader_draco', icon: 'webgl_loader_draco'}
                },
                {
                    path: '/webglLoaderCollada',
                    name: 'webglLoaderCollada',
                    component: () => import('@/views/loader/webglLoaderCollada'),
                    meta: {title: 'webgl_loader_collada', icon: 'webgl_loader_collada'}
                },
                {
                    path: '/webglLoaderColladaSkinning',
                    name: 'webglLoaderColladaSkinning',
                    component: () => import('@/views/loader/webglLoaderColladaSkinning'),
                    meta: {title: 'webgl_loader_collada_skinning', icon: 'webgl_loader_collada_skinning'}
                },
                {
                    path: '/webglLoaderAssimp',
                    name: 'webglLoaderAssimp',
                    component: () => import('@/views/loader/webglLoaderAssimp'),
                    meta: {title: 'loader_assimp', icon: 'webgl_loader_assimp'}
                },
                {
                    path: '/webglLoader3mf',
                    name: 'webglLoader3mf',
                    component: () => import('@/views/loader/webglLoader3mf'),
                    meta: {title: 'loader_3mf', icon: 'webgl_loader_3mf'}
                },
                {
                    path: '/webglLoader3dm',
                    name: 'webglLoader3dm',
                    component: () => import('@/views/loader/webglLoader3dm'),
                    meta: {title: 'loader_3dm', icon: 'webgl_loader_3dm'}
                },
                {
                    path: '/webglLightningstrike',
                    name: 'webglLightningstrike',
                    component: () => import('@/views/lightningstrike/webglLightningstrike'),
                    meta: {title: 'lightningstrike', icon: 'webgl_lightningstrike'}
                },
                {
                    path: '/webglLensflares',
                    name: 'webglLensflares',
                    component: () => import('@/views/lensflares/webglLensflares'),
                    meta: {title: 'lensflares', icon: 'webgl_lensflares'}
                },
                {
                    path: '/webglInstancingDynamic',
                    name: 'webglInstancingDynamic',
                    component: () => import('@/views/instancing/webglInstancingDynamic'),
                    meta: {title: 'instancing_dynamic', icon: 'webgl_instancing_dynamic'}
                },
                {
                    path: '/webglInstancingModified',
                    name: 'webglInstancingModified',
                    component: () => import('@/views/instancing/webglInstancingModified'),
                    meta: {title: 'instancing_modified', icon: 'webgl_instancing_modified'}
                },
                {
                    path: '/webglGeometryExtrudeShapes2',
                    name: 'webglGeometryExtrudeShapes2',
                    component: () => import('@/views/geometries/webglGeometryExtrudeShapes2'),
                    meta: {title: 'geometry_extrude_shapes2', icon: 'webgl_geometry_extrude_shapes2'}
                },
                {
                    path: '/webglAnimationMultiple',
                    name: 'webglAnimationMultiple',
                    component: () => import('@/views/animation/webglAnimationMultiple'),
                    meta: {title: 'animation_multiple', icon: 'webgl_animation_multiple'}
                },
                {
                    path: '/webglBuffergeometryPoints',
                    name: 'webglBuffergeometryPoints',
                    component: () => import('@/views/buffergeometry/webglBuffergeometryPoints'),
                    meta: {title: 'buffergeometry_points', icon: 'webgl_buffergeometry_points'}
                },
                {
                    path: '/webglCameraArray',
                    name: 'webglCameraArray',
                    component: () => import('@/views/camera/webglCameraArray'),
                    meta: {title: 'camera_array', icon: 'webgl_camera_array'}
                },
                {
                    path: '/webglCamera',
                    name: 'webglCamera',
                    component: () => import('@/views/camera/webglCamera'),
                    meta: {title: 'camera', icon: 'webgl_camera'}
                },
                {
                    path: '/webglClippingStencil',
                    name: 'webglClippingStencil',
                    component: () => import('@/views/clipping/webglClippingStencil'),
                    meta: {title: 'clipping_stencil', icon: 'webgl_clipping_stencil'}
                },
                {
                    path: '/webglDecals',
                    name: 'webglDecals',
                    component: () => import('@/views/decals/webglDecals'),
                    meta: {title: 'decals', icon: 'webgl_decals'}
                },
                {
                    path: '/webglEffectsAnaglyph',
                    name: 'webglEffectsAnaglyph',
                    component: () => import('@/views/effects/webglEffectsAnaglyph'),
                    meta: {title: 'effects_anaglyph', icon: 'webgl_effects_anaglyph'}
                },
                {
                    path: '/webglEffectsParallaxbarrier',
                    name: 'webglEffectsParallaxbarrier',
                    component: () => import('@/views/effects/webglEffectsParallaxbarrier'),
                    meta: {title: 'effects_parallaxbarrier', icon: 'webgl_effects_parallaxbarrier'}
                },
                {
                    path: '/webglEffectsPeppersghost',
                    name: 'webglEffectsPeppersghost',
                    component: () => import('@/views/effects/webglEffectsPeppersghost'),
                    meta: {title: 'effects_peppersghost', icon: 'webgl_effects_peppersghost'}
                },
                {
                    path: '/webglEffectsStereo',
                    name: 'webglEffectsStereo',
                    component: () => import('@/views/effects/webglEffectsStereo'),
                    meta: {title: 'webgl_effects_stereo', icon: 'webgl_effects_stereo'}
                },
                {
                    path: '/webglClippingAdvanced',
                    name: 'webglClippingAdvanced',
                    component: () => import('@/views/clipping/webglClippingAdvanced'),
                    meta: {title: 'clipping_advanced', icon: 'webgl_clipping_advanced'}
                },
                {
                    path: '/webglCameraLogarithmicdepthbuffer',
                    name: 'webglCameraLogarithmicdepthbuffer',
                    component: () => import('@/views/camera/webglCameraLogarithmicdepthbuffer'),
                    meta: {title: 'camera_logarithmicdepthbuffer', icon: 'webgl_camera_logarithmicdepthbuffer'}
                },
                {
                    path: '/webglBuffergeometryInstancingBillboards',
                    name: 'webglBuffergeometryInstancingBillboards',
                    component: () => import('@/views/buffergeometry/webglBuffergeometryInstancingBillboards'),
                    meta: {title: 'buffergeometry_instancing_billboards', icon: 'webgl_buffergeometry_instancing_billboards'}
                },
                {
                    path: '/webglBuffergeometryDrawrange',
                    name: 'webglBuffergeometryDrawrange',
                    component: () => import('@/views/buffergeometry/webglBuffergeometryDrawrange'),
                    meta: {title: 'buffergeometry_drawrange', icon: 'webgl_buffergeometry_drawrange'}
                },
                {
                    path: '/webglBuffergeometryCustomAttributesParticles',
                    name: 'webglBuffergeometryCustomAttributesParticles',
                    component: () => import('@/views/buffergeometry/webglBuffergeometryCustomAttributesParticles'),
                    meta: {title: 'buffergeometry_custom_attributes_particles', icon: 'webgl_buffergeometry_custom_attributes_particles'}
                },
                {
                    path: '/webglAnimationSkinningBlending',
                    name: 'webglAnimationSkinningBlending',
                    component: () => import('@/views/animation/webglAnimationSkinningBlending'),
                    meta: {title: 'animation_skinning_blending', icon: 'webgl_animation_skinning_blending'}
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
        {
            path: '/test',
            name: 'test',
            component: () => import('@/views/test')
        },
        // {
        //     path: '/physicsAmmoVolume',
        //     name: 'physicsAmmoVolume',
        //     component: () => import('@/views/physics/physicsAmmoVolume'),
        //     meta: {title: 'physics_ammo_volume', icon: 'physics_ammo_volume'}
        // },


      
      
      
        // {
        //     path: '/webglLod',
        //     name: 'webglLod',
        //     component: () => import('@/views/lod/webglLod'),
        //     meta: {title: 'lod', icon: 'webgl_lod'}
        // },
        // {
        //     path: '/webglLinesFat',
        //     name: 'webglLinesFat',
        //     component: () => import('@/views/lines/webglLinesFat'),
        //     meta: {title: 'lines_fat', icon: 'webgl_lines_fat'}
        // },
        // {
        //     path: '/webglLinesFatWireframe',
        //     name: 'webglLinesFatWireframe',
        //     component: () => import('@/views/lines/webglLinesFatWireframe'),
        //     meta: {title: 'lines_fat_wireframe', icon: 'webgl_lines_fat_wireframe'}
        // },
        // {
        //     path: '/webglMultipleViews',
        //     name: 'webglMultipleViews',
        //     component: () => import('@/views/multiple/webglMultipleViews'),
        //     meta: {title: 'multiple_views', icon: 'webgl_multiple_views'}
        // },
        // {
        //     path: '/webglModifierTessellation',
        //     name: 'webglModifierTessellation',
        //     component: () => import('@/views/modifier/webglModifierTessellation'),
        //     meta: {title: 'modifier_tessellation', icon: 'webgl_modifier_tessellation'}
        // },
        // {
        //     path: '/webglMaterialsNodes',
        //     name: 'webglMaterialsNodes',
        //     component: () => import('@/views/materials/webglMaterialsNodes'),
        //     meta: {title: 'materials_nodes', icon: 'webgl_materials_nodes'}
        // },
        // {
        //     path: '/webglInstancingPerformance',
        //     name: 'webglInstancingPerformance',
        //     component: () => import('@/views/instancing/webglInstancingPerformance'),
        //     meta: {title: 'instancing_performance', icon: 'webgl_instancing_performance'}
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
        //     path: '/webglFramebufferTexture',
        //     name: 'webglFramebufferTexture',
        //     component: () => import('@/views/framebuffer/webglFramebufferTexture'),
        //     meta: {title: 'webgl_framebuffer_texture', icon: 'webgl_framebuffer_texture'}
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

        {
            path: '/miscExporterGltf',
            name: 'miscExporterGltf',
            component: () => import('@/views/misc/miscExporterGltf'),
            meta: {title: 'misc_exporter_gltf', icon: 'misc_exporter_gltf'}
        },
        // {
        //     path: '/webxrVrSandbox',
        //     name: 'webxrVrSandbox',
        //     component: () => import('@/views/vr/webxrVrSandbox'),
        //     meta: {title: 'webxr_vr_sandbox', icon: 'webxr_vr_sandbox'}
        // },
        // {
        //     path: '/webgpuSandbox',
        //     name: 'webgpuSandbox',
        //     component: () => import('@/views/sandbox/webgpuSandbox'),
        //     meta: {title: 'webgpu_sandbox', icon: 'webgpu_sandbox'}
        // },
        // {
        //     path: '/webgpuRtt',
        //     name: 'webgpuRtt',
        //     component: () => import('@/views/rtt/webgpuRtt'),
        //     meta: {title: 'webgpu_rtt', icon: 'webgpu_rtt'}
        // },
        // {
        //     path: '/webgpuCompute',
        //     name: 'webgpuCompute',
        //     component: () => import('@/views/compute/webgpuCompute'),
        //     meta: {title: 'compute', icon: 'webgpu_compute'}
        // },
        // {
        //     path: '/webglWorkerOffscreencanvas',
        //     name: 'webglWorkerOffscreencanvas',
        //     component: () => import('@/views/worker/webglWorkerOffscreencanvas'),
        //     meta: {title: 'worker_offscreencanvas', icon: 'webgl_worker_offscreencanvas'}
        // },
        // {
        //     path: '/webglSkinningSimple',
        //     name: 'webglSkinningSimple',
        //     component: () => import('@/views/skinning/webglSkinningSimple'),
        //     meta: {title: 'skinning_simple', icon: 'webgl_skinning_simple'}
        // },
        // {
        //     path: '/webglShadersTonemapping',
        //     name: 'webglShadersTonemapping',
        //     component: () => import('@/views/shaders/webglShadersTonemapping'),
        //     meta: {title: 'shaders_tonemapping', icon: 'webgl_shaders_tonemapping'}
        // },
        // {
        //     path: '/webglShader2',
        //     name: 'webglShader2',
        //     component: () => import('@/views/shader2/webglShader2'),
        //     meta: {title: 'shader2', icon: 'webgl_shader2'}
        // },
        // {
        //     path: '/webglPostprocessingFxaa',
        //     name: 'webglPostprocessingFxaa',
        //     component: () => import('@/views/postprocessing/webglPostprocessingFxaa'),
        //     meta: {title: 'postprocessing_fxaa', icon: 'webgl_postprocessing_fxaa'}
        // },
        // {
        //     path: '/webglMultipleElementsText',
        //     name: 'webglMultipleElementsText',
        //     component: () => import('@/views/multiple/webglMultipleElementsText'),
        //     meta: {title: 'multiple_elements_text', icon: 'webgl_multiple_elements_text'}
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
    ]
})
