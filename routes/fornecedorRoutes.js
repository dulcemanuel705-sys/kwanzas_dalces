const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memory storage
const XLSX = require('xlsx');

const db = require('../models');
const { Op } = require('sequelize');

function parseNumero(str){
  const m = /^kwanza-(\d+)$/i.exec((str||'').trim());
  return m ? parseInt(m[1], 10) : null;
}

async function getNextNumOrdem(){
  const rows = await db.Fornecedor.findAll({ attributes: ['num_ordem'] });
  let max = 0;
  for(const r of rows){
    const n = parseNumero(r.num_ordem);
    if(n && n > max) max = n;
  }
  const next = max + 1;
  return `kwanza-${String(next).padStart(4,'0')}`;
}

// GET /api/fornecedores
router.get('/', async (req, res) => {
  try{
    const { q, page = 1, limit = 50 } = req.query;
    const where = {};
    if(q){
      where[Op.or] = [
        { nome: { [Op.iLike || Op.like]: `%${q}%` } },
        { nif: { [Op.iLike || Op.like]: `%${q}%` } },
        { num_factura: { [Op.iLike || Op.like]: `%${q}%` } },
        { num_ordem: { [Op.iLike || Op.like]: `%${q}%` } },
      ];
    }
    const offset = (Number(page)-1) * Number(limit);
    const { rows, count } = await db.Fornecedor.findAndCountAll({ where, limit: Number(limit), offset, order: [['createdAt','DESC']] });
    res.json({ items: rows, total: count, page: Number(page), limit: Number(limit) });
  }catch(e){ res.status(500).json({ message: 'erro_listar_fornecedores', detail: e.message }); }
});

// GET /api/fornecedores/next-id
router.get('/next-id', async (req, res) => {
  try{
    const id = await getNextNumOrdem();
    res.json({ id });
  }catch(e){ res.status(500).json({ message: 'erro_next_id', detail: e.message }); }
});

// POST /api/fornecedores
router.post('/', async (req, res) => {
  try{
    const payload = req.body || {};
    if(!payload.num_ordem || !payload.num_ordem.trim()){
      payload.num_ordem = await getNextNumOrdem();
    }
    // Normalizar/validar id_projecto para evitar violação de FK
    if (payload.id_projecto !== undefined && payload.id_projecto !== null && String(payload.id_projecto).trim() !== ''){
      const n = Number(payload.id_projecto);
      if (!Number.isFinite(n)){
        payload.id_projecto = null;
      } else {
        const proj = await db.Projecto.findByPk(n);
        if (!proj){
          payload.id_projecto = null;
        } else {
          payload.id_projecto = n;
        }
      }
    } else {
      payload.id_projecto = null;
    }
    const created = await db.Fornecedor.create(payload);
    res.status(201).json(created);
  }catch(e){
    if (e.name === 'SequelizeUniqueConstraintError'){
      return res.status(409).json({ message: 'num_ordem_duplicado' });
    }
    res.status(500).json({ message: 'erro_criar_fornecedor', detail: e.message });
  }
});

// POST /api/fornecedores/upload (CSV)
router.post('/upload', upload.single('file'), async (req, res) => {
  try{
    if(!req.file) return res.status(400).json({ message: 'arquivo_obrigatorio' });
    const csv = req.file.buffer.toString('utf-8');
    const linhas = csv.split(/\r?\n/).filter(Boolean);
    if(linhas.length <= 1) return res.status(400).json({ message: 'csv_sem_conteudo' });
    // Mapeamento baseado na ordem definida no frontend
    // [0]num_ordem, [1]nif, [2]nome, [3]pago_via, [4]num_factura,
    // [5]custo_aceite, [6]data_documento, [7]mes, [8]valor_documento, [9]valor_iva,
    // [10]valor_retencao, [11]iva_dedutivel, [12]iva_suportado, [13]iva_dedutivel2,
    // [14]valor_pago, [15]divida, [16]situacao, [17]rfont, [18]tipologia,
    // [19]id_projecto, [20]obs, [21]data_pagamento
    const items = [];
    // Preparar contador inicial para num_ordem vazio
    // Busca max atual
    const rows = await db.Fornecedor.findAll({ attributes: ['num_ordem'] });
    let max = 0;
    for(const r of rows){ const n = parseNumero(r.num_ordem); if(n && n>max) max = n; }
    let counter = max + 1;

    for(let i=1;i<linhas.length;i++){
      const cols = linhas[i].split(',');
      if(cols.length === 0) continue;
      let num = (cols[0]||'').trim();
      if(!num){ num = `kwanza-${String(counter++).padStart(4,'0')}`; }
      const obj = {
        num_ordem: num,
        nif: cols[1], nome: cols[2], pago_via: cols[3], num_factura: cols[4],
        custo_aceite: cols[5], data_documento: cols[6]||null, mes: cols[7], valor_documento: cols[8]||null, valor_iva: cols[9]||null,
        valor_retencao: cols[10]||null, iva_dedutivel: cols[11]||null, iva_suportado: cols[12]||null, iva_dedutivel2: cols[13]||null,
        valor_pago: cols[14]||null, divida: cols[15]||null, situacao: cols[16], rfont: cols[17], tipologia: cols[18],
        id_projecto: cols[19]||null, obs: cols[20], data_pagamento: cols[21]||null
      };
      items.push(obj);
    }

    // Validar ids de projecto: substituir por null se não existirem
    const projIds = Array.from(new Set(items
      .map(it => it.id_projecto)
      .filter(v => v !== null && v !== undefined && String(v).trim() !== '')));
    const projIdsNum = projIds.map(v => Number(v)).filter(n => Number.isFinite(n));
    const validSet = new Set();
    if (projIdsNum.length > 0){
      const existing = await db.Projecto.findAll({ where: { id: projIdsNum } });
      for(const p of existing){ validSet.add(Number(p.id)); }
    }
    let nullified = 0;
    for(const it of items){
      if(it.id_projecto === null || it.id_projecto === undefined || String(it.id_projecto).trim() === ''){ it.id_projecto = null; continue; }
      const n = Number(it.id_projecto);
      if(!Number.isFinite(n) || !validSet.has(n)){ it.id_projecto = null; nullified++; }
      else { it.id_projecto = n; }
    }

    // Validar linhas obrigatórias: 'nome' não pode ser nulo/vazio
    const skipped = [];
    const validItems = [];
    for(const it of items){
      const nome = (it.nome||'').toString().trim();
      if(!nome){ skipped.push({ reason: 'nome_vazio', row: it }); continue; }
      it.nome = nome;
      validItems.push(it);
    }

    const created = await db.sequelize.transaction(async (t) => {
      const results = [];
      for(const it of validItems){
        const r = await db.Fornecedor.create(it, { transaction: t });
        results.push(r);
      }
      return results;
    });
    res.json({ inserted: created.length, project_ids_nullified: nullified, skipped: skipped.length });
  }catch(e){ res.status(500).json({ message: 'erro_upload_csv', detail: e.message }); }
});

// POST /api/fornecedores/upload-excel (XLS/XLSX)
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try{
    if(!req.file) return res.status(400).json({ message: 'arquivo_obrigatorio' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if(!ws) return res.status(400).json({ message: 'excel_sem_conteudo', detail: 'Folha 1 ausente ou vazia' });
    // Tenta como array de arrays (header:1)
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
    const items = [];
    // Preparar contador inicial para num_ordem vazio
    const all = await db.Fornecedor.findAll({ attributes: ['num_ordem'] });
    let max = 0;
    for(const r of all){ const n = parseNumero(r.num_ordem); if(n && n>max) max = n; }
    let counter = max + 1;

    const pushFromArray = () => {
      if(rows.length <= 1) return false;
      for(let i=1;i<rows.length;i++){
        const cols = rows[i] || [];
        if(!cols || cols.length === 0) continue;
        let num = (cols[0]||'').toString().trim();
        if(!num){ num = `kwanza-${String(counter++).padStart(4,'0')}`; }
        const obj = {
          num_ordem: num,
          nif: (cols[1]||'') || null,
          nome: (cols[2]||'') || null,
          pago_via: (cols[3]||'') || null,
          num_factura: (cols[4]||'') || null,
          custo_aceite: (cols[5]||'') || null,
          data_documento: (cols[6]||'') || null,
          mes: (cols[7]||'') || null,
          valor_documento: (cols[8]||'') || null,
          valor_iva: (cols[9]||'') || null,
          valor_retencao: (cols[10]||'') || null,
          iva_dedutivel: (cols[11]||'') || null,
          iva_suportado: (cols[12]||'') || null,
          iva_dedutivel2: (cols[13]||'') || null,
          valor_pago: (cols[14]||'') || null,
          divida: (cols[15]||'') || null,
          situacao: (cols[16]||'') || null,
          rfont: (cols[17]||'') || null,
          tipologia: (cols[18]||'') || null,
          id_projecto: (cols[19]||'') || null,
          obs: (cols[20]||'') || null,
          data_pagamento: (cols[21]||'') || null,
        };
        items.push(obj);
      }
      return items.length > 0;
    };

    const normalize = (s) => (s||'').toString().trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    const mapByHeader = () => {
      const objects = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
      if(!objects || objects.length === 0) return false;
      const keyMap = {
        num_ordem: ['num_ordem','n_ordem','numero_ordem','ordem'],
        nif: ['nif','nif_do_contribuinte'],
        nome: ['nome','firma','nome__firma','nome_firma'],
        pago_via: ['pago_via','pagovia','via'],
        num_factura: ['num_factura','n_factura','numero_factura','factura'],
        custo_aceite: ['custo_aceite','custo_aceite_ou_nao','custo'],
        data_documento: ['data_documento','data'],
        mes: ['mes','mês'],
        valor_documento: ['valor_documento','valor_doc','valor'],
        valor_iva: ['valor_iva','iva'],
        valor_retencao: ['valor_retencao','retencao'],
        iva_dedutivel: ['iva_dedutivel'],
        iva_suportado: ['iva_suportado'],
        iva_dedutivel2: ['iva_dedutivel2'],
        valor_pago: ['valor_pago','pago'],
        divida: ['divida','dívida'],
        situacao: ['situacao','situação'],
        rfont: ['rfont'],
        tipologia: ['tipologia'],
        id_projecto: ['id_projecto','projecto_id'],
        obs: ['obs','observacao','observação'],
        data_pagamento: ['data_pagamento'],
      };
      const mapRow = (row) => {
        const out = {};
        const keys = Object.keys(row);
        const findVal = (aliases) => {
          for(const alias of aliases){
            const k = keys.find(kk => normalize(kk) === normalize(alias));
            if(k) return row[k];
          }
          return '';
        };
        let num = (findVal(keyMap.num_ordem) || '').toString().trim();
        if(!num){ num = `kwanza-${String(counter++).padStart(4,'0')}`; }
        out.num_ordem = num;
        out.nif = findVal(keyMap.nif) || null;
        out.nome = findVal(keyMap.nome) || null;
        out.pago_via = findVal(keyMap.pago_via) || null;
        out.num_factura = findVal(keyMap.num_factura) || null;
        out.custo_aceite = findVal(keyMap.custo_aceite) || null;
        out.data_documento = findVal(keyMap.data_documento) || null;
        out.mes = findVal(keyMap.mes) || null;
        out.valor_documento = findVal(keyMap.valor_documento) || null;
        out.valor_iva = findVal(keyMap.valor_iva) || null;
        out.valor_retencao = findVal(keyMap.valor_retencao) || null;
        out.iva_dedutivel = findVal(keyMap.iva_dedutivel) || null;
        out.iva_suportado = findVal(keyMap.iva_suportado) || null;
        out.iva_dedutivel2 = findVal(keyMap.iva_dedutivel2) || null;
        out.valor_pago = findVal(keyMap.valor_pago) || null;
        out.divida = findVal(keyMap.divida) || null;
        out.situacao = findVal(keyMap.situacao) || null;
        out.rfont = findVal(keyMap.rfont) || null;
        out.tipologia = findVal(keyMap.tipologia) || null;
        out.id_projecto = findVal(keyMap.id_projecto) || null;
        out.obs = findVal(keyMap.obs) || null;
        out.data_pagamento = findVal(keyMap.data_pagamento) || null;
        return out;
      };
      for(const r of objects){
        items.push(mapRow(r));
      }
      return items.length > 0;
    };

    // Primeiro tenta por posição; se não, tenta por cabeçalhos
    const okArray = pushFromArray();
    if(!okArray){
      const okHeader = mapByHeader();
      if(!okHeader) return res.status(400).json({ message: 'excel_sem_conteudo', detail: 'Não foram encontradas linhas válidas. Verifique a folha e cabeçalhos.' });
    }

    // Validar ids de projecto: substituir por null se não existirem
    const projIds = Array.from(new Set(items
      .map(it => it.id_projecto)
      .filter(v => v !== null && v !== undefined && String(v).trim() !== '')));
    const projIdsNum = projIds.map(v => Number(v)).filter(n => Number.isFinite(n));
    const validSet = new Set();
    if (projIdsNum.length > 0){
      const existing = await db.Projecto.findAll({ where: { id: projIdsNum } });
      for(const p of existing){ validSet.add(Number(p.id)); }
    }
    let nullified = 0;
    for(const it of items){
      if(it.id_projecto === null || it.id_projecto === undefined || String(it.id_projecto).trim() === ''){ it.id_projecto = null; continue; }
      const n = Number(it.id_projecto);
      if(!Number.isFinite(n) || !validSet.has(n)){ it.id_projecto = null; nullified++; }
      else { it.id_projecto = n; }
    }

    // Validar linhas obrigatórias: 'nome' não pode ser nulo/vazio
    const skipped = [];
    const validItems = [];
    for(const it of items){
      const nome = (it.nome||'').toString().trim();
      if(!nome){ skipped.push({ reason: 'nome_vazio', row: it }); continue; }
      it.nome = nome;
      validItems.push(it);
    }

    const created = await db.sequelize.transaction(async (t) => {
      const results = [];
      for(const it of validItems){
        const r = await db.Fornecedor.create(it, { transaction: t });
        results.push(r);
      }
      return results;
    });
    res.json({ inserted: created.length, project_ids_nullified: nullified, skipped: skipped.length });
  }catch(e){ console.error('upload-excel erro:', e); res.status(500).json({ message: 'erro_upload_excel', detail: e.message }); }
});

// PUT /api/fornecedores/:id - atualizar campos (usado para pagar fatura)
router.put('/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    if(!Number.isFinite(id)) return res.status(400).json({ message: 'id_invalido' });
    const found = await db.Fornecedor.findByPk(id);
    if(!found) return res.status(404).json({ message: 'fornecedor_nao_encontrado' });
    const payload = req.body || {};
    // Só permite atualizar alguns campos conhecidos para segurança
    const allowed = ['valor_pago','divida','situacao','data_pagamento','pago_via'];
    const updates = {};
    for(const key of allowed){
      if(Object.prototype.hasOwnProperty.call(payload, key)){
        updates[key] = payload[key];
      }
    }
    await found.update(updates);
    res.json(found);
  }catch(e){
    res.status(500).json({ message: 'erro_atualizar_fornecedor', detail: e.message });
  }
});

// GET /api/fornecedores/relatorios/contas-pagar/aging
router.get('/relatorios/contas-pagar/aging', async (req, res) => {
  try {
    // Calculate total debt from all suppliers
    const result = await db.Fornecedor.findAll({
      attributes: [
        [db.sequelize.fn('SUM', db.sequelize.col('divida')), 'total'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        divida: {
          [Op.gt]: 0 // Only include suppliers with debt > 0
        }
      }
    });

    const total = result[0]?.dataValues?.total || 0;
    const count = result[0]?.dataValues?.count || 0;

    res.json({
      total: parseFloat(total) || 0,
      count: parseInt(count) || 0,
      currency: 'KZ'
    });
  } catch (e) {
    console.error('Erro ao calcular dívida de fornecedores:', e);
    res.status(500).json({ message: 'erro_calcular_divida_fornecedores', detail: e.message });
  }
});

// DELETE /api/fornecedores/:id
router.delete('/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    if(!Number.isFinite(id)) return res.status(400).json({ message: 'id_invalido' });
    const found = await db.Fornecedor.findByPk(id);
    if(!found) return res.status(404).json({ message: 'fornecedor_nao_encontrado' });
    await found.destroy();
    res.json({ ok: true });
  }catch(e){ res.status(500).json({ message: 'erro_eliminar_fornecedor', detail: e.message }); }
});

module.exports = router;
