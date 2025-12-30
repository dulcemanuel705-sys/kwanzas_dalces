module.exports = (sequelize, DataTypes) => {
  const Ferias = sequelize.define('Ferias', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_funcionario: { type: DataTypes.INTEGER, allowNull: false },
    data_inicio: { type: DataTypes.DATEONLY, allowNull: false },
    data_fim: { type: DataTypes.DATEONLY, allowNull: false },
    estado: { type: DataTypes.ENUM('PENDENTE', 'APROVADO', 'REJEITADO'), allowNull: false, defaultValue: 'PENDENTE' },
    motivo: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'ferias' });
  return Ferias;
};
