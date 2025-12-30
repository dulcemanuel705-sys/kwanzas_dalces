module.exports = (sequelize, DataTypes) => {
  const Transacoes = sequelize.define("Transacoes", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // FK para Pagamento (1:1)
    pagamento_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    tipoTransacao: { type: DataTypes.ENUM("Crédito", "Débito") },
    saldo: { type: DataTypes.FLOAT },
    descricao: { type: DataTypes.STRING(100) }
  });

  Transacoes.associate = (models) => {
    Transacoes.belongsTo(models.Pagamento, {
      foreignKey: { name: "pagamento_id", allowNull: false, unique: true },
      as: "pagamento",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Transacoes.hasMany(models.Banco, { foreignKey: "transacoes_id", as: "bancos" });
  };

  return Transacoes;
};
