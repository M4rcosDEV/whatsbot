async function buscarHistorico(client, numero, qtdMensagem) {
    const historico = [];

    try {
        const chat = await client.getChatById(numero);

        if (!chat) {
            console.log("❌ Chat não encontrado.");
            return [];
        }

        const messages = await chat.fetchMessages({ limit: qtdMensagem });

        for (const msg of messages) {
            if (
                (!msg.body && !msg.hasMedia) ||
                msg.type === 'e2e_notification' ||
                msg.type === 'ciphertext'
            ) continue;

            const item = {
                de: msg.fromMe ? "atendente" : "cliente",
                tipo: msg.type,
                timestamp: msg.timestamp,
            };

            if (msg.hasMedia) {
                item.conteudo = {
                    id: msg.id.id,               // Importante: usado pra buscar a mídia via socket
                    mimetype: msg.mimetype,
                    filename: msg.filename || "arquivo",
                    hasMedia: true
                };
            } else {
                item.conteudo = msg.body;
            }

            historico.push(item);
        }

        return historico;

    } catch (error) {
        console.error("❌ Erro ao buscar histórico:", error);
        return [];
    }
}

module.exports = { buscarHistorico };