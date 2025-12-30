const express = require('express');
const router = express.Router();
const db = require('../models');

// GET /api/bancos-catalogo
router.get('/', async (req, res) => {
  console.log('[GET] /api/bancos-catalogo');
  try {
    const items = await db.BancoCatalogo.findAll({ order: [['createdAt','DESC']] });
    res.json({ items, total: items.length });
  } catch (e) {
    res.status(500).json({ message: 'erro_listar_bancos', detail: e.message });
  }
});

// GET /api/bancos-catalogo/:id
router.get('/:id', async (req, res) => {
  console.log('[GET] /api/bancos-catalogo/:id', req.params.id);
  try {
    const item = await db.BancoCatalogo.findByPk(req.params.id);
    if(!item) return res.status(404).json({ message: 'banco_nao_encontrado' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'erro_obter_banco', detail: e.message });
  }
});

// POST /api/bancos-catalogo
router.post('/', async (req, res) => {
  console.log('[POST] /api/bancos-catalogo body:', req.body);
  try {
    const { nome, logo_url, status = 'Ativo', descricao } = req.body || {};
    if(!nome || !nome.trim()) return res.status(400).json({ message: 'nome_obrigatorio' });
    const created = await db.BancoCatalogo.create({ nome: nome.trim(), logo_url, status, descricao });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: 'erro_criar_banco', detail: e.message });
  }
});

// PUT /api/bancos-catalogo/:id
router.put('/:id', async (req, res) => {
  console.log('[PUT] /api/bancos-catalogo/:id', req.params.id, 'body:', req.body);
  try {
    const { nome, logo_url, status, descricao } = req.body || {};
    const [count] = await db.BancoCatalogo.update({ nome, logo_url, status, descricao }, { where: { id: req.params.id } });
    if(count === 0) return res.status(404).json({ message: 'banco_nao_encontrado' });
    const updated = await db.BancoCatalogo.findByPk(req.params.id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'erro_atualizar_banco', detail: e.message });
  }
});

// DELETE /api/bancos-catalogo/:id
router.delete('/:id', async (req, res) => {
  console.log('[DELETE] /api/bancos-catalogo/:id', req.params.id);
  try {
    const count = await db.BancoCatalogo.destroy({ where: { id: req.params.id } });
    if(count === 0) return res.status(404).json({ message: 'banco_nao_encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'erro_remover_banco', detail: e.message });
  }
});

module.exports = router;
