export async function loadCubeTextureWithMipmaps() {
    const path = 'static/textures/cube/angus/'
    const format = '.jpg'
    const mipmaps = []
    const maxLevel = 8
    async function loadCubeTexture( urls ) {
        return new Promise( function ( resolve ) {
            new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {
                resolve( cubeTexture )
            } )
        } )
    }
    // load mipmaps
    const pendings = []
    for ( let level = 0; level <= maxLevel; ++ level ) {
        const urls = []
        for ( let face = 0; face < 6; ++ face ) {
            urls.push( path + 'cube_m0' + level + '_c0' + face + format )
        }
        const mipmapLevel = level
        pendings.push( loadCubeTexture( urls ).then( function ( cubeTexture ) {
            mipmaps[ mipmapLevel ] = cubeTexture
        } ) )
    }
    await Promise.all( pendings )
    const customizedCubeTexture = mipmaps.shift()
    customizedCubeTexture.mipmaps = mipmaps
    customizedCubeTexture.minFilter = THREE.LinearMipMapLinearFilter
    customizedCubeTexture.magFilter = THREE.LinearFilter
    customizedCubeTexture.generateMipmaps = false
    customizedCubeTexture.needsUpdate = true
    return customizedCubeTexture
}

export default { loadCubeTextureWithMipmaps }