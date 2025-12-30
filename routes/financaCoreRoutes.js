const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authRole = require('../middlewares/authRole');
const db = require('../models');

// Utils map
function safeNumber(n){ const v = Number(n); return Number.isFinite(v) ? v : 0; }

// ----- PAGAMENTOS (financeiro agregado) ----- //
router.get('/pagamentos', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const items = await db.Pagamento.findAll({ order: [['createdAt','DESC']] });
    // Adapt to frontend shape
    const mapped = items.map(p => ({
      id: p.id,
      data: p.data,
      desc: p.docx || '',
      valor: p.valor,
      metodo: p.via,
      ref: p.docx || '',
    }));
    res.json({ items: mapped, total: mapped.length });
  }catch(e){ res.status(500).json({ message: 'erro_listar_pagamentos', detail: e.message }); }
});

router.post('/pagamentos', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const { data, valor, metodo, ref } = req.body || {};
    const created = await db.Pagamento.create({ data, valor: safeNumber(valor), via: metodo, docx: ref });
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_pagamento', detail: e.message }); }
});

// ----- DESPESAS ----- //
router.get('/despesas', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const items = await db.Despesa.findAll({ order: [['createdAt','DESC']] });
    res.json({ items, total: items.length });
  }catch(e){ res.status(500).json({ message: 'erro_listar_despesas', detail: e.message }); }
});

router.post('/despesas', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const { data, categoria, descricao, valor, centro } = req.body || {};
    const created = await db.Despesa.create({ data, categoria, descricao, valor: safeNumber(valor), centro });
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_despesa', detail: e.message }); }
});

// ----- IMPOSTOS ----- //
router.get('/impostos', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const items = await db.FinancaImposto.findAll({ order: [['createdAt','DESC']] });
    res.json({ items, total: items.length });
  }catch(e){ res.status(500).json({ message: 'erro_listar_impostos', detail: e.message }); }
});

router.post('/impostos', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const { periodo, imposto, base, valor, status } = req.body || {};
    const created = await db.FinancaImposto.create({ periodo, imposto, base: safeNumber(base), valor: safeNumber(valor), status });
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_imposto', detail: e.message }); }
});

// ----- FUNDO ----- //
router.get('/fundo', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const items = await db.FinancaFundo.findAll({ order: [['createdAt','DESC']] });
    res.json({ items, total: items.length });
  }catch(e){ res.status(500).json({ message: 'erro_listar_fundo', detail: e.message }); }
});

router.post('/fundo', auth, authRole(['admin','contabilista']), async (req,res) => {
  try{
    const { data, tipo, desc, valor } = req.body || {};
    // calcular saldo acumulado simples
    const last = await db.FinancaFundo.findOne({ order: [['createdAt','DESC']] });
    const lastSaldo = last && last.saldo ? Number(last.saldo) : 0;
    const delta = (tipo === 'Saida') ? -safeNumber(valor) : safeNumber(valor);
    const saldo = lastSaldo + delta;
    const created = await db.FinancaFundo.create({ data, tipo, desc, valor: safeNumber(valor), saldo });
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_fundo', detail: e.message }); }
});

module.exports = router;
