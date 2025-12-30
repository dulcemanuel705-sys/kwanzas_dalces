module.exports = (sequelize, DataTypes) => {
  const Departamento = sequelize.define('Departamento', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    codigo: { type: DataTypes.STRING(40), allowNull: true },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, { tableName: 'departamentos' });
  return Departamento;
};
