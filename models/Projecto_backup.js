module.exports = (sequelize, DataTypes) => {
  const Projecto = sequelize.define("Projecto", {
    id_projecto: { type: DataTypes.INTEGER },
    contador: { type: DataTypes.INTEGER },
    // Identificação do cliente
    cliente: { type: DataTypes.STRING(150) },
    clienteId: { type: DataTypes.STRING(64) },
    descricao: { type: DataTypes.STRING(255) },
    // Datas principais
    dataInicio: { type: DataTypes.DATE },
    dataFim: { type: DataTypes.DATE },
    // status livre para evitar problemas de sync com ENUM entre ambientes
    status: { type: DataTypes.STRING(30) },
    jobStatus: { type: DataTypes.STRING(30) },
    // Valores financeiros
    valorCotacao: { type: DataTypes.DECIMAL(15, 2) },
    valorTotalOrcamento: { type: DataTypes.DECIMAL(15, 2) },
    valorTotalContrato: { type: DataTypes.DECIMAL(15, 2) },

    // Pedido/Cotação
    idTrabalhoMs: { type: DataTypes.STRING(64) },
    idPedido: { type: DataTypes.STRING(64) },
    linkPedido: { type: DataTypes.STRING(255) },
    dataHoraPedido: { type: DataTypes.DATE },
    numCotacao: { type: DataTypes.STRING(64) },
    dataCotacao: { type: DataTypes.DATE },
    termosPagamentoCotacao: { type: DataTypes.STRING(120) },
    incoterms: { type: DataTypes.STRING(45) },

    // Nota de Encomenda / Contrato
    poSoContractNo: { type: DataTypes.STRING(64) },
    numNotaEncomenda: { type: DataTypes.STRING(64) },
    conteudoNotaEncomenda: { type: DataTypes.TEXT },
    dataNotaEncomenda: { type: DataTypes.DATE },
    valorNotaEncomenda: { type: DataTypes.DECIMAL(15, 2) },
    termosPagamentoEncomenda: { type: DataTypes.STRING(120) },

    // Projecto
    projectId: { type: DataTypes.STRING(64) },
    jobDescription: { type: DataTypes.STRING(255) },

    // Guia Serviço / Nota Serviço
    numNotaServico: { type: DataTypes.STRING(64) },
    conteudoNotaServico: { type: DataTypes.TEXT },
    dataEmissaoNsNe: { type: DataTypes.DATE },
    dataAprovacaoNsNe: { type: DataTypes.DATE },

    // Proforma
    proformaNo: { type: DataTypes.STRING(64) },
    proformaDate: { type: DataTypes.DATE },
    proformaValueNet: { type: DataTypes.DECIMAL(15, 2) },
    proformaExchange: { type: DataTypes.DECIMAL(12, 4) },

    // Factura
    invoiceNo: { type: DataTypes.STRING(64) },
    invoiceDate: { type: DataTypes.DATE },
    invoiceValue: { type: DataTypes.DECIMAL(15, 2) },
    invoiceExchange: { type: DataTypes.DECIMAL(12, 4) },

    // Pagamentos/Recibos
    datePaid: { type: DataTypes.DATE },
    valuePaid: { type: DataTypes.DECIMAL(15, 2) },
    receiptNo: { type: DataTypes.STRING(64) },
    receiptDate: { type: DataTypes.DATE },

    // Status adicional / observações
    statusDate: { type: DataTypes.DATE },
    remarks: { type: DataTypes.TEXT },

    // guarda o payload completo para rastreamento/compatibilidade
    dados: { type: DataTypes.JSON }
  });

  Projecto.associate = (models) => {
    Projecto.belongsTo(models.NotaEncomenda, { foreignKey: "nota_encomenda_id", as: "notaEncomenda" });
    Projecto.hasMany(models.ServiceTicket, { foreignKey: "projecto_id", as: "serviceTickets" });
    Projecto.hasOne(models.ProformaInvoice, { foreignKey: "projecto_id", as: "proforma" });
  };

  return Projecto;
};
