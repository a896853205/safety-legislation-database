module.exports = {
  apps: [
    {
      interpreter: 'ts-node',
      name: 'safetyAPI',
      script: 'dist/www.js',

      instances: 1,
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
      host: '47.94.133.12',
      ref: 'origin/master',
      repo: 'git@github.com:a896853205/safety-legislation-database.git',
      path: '/safety-legislation/safety-legislation-server',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'post-setup': 'npm install',
    },
  },
};
