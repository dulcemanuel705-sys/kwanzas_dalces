module.exports = (sequelize, DataTypes) => {
  const FinancaImposto = sequelize.define('FinancaImposto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periodo: { type: DataTypes.STRING(20), allowNull: true },
    imposto: { type: DataTypes.STRING(40), allowNull: false },
    base: { type: DataTypes.DECIMAL(18,2), allowNull: true },
    valor: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('Declarado','Pago','Pendente'), allowNull: true, defaultValue: 'Pendente' },
  }, { tableName: 'financa_impostos' });
  return FinancaImposto;
};
