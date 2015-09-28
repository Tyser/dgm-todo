'use strict';

module.exports = {
  name: 'PACKAGE_NAME',
  env: 'NODE_ENV',
  port: 'PORT',
  session: {
    secret: 'SESSION_SECRET',
    secure: 'SESSION_SECURE'
  },
  redis: {
    url: 'REDIS_URL'
  },
  mongo: {
    url: 'MONGOLAB_URI'
  },
  user: {
    saltWorkFactor: 'ACCOUNT_SALE_WORK_FACTOR',
    maxLoginAttempts: 'ACOUNT_MAX_LOGIN_ATTEMPTS',
    lockTime: 'ACCOUNT_LOCK_TIME'
  }
};
