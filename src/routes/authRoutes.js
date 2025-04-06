const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post('/login', authController.loginUsuario);
router.post('/registrar', authController.cadastrarUsuario);
router.post('/logout', (req, res) => {
    res.clearCookie('auth-token'); // mesmo nome usado ao definir o cookie
    return res.status(200).json({ message: 'Logout realizado com sucesso' });
  });


module.exports = router;