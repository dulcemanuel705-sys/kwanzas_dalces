module.exports = (sequelize, DataTypes) => {
  const PedidoCotacao = sequelize.define("PedidoCotacao", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    linkPedido: { type: DataTypes.STRING(50), allowNull: false },
    dataEntrada: { type: DataTypes.DATE, allowNull: false }
  });

  PedidoCotacao.associate = (models) => {
    PedidoCotacao.belongsTo(models.Trabalho, { foreignKey: "trabalho_id", as: "trabalho" });
    PedidoCotacao.hasMany(models.Cotacao, { foreignKey: "pedido_cotacao_id", as: "cotacoes" });
  };

  return PedidoCotacao;
};
