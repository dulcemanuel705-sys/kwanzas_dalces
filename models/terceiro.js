module.exports = (sequelize, DataTypes) => {
  const Terceiro = sequelize.define("Terceiro", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nif: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    nome_firma: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    telefone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    endereco: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM("Cliente", "Fornecedor", "Outro"),
      allowNull: false
    }
  });

  Terceiro.associate = (models) => {
    Terceiro.hasMany(models.Trabalho, { foreignKey: "terceiro_id", as: "trabalhos" });
    Terceiro.hasMany(models.Fatura, { foreignKey: "terceiro_id", as: "faturas" });
  };

  return Terceiro;
};

