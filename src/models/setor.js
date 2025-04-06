const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");


const Setor = sequelize.define('Setor', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'setores'
});


module.exports = Setor;