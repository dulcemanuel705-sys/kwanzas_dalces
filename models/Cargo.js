module.exports = (sequelize, DataTypes) => {
  const Cargo = sequelize.define('Cargo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    id_departamento: { type: DataTypes.INTEGER, allowNull: true },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, { tableName: 'cargos' });
  return Cargo;
};
