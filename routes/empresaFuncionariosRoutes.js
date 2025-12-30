const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const auth = require('../middlewares/auth');
const authRole = require('../middlewares/authRole');
const db = require('../models');

// uploads dir
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'funcionarios');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = `func_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    cb(null, base + ext);
  }
});
const upload = multer({ storage });

// GET /api/empresa/funcionarios – qualquer utilizador autenticado pode consultar equipa
router.get('/', auth, async (req, res) => {
  try{
    const { q } = req.query;
    const where = {};
    if(q){
      where[db.Sequelize.Op.or] = [
        { nome: { [db.Sequelize.Op.like]: `%${q}%` } },
        { cargo: { [db.Sequelize.Op.like]: `%${q}%` } },
        { departamento: { [db.Sequelize.Op.like]: `%${q}%` } },
      ];
    }
    const items = await db.Funcionario.findAll({ where, order: [['createdAt','DESC']] });
    res.json({ items, total: items.length });
  }catch(e){ res.status(500).json({ message: 'erro_listar_funcionarios', detail: e.message }); }
});

// GET /api/empresa/funcionarios/:id
router.get('/:id', auth, async (req, res) => {
  try{
    const f = await db.Funcionario.findByPk(req.params.id);
    if(!f) return res.status(404).json({ message: 'funcionario_nao_encontrado' });
    res.json(f);
  }catch(e){ res.status(500).json({ message: 'erro_obter_funcionario', detail: e.message }); }
});

// POST /api/empresa/funcionarios (multipart) – admin ou gestor
router.post('/', auth, authRole(['admin','gestor']), upload.single('foto_file'), async (req, res) => {
  try{
    const body = req.body || {};
    const file = req.file;
    const payload = {
      nome: body.nome,
      bi: body.bi,
      nif: body.nif,
      email: body.email,
      telefone: body.telefone,
      cargo: body.cargo,
      departamento: body.departamento,
      data_admissao: body.data_admissao,
      salario_base: body.salario_base,
      estado: body.estado || 'Ativo',
      endereco: body.endereco,
      foto_url: file ? `/uploads/funcionarios/${file.filename}` : null,
    };
    if(!payload.nome || !payload.nome.trim()) return res.status(400).json({ message: 'nome_obrigatorio' });
    const created = await db.Funcionario.create(payload);
    res.status(201).json(created);
  }catch(e){ res.status(500).json({ message: 'erro_criar_funcionario', detail: e.message }); }
});

// PUT /api/empresa/funcionarios/:id (multipart opcional) – admin ou gestor
router.put('/:id', auth, authRole(['admin','gestor']), upload.single('foto_file'), async (req, res) => {
  try{
    const body = req.body || {};
    const file = req.file;
    const payload = {
      nome: body.nome,
      bi: body.bi,
      nif: body.nif,
      email: body.email,
      telefone: body.telefone,
      cargo: body.cargo,
      departamento: body.departamento,
      data_admissao: body.data_admissao,
      salario_base: body.salario_base,
      estado: body.estado,
      endereco: body.endereco,
    };
    if(file){ payload.foto_url = `/uploads/funcionarios/${file.filename}`; }
    const [count] = await db.Funcionario.update(payload, { where: { id: req.params.id } });
    if(count === 0) return res.status(404).json({ message: 'funcionario_nao_encontrado' });
    const updated = await db.Funcionario.findByPk(req.params.id);
    res.json(updated);
  }catch(e){ res.status(500).json({ message: 'erro_atualizar_funcionario', detail: e.message }); }
});

// DELETE /api/empresa/funcionarios/:id – apenas admin
router.delete('/:id', auth, authRole('admin'), async (req, res) => {
  try{
    const count = await db.Funcionario.destroy({ where: { id: req.params.id } });
    if(count === 0) return res.status(404).json({ message: 'funcionario_nao_encontrado' });
    res.status(204).send();
  }catch(e){ res.status(500).json({ message: 'erro_remover_funcionario', detail: e.message }); }
});

module.exports = router;
