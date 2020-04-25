import { ConfigScheme } from './config-scheme.type';

interface devConfig extends ConfigScheme {}

export const DEV_CONFIG: devConfig = {
  port: '4000',
  db: {
    port: '3306',
    host: 'localhost',
    name: 'wolf_gallery'
  }
};
