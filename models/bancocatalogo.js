module.exports = (sequelize, DataTypes) => {
  const BancoCatalogo = sequelize.define("BancoCatalogo", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    logo_url: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM("Ativo", "Inativo"), allowNull: false, defaultValue: "Ativo" },
    descricao: { type: DataTypes.STRING(255), allowNull: true },
  }, {
    tableName: 'bancos_catalogo'
  });

  return BancoCatalogo;
};
