const crypto = require("crypto"); // Para gerar protocolos únicos

// Função para gerar um protocolo único
const gerarProtocolo = () => {
    return crypto.randomBytes(5).toString("hex").toUpperCase();
};

module.exports = {
    gerarProtocolo
};