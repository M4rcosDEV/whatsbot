const client = require("../services/whatsappClient.js");
const {buscarHistorico} = require('../services/historicoChat.js');
const {enviarMensagens} = require('../services/enviarMensagens.js');

async function conversasAbertas(req, res) {
    try {
        const chats = await client.getChats();

        const chatsFiltrados = chats.filter(chat =>
            !chat.id._serialized.endsWith("@g.us") &&
            !chat.id._serialized.endsWith("@broadcast") &&
            !chat.id._serialized.endsWith("@newsletter")
        );

        const conversas = await Promise.all(
            chatsFiltrados.map(async (chat) => {
                try {
                    const contato = await chat.getContact();
                    const nome = contato.pushname || contato.name || contato.number;
                    const numero = contato.id._serialized;

                    // const fotoPerfil = await getFotoPerfilComCache(numero, getFotoPerfil);

                    return {
                        nome,
                        numero,
                        // foto_perfil: fotoPerfil,
                        id: chat.id._serialized,
                        //unreadCount: chat.unreadCount,
                        //isMuted: chat.isMuted,
                        //isArchived: chat.archived,
                        //isGroup: chat.isGroup,
                        //ultimaMensagem: chat.lastMessage?.body || null,
                        ultimoTimestamp: chat.lastMessage?.timestamp || 0
                    };
                } catch (error) {
                    console.error("Erro ao processar chat:", error);
                    return null;
                }
            })
        );

        const conversasValidas = conversas.filter(c => c !== null);

        // Ordena por última mensagem mais recente
        conversasValidas.sort((a, b) => b.ultimoTimestamp - a.ultimoTimestamp);

        // Retorna todas as conversas, sem limitar
        res.json(conversasValidas);
    } catch (err) {
        console.error("Erro ao buscar conversas:", err);
        res.status(500).json({ erro: "Erro ao buscar conversas" });
    }
}

async function buscarHistoricoConversa(req, res) {
    const numero = req.params.numero;
  
    try {
      // Aqui usamos o número (JID) direto
      const historico = await buscarHistorico(client, numero, 20);
  
      return res.status(200).json({
        historico: historico
      });
  
    } catch (error) {
      console.error('Erro ao buscar histórico da conversa:', error);
      return res.status(500).json({
        mensagem: 'Erro interno ao buscar histórico da conversa',
        descricao: error.message
      });
    }
  }

async function enviarMensagensClienteConversa(req, res) {
    const conversaId = req.params.id_conversa;
    const mensagem = req.body.mensagem;
    try {

        await enviarMensagens(client, conversaId, mensagem);
        
        return res.status(200).json({
            mensagem : mensagem
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem para cliente:', error);
        return res.status(500).json({ mensagem: 'Erro interno ao enviar mensagem para client', descrição: error.message });
    }
}
  

module.exports = {
    conversasAbertas,
    buscarHistoricoConversa,
    enviarMensagensClienteConversa
};

