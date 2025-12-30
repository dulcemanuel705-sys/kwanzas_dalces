const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Helper: map frontend payload to Terceiro fields
function mapToTerceiro(body){
  return {
    nif: body.nif,
    nome_firma: body.nome || body.nome_firma,
    email: body.email,
    telefone: body.telefone,
    endereco: body.endereco,
    estado: body.estado,
    tipo: 'Cliente',
  };
}

// GET /api/clientes
router.get('/', async (req, res) => {
  try{
    const { q, page = 1, limit = 50 } = req.query;
    const where = { tipo: 'Cliente' };
    if(q){
      where[Op.or] = [
        { nome_firma: { [Op.iLike || Op.like]: `%${q}%` } },
        { nif: { [Op.iLike || Op.like]: `%${q}%` } },
      ];
    }
    const offset = (Number(page)-1) * Number(limit);
    const { rows, count } = await db.Terceiro.findAndCountAll({ where, limit: Number(limit), offset, order: [['createdAt','DESC']] });
    res.json({ items: rows, total: count, page: Number(page), limit: Number(limit) });
  }catch(e){ res.status(500).json({ message: 'erro_listar_clientes', detail: e.message }); }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try{
    const item = await db.Terceiro.findOne({ where: { id: req.params.id, tipo: 'Cliente' } });
    if(!item) return res.status(404).json({ message: 'cliente_nao_encontrado' });
    res.json(item);
  }catch(e){ res.status(500).json({ message: 'erro_obter_cliente', detail: e.message }); }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  try{
    const payload = mapToTerceiro(req.body || {});
    if(!payload.nome_firma || !payload.nif){
      return res.status(400).json({ message: 'nome_e_nif_obrigatorios' });
    }
    console.log('[POST /api/clientes] criando cliente:', payload);
    const created = await db.Terceiro.create(payload);
    console.log('[POST /api/clientes] criado id:', created?.id);
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_cliente', detail: e.message }); }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  try{
    const payload = mapToTerceiro(req.body || {});
    console.log('[PUT /api/clientes/:id] atualizando id', req.params.id, 'payload:', payload);
    const [count] = await db.Terceiro.update(payload, { where: { id: req.params.id, tipo: 'Cliente' } });
    if(count === 0) return res.status(404).json({ message: 'cliente_nao_encontrado' });
    const item = await db.Terceiro.findByPk(req.params.id);
    res.json(item);
  }catch(e){ res.status(500).json({ message: 'erro_atualizar_cliente', detail: e.message }); }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try{
    console.log('[DELETE /api/clientes/:id] removendo id', req.params.id);
    const count = await db.Terceiro.destroy({ where: { id: req.params.id, tipo: 'Cliente' } });
    if(count === 0) return res.status(404).json({ message: 'cliente_nao_encontrado' });
    res.status(204).send();
  }catch(e){ res.status(500).json({ message: 'erro_remover_cliente', detail: e.message }); }
});

module.exports = router;
