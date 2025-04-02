const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('message_create', message => {
	if (message.body === 'oi') {
		// reply back "pong" directly to the message
		message.reply('pong');
	}
});


client.initialize();

      // Número para enviar a mensagem (formato internacional sem "+" e sem espaços)
        // let numero = "5577981035533"; // Substitua pelo número desejado
        // let mensagem = "Olá! Esta é uma mensagem enviada pelo bot.";
    
        // let chatId = `${numero}@c.us`; // Formato correto do WhatsApp Web
    
        // client.sendMessage(chatId, mensagem)
        //     .then(() => console.log("Mensagem enviada com sucesso!"))
        //     .catch((err) => console.error("Erro ao enviar mensagem:", err));

        // client.getChatById("557781035533@c.us").then(async (chat) => {
        //     const messages = await chat.fetchMessages({ limit: 20 }); // Pega as últimas 20 mensagens
            
        //     // Exibe apenas o texto das mensagens
        //     messages.forEach(msg => {
        //         console.log(msg.body);
        //     });
        // });
