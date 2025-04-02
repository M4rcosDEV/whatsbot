require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "postgres"
});

sequelize.authenticate()
    .then(() => console.log("Conectado ao banco de dados!"))
    .catch(err => console.error("Erro ao conectar:", err));

module.exports = sequelize;
