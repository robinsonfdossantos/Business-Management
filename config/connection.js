const Sequelize = require('sequelize');

const sequelize = new Sequelize(

  'business_db',
  'root',
  'Mysql0421!',
  {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
  }
);

module.exports = sequelize;
