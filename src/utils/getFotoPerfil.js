const client = require("../services/whatsappClient.js");

async function getFotoPerfil(numero) {
    try {
        const contato = await client.getContactById(numero);
        const fotoUrl = await contato.getProfilePicUrl();
        return fotoUrl || null;
    } catch (error) {
        console.error(`Erro ao obter foto de perfil: ${error}`);
        return null;
    }
}


module.exports = {
    getFotoPerfil
};