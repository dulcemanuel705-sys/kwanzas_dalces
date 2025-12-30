const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authRole = require('../middlewares/authRole');
const ctrl = require('../controllers/projectoController');

// Lista e detalhe (qualquer utilizador autenticado pode ver projectos)
router.get('/', auth, ctrl.listProjectos);
router.get('/:id', auth, ctrl.getProjecto);

// Criar projecto único (apenas admin ou gestor de projectos)
router.post('/', auth, authRole(['admin', 'gestor']), ctrl.createProjecto);

// Atualizar estado do projecto (apenas admin ou gestor de projectos)
router.patch('/:id/status', auth, authRole(['admin', 'gestor']), ctrl.updateStatus);

// Adicionar trabalho/tarefa (ServiceTicket) a um projecto existente
router.post('/:id/tickets', auth, authRole(['admin', 'gestor']), ctrl.addServiceTicket);

// Atualizar / eliminar um trabalho/tarefa existente (ServiceTicket)
router.patch('/tickets/:ticketId', auth, authRole(['admin', 'gestor']), ctrl.updateServiceTicket);
router.delete('/tickets/:ticketId', auth, authRole(['admin', 'gestor']), ctrl.deleteServiceTicket);

// Importação em massa (aceita {items:[...]} ou [...]) – apenas admin ou gestor de projectos
router.post(['/import','/bulk'], auth, authRole(['admin', 'gestor']), ctrl.importMany);

// Apagar todos os projectos – apenas admin
router.delete('/', auth, authRole('admin'), ctrl.deleteAll);
router.delete('/:id', auth, authRole(['admin', 'gestor']), ctrl.deleteOne);

module.exports = router;
