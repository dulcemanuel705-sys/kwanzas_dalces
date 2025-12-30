module.exports = (sequelize, DataTypes) => {
  const Fatura = sequelize.define("Fatura", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numeroFatura: { type: DataTypes.INTEGER, allowNull: false },
    data: { type: DataTypes.DATE },
    valor: { type: DataTypes.FLOAT },
    quantidade: { type: DataTypes.INTEGER },
    tipo_pag: { type: DataTypes.STRING }
  });

  Fatura.associate = (models) => {
    Fatura.belongsTo(models.Terceiro, { foreignKey: "terceiro_id", as: "terceiro" });
    Fatura.belongsTo(models.ProformaInvoice, { foreignKey: "proforma_invoice_numero", as: "proforma" });
    Fatura.hasMany(models.ItemFatura, { foreignKey: "fatura_id", as: "itens" });
    Fatura.hasMany(models.Imposto, { foreignKey: "fatura_id", as: "impostos" });
  };

  return Fatura;
};
