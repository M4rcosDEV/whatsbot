const sequelize = require("../config/database");

const Usuario = require("./usuario");
const Atendimento = require("./atendimento");
const Setor = require("./setor");
const Contato = require("./contato");

// 🔹 Relacionamento entre as tabelas Usuarios x Atendimentos
Usuario.hasMany(Atendimento, { foreignKey: "usuario_id", as: 'atendimentos' });
Atendimento.belongsTo(Usuario, { foreignKey: "usuario_id", as: 'usuario' });

// 🔹 Relacionamento entre as tabelas Usuarios x Setores
Setor.hasMany(Usuario, { foreignKey: "setor_id" });
Usuario.belongsTo(Setor, { foreignKey: "setor_id" });

// 🔹 Relacionamento entre Contato x Atendimentos
Contato.hasMany(Atendimento, { foreignKey: "contato_id", as: 'atendimentos' });
Atendimento.belongsTo(Contato, { foreignKey: "contato_id", as: 'contato' });


// 🔹 Exportar os modelos e a conexão
module.exports = { sequelize, Usuario, Atendimento, Setor, Contato };
