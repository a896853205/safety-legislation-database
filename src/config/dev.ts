import { ConfigScheme } from './config-scheme.type';
import { DEV_DATA_BASE_USER, DEV_DATA_BASE_KEY } from '../keys/keys';

interface devConfig extends ConfigScheme {}

export const DEV_CONFIG: devConfig = {
  port: '4000',
  db: {
    port: '3306',
    host: 'localhost',
    name: 'safety_legislation',
    user: DEV_DATA_BASE_USER,
    password: DEV_DATA_BASE_KEY,
  },
};
