const { Client, LocalAuth  } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require("express");
const sequelize = require("./src/config/database.js");
const {buscarHistorico} = require('./src/services/historicoChat.js');
const { buscarHistoricoChat } = require('./src/services/enviarMensagens.js');
const Atendimento = require('./src/models/atendimento.js');

const crypto = require("crypto"); // Para gerar protocolos únicos

const app = express();
app.use(express.json()); // Permitir JSON no body das requisições

const client = new Client({
    authStrategy: new LocalAuth(),
});

const atendentes = {
    'Dija': '557799756787', // Substitua pelo número correto do atendente
};

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});


let atendimentos = {}; // Armazena protocolos ativos

const chatId = "55779@c.us"; // Número do contato

client.on("ready", async () => {
    console.log("✅ Bot conectado!");
    

    //buscarHistorico(client, chatId, 4);

});



// Captura novas mensagens em tempo real
client.on("message", async (message) => {
    if (message.from.endsWith('@g.us')) {return}
    const remetente = message.from;
    const sender = message.fromMe ? "Você" : "Cliente";
    const date = new Date(message.timestamp * 1000).toLocaleString("pt-BR");

    const tipoMsg = verificarTipo(message);

    console.log(`[${date}] ${sender=='Cliente'? message.from : sender}: ${tipoMsg}`);

    let atendimento = await Atendimento.findOne({ where: { cliente: remetente, data_fim: null } });

    
    //console.log(remetente);

    if (!atendimento) {
        const protocolo = gerarProtocolo();
        atendimento = await Atendimento.create({ protocolo, cliente: remetente });

        //substituir para remetente
        client.sendMessage('557798441226@c.us', `Olá! Seu protocolo de atendimento é: *${protocolo}*`);
    }

    //console.log(`📩 Nova mensagem: ${message.body}`);
});

// Função para gerar um protocolo único
const gerarProtocolo = () => {
    return crypto.randomBytes(5).toString("hex").toUpperCase();
};

// Exemplo de uso do protocolo
console.log("🔢 Protocolo gerado:", gerarProtocolo());

// client.on('message', async message => {
//     // Ignora mensagens de grupos
//     if (message.from.endsWith('@g.us')) {
//         console.log('📢 Mensagem de grupo ignorada:', message.from);
//         return;
//     }

//     if (message.body.toLowerCase() === 'atendimento') {
//         const atendenteNome = 'Dija';
//         const atendenteNumero = atendentes[atendenteNome];
//         let chatId = `${atendenteNumero}@c.us`;
//         if (atendenteNumero) {
//             console.log(`🔄 Transferindo atendimento para ${atendenteNome} (${atendenteNumero})`);

//             // Responde ao cliente confirmando a transferência
//             await message.reply(`Você foi transferido para *${atendenteNome}*, nosso atendente. Ele responderá em breve. 😊`);

//             // Notifica o atendente sobre o novo atendimento
//             const clienteNumero = message.from; // Número do cliente que pediu atendimento
//             const mensagemAtendente = `🔔 *Novo atendimento!*\n👤 Cliente: *${clienteNumero}*\n💬 Mensagem: "${message.body}"`;

//             try {
//                 await client.sendMessage(chatId, mensagemAtendente);
//                 console.log(`✅ Mensagem enviada para o atendente ${atendenteNome}`);
//             } catch (error) {
//                 console.error(`❌ Erro ao enviar mensagem para o atendente:`, error);
//             }
//         } else {
//             console.log('⚠️ Nenhum atendente disponível.');
//             await message.reply('No momento, não há atendentes disponíveis. Tente novamente mais tarde.');
//         }
//     }
// });

// Captura mensagens e gerencia atendimentos
// client.on("message", async (msg) => {
//     const remetente = msg.from;

//     // Se for a primeira mensagem do cliente, criar um atendimento
//     if (!atendimentos[remetente]) {
//         const protocolo = gerarProtocolo();
//         atendimentos[remetente] = protocolo;

//         await pool.query(
//             "INSERT INTO atendimentos (protocolo, cliente) VALUES ($1, $2) RETURNING id",
//             [protocolo, remetente]
//         );

//         client.sendMessage(
//             remetente,
//             `Seu atendimento foi iniciado! Protocolo: *${protocolo}*`
//         );
//     }

//     // Salvar a mensagem no banco
//     const protocolo = atendimentos[remetente];

//     await pool.query(
//         "INSERT INTO mensagens (atendimento_id, remetente, mensagem) VALUES ((SELECT id FROM atendimentos WHERE protocolo = $1), $2, $3)",
//         [protocolo, remetente, msg.body]
//     );

//     console.log(`Mensagem salva: ${msg.body} (Protocolo: ${protocolo})`);
// });


function verificarTipo(msg) {
    if (msg.hasMedia && msg.type === 'image') {
        return 'imagem';
    } else if (msg.hasMedia && msg.type === 'video') {
        return 'video';

    } else if( msg.hasMedia && msg.type === 'document') {
        return 'documento';
    } else if(msg.hasMedia && msg.type === 'ptt'){
        return 'audio';
    }else {
        return 'texto';
    }   
}

client.initialize();

// Sincronizar com o banco
sequelize.sync({ alter: true })
    .then(() => console.log("Tabelas sincronizadas com o banco!"))
    .catch(err => console.error("Erro ao sincronizar tabelas:", err));

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));

