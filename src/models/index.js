const sequelize = require("../config/database");

const Usuario = require("./usuario");
const Atendimento = require("./atendimento");
const Setor = require("./setor");

// 🔹 Relacionamento entre as tabelas Usuarios x Atendimentos
Usuario.hasMany(Atendimento, { foreignKey: "usuario_id" });
Atendimento.belongsTo(Usuario, { foreignKey: "usuario_id" });

// 🔹 Relacionamento entre as tabelas Usuarios x Setores
Setor.hasMany(Usuario, { foreignKey: "setor_id" });
Usuario.belongsTo(Setor, { foreignKey: "setor_id" });


// 🔹 Exportar os modelos e a conexão
module.exports = { sequelize, Usuario, Atendimento, Setor };
