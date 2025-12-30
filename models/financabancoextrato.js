module.exports = (sequelize, DataTypes) => {
  const FinancaBancoExtrato = sequelize.define('FinancaBancoExtrato', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bancoId: { type: DataTypes.INTEGER, allowNull: false, field: 'banco_id' },
    ordem: { type: DataTypes.INTEGER, allowNull: true },
    data: { type: DataTypes.DATEONLY, allowNull: true },
    dataTexto: { type: DataTypes.STRING(20), allowNull: true, field: 'data_texto' },
    dataValorTexto: { type: DataTypes.STRING(20), allowNull: true, field: 'data_valor_texto' },
    numeroOperacao: { type: DataTypes.STRING(50), allowNull: true },
    descExtrato: { type: DataTypes.STRING(255), allowNull: true, field: 'desc_extrato' },
    descPrimavera: { type: DataTypes.STRING(255), allowNull: true, field: 'desc_primavera' },
    classificacao: { type: DataTypes.STRING(100), allowNull: true },
    status: { type: DataTypes.STRING(40), allowNull: true },
    factura: { type: DataTypes.STRING(80), allowNull: true },
    saidas: { type: DataTypes.DECIMAL(18,2), allowNull: true, defaultValue: 0 },
    entradas: { type: DataTypes.DECIMAL(18,2), allowNull: true, defaultValue: 0 },
    saldo: { type: DataTypes.DECIMAL(18,2), allowNull: true, defaultValue: 0 },
    saidasTexto: { type: DataTypes.STRING(50), allowNull: true, field: 'saidas_texto' },
    entradasTexto: { type: DataTypes.STRING(50), allowNull: true, field: 'entradas_texto' },
    saldoTexto: { type: DataTypes.STRING(50), allowNull: true, field: 'saldo_texto' },
    observacao: { type: DataTypes.STRING(255), allowNull: true }
  }, {
    tableName: 'financa_banco_extratos'
  });

  FinancaBancoExtrato.associate = (models) => {
    FinancaBancoExtrato.belongsTo(models.FinancaBanco, { foreignKey: 'bancoId', as: 'banco' });
  };

  return FinancaBancoExtrato;
};
