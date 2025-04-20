const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");


const Setor = sequelize.define('Setor', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    permisao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[1, 2, 3]] // 1 = master, 2 = normal, 3 = visitante
        }
      }
},{
    tableName: 'setores'
});


module.exports = Setor;