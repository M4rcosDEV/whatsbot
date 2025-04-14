const express = require("express");
const router = express.Router();
const passport = require('passport');
const atendimentoController = require("../controllers/atendimentoController");
const { Atendimento } = require("../models");

// Todas as rotas protegidas por JWT
router.get("/", passport.authenticate('jwt', { session: false }), atendimentoController.listarAtendimentos);
router.post("/:id_atendimento/enviar", passport.authenticate('jwt', { session: false }), atendimentoController.enviarMensagensCliente);
router.post("/encerrar", passport.authenticate('jwt', { session: false }), atendimentoController.encerrar);
router.put("/:id/iniciar", passport.authenticate('jwt', { session: false }), atendimentoController.iniciarAtendimento);
router.put("/transferir/:id_atendimento/:id_atendente", passport.authenticate('jwt', { session: false }), atendimentoController.transferirAtendimento);
router.get('/:id_atendimento/historico', passport.authenticate('jwt', { session: false }), atendimentoController.buscarHistoricoAtendimento);
router.get('/:numero/:mensagemId', passport.authenticate('jwt', { session: false }), atendimentoController.buscarMidiaDownload);

module.exports = router;
