async function enviarMensagens(client, numero, mensagem) {
    try {
        await client.sendMessage(numero, mensagem);
    } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
    }
}

module.exports = { enviarMensagens };