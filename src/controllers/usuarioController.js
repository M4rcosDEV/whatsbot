const { Usuario, Atendimento } = require("../models");
const { Sequelize } = require("sequelize");

async function listarUsuarios(req, res) {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ["id", "nome", "email"], 
            order: [["createdAt", "ASC"]]
        });
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ message: "Erro ao obter usuários" });
    }
}

async function listarStatusUsuarios(req, res) {
    try {
    const usuarios = await Usuario.findAll({
        attributes: [
            'id',
            'nome',
            'email',
            [
            Sequelize.literal(`(
                SELECT COUNT(*) FROM atendimentos 
                WHERE atendimentos.usuario_id = "Usuario"."id" 
                AND atendimentos.data_fim IS NULL
            )`),
            'atendimentos_abertos'
            ]
        ],
        order: [
            [Sequelize.literal(`(
            SELECT COUNT(*) FROM atendimentos 
            WHERE atendimentos.usuario_id = "Usuario"."id" 
            AND atendimentos.data_fim IS NULL
            )`), 'DESC'] // ou 'ASC' se quiser do menor para o maior
        ]
        });
  
      res.status(200).json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao obter status dos usuários" });
    }
  }

async function criarUsuario(req, res) {
    try {
        const {nome, email, senha} = req.body;
        const usuario = await Usuario.create({
            nome: nome,
            email: email,
            senha: senha
        });
        console.log(`Usuario criado com sucesso: ${nome} - ${email}`); 
        res.status(201).json(usuario);
        
    } catch (error) {
        console.log(`Erro ao criar usuario: ${error}`);
        res.status(500).json({ mensagem: "Erro ao criar usuario" });
    }
}

async function adicionarSetorUsuario(req, res) {
    const { id_usuario, id_setor } = req.body;
   
    try {
        const usuario = await Usuario.findByPk(id_usuario);
        usuario.setor 
        console.log(`Usuario criado com sucesso: ${nome} - ${email}`); 
        res.status(201).json(usuario);
        
    } catch (error) {
        console.log(`Erro ao criar usuario: ${error}`);
        res.status(500).json({ mensagem: "Erro ao criar usuario" });
    }
}



module.exports = {
    listarUsuarios,
    listarStatusUsuarios,
    criarUsuario
};