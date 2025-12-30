const { Pagamento } = require("../models");

exports.getAllPagamentos = async (req, res) => {
  const pagamentos = await Pagamento.findAll();
  res.json(pagamentos);
};

exports.getPagamentoById = async (req, res) => {
  const pagamento = await Pagamento.findByPk(req.params.id);
  if (!pagamento)
    return res.status(404).json({ error: "Pagamento não encontrado" });
  res.json(pagamento);
};

exports.createPagamento = async (req, res) => {
  const pagamento = await Pagamento.create(req.body);
  res.status(201).json(pagamento);
};

exports.updatePagamento = async (req, res) => {
  const pagamento = await Pagamento.findByPk(req.params.id);
  if (!pagamento)
    return res.status(404).json({ error: "Pagamento não encontrado" });

  await pagamento.update(req.body);
  res.json(pagamento);
};

exports.deletePagamento = async (req, res) => {
  const pagamento = await Pagamento.findByPk(req.params.id);
  if (!pagamento)
    return res.status(404).json({ error: "Pagamento não encontrado" });

  await pagamento.destroy();
  res.json({ message: "Pagamento removido com sucesso" });
};
