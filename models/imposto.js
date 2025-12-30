module.exports = (sequelize, DataTypes) => {
  const Imposto = sequelize.define("Imposto", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomeImposto: { type: DataTypes.ENUM("IVA", "IR", "IS"), allowNull: false },
    tipoCalculo: { type: DataTypes.ENUM("Percentual", "Fixo") },
    valorTributario: { type: DataTypes.FLOAT },
    taxa: { type: DataTypes.ENUM("Baixa", "Média", "Alta") },
    ivaDedutivel: { type: DataTypes.STRING(30) }
  });

  Imposto.associate = (models) => {
    Imposto.belongsTo(models.Fatura, { foreignKey: "fatura_id", as: "fatura" });
  };

  return Imposto;
};
