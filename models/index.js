"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js");
const db = {};

let sequelize;
// Garante que os atributos com parênteses são escapados (CVE-2023-22578)
if (config && config[env]) {
  config[env].attributeBehavior = config[env].attributeBehavior || 'escape';
}
if (config && config[env] && config[env].use_env_variable) {
  sequelize = new Sequelize(process.env[config[env].use_env_variable], config[env]);
} else if (config && config[env]) {
  sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    config[env]
  );
} else {
  throw new Error(`Configuration for environment '${env}' not found`);
}

// Importa todos os modelos da pasta
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      // Ignora arquivos de backup para evitar sobrescrever modelos reais
      !file.toLowerCase().includes("backup")
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Executa os métodos associate definidos nos modelos
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exporta o Sequelize e os modelos carregados
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
