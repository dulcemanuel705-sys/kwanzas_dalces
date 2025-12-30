module.exports = (sequelize, DataTypes) => {
  const FinancaBanco = sequelize.define('FinancaBanco', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    banco: { type: DataTypes.STRING(120), allowNull: false },
    agencia: { type: DataTypes.STRING(60), allowNull: true },
    conta: { type: DataTypes.STRING(60), allowNull: true },
    iban: { type: DataTypes.STRING(64), allowNull: true },
    saldo: { type: DataTypes.DECIMAL(18,2), allowNull: true, defaultValue: 0 },
    logo: { type: DataTypes.STRING(255), allowNull: true }, // URL relativa (ex.: /uploads/bancos/xxx.png)
  }, {
    tableName: 'financa_bancos'
  });
  return FinancaBanco;
};
