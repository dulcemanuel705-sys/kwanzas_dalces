module.exports = (sequelize, DataTypes) => {
  const Banco = sequelize.define("Banco", {
    ordem: { type: DataTypes.INTEGER, primaryKey: true },
    data: { type: DataTypes.DATE },
    numeroOperacao: { type: DataTypes.INTEGER },
    descricaoEntrada: { type: DataTypes.STRING(100) },
    descricaoSaida: { type: DataTypes.STRING(100) },
    classificacao: { type: DataTypes.STRING(30) },
    status: { type: DataTypes.ENUM("Ativo", "Inativo") },
    saldo: { type: DataTypes.FLOAT },
    observacao: { type: DataTypes.STRING(100) }
  });

  Banco.associate = (models) => {
    Banco.belongsTo(models.Transacoes, { foreignKey: "transacoes_id", as: "transacao" });
  };

  return Banco;
};
