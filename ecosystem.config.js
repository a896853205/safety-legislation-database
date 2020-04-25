module.exports = {
  apps: [
    {
      name: 'safetyAPI',
      script: 'dist/www',

      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      args: 'one two',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      env: {
        COMMON_VARIABLE: 'true'
      }
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '47.94.133.12',
      ref: 'origin/master',
      repo: 'git@github.com:a896853205/safety-legislation-database.git',
      path: '/safety-legislation/safety-legislation-server',
      'post-deploy':
        'npm install && tsc && pm2 reload ecosystem.config.js --env production',
      'post-setup': 'npm install && tsc'
    }
  }
};
