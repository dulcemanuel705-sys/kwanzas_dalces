const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");
const authRole = require("../middlewares/authRole");

// Gestão de utilizadores (apenas admin)
router.get("/", auth, authRole("admin"), userController.getAllUsers);
router.post("/criar-com-endereco", auth, authRole("admin"), userController.criarUsuarioComEndereco);

// Perfil do próprio utilizador (self-service)
router.get("/me", auth, userController.me);
router.put("/me", auth, userController.updateMe);
router.post("/me/password", auth, userController.changePasswordMe);
router.post("/me/avatar", auth, userController.uploadAvatarMe);

// Gestão de utilizadores por id (admin)
router.get("/:id", auth, authRole("admin"), userController.getUserById);
router.put("/:id", auth, authRole("admin"), userController.updateUser);
router.delete("/:id", auth, authRole("admin"), userController.deleteUser);

// Rota para login
router.post("/login", userController.login);

// Rota para registro
router.post("/register", userController.register);

module.exports = router;
