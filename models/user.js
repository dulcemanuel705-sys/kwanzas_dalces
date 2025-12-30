module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define("Usuario", {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sobrenome: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      defaultValue: "cliente", // ou "admin", dependendo do seu sistema
    },
    id_funcionario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ultimo_acesso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tentativas_falhas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bloqueado_ate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Usuario.associate = (models) => {
    if (models.Funcionario) {
      Usuario.belongsTo(models.Funcionario, {
        foreignKey: "id_funcionario",
        as: "funcionario",
      });
    }
    // Associações condicionais apenas se os modelos existirem,
    // evitando erros quando os modelos não estão definidos no projeto.
    if (models.Pedido) {
      Usuario.hasMany(models.Pedido, {
        foreignKey: "id_usuario",
        as: "pedidos",
      });
    }

    if (models.Endereco) {
      Usuario.hasMany(models.Endereco, {
        foreignKey: "id_usuario",
        as: "endereco",
      });
    }

    if (models.Carrinho) {
      Usuario.hasMany(models.Carrinho, {
        foreignKey: "id_usuario",
        as: "carrinho",
      });
    }
  };

  return Usuario;
};
