// fotoCache.js
const fotoCache = new Map();

async function getFotoPerfilComCache(numero, getFotoPerfil) {
    if (fotoCache.has(numero)) {
        return fotoCache.get(numero);
    }

    const foto = await getFotoPerfil(numero);
    fotoCache.set(numero, foto);
    return foto;
}

module.exports = {
    getFotoPerfilComCache,
};
