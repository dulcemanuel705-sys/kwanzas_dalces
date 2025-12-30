module.exports = (sequelize, DataTypes) => {
  const Pagamento = sequelize.define("Pagamento", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    valor: { type: DataTypes.FLOAT },
    via: { type: DataTypes.ENUM("Transferência", "Cheque", "Dinheiro") },
    docx: { type: DataTypes.STRING(100) },
    data: { type: DataTypes.DATE },
    // FK para TipoPagamento
    tipo_pagamento_id: { type: DataTypes.INTEGER, allowNull: true },
  });

  Pagamento.associate = (models) => {
    Pagamento.hasOne(models.Transacoes, {
      foreignKey: { name: "pagamento_id", allowNull: false, unique: true },
      as: "transacao",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Pagamento.hasMany(models.ItemFatura, { foreignKey: "pagamento_id", as: "itensFatura" });
    // Associação com TipoPagamento (muitos pagamentos pertencem a um tipo)
    if (models.TipoPagamento) {
      Pagamento.belongsTo(models.TipoPagamento, {
        foreignKey: "tipo_pagamento_id",
        as: "tipoPagamento",
      });
    }
  };

  return Pagamento;
};
