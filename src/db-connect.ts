import dbConfig from './config';
import { Sequelize } from 'sequelize-typescript';

export default (): Sequelize => {
  return new Sequelize({
    database: dbConfig.db.name,
    dialect: 'mysql',
    username: dbConfig.db.user,
    password: dbConfig.db.password,
    models: [__dirname + '/models'], // or [Player, Team],
    logging: false,
  });
};
