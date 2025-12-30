const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const auth = require('../middlewares/auth');
const authRole = require('../middlewares/authRole');
const db = require('../models');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'bancos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = `banco_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    cb(null, base + ext);
  }
});

const upload = multer({ storage });

// GET /api/financas/bancos
router.get('/', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const items = await db.FinancaBanco.findAll({ order: [['createdAt','DESC']] });
    res.json({ items, total: items.length });
  }catch(e){ res.status(500).json({ message: 'erro_listar_bancos_financa', detail: e.message }); }
});

// GET /api/financas/bancos/:id
router.get('/:id', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const id = Number(req.params.id);
    if(!id) return res.status(400).json({ message: 'id_invalido' });
    const found = await db.FinancaBanco.findByPk(id);
    if(!found) return res.status(404).json({ message: 'banco_nao_encontrado' });
    res.json(found);
  }catch(e){ res.status(500).json({ message: 'erro_obter_banco_financa', detail: e.message }); }
});

// ----- EXTRATO BANCÁRIO -----
// GET /api/financas/bancos/:id/extrato
router.get('/:id/extrato', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const bancoId = Number(req.params.id);
    if(!bancoId) return res.status(400).json({ message: 'id_invalido' });
    const items = await db.FinancaBancoExtrato.findAll({
      where: { bancoId },
      order: [['ordem','ASC'], ['id','ASC']]
    });
    res.json(items);
  }catch(e){ res.status(500).json({ message: 'erro_listar_extrato_banco', detail: e.message }); }
});

// POST /api/financas/bancos/:id/extrato
router.post('/:id/extrato', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const bancoId = Number(req.params.id);
    if(!bancoId) return res.status(400).json({ message: 'id_invalido' });
    const body = req.body || {};
    const payload = {
      bancoId,
      ordem: body.ordem || null,
      data: body.data || null,
      dataTexto: body.dataTexto || null,
      dataValorTexto: body.dataValorTexto || null,
      numeroOperacao: body.numeroOperacao || null,
      descExtrato: body.descExtrato || null,
      descPrimavera: body.descPrimavera || null,
      classificacao: body.classificacao || null,
      status: body.status || null,
      factura: body.factura || null,
      saidas: body.saidas || 0,
      entradas: body.entradas || 0,
      saldo: body.saldo || 0,
      saidasTexto: body.saidasTexto || null,
      entradasTexto: body.entradasTexto || null,
      saldoTexto: body.saldoTexto || null,
      observacao: body.observacao || null
    };
    const created = await db.FinancaBancoExtrato.create(payload);
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_extrato_banco', detail: e.message }); }
});

// PUT /api/financas/bancos/:id/extrato/:lancId
router.put('/:id/extrato/:lancId', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const bancoId = Number(req.params.id);
    const lancId = Number(req.params.lancId);
    if(!bancoId || !lancId) return res.status(400).json({ message: 'id_invalido' });
    const lanc = await db.FinancaBancoExtrato.findOne({ where: { id: lancId, bancoId } });
    if(!lanc) return res.status(404).json({ message: 'lancamento_nao_encontrado' });
    const body = req.body || {};
    const updatable = [
      'ordem','data','dataTexto','dataValorTexto','numeroOperacao','descExtrato','descPrimavera','classificacao','status',
      'factura','saidas','entradas','saldo','saidasTexto','entradasTexto','saldoTexto','observacao'
    ];
    updatable.forEach(k => { if (Object.prototype.hasOwnProperty.call(body, k)) lanc[k] = body[k]; });
    await lanc.save();
    res.json(lanc);
  }catch(e){ res.status(500).json({ message: 'erro_actualizar_extrato_banco', detail: e.message }); }
});

// DELETE /api/financas/bancos/:id/extrato/:lancId
router.delete('/:id/extrato/:lancId', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const bancoId = Number(req.params.id);
    const lancId = Number(req.params.lancId);
    if(!bancoId || !lancId) return res.status(400).json({ message: 'id_invalido' });
    const lanc = await db.FinancaBancoExtrato.findOne({ where: { id: lancId, bancoId } });
    if(!lanc) return res.status(404).json({ message: 'lancamento_nao_encontrado' });
    await lanc.destroy();
    res.json({ ok: true });
  }catch(e){ res.status(500).json({ message: 'erro_eliminar_extrato_banco', detail: e.message }); }
});

// DELETE /api/financas/bancos/:id/extrato  (eliminar todos os lançamentos de um banco)
router.delete('/:id/extrato', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const bancoId = Number(req.params.id);
    if(!bancoId) return res.status(400).json({ message: 'id_invalido' });
    await db.FinancaBancoExtrato.destroy({ where: { bancoId } });
    res.json({ ok: true });
  }catch(e){ res.status(500).json({ message: 'erro_eliminar_todos_extrato_banco', detail: e.message }); }
});

// POST /api/financas/bancos (multipart) – apenas admin
router.post('/', auth, authRole('admin'), upload.single('logo_file'), async (req, res) => {
  try{
    const body = req.body || {};
    const file = req.file;
    const payload = {
      banco: body.banco,
      agencia: body.agencia,
      conta: body.conta,
      iban: body.iban,
      saldo: body.saldo || 0,
      logo: file ? `/uploads/bancos/${file.filename}` : null,
    };
    if(!payload.banco || !payload.banco.trim()){
      return res.status(400).json({ message: 'banco_obrigatorio' });
    }
    const created = await db.FinancaBanco.create(payload);
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_banco_financa', detail: e.message }); }
});

// PUT /api/financas/bancos/:id (JSON update; simple fields)
// Permite que admin e contabilista atualizem saldo (ex.: a partir do extrato bancário)
router.put('/:id', auth, authRole(['admin','contabilista']), async (req, res) => {
  try{
    const id = Number(req.params.id);
    const found = await db.FinancaBanco.findByPk(id);
    if(!found) return res.status(404).json({ message: 'banco_nao_encontrado' });
    const up = req.body || {};
    // Only allow updatable fields
    const fields = ['banco','agencia','conta','iban','saldo'];
    fields.forEach(k => { if (up[k] !== undefined) found[k] = up[k]; });
    await found.save();
    res.json(found);
  }catch(e){ res.status(500).json({ message: 'erro_actualizar_banco_financa', detail: e.message }); }
});

// DELETE /api/financas/bancos/:id – apenas admin
router.delete('/:id', auth, authRole('admin'), async (req, res) => {
  try{
    const id = Number(req.params.id);
    const found = await db.FinancaBanco.findByPk(id);
    if(!found) return res.status(404).json({ message: 'banco_nao_encontrado' });
    // Attempt to remove logo file if present
    try{
      if(found.logo){
        const abs = path.join(__dirname, '..', 'public', found.logo.replace(/^\//, ''));
        fs.unlink(abs, () => {});
      }
    }catch{}
    await found.destroy();
    res.json({ ok: true });
  }catch(e){ res.status(500).json({ message: 'erro_eliminar_banco_financa', detail: e.message }); }
});

module.exports = router;
