module.exports = (sequelize, DataTypes) => {
  const NotaEncomenda = sequelize.define("NotaEncomenda", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    centroCusto: { type: DataTypes.STRING(100) },
    valor: { type: DataTypes.FLOAT, allowNull: false },
    data: { type: DataTypes.DATE, allowNull: false },
    termo_pagamento: { type: DataTypes.STRING(30) },
    incoterm: { type: DataTypes.STRING(30) }
  });

  NotaEncomenda.associate = (models) => {
    NotaEncomenda.belongsTo(models.Cotacao, { foreignKey: "cotacao_id", as: "cotacao" });
    NotaEncomenda.hasOne(models.Projecto, { foreignKey: "nota_encomenda_id", as: "projecto" });
  };

  return NotaEncomenda;
};
