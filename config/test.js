'use strict';

module.exports = {
  port: 8001,
  mongo: {
    url: 'mongodb://127.0.0.1:27017/dgm-todo-test'
  },
  user: {
    saltWorkFactor: '1',
    maxLoginAttempts: '3',
    lockTime: '1000' // 1 second
  }
};
