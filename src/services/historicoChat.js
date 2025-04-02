async function buscarHistorico(client, numero, qtdMensagem) {
    try {
            // Obtém o chat e o histórico de mensagens
            const chat = await client.getChatById(numero);
    
            if (chat) { 
                const messages = await chat.fetchMessages({ limit: qtdMensagem }); 
                console.log("📜 Histórico de mensagens:");
                //console.log(messages);
    
                for (const msg of messages) {
                    const date = new Date(msg.timestamp * 1000).toLocaleString("pt-BR"); // Convertendo timestamp
                    const sender = msg.fromMe ? "Você" : "Cliente";
            
                    if (msg.hasMedia && msg.type === 'image') {
                        const media = await msg.downloadMedia();
                        console.log(`[${date}] ${sender}: [Enviou uma imagem]`);
                        //console.log(`Mídia Base64: ${media.data.substring(0, 50)}...`); // Exibe um trecho da imagem em base64
                        
                    } else if (msg.hasMedia && msg.type === 'video') {
                        const media = await msg.downloadMedia();
                        console.log(`[${date}] ${sender}: [Enviou um vídeo]`);
    
                    } else if( msg.hasMedia && msg.type === 'document') {
                        const media = await msg.downloadMedia();
                        console.log(`[${date}] ${sender}: [Enviou um arquivo]`);
    
                    } else if(msg.hasMedia && msg.type === 'ptt'){
                        const media = await msg.downloadMedia();
                        console.log(`[${date}] ${sender}: [Enviou um audio]`);
    
                    }else {
                        console.log(`[${date}] ${sender}: ${msg.body}`);
                    }
                }
                
            } else {
                console.log("❌ Chat não encontrado.");
            }
        } catch (error) {
            console.error("❌ Erro ao buscar histórico:", error);
        }
}

module.exports = { buscarHistorico };