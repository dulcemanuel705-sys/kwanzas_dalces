const db = require("../models");

function toNumber(val){
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

// Cria/atualiza cliente (terceiro) com base no item importado
async function ensureCliente(raw){
  if (!raw) return null;
  const nome = raw.cliente || raw.clienteNome || raw.nome || raw.nome_firma || raw.razao_social || null;
  if (!nome) return null;
  let nif = raw.nif || raw.nif_cliente || null;
  const email = raw.email || raw.email_cliente || null;
  const telefone = raw.telefone || raw.telemovel || raw.telefone_cliente || null;
  // Detecta o modelo disponível: Terceiro (preferido) ou Cliente
  const M = db.Terceiro || db.Cliente || null;
  if (!M) return null;
  // Estratégia: tenta achar por NIF, se não houver, por nome (nome_firma)
  let where = {};
  if (nif) where.nif = nif; else where.nome_firma = nome;
  const found = await M.findOne({ where }).catch(()=>null);
  if (found){
    // Atualiza usando campos do modelo Terceiro (nome_firma/tipo com maiúscula)
    const payload = {
      nome_firma: nome,
      nif: nif || found.nif,
      email,
      telefone,
      tipo: 'Cliente'
    };
    try { await found.update(payload); } catch(_){}
    return found.id || found.get?.('id') || null;
  }
  // Se o modelo exigir NIF não nulo e não tivermos, aplicamos um placeholder
  if (!nif) nif = 'SEM-NIF';
  const payload = {
    nome_firma: nome,
    nif,
    email,
    telefone,
    tipo: 'Cliente'
  };
  const created = await M.create(payload).catch(()=>null);
  return created?.id || null;
}

function mapBodyToModel(body){
  return {
    contador: body.contador != null ? Number(body.contador) : null,
    // Cliente
    cliente: body.cliente || body.clienteNome || null,
    clienteId: body.clienteId || body.cliente_id || null,
    // Descrição
    descricao: body.descricaoTrabalho || body.descricao || body.jobDescription || body.descricaoProjeto || null,
    descricaoProjeto: body.descricaoProjeto || body.descricaoTrabalho || body.descricao || body.jobDescription || null,
    // Datas principais
    dataInicio: body.dataInicioEstimada || body.inicio || body.dataInicio || null,
    dataFim: body.dataFim || body.fim || body.dataFimEstimada || null,
    dataInicioEstimada: body.dataInicioEstimada || body.dataInicio || null,
    dataFimEstimada: body.dataFimEstimada || body.dataFim || null,
    // Status geral
    status: body.jobStatus || body.estado || body.status || null,
    // Cotação / Orçamento / Contrato
    valorCotacao: toNumber(body.valorCotacao || body.cotacaoValor || body.orcamento),
    valorTotalOrcamento: toNumber(body.valorTotalOrcamento || body.valorOrcamento || body.orcamentoTotal || body.budgetTotal || body.valor_orcamento),
    valorTotalContrato: toNumber(body.valorTotalContrato || body.valorContrato || body.contractTotal || body.valor_contrato),

    // Pedido / Cotação
    idTrabalhoMs: body.idTrabalhoMs || body.msJobId || null,
    idPedido: body.idPedido || body.pedidoId || null,
    linkPedido: body.linkPedido || body.pedidoLink || null,
    dataHoraPedido: body.dataHoraPedido || body.pedidoData || null,
    numCotacao: body.numCotacao || body.cotacaoNumero || null,
    dataCotacao: body.dataCotacao || null,
    termosPagamentoCotacao: body.termosPagamentoCotacao || null,
    incoterms: body.incoterms || null,

    // Nota Encomenda / Contrato
    poSoContractNo: body.poSoContractNo || null,
    numNotaEncomenda: body.numNotaEncomenda || null,
    conteudoNotaEncomenda: body.conteudoNotaEncomenda || null,
    dataNotaEncomenda: body.dataNotaEncomenda || null,
    valorNotaEncomenda: toNumber(body.valorNotaEncomenda),
    termosPagamentoEncomenda: body.termosPagamentoEncomenda || null,

    // Projecto
    projectId: body.projectId || null,
    jobDescription: body.jobDescription || body.descricaoTrabalho || body.descricaoProjeto || null,
    dataInicioEstimada: body.dataInicioEstimada || null,
    jobStatus: body.jobStatus || null,

    // Guia Serviço / Nota Serviço
    numNotaServico: body.numNotaServico || null,
    conteudoNotaServico: body.conteudoNotaServico || null,
    dataEmissaoNsNe: body.dataEmissaoNsNe || null,
    dataAprovacaoNsNe: body.dataAprovacaoNsNe || null,

    // Proforma
    proformaNo: body.proformaNo || null,
    proformaDate: body.proformaDate || null,
    proformaValueNet: toNumber(body.proformaValueNet),
    proformaExchange: toNumber(body.proformaExchange),

    // Factura
    invoiceNo: body.invoiceNo || null,
    invoiceDate: body.invoiceDate || null,
    invoiceValue: toNumber(body.invoiceValue),
    invoiceExchange: toNumber(body.invoiceExchange),

    // Pagamentos
    datePaid: body.datePaid || null,
    valuePaid: toNumber(body.valuePaid),
    receiptNo: body.receiptNo || null,
    receiptDate: body.receiptDate || null,

    // Status extra
    statusDate: body.statusDate || null,
    remarks: body.remarks || body.observacoes || null,

    dados: body
  };
}

// Normaliza chaves vindas do Excel/tabela (cabeçalhos em PT/EN) para o formato esperado pelo backend
function normalizeRawFromExcel(raw){
  if (!raw) return {};
  const body = { ...raw };

  // Cabeçalhos principais usados na tabela detalhada de upload
  if (raw["Cliente"]) body.cliente = raw["Cliente"];
  if (raw["Descrição Trabalho"]) body.descricaoTrabalho = raw["Descrição Trabalho"];
  if (raw["Descrição do Trabalho"]) body.descricaoTrabalho = raw["Descrição do Trabalho"];

  // Projecto
  if (raw["Project ID"]) body.projectId = raw["Project ID"];
  if (raw["ID Projecto"]) body.projectId = raw["ID Projecto"];

  // Datas principais (formatadas em texto no Excel)
  if (raw["Est. Job Start Date"]) body.dataInicioEstimada = raw["Est. Job Start Date"];
  if (raw["Data Est. Início"]) body.dataInicioEstimada = raw["Data Est. Início"];
  if (raw["Job End Date"]) body.dataFimEstimada = raw["Job End Date"];
  if (raw["Data Fim Trabalho"]) body.dataFimEstimada = raw["Data Fim Trabalho"];

  // Status do trabalho
  if (raw["Job Status"]) body.jobStatus = raw["Job Status"];
  if (raw["Estado Trabalho"]) body.jobStatus = raw["Estado Trabalho"];

  // Valores (números podem vir como texto do Excel)
  if (raw["Valor Cotação (AOA)"]) body.valorCotacao = raw["Valor Cotação (AOA)"];
  if (raw["Valor Nota Encomenda"]) body.valorNotaEncomenda = raw["Valor Nota Encomenda"];
  if (raw["Valor Factura (Líq)"]) body.invoiceValue = raw["Valor Factura (Líq)"];
  if (raw["Valor Pago"]) body.valuePaid = raw["Valor Pago"];

  // Cabeçalhos adicionais solicitados (pedido/cotação e identificadores)
  if (raw["Id. Trabalho MS"]) body.idTrabalhoMs = raw["Id. Trabalho MS"];
  if (raw["ID Trabalho (MS)"]) body.idTrabalhoMs = raw["ID Trabalho (MS)"];
  if (raw["Id. Pedido"]) body.idPedido = raw["Id. Pedido"];
  if (raw["ID Pedido"]) body.idPedido = raw["ID Pedido"];
  if (raw["Link Pedido"]) body.linkPedido = raw["Link Pedido"];
  if (raw["Link do Pedido"]) body.linkPedido = raw["Link do Pedido"];
  if (raw["Data & Hr Pedido"]) body.dataHoraPedido = raw["Data & Hr Pedido"];
  if (raw["Data & Hora do Pedido"]) body.dataHoraPedido = raw["Data & Hora do Pedido"];
  if (raw["Nº Cotação"]) body.numCotacao = raw["Nº Cotação"];
  if (raw["Nº da Cotação"]) body.numCotacao = raw["Nº da Cotação"];
  if (raw["Data Cotação"]) body.dataCotacao = raw["Data Cotação"];
  if (raw["Data da Cotação"]) body.dataCotacao = raw["Data da Cotação"];

  // Incoterms
  if (raw["Incoterms"]) body.incoterms = raw["Incoterms"];

  // Nota Encomenda / Contrato
  if (raw["P.O/S.O/Contract No."]) body.poSoContractNo = raw["P.O/S.O/Contract No."];
  if (raw["Nº Nota de Encomenda / Contrato (P.O / S.O / Contract No.)"]) body.poSoContractNo = raw["Nº Nota de Encomenda / Contrato (P.O / S.O / Contract No.)"];
  if (raw["Nº Nota Encomenda / Contrato"]) body.numNotaEncomenda = raw["Nº Nota Encomenda / Contrato"]; // quando existir
  if (raw["Nº Nota de Encomenda / Contrato"]) body.numNotaEncomenda = raw["Nº Nota de Encomenda / Contrato"]; // alternativa
  if (raw["Conteúdo da Nota Encomenda / Contrato"]) body.conteudoNotaEncomenda = raw["Conteúdo da Nota Encomenda / Contrato"];
  if (raw["Data Nota Encomenda / Contrato"]) body.dataNotaEncomenda = raw["Data Nota Encomenda / Contrato"];
  if (raw["Data da Nota de Encomenda / Contrato"]) body.dataNotaEncomenda = raw["Data da Nota de Encomenda / Contrato"];
  if (raw["Valor Nota Encomenda"]) body.valorNotaEncomenda = raw["Valor Nota Encomenda"];
  if (raw["Termos de Pagamento da Nota / Contrato"]) body.termosPagamentoEncomenda = raw["Termos de Pagamento da Nota / Contrato"];
  if (raw["Termos de Pagamento da Cotação"]) body.termosPagamentoCotacao = raw["Termos de Pagamento da Cotação"];

  return body;
}

// DELETE /api/projectos  -> apaga todos os registos
exports.deleteAll = async (req, res) => {
  try{
    const count = await db.Projecto.destroy({ where: {} });
    return res.json({ deleted: count });
  }catch(err){
    console.error('[projectos:deleteAll]', err);
    return res.status(500).json({ message: 'Erro ao eliminar projectos', error: String(err?.message || err) });
  }
};

// PATCH /api/projectos/tickets/:ticketId -> atualiza campos simples de um ServiceTicket existente
exports.updateServiceTicket = async (req, res) => {
  try{
    const ticketId = req.params.ticketId;
    const body = req.body || {};

    const ticket = await db.ServiceTicket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Trabalho/tarefa não encontrado' });

    // Atualiza apenas campos simples definidos no modelo
    if (body.notaServico !== undefined) ticket.notaServico = body.notaServico;
    if (body.notaExecutado !== undefined) ticket.notaExecutado = body.notaExecutado;
    if (body.notaEnviado !== undefined) ticket.notaEnviado = body.notaEnviado;
    if (body.notaPago !== undefined) ticket.notaPago = body.notaPago;
    if (body.dataInicio !== undefined) ticket.dataInicio = body.dataInicio || null;
    if (body.dataFim !== undefined) ticket.dataFim = body.dataFim || null;

    await ticket.save();
    return res.json(ticket);
  }catch(err){
    console.error('[projectos:updateServiceTicket]', err);
    return res.status(500).json({ message: 'Erro ao atualizar trabalho/tarefa', error: String(err?.message || err) });
  }
};

// DELETE /api/projectos/tickets/:ticketId -> remove um ServiceTicket
exports.deleteServiceTicket = async (req, res) => {
  try{
    const ticketId = req.params.ticketId;
    const ticket = await db.ServiceTicket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Trabalho/tarefa não encontrado' });

    await ticket.destroy();
    return res.status(204).send();
  }catch(err){
    console.error('[projectos:deleteServiceTicket]', err);
    return res.status(500).json({ message: 'Erro ao eliminar trabalho/tarefa', error: String(err?.message || err) });
  }
};

exports.createProjecto = async (req, res) => {
  try{
    // Validação simples
    const body = req.body || {};
    if (!body.cliente) return res.status(400).json({ message: 'Campo cliente é obrigatório' });
    if (!(body.descricaoTrabalho || body.descricao || body.jobDescription)) return res.status(400).json({ message: 'Descrição do trabalho é obrigatória' });

    const payload = mapBodyToModel(body);
    const saved = await db.Projecto.create(payload);
    return res.status(201).json(saved);
  }catch(err){
    console.error("[projectos:create]", err);
    return res.status(500).json({ message: "Erro ao criar projecto", error: String(err?.message || err) });
  }
};

// GET /api/projectos?limit=&offset=
exports.listProjectos = async (req, res) => {
  try{
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const { rows, count } = await db.Projecto.findAndCountAll({
      limit,
      offset,
      order: [["createdAt","DESC"]],
      attributes: { exclude: ['nota_encomenda_id'] }
    });
    const items = rows.map(r => ({ ...r.toJSON(), ...(r.dados || {}) }));
    return res.json({ total: count, items });
  }catch(err){
    console.error('[projectos:list]', err);
    return res.status(500).json({ message: 'Erro ao listar projectos', error: String(err?.message || err) });
  }
};

// GET /api/projectos/:id
exports.getProjecto = async (req, res) => {
  try{
    const idParam = req.params.id;

    // 1) tenta pela PK normal (id)
    let item = await db.Projecto.findByPk(idParam, {
      attributes: { exclude: ['nota_encomenda_id'] },
      include: [
        { model: db.ServiceTicket, as: 'serviceTickets' }
      ]
    });

    // 2) se não encontrar, tenta pelo campo projectId (caso o front use essa referência)
    if (!item) {
      item = await db.Projecto.findOne({
        where: { projectId: idParam },
        attributes: { exclude: ['nota_encomenda_id'] },
        include: [
          { model: db.ServiceTicket, as: 'serviceTickets' }
        ]
      });
    }

    // 3) se ainda assim não encontrar, tenta pelo campo id_projecto (ID externo importado)
    if (!item) {
      item = await db.Projecto.findOne({
        where: { id_projecto: idParam },
        attributes: { exclude: ['nota_encomenda_id'] },
        include: [
          { model: db.ServiceTicket, as: 'serviceTickets' }
        ]
      });
    }

    if (!item) return res.status(404).json({ message: 'Projecto não encontrado' });
    const json = item.toJSON();
    return res.json({ ...json, ...(json.dados || {}) });
  }catch(err){
    console.error('[projectos:get]', err);
    return res.status(500).json({ message: 'Erro ao obter projecto', error: String(err?.message || err) });
  }
};

// PATCH /api/projectos/:id/status -> atualiza apenas o estado/jobStatus do projecto
exports.updateStatus = async (req, res) => {
  try{
    const idParam = req.params.id;
    const body = req.body || {};
    const novoStatus = body.jobStatus || body.status || null;
    if (!novoStatus) return res.status(400).json({ message: 'Campo status/jobStatus é obrigatório' });

    // mesmo padrão de lookup de getProjecto/deleteOne
    let item = await db.Projecto.findByPk(idParam);
    if (!item) {
      item = await db.Projecto.findOne({ where: { projectId: idParam } });
    }
    if (!item) {
      item = await db.Projecto.findOne({ where: { id_projecto: idParam } });
    }
    if (!item) return res.status(404).json({ message: 'Projecto não encontrado' });

    item.status = novoStatus;
    item.jobStatus = novoStatus;
    await item.save();

    const json = item.toJSON();
    return res.json({ ...json, ...(json.dados || {}), jobStatus: novoStatus, status: novoStatus });
  }catch(err){
    console.error('[projectos:updateStatus]', err);
    return res.status(500).json({ message: 'Erro ao atualizar estado do projecto', error: String(err?.message || err) });
  }
};

// DELETE /api/projectos/:id
exports.deleteOne = async (req, res) => {
  try{
    const idParam = req.params.id;

    // 1) tenta pela PK normal (id)
    let item = await db.Projecto.findByPk(idParam);

    // 2) se não encontrar, tenta pelo campo projectId (referência externa usada no front)
    if (!item) {
      item = await db.Projecto.findOne({ where: { projectId: idParam } });
    }

    // 3) se ainda assim não encontrar, tenta pelo campo id_projecto (ID externo importado)
    if (!item) {
      item = await db.Projecto.findOne({ where: { id_projecto: idParam } });
    }

    if (!item) return res.status(404).json({ message: 'Projecto não encontrado' });

    await item.destroy();
    return res.json({ deleted: 1 });
  }catch(err){
    console.error('[projectos:deleteOne]', err);
    return res.status(500).json({ message: 'Erro ao eliminar projecto', error: String(err?.message || err) });
  }
};

// POST /api/projectos/:id/tickets  -> adiciona um trabalho/tarefa (ServiceTicket) ao projecto
exports.addServiceTicket = async (req, res) => {
  try{
    const idParam = req.params.id;

    // Mesmo padrão de lookup de getProjecto/updateStatus/deleteOne
    let projecto = await db.Projecto.findByPk(idParam);
    if (!projecto) {
      projecto = await db.Projecto.findOne({ where: { projectId: idParam } });
    }
    if (!projecto) {
      projecto = await db.Projecto.findOne({ where: { id_projecto: idParam } });
    }
    if (!projecto) return res.status(404).json({ message: 'Projecto não encontrado' });

    const body = req.body || {};
    if (!body.notaServico) return res.status(400).json({ message: 'Campo notaServico é obrigatório' });

    const payload = {
      notaServico: body.notaServico,
      notaExecutado: body.notaExecutado || '',
      notaEnviado: body.notaEnviado || '',
      notaPago: body.notaPago || '',
      projecto_id: projecto.id
    };

    const created = await db.ServiceTicket.create(payload);
    return res.status(201).json(created);
  }catch(err){
    console.error('[projectos:addServiceTicket]', err);
    return res.status(500).json({ message: 'Erro ao adicionar trabalho/tarefa ao projecto', error: String(err?.message || err) });
  }
};

exports.importMany = async (req, res) => {
  try{
    const items = Array.isArray(req.body) ? req.body : (Array.isArray(req.body?.items) ? req.body.items : []);
    if (!items.length) return res.status(400).json({ message: "Nenhum item enviado" });

    const failed = [];
    let inserted = 0;

    // Inserção individual para permitir parcialmente salvar o que é válido
    for (let i = 0; i < items.length; i++){
      const raw = items[i] || {};
      try{
        // Normalizar mínimos obrigatórios (inclui mapeamento de cabeçalhos do Excel)
        const normalized = normalizeRawFromExcel(raw);
        // Mesclar raw + normalizado para preservar TODOS os campos/histórico nos dados persistidos
        const body = { ...raw, ...normalized };
        if (body.contador == null) body.contador = i + 1;
        body.cliente = body.cliente || body.clienteNome || body.nome || body.nome_firma || body.razao_social || null;
        body.descricaoTrabalho = body.descricaoTrabalho || body.descricao || body.jobDescription || body.trabalho || null;

        if (!body.cliente || !body.descricaoTrabalho){
          failed.push({ index: i, message: 'Campos obrigatórios ausentes: cliente e/ou descrição' });
          continue;
        }

        // Upsert do cliente na tabela de terceiros/clientes
        try{ await ensureCliente(body); }catch(_){ /* segue mesmo assim */ }
        const payload = mapBodyToModel(body);
        await db.Projecto.create(payload);
        inserted++;
      }catch(e){
        failed.push({ index: i, message: String(e?.message || e) });
      }
    }
    return res.status(201).json({
      success: true,
      savedCount: inserted,
      inserted,
      failed
    });
  }catch(err){
    console.error("[projectos:import]", err);
    return res.status(500).json({ message: "Erro ao importar projectos", error: String(err?.message || err) });
  }
};
