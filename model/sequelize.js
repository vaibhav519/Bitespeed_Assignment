const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.CC_MYSQL_ADDON_DB, process.env.CC_MYSQL_ADDON_USER, process.env.CC_MYSQL_ADDON_PASSWORD, {
    host: process.env.CC_MYSQL_ADDON_HOST,
    port: process.env.CC_MYSQL_ADDON_PORT,
    dialect: 'mysql',
  });

module.exports = sequelize;
