'use strict';

import mongoose, {Schema} from 'mongoose';
import validate from 'mongoose-validator';
import config from 'config';
import CustomError from '../lib/custom-error';

// Plugins
import mongoosePassword from '../lib/mongoose-password';
import mongooseCreatedAt from '../lib/mongoose-created-at';
import mongooseUpdatedAt from '../lib/mongoose-updated-at';
import mongooseLock from '../lib/mongoose-lock';

// Custom Errors
export class UserNotFoundError extends CustomError {
  constructor(message) { super(message, 401); }
}
export class AccountLockedError extends CustomError {
  constructor(message) { super(message, 403); }
}
export class IncorrectPasswordError extends CustomError {
  constructor(message) { super(message, 401); }
}

// Schema Definition
let User = new Schema({
  email: {
    type: String,
    required: true,
    validate: [
      validate({
        validator: 'isEmail'
      })
    ]
  }
});

// Plugin configuration
User.plugin(mongoosePassword, {
  path: 'password',
  auth: 'authenticate',
  workFactor: config.get('user.saltWorkFactor')
});
User.plugin(mongooseLock, {
  attemptsPath: 'attempts',
  lockUntilPath: 'lockUntil',
  isLockedPath: 'isLocked',
  incMethod: 'incAttempts',
  maxAttempts: config.get('user.maxLoginAttempts'),
  lockTime: config.get('user.lockTime')
});
User.plugin(mongooseCreatedAt, {
  path: 'createdAt'
});
User.plugin(mongooseUpdatedAt, {
  path: 'updatedAt'
});

/**
 * @function User.authenticate
 * @param {String} email
 * @param {String} password
 */
User.static('authenticate', function (email = '', password = '') {
  let user;
  return this.findOne({email})
    .then((foundUser) => {
      user = foundUser;
      if (!user) {
        throw new UserNotFoundError('User not found with given email');
      }
      if (user.isLocked) { throw new AccountLockedError('Account Locked'); }
      return user.authenticate(password);
    })
    .then((passwordMatches) => {
      if (passwordMatches) { return user; }
      return user.incAttempts().then(() => {
        throw new IncorrectPasswordError('Password was incorrect');
      });
    });
});

export default mongoose.model('User', User);
