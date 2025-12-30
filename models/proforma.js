module.exports = (sequelize, DataTypes) => {
  const ProformaInvoice = sequelize.define("ProformaInvoice", {
    numero: { type: DataTypes.INTEGER, primaryKey: true },
    data: { type: DataTypes.DATE },
    valor: { type: DataTypes.FLOAT },
    cambio: { type: DataTypes.FLOAT }
  });

  ProformaInvoice.associate = (models) => {
    ProformaInvoice.belongsTo(models.Projecto, { foreignKey: "projecto_id", as: "projecto" });
    ProformaInvoice.hasMany(models.Fatura, { foreignKey: "proforma_invoice_numero", as: "faturas" });
  };

  return ProformaInvoice;
};
