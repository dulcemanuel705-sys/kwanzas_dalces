const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authRole = require("../middlewares/authRole");
const controller = require("../controllers/pagamentoController");

// Pagamentos: apenas admin ou contabilista podem gerir
router.get("/", auth, authRole(["admin", "contabilista"]), controller.getAllPagamentos);
router.get("/:id", auth, authRole(["admin", "contabilista"]), controller.getPagamentoById);
router.post("/", auth, authRole(["admin", "contabilista"]), controller.createPagamento);
router.put("/:id", auth, authRole(["admin", "contabilista"]), controller.updatePagamento);
router.delete("/:id", auth, authRole(["admin", "contabilista"]), controller.deletePagamento);

module.exports = router;
