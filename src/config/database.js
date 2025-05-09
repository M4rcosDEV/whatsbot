require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
});

if (process.env.NODE_ENV !== 'test') {
    (async () => {
      try {
        await sequelize.authenticate();
        //console.log("Conectado ao banco de dados!");
      } catch (err) {
        console.error('Erro ao conectar ao banco:', err);
      }
    })();
}
  

module.exports = sequelize;
