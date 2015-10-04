'use strict';

var packageName = require('../package').name;

module.exports = {
  name: packageName,
  env: 'development',
  port: 8000,
  session: {
    secret: 'changeme',
    secure: false
  },
  redis: {
    url: 'redis://127.0.0.1:6379'
  },
  mongo: {
    url: 'mongodb://127.0.0.1:27017/dgm-todo-test'
  },
  user: {
    saltWorkFactor: 12,
    maxLoginAttempts: 3,
    lockTime: 1 * 60 * 60 * 1000 // 1 hour
  }
};
