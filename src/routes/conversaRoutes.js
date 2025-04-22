const express = require("express");
const router = express.Router();
const passport = require('passport');
const conversaController= require("../controllers/conversaController");

router.get("/", passport.authenticate('jwt', { session: false }), conversaController.conversasAbertas);
router.get("/:numero/historico", passport.authenticate('jwt', { session: false }), conversaController.buscarHistoricoConversa);
router.post("/:id_conversa/enviar", passport.authenticate('jwt', { session: false }), conversaController.enviarMensagensClienteConversa);

module.exports = router;    