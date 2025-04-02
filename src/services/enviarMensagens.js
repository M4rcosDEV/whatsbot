async function enviarMensagens(client, numero, mensagem) {
    try {
        await client.sendMessage(numero, mensagem);
        console.log("📩 Mensagem com botões enviada!");
    } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
    }
}

module.exports = { enviarMensagens };