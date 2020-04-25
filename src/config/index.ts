import { DEV_CONFIG } from './dev';
import { PROD_CONFIG } from './prod';
import { TEST_CONFIG } from './test';
import { ConfigScheme } from './config-scheme.type';

let config: ConfigScheme;

if (process.env.NODE_ENV === 'development') {
  config = DEV_CONFIG;
} else if (process.env.NODE_ENV === 'production') {
  config = PROD_CONFIG;
} else if (process.env.NODE_ENV === 'test') {
  config = TEST_CONFIG;
} else {
  throw new Error('Please check NODE_ENV!')
}

export default config;
