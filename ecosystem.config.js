module.exports = {
  apps : [{
    name: 'pocketcraft-production',
    script: 'server/index.js',
    instances: 1,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'pocketcraft-market',
    script: 'processes/market-collection.js',
    instances: 1,
    watch: false,
    env: {
      DEBUG: 'pocketcraft:*',
      NODE_ENV: 'development'
    },
    env_production: {
      DEBUG: 'pocketcraft:*',
      NODE_ENV: 'production'
    }
  }],
};
