const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middlewares/auth');
const authRole = require('../middlewares/authRole');

// ===== Departamentos =====
router.get('/departamentos', auth, async (req, res) => {
  try {
    const items = await db.Departamento.findAll({ order: [['nome','ASC']] });
    res.json({ items, total: items.length });
  } catch (e) {
    res.status(500).json({ message: 'erro_listar_departamentos', detail: e.message });
  }
});

router.post('/departamentos', auth, authRole('admin'), async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.nome || !body.nome.trim()) {
      return res.status(400).json({ message: 'nome_obrigatorio' });
    }
    const created = await db.Departamento.create({
      nome: body.nome,
      codigo: body.codigo || null,
      ativo: body.ativo !== undefined ? !!body.ativo : true,
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: 'erro_criar_departamento', detail: e.message });
  }
});

router.put('/departamentos/:id', auth, authRole('admin'), async (req, res) => {
  try {
    const body = req.body || {};
    const payload = {
      nome: body.nome,
      codigo: body.codigo,
    };
    if (body.ativo !== undefined) payload.ativo = !!body.ativo;
    const [count] = await db.Departamento.update(payload, { where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ message: 'departamento_nao_encontrado' });
    const updated = await db.Departamento.findByPk(req.params.id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'erro_atualizar_departamento', detail: e.message });
  }
});

router.delete('/departamentos/:id', auth, authRole('admin'), async (req, res) => {
  try {
    const [count] = await db.Departamento.update({ ativo: false }, { where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ message: 'departamento_nao_encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'erro_remover_departamento', detail: e.message });
  }
});

// ===== Cargos =====
router.get('/cargos', auth, async (req, res) => {
  try {
    const where = {};
    if (req.query.id_departamento) where.id_departamento = req.query.id_departamento;
    const items = await db.Cargo.findAll({ where, order: [['nome','ASC']] });
    res.json({ items, total: items.length });
  } catch (e) {
    res.status(500).json({ message: 'erro_listar_cargos', detail: e.message });
  }
});

router.post('/cargos', auth, authRole('admin'), async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.nome || !body.nome.trim()) {
      return res.status(400).json({ message: 'nome_obrigatorio' });
    }
    const created = await db.Cargo.create({
      nome: body.nome,
      id_departamento: body.id_departamento || null,
      ativo: body.ativo !== undefined ? !!body.ativo : true,
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: 'erro_criar_cargo', detail: e.message });
  }
});

router.put('/cargos/:id', auth, authRole('admin'), async (req, res) => {
  try {
    const body = req.body || {};
    const payload = {
      nome: body.nome,
      id_departamento: body.id_departamento || null,
    };
    if (body.ativo !== undefined) payload.ativo = !!body.ativo;
    const [count] = await db.Cargo.update(payload, { where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ message: 'cargo_nao_encontrado' });
    const updated = await db.Cargo.findByPk(req.params.id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'erro_atualizar_cargo', detail: e.message });
  }
});

router.delete('/cargos/:id', auth, authRole('admin'), async (req, res) => {
  try {
    const [count] = await db.Cargo.update({ ativo: false }, { where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ message: 'cargo_nao_encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'erro_remover_cargo', detail: e.message });
  }
});

// ===== Férias =====

// Lista férias, com filtros opcionais: estado, id_funcionario
router.get('/ferias', auth, async (req, res) => {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.id_funcionario) where.id_funcionario = req.query.id_funcionario;
    const items = await db.Ferias.findAll({ where, order: [['data_inicio', 'DESC']] });
    res.json({ items, total: items.length });
  } catch (e) {
    res.status(500).json({ message: 'erro_listar_ferias', detail: e.message });
  }
});

// Cria pedido de férias
router.post('/ferias', auth, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.id_funcionario || !body.data_inicio || !body.data_fim) {
      return res.status(400).json({ message: 'campos_obrigatorios', campos: ['id_funcionario', 'data_inicio', 'data_fim'] });
    }
    const created = await db.Ferias.create({
      id_funcionario: body.id_funcionario,
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
      estado: 'PENDENTE',
      motivo: body.motivo || null,
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: 'erro_criar_ferias', detail: e.message });
  }
});

// Atualiza dados gerais de um pedido (datas/motivo)
router.put('/ferias/:id', auth, async (req, res) => {
  try {
    const body = req.body || {};
    const payload = {
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
      motivo: body.motivo,
    };
    const [count] = await db.Ferias.update(payload, { where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ message: 'ferias_nao_encontrado' });
    const updated = await db.Ferias.findByPk(req.params.id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'erro_atualizar_ferias', detail: e.message });
  }
});

// Aprovar / Rejeitar férias (apenas admin ou rh)
router.put('/ferias/:id/estado', auth, authRole(['admin', 'rh']), async (req, res) => {
  try {
    const { estado } = req.body || {};
    if (!['PENDENTE', 'APROVADO', 'REJEITADO'].includes(estado)) {
      return res.status(400).json({ message: 'estado_invalido' });
    }
    const [count] = await db.Ferias.update({ estado }, { where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ message: 'ferias_nao_encontrado' });
    const updated = await db.Ferias.findByPk(req.params.id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'erro_atualizar_estado_ferias', detail: e.message });
  }
});

// Remover/cancelar (soft delete simples opcional)
router.delete('/ferias/:id', auth, authRole(['admin', 'rh']), async (req, res) => {
  try {
    const count = await db.Ferias.destroy({ where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ message: 'ferias_nao_encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'erro_remover_ferias', detail: e.message });
  }
});

module.exports = router;
