const express = require("express");
const router = express.Router();
const controller = require("../controllers/tipoPagamentoController");

router.get("/", controller.getAllTipos);
router.get("/:id", controller.getTipoById);
router.post("/", controller.createTipo);
router.put("/:id", controller.updateTipo);
router.delete("/:id", controller.deleteTipo);

module.exports = router;
