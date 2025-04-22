// Função para obter o nome do contato salvo
const client = require("../services/whatsappClient.js");

async function getNomeContato(numero) {
    try {
        const contato = await client.getContactById(numero);
        return contato.pushname || contato.name || numero; // Retorna o nome salvo ou o número se não houver nome
    } catch (error) {
        console.error(`Erro ao obter nome do contato: ${error}`);
        return numero; // Retorna o número caso haja erro
    }
}

module.exports = {
    getNomeContato
};