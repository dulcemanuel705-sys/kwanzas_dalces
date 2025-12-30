module.exports = (sequelize, DataTypes) => {
  const Projecto = sequelize.define("Projecto", {
    id_projecto: { type: DataTypes.INTEGER },
    contador: { type: DataTypes.INTEGER },
    // Identificação do cliente
    cliente: { 
      type: DataTypes.STRING(150),
      field: 'Cliente'
    },
    clienteId: { type: DataTypes.STRING(64) },
    descricao: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('jobDescription') || this.getDataValue('descricaoProjeto') || (this.getDataValue('dados')?.descricaoTrabalho) || null;
      },
      set(val) {
        // Mantém compatibilidade atribuindo ao campo persistente jobDescription
        this.setDataValue('jobDescription', val);
      }
    },
    // Datas principais
    dataInicio: {
      // Não existe coluna correspondente na BD → manter como virtual
      type: DataTypes.VIRTUAL,
      get() {
        const raw = this.getDataValue('dataInicioReal');
        if (raw) return raw;
        const d = this.getDataValue('dados') || {};
        return d.dataInicio || d.dataInicioEstimada || d.inicio || null;
      },
      set(v) { this.setDataValue('dataInicioReal', v); }
    },
    dataFim: { 
      type: DataTypes.DATE,
      field: 'Data de Fim do Trabalho'
    },
    // status livre para evitar problemas de sync com ENUM entre ambientes
    status: { 
      type: DataTypes.STRING(30),
      field: 'Estado do Trabalho (Job Status)'
    },
    jobStatus: { 
      type: DataTypes.STRING(30),
      field: 'Estado do Trabalho (Job Status)'
    },
    // Valores financeiros
    valorCotacao: { 
      type: DataTypes.DECIMAL(15, 2),
      field: 'Valor da Cotação (AOA)'
    },
    valorTotalOrcamento: { type: DataTypes.VIRTUAL },
    valorTotalContrato: { type: DataTypes.VIRTUAL },

    // Pedido/Cotação
    idTrabalhoMs: { 
      type: DataTypes.STRING(64),
      field: 'ID Trabalho (MS)'
    },
    idPedido: { 
      type: DataTypes.STRING(64),
      field: 'ID Pedido'
    },
    linkPedido: { 
      type: DataTypes.STRING(255),
      field: 'Link do Pedido'
    },
    dataHoraPedido: { 
      type: DataTypes.DATE,
      field: 'Data & Hora do Pedido'
    },
    numCotacao: { 
      type: DataTypes.STRING(64),
      field: 'Nº da Cotação'
    },
    dataCotacao: { 
      type: DataTypes.DATE,
      field: 'Data da Cotação'
    },
    termosPagamentoCotacao: { 
      type: DataTypes.STRING(120),
      field: 'Termos de Pagamento da Cotação'
    },
    incoterms: { 
      type: DataTypes.STRING(45),
      field: 'Incoterms'
    },

    // Nota de Encomenda / Contrato
    poSoContractNo: { 
      type: DataTypes.STRING(64),
      field: 'Nº Nota de Encomenda / Contrato (P.O / S.O / Contract No.)'
    },
    numNotaEncomenda: { 
      type: DataTypes.STRING(64),
      field: 'Nº Nota de Encomenda / Contrato'
    },
    conteudoNotaEncomenda: { 
      type: DataTypes.TEXT,
      field: 'Conteúdo da Nota de Encomenda / Contrato'
    },
    dataNotaEncomenda: { 
      type: DataTypes.DATE,
      field: 'Data da Nota de Encomenda / Contrato'
    },
    valorNotaEncomenda: { 
      type: DataTypes.DECIMAL(15, 2),
      field: 'Valor da Nota de Encomenda'
    },
    termosPagamentoEncomenda: { 
      type: DataTypes.STRING(120),
      field: 'Termos de Pagamento da Nota / Contrato'
    },

    // Projecto
    projectId: { 
      type: DataTypes.STRING(64),
      field: 'Project ID (ID do Projecto)'
    },
    jobDescription: { 
      type: DataTypes.STRING(255),
      field: 'Job Description (Descrição do Trabalho)'
    },

    // Guia Serviço / Nota Serviço
    numNotaServico: { 
      type: DataTypes.STRING(64),
      field: 'Nº da Nota de Serviço / Entrega'
    },
    conteudoNotaServico: { 
      type: DataTypes.TEXT,
      field: 'Conteúdo da Nota de Serviço / Entrega'
    },
    dataEmissaoNsNe: { 
      type: DataTypes.DATE,
      field: 'Data de Emissão da Nota de Serviço / Entrega'
    },
    dataAprovacaoNsNe: { 
      type: DataTypes.DATE,
      field: 'Data de Aprovação da Nota de Serviço / Entrega'
    },

    // Proforma
    proformaNo: { 
      type: DataTypes.STRING(64),
      field: 'Nº da Proforma'
    },
    proformaDate: { 
      type: DataTypes.DATE,
      field: 'Data da Proforma'
    },
    proformaValueNet: { 
      type: DataTypes.DECIMAL(15, 2),
      field: 'Valor da Proforma (Líquido)'
    },
    proformaExchange: { 
      type: DataTypes.DECIMAL(12, 4),
      field: 'Câmbio da Proforma'
    },

    // Factura
    invoiceNo: { 
      type: DataTypes.STRING(64),
      field: 'Nº da Factura'
    },
    invoiceDate: { 
      type: DataTypes.DATE,
      field: 'Data da Factura'
    },
    invoiceValue: { 
      type: DataTypes.DECIMAL(15, 2),
      field: 'Valor da Factura (AOA – Líquido)'
    },
    invoiceExchange: { 
      type: DataTypes.DECIMAL(12, 4),
      field: 'Câmbio da Factura'
    },

    // Pagamentos/Recibos
    datePaid: { 
      type: DataTypes.DATE,
      field: 'Data do Pagamento'
    },
    valuePaid: { 
      type: DataTypes.DECIMAL(15, 2),
      field: 'Valor Pago'
    },
    receiptNo: { 
      type: DataTypes.STRING(64),
      field: 'Nº do Recibo'
    },
    receiptDate: { 
      type: DataTypes.DATE,
      field: 'Data do Recibo'
    },

    // Status adicional / observações
    statusDate: { 
      type: DataTypes.DATE,
      field: 'Data de Registo'
    },
    remarks: { 
      type: DataTypes.TEXT,
      field: 'Observações / Remarks'
    },

    // guarda o payload completo para rastreamento/compatibilidade
    dados: { type: DataTypes.JSON }
  }, {
    defaultScope: {
      attributes: { exclude: ['nota_encomenda_id'] }
    }
  });

  Projecto.associate = (models) => {
    Projecto.hasMany(models.ServiceTicket, { foreignKey: "projecto_id", as: "serviceTickets" });
    Projecto.hasOne(models.ProformaInvoice, { foreignKey: "projecto_id", as: "proforma" });
  };

  return Projecto;
};
