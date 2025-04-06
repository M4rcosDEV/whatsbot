const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { Usuario } = require("../models");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", usuarioController.listarUsuarios);
router.get("/status", usuarioController.listarStatusUsuarios);
router.post("/adicionar", usuarioController.criarUsuario);

router.get('/me', authMiddleware, (req, res) => {
    // Aqui já temos req.user preenchido pelo middleware
    const { id, nome, email } = req.user;
    res.json({ id, nome, email });
  });

module.exports = router;