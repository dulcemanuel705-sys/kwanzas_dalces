module.exports = (sequelize, DataTypes) => {
  const Funcionario = sequelize.define('Funcionario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    bi: { type: DataTypes.STRING(40), allowNull: true },
    nif: { type: DataTypes.STRING(40), allowNull: true },
    email: { type: DataTypes.STRING(120), allowNull: true },
    telefone: { type: DataTypes.STRING(40), allowNull: true },
    cargo: { type: DataTypes.STRING(80), allowNull: true },
    departamento: { type: DataTypes.STRING(80), allowNull: true },
    data_admissao: { type: DataTypes.DATE, allowNull: true },
    salario_base: { type: DataTypes.DECIMAL(18,2), allowNull: true, defaultValue: 0 },
    estado: { type: DataTypes.ENUM('Ativo','Inativo'), allowNull: false, defaultValue: 'Ativo' },
    endereco: { type: DataTypes.STRING(200), allowNull: true },
    foto_url: { type: DataTypes.STRING(255), allowNull: true },
  }, { tableName: 'empresa_funcionarios' });
  return Funcionario;
};
