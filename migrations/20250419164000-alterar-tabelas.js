'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('atendimentos', 'contato_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // ou false, dependendo do caso
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('atendimentos', 'contato_id');
  }
};
