const { TipoPagamento } = require('../models');

exports.getAllTipos = async (req, res) => {
  const tipos = await TipoPagamento.findAll();
  res.json(tipos);
};

exports.getTipoById = async (req, res) => {
  const tipo = await TipoPagamento.findByPk(req.params.id);
  if (!tipo) return res.status(404).json({ error: 'Tipo não encontrado' });
  res.json(tipo);
};

exports.createTipo = async (req, res) => {
  const tipo = await TipoPagamento.create(req.body);
  res.status(201).json(tipo);
};

exports.updateTipo = async (req, res) => {
  const tipo = await TipoPagamento.findByPk(req.params.id);
  if (!tipo) return res.status(404).json({ error: 'Tipo não encontrado' });

  await tipo.update(req.body);
  res.json(tipo);
};

exports.deleteTipo = async (req, res) => {
  const tipo = await TipoPagamento.findByPk(req.params.id);
  if (!tipo) return res.status(404).json({ error: 'Tipo não encontrado' });

  await tipo.destroy();
  res.json({ message: 'Tipo de pagamento removido com sucesso' });
};
