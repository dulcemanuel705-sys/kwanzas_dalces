module.exports = (sequelize, DataTypes) => {
  const Endereco = sequelize.define("Endereco", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rua: { type: DataTypes.STRING, allowNull: false },
    bairro: { type: DataTypes.STRING, allowNull: true, defaultValue: "Centro" },
    municipio: { type: DataTypes.STRING, allowNull: false },
    provincia: { type: DataTypes.STRING, allowNull: false },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  });

  Endereco.associate = (models) => {
    if (models.Usuario) {
      Endereco.belongsTo(models.Usuario, {
        foreignKey: "id_usuario",
        as: "usuario",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  };

  return Endereco;
};
