const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");


const Usuario = sequelize.define('Usuario', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    setor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'setores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
      
},{
    tableName: 'usuarios'
});


module.exports = Usuario;
