module.exports = (sequelize, DataTypes) => {
  const Trabalho = sequelize.define("Trabalho", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descricao: { type: DataTypes.STRING(100), allowNull: false },
    data: { type: DataTypes.DATE, allowNull: false },
    trabalhoMOS: { type: DataTypes.STRING, allowNull: false }
  });

  Trabalho.associate = (models) => {
    Trabalho.belongsTo(models.Terceiro, { foreignKey: "terceiro_id", as: "terceiro" });
    Trabalho.hasMany(models.PedidoCotacao, { foreignKey: "trabalho_id", as: "pedidosCotacao" });
  };

  return Trabalho;
};
