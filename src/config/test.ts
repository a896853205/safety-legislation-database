import { ConfigScheme } from './config-scheme.type';

interface TestConfig extends ConfigScheme {}

export const TEST_CONFIG: TestConfig = {
  port: '4000',
  db: {
    port: '3306',
    host: 'localhost',
    name: 'wolf_gallery'
  }
};
