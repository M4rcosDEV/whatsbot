const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

const Atendimento = sequelize.define("Atendimento", {
    protocolo: { type: DataTypes.STRING, unique: true },
    cliente: { type: DataTypes.STRING, allowNull: false },
    data_inicio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    data_fim: { type: DataTypes.DATE, allowNull: true }
});

module.exports = Atendimento;
