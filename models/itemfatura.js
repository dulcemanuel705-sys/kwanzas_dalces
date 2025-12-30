module.exports = (sequelize, DataTypes) => {
  const ItemFatura = sequelize.define("ItemFatura", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descricao: { type: DataTypes.STRING(100) },
    valor: { type: DataTypes.FLOAT },
    data: { type: DataTypes.DATE }
  });

  ItemFatura.associate = (models) => {
    ItemFatura.belongsTo(models.Fatura, { foreignKey: "fatura_id", as: "fatura" });
    ItemFatura.belongsTo(models.Pagamento, { foreignKey: "pagamento_id", as: "pagamento" });
  };

  return ItemFatura;
};
