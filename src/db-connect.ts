import dbConfig from './config/db-config';
import { Sequelize } from 'sequelize-typescript';

export default (): Sequelize => {
  return new Sequelize({
    database: dbConfig.database,
    dialect: 'mysql',
    username: dbConfig.user,
    password: dbConfig.password,
    models: [__dirname + '/models'], // or [Player, Team],
    logging: false
  });
};
