import { ConfigScheme } from './config-scheme.type';
import { PRO_DATA_BASE_USER, PRO_DATA_BASE_KEY } from '../keys/keys';

interface ProdConfig extends ConfigScheme {}

export const PROD_CONFIG: ProdConfig = {
  port: '4000',
  db: {
    port: '3306',
    host: 'localhost',
    name: 'safety_legislation',
    user: PRO_DATA_BASE_USER,
    password: PRO_DATA_BASE_KEY,
  },
};
