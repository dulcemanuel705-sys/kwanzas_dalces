module.exports = (sequelize, DataTypes) => {
  const TipoPagamento = sequelize.define("TipoPagamento", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    descricao: { type: DataTypes.STRING(255), allowNull: true },
  });

  TipoPagamento.associate = (models) => {
    if (models.Pagamento) {
      TipoPagamento.hasMany(models.Pagamento, {
        foreignKey: "tipo_pagamento_id",
        as: "pagamentos",
      });
    }
  };

  return TipoPagamento;
};
