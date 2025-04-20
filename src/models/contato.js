const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

const Contato = sequelize.define("Contato", {
  nome: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'contatos',
});

module.exports = Contato;
