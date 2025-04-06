const qrcode = require('qrcode-terminal');
const express = require("express");
const {buscarHistorico} = require('./src/services/historicoChat.js');
const client = require("./src/services/whatsappClient.js");
const {gerarProtocolo} = require("./src/utils/gerarProtocolo.js");
const atendimentoRoutes = require("./src/routes/atendimentoRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const authRoutes = require("./src/routes/authRoutes");
const passport = require('passport');
const rotasProtegida = require('./src/routes/protegidas.js');
require('./src/config/passport')(passport);
const { sequelize, Usuario, Atendimento } = require("./src/models");
const cookieParser = require('cookie-parser');


const app = express();

app.use(require('cors')({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json());
app.use("/atendimentos", atendimentoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/auth", authRoutes);
app.use('/api', rotasProtegida); 

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("✅ Bot conectado!");
    
    //buscarHistorico(client, '558496590131@c.us', 10);

});

// Captura novas mensagens em tempo real
client.on("message_create", async (message) => {
    if (
        message.from.endsWith("@g.us") || 
        message.from.endsWith("@broadcast") || 
        message.from.endsWith("@newsletter") ||
        message.type === 'e2e_notification'
    ) {
        return;
    }

    const remetente = message.from;
    const nomeCliente = await getNomeContato(remetente);
    const sender = message.fromMe ? "Você" : "Cliente";
    const date = new Date(message.timestamp * 1000).toLocaleString("pt-BR");

    const tipoMsg = verificarTipo(message);

    console.log(`[${date}] ${sender=='Cliente'? nomeCliente : sender}: ${tipoMsg}`);

    let atendimento = await Atendimento.findOne({ where: { numero: remetente, data_fim: null } });

    if (message.fromMe) {
        return;
    }

    //console.log(remetente);

    if (!atendimento) {
        const protocolo = gerarProtocolo();
        atendimento = await Atendimento.create({ protocolo, cliente: nomeCliente, numero:remetente });

        //substituir para remetente
        client.sendMessage('557798441226@c.us', `Olá! Seu protocolo de atendimento é: *${protocolo}*`);
    }else{
        //console.log("Atendimento já existe");
        return;
    }
    
    //console.log(`📩 Nova mensagem: ${message.body}`);
});


// Função para obter o nome do contato salvo
async function getNomeContato(numero) {
    try {
        const contato = await client.getContactById(numero);
        return contato.pushname || contato.name || numero; // Retorna o nome salvo ou o número se não houver nome
    } catch (error) {
        console.error(`Erro ao obter nome do contato: ${error}`);
        return numero; // Retorna o número caso haja erro
    }
}


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
sequelize.sync({})
    .then(() => console.log("Tabelas sincronizadas com o banco!"))
    .catch(err => console.error("Erro ao sincronizar tabelas:", err));

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));

