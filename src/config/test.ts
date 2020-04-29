import { ConfigScheme } from './config-scheme.type';
import { TEST_DATA_BASE_USER, TEST_DATA_BASE_KEY } from '../keys/keys';
interface TestConfig extends ConfigScheme {}

export const TEST_CONFIG: TestConfig = {
  port: '4000',
  db: {
    port: '3306',
    host: 'localhost',
    name: 'safety_legislation',
    user: TEST_DATA_BASE_USER,
    password: TEST_DATA_BASE_KEY,
  },
};
