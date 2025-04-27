const qrcode = require('qrcode-terminal');
const express = require("express");
const {buscarHistorico} = require('./src/services/historicoChat.js');
const client = require("./src/services/whatsappClient.js");
const {gerarProtocolo} = require("./src/utils/gerarProtocolo.js");
const {getFotoPerfil} = require("./src/utils/getFotoPerfil.js");
const {getNomeContato} = require("./src/utils/getNomeContato.js");
const atendimentoRoutes = require("./src/routes/atendimentoRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const conversaRoutes = require("./src/routes/conversaRoutes");
const authRoutes = require("./src/routes/authRoutes");

const passport = require('passport');
const rotasProtegida = require('./src/routes/protegidas.js');
require('./src/config/passport')(passport);
const { sequelize, Usuario, Atendimento } = require("./src/models");
const cookieParser = require('cookie-parser');
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(require('cors')({
    origin: 'http://10.0.2.111:3000',
    credentials: true,
}))

app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json());
app.get('/', (req, res) =>{
    res.json('Teste')
})
app.use("/atendimentos", atendimentoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/auth", authRoutes);
app.use('/conversas', conversaRoutes);
app.use('/api', rotasProtegida); 

// Cria o servidor HTTP a partir do app Express
const server = http.createServer(app);

// CORS para WebSocket (Socket.IO)
const io = new Server(server, {
    cors: {
      origin: "http://10.0.2.111:3000",
      credentials: true,
    },
  });

  // Lógica do Socket.IO aqui (exemplo)
io.on("connection", (socket) => {
    //console.log("🔥 Novo cliente conectado via socket:", socket.id);

    socket.on("entrarSala", (salaId) => {
        socket.join(salaId);
        //console.log(`📥 Socket ${socket.id} entrou na sala ${salaId}`);
      });
    
      socket.on("sairSala", (salaId) => {
        socket.leave(salaId);
        //console.log(`📤 Socket ${socket.id} saiu da sala ${salaId}`);
      });
  
    socket.on("disconnect", () => {
      //console.log("❌ Cliente desconectado:", socket.id);
    });
});


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("✅ Bot conectado!");
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

    const remetente = message.fromMe ? message.to : message.from;
    const nomeCliente = await getNomeContato(remetente);
    //const sender = message.fromMe ? "Você" : "Cliente";
    //const date = new Date(message.timestamp * 1000).toLocaleString("pt-BR");

    const tipoMsg = verificarTipo(message);
    //console.log(message);
    //console.log(`[${date}] ${sender=='Cliente'? nomeCliente : sender}: ${tipoMsg}`);

    let atendimento = await Atendimento.findOne({ where: { numero: remetente, data_fim: null } });

    if (!atendimento && !message.fromMe) {
        const fotoPerfil = await getFotoPerfil(remetente);
        //console.log('Foto de perfil :', fotoPerfil);
        const protocolo = gerarProtocolo();
        atendimento = await Atendimento.create({ protocolo, cliente: nomeCliente, numero:remetente, foto_perfil: fotoPerfil });

        //substituir para remetente
        client.sendMessage('557798441226@c.us', `Olá! Seu protocolo de atendimento é: *${protocolo}*`);
        // Emite evento de socket pro frontend
        io.emit("novo-atendimento", {
            id: atendimento.id,
            cliente: atendimento.cliente,
            numero: atendimento.numero,
            protocolo: atendimento.protocolo,
            data_inicio: atendimento.data_inicio,
            foto_perfil: fotoPerfil
        });
    }

    if (!atendimento) return;

    const novaMensagem = {
        de: message.fromMe ? "atendente" : "cliente",
        tipo: message.type,
        timestamp: message.timestamp,
        atendimento_id: atendimento.id,
    };

    if (message.hasMedia) {
        novaMensagem.conteudo = {
            id: message.id.id,
            mimetype: message.mimetype,
            filename: message.filename || "arquivo",
            hasMedia: true
        };
    } else {
        novaMensagem.conteudo = message.body;
    }
    
    //console.log("🔊 Emitindo nova mensagem para sala:", `atendimento_${atendimento.id}`);
    io.to(`atendimento_${atendimento.id}`).emit("novaMensagem", novaMensagem);  
});

client.on("message_create", async (message) => {
    if (
        message.from.endsWith("@g.us") || 
        message.from.endsWith("@broadcast") || 
        message.from.endsWith("@newsletter") ||
        message.type === 'e2e_notification'
    ) {
        return;
    }

    const remetente = message.fromMe ? message.to : message.from;
    const nomeCliente = await getNomeContato(remetente);

    console.log(remetente);
    console.log(`troca de msg com ${nomeCliente}`);

    const novaMensagem = {
        de: message.fromMe ? "atendente" : "cliente",
        tipo: message.type,
        timestamp: message.timestamp,
        numero: remetente
    };

    if (message.hasMedia) {
        novaMensagem.conteudo = {
            id: message.id.id,
            mimetype: message.mimetype,
            filename: message.filename || "arquivo",
            hasMedia: true
        };
    } else {
        novaMensagem.conteudo = message.body;
    }

    io.to(`conversa_${remetente}`).emit("novaMensagem", novaMensagem); 

});




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
sequelize.sync()
    .then(() => console.log("Tabelas sincronizadas com o banco!"))
    .catch(err => console.error("Erro ao sincronizar tabelas:", err));

server.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});

