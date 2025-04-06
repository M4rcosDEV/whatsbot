// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { Usuario } = require("../models");

async function authMiddleware(req, res, next) {
  const token = req.cookies['auth-token'];

  if (!token) {
    return res.status(401).json({ mensagem: 'Não autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco de dados com base no ID do token
    const user = await Usuario.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    req.user = user; // agora o usuário estará disponível em req.user
    next();
  } catch (err) {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
}


module.exports = {authMiddleware};