module.exports = (sequelize, DataTypes) => {
  const Fornecedor = sequelize.define(
    'Fornecedor',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      num_ordem: { type: DataTypes.STRING(32), allowNull: false, unique: true }, // ex: "kwanza-0001"
      nif: { type: DataTypes.STRING(32), allowNull: true },
      nome: { type: DataTypes.STRING(255), allowNull: false },
      pago_via: { type: DataTypes.STRING(64), allowNull: true },
      num_factura: { type: DataTypes.STRING(64), allowNull: true },
      custo_aceite: { type: DataTypes.STRING(32), allowNull: true }, // manter string conforme planilha ("Sim/Não"), pode virar BOOLEAN no futuro
      data_documento: { type: DataTypes.DATEONLY, allowNull: true },
      mes: { type: DataTypes.STRING(16), allowNull: true },
      valor_documento: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      valor_iva: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      valor_retencao: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      iva_dedutivel: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      iva_suportado: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      iva_dedutivel2: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      valor_pago: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      divida: { type: DataTypes.DECIMAL(18,2), allowNull: true },
      situacao: { type: DataTypes.STRING(64), allowNull: true },
      rfont: { type: DataTypes.STRING(64), allowNull: true },
      tipologia: { type: DataTypes.STRING(64), allowNull: true },
      id_projecto: { type: DataTypes.INTEGER, allowNull: true },
      obs: { type: DataTypes.TEXT, allowNull: true },
      data_pagamento: { type: DataTypes.DATEONLY, allowNull: true }
    },
    {
      tableName: 'fornecedores',
      underscored: true,
      indexes: [
        { unique: true, fields: ['num_ordem'] },
        { fields: ['nif'] },
        { fields: ['nome'] }
      ]
    }
  );

  Fornecedor.associate = (models) => {
    // Relaciona com Projecto, se existir
    if (models.Projecto) {
      Fornecedor.belongsTo(models.Projecto, { primaryKey: 'id_projecto', as: 'projecto' });
    }
    // Poderá relacionar com pagamentos/despesas no futuro
  };

  return Fornecedor;
};
