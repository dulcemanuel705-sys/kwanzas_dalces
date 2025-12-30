module.exports = (sequelize, DataTypes) => {
  const Cotacao = sequelize.define("Cotacao", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numeroCotacao: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    data: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    valor: { type: DataTypes.FLOAT, allowNull: false },
    termo_pagamento: { type: DataTypes.STRING(30), allowNull: false },
    incoterm: { type: DataTypes.STRING(30), allowNull: false }
  });

  Cotacao.associate = (models) => {
    Cotacao.belongsTo(models.PedidoCotacao, { foreignKey: "pedido_cotacao_id", as: "pedidoCotacao" });
    Cotacao.hasOne(models.NotaEncomenda, { foreignKey: "cotacao_id", as: "notaEncomenda" });
  };

  return Cotacao;
};
