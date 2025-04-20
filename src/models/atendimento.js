const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");


const Atendimento = sequelize.define("Atendimento", {
    protocolo: { 
        type: DataTypes.STRING, 
        unique: true 
    },
    cliente:{ 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    numero: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    data_inicio: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
    data_fim: { 
        type: DataTypes.DATE, 
        allowNull: true 
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    contato_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'contatos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    foto_perfil: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'atendimentos'
});



module.exports = Atendimento;
