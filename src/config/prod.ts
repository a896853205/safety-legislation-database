import { ConfigScheme } from './config-scheme.type';

interface ProdConfig extends ConfigScheme {}

export const PROD_CONFIG: ProdConfig = {
  port: '4000',
  db: {
    port: '3306',
    host: 'localhost',
    name: 'wolf_gallery'
  }
};
