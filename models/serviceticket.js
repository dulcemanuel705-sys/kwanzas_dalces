module.exports = (sequelize, DataTypes) => {
  const ServiceTicket = sequelize.define("ServiceTicket", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    notaServico: { type: DataTypes.INTEGER, allowNull: true },
    notaExecutado: { type: DataTypes.STRING(20) },
    notaEnviado: { type: DataTypes.STRING(15) },
    notaPago: { type: DataTypes.STRING(30) }
  });

  ServiceTicket.associate = (models) => {
    ServiceTicket.belongsTo(models.Projecto, { foreignKey: "projecto_id", as: "projecto" });
  };

  return ServiceTicket;
};
