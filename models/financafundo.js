module.exports = (sequelize, DataTypes) => {
  const FinancaFundo = sequelize.define('FinancaFundo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.DATE, allowNull: true },
    tipo: { type: DataTypes.ENUM('Entrada','Saida'), allowNull: false, defaultValue: 'Entrada' },
    desc: { type: DataTypes.STRING(255), allowNull: true },
    valor: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
    saldo: { type: DataTypes.DECIMAL(18,2), allowNull: true },
  }, { tableName: 'financa_fundo' });
  return FinancaFundo;
}
