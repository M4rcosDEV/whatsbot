const { Atendimento, Usuario } = require("../models");
const {buscarHistorico} = require('../services/historicoChat.js');
const client = require("../services/whatsappClient.js");

async function listarAtendimentos(req, res) {
    const atendimentos = await Atendimento.findAll({
        // where: { data_fim: null },
        order: [["updatedAt", "DESC"]]
    });
    res.json(atendimentos);
}

async function iniciarAtendimento(req, res) {
    const atendimentoId = req.params.id;
    const usuarioId = req.user.id; 

    try {
        const atendimento = await Atendimento.findByPk(atendimentoId);
        const usuario = await Usuario.findByPk(usuarioId);
  
        if (!atendimento) {
            return res.status(404).json({ mensagem: 'Atendimento não encontrado' });
        }

        // Verifica se já está em atendimento
        if (atendimento.usuario_id) {
            return res.status(400).json({ mensagem: 'Este atendimento já foi iniciado por outro atendente.' });
        }

        // Atualiza com o usuário autenticado
        atendimento.usuario_id = usuarioId;
        await atendimento.save();

        // Enviar mensagem para o cliente
        if (atendimento.numero) {
            
            const mensagem = `Olá! Meu nome é ${usuario.nome} e estou assumindo seu atendimento.`;
            
            //substituir numero pelo numero do cliente
            await client.sendMessage(`557798441226@c.us`, mensagem);
        }
        
        const numero = atendimento.numero;
        const historico = await buscarHistorico(client, numero, 20);
        
        return res.status(200).json({ mensagem: 'Atendimento iniciado com sucesso',
            atendimento : atendimento,
            historico : historico
         });
    } catch (error) {
        console.error('Erro ao iniciar atendimento:', error);
        return res.status(500).json({ mensagem: 'Erro interno ao iniciar atendimento' });
    }
}


async function buscarMidiaDownload(req, res) {
    const { numero, mensagemId } = req.params;

     try {
        const chat = await client.getChatById(numero);
        const messages = await chat.fetchMessages({ limit: 50 }); // ou ajuste se souber o index

        const msg = messages.find(m => m.id.id === mensagemId);

        if (!msg || !msg.hasMedia) {
        return res.status(404).json({ erro: 'Mídia não encontrada' });
        }

        const media = await msg.downloadMedia();

        const buffer = Buffer.from(media.data, 'base64');
        res.set({
            'Content-Type': media.mimetype,
            'Content-Disposition': `attachment; filename="${media.filename || 'arquivo'}"`
        });
        res.send(buffer);

    }catch(err) {
        console.error('Erro ao baixar mídia:', err);
        res.status(500).json({ erro: 'Erro interno ao baixar mídia', descrição: err.message });
    }
}

async function transferirAtendimento(req, res) {
    const usuarioId = req.user.id;
    const atendimentoId = req.params.id_atendimento;
    const novoAtendenteId = req.params.id_atendente;

    try {
        const atendimento = await Atendimento.findByPk(atendimentoId);
        const novoAtendente = await Usuario.findByPk(novoAtendenteId);
        if(atendimento.usuario_id == usuarioId) {
            atendimento.usuario_id = novoAtendenteId;
            await atendimento.save();

            // Enviar mensagem para o cliente
            if (atendimento.numero) {
                
                const mensagem = `O atendimento foi transferido para ${novoAtendente.nome}!`;
                
                //substituir numero pelo numero do cliente
                await client.sendMessage(`557798441226@c.us`, mensagem);
            }
            return res.status(200).json({ mensagem: 'Atendimento transferido com sucesso' });
        }else{
            return res.status(403).json({ mensagem: 'Você não tem permissão para transferir esse atendimento' });
        }
        
    } catch (error) {
        console.error('Erro ao transferir atendimento:', error);
        return res.status(500).json({ mensagem: 'Erro interno ao transferir atendimento', descrição: error.message });
    }
}


async function encerrar(req, res) { 
    try {
        const atendimento = await Atendimento.findOne({ where: { numero, data_fim: null } });

        if (!atendimento) {
            console.log(`Nenhum atendimento em aberto para ${numero}`);
            return res.status(404).json({ mensagem: "Nenhum atendimento em aberto"});
        }

        atendimento.data_fim = new Date();
        await atendimento.save();
        console.log(`Protocolo encerrado com sucesso para ${numero}`);
        return res.json({ mensagem: "Protocolo encerrado com sucesso", atendimento });
        
    } catch (error) {
        console.log(`Erro ao encerrar protocolo para ${numero}: ${error.message}`);
        return res.status(500).json({ mensagem: "Erro ao encerrar protocolo" });
        
    }
}

module.exports = {
    listarAtendimentos,
    iniciarAtendimento,
    transferirAtendimento,
    buscarMidiaDownload,
    encerrar
};
