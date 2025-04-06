const express = require('express');
const passport = require('passport');
const router = express.Router();

// Rota protegida por JWT
router.get('/home', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    mensagem: '✅ Você está autenticado com sucesso!',
    usuario: req.user
  });
});

module.exports = router;