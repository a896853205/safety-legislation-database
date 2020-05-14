module.exports = {
  apps: [
    {
      interpreter: './node_modules/.bin/ts-node',
      interpreter_args: '-P ./tsconfig.json',
      name: 'safetyAPI',
      script: './src/www.ts',
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env: {
        COMMON_VARIABLE: 'true',
      },
    },
  ],

  deploy: {
    production: {
      user: 'root',
      host: '39.97.175.30',
      ref: 'origin/master',
      repo: 'git@github.com:a896853205/safety-legislation-database.git',
      path: '/safety-legislation/safety-legislation-server',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'post-setup': 'npm install',
    },
  },
};
