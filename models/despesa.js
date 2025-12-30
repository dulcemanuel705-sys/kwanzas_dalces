module.exports = (sequelize, DataTypes) => {
  const Despesa = sequelize.define('Despesa', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.DATE, allowNull: true },
    categoria: { type: DataTypes.STRING(80), allowNull: true },
    descricao: { type: DataTypes.STRING(255), allowNull: true },
    valor: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
    centro: { type: DataTypes.STRING(80), allowNull: true },
  }, {
    tableName: 'financa_despesas'
  });
  return Despesa;
};
