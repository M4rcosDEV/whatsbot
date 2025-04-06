const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

//LOGIN
async function loginUsuario(req, res) {
    try {
        const { email, senha } = req.body;
        console.log(email, senha);

        const user = await Usuario.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(senha, user.senha))) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // Aqui você define o cookie:
        res.cookie('auth-token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 1000 * 60 * 60 * 24
        });

        return res.status(200).json({ token: token });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao realizar login' });
    }
}

// CADASTRO
async function cadastrarUsuario(req, res) {
    try {
      const { nome, email, senha } = req.body;
  
      // Verifica se já existe
      const existente = await Usuario.findOne({ where: { email } });
      if (existente) {
        return res.status(400).json({ mensagem: 'E-mail já cadastrado' });
      }
  
      // Criptografa a senha
      const hash = await bcrypt.hash(senha, 10);
  
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha: hash,
      });
  
      const token = jwt.sign({ id: novoUsuario.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
  
      return res.status(201).json({ mensagem: 'Usuário criado com sucesso', token: token });

    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
    }
  }

module.exports = {
    loginUsuario,
    cadastrarUsuario
};

