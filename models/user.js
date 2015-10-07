'use strict';

import Promise from 'bluebird';
import mongoose, {Schema} from 'mongoose';
import validate from 'mongoose-validator';
import config from 'config';
import CustomError from '../lib/custom-error';

// Plugins
import mongoosePassword from '../lib/mongoose-password';
import mongooseCreatedAt from '../lib/mongoose-created-at';
import mongooseUpdatedAt from '../lib/mongoose-updated-at';
import mongooseLock from '../lib/mongoose-lock';
import mongooseRole from '../lib/mongoose-role';

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
let UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    validate: [
      validate({
        validator: 'isEmail'
      })
    ]
  }
});

// Plugin configuration
UserSchema.plugin(mongoosePassword, {
  path: 'password',
  auth: 'authenticate',
  workFactor: parseInt(config.get('user.saltWorkFactor'), 10)
});
UserSchema.plugin(mongooseLock, {
  attemptsPath: 'attempts',
  lockUntilPath: 'lockUntil',
  isLockedPath: 'isLocked',
  incMethod: 'incAttempts',
  maxAttempts: parseInt(config.get('user.maxLoginAttempts'), 10),
  lockTime: parseInt(config.get('user.lockTime'), 10)
});
UserSchema.plugin(mongooseRole, {
  roles: [
    'admin',
    'member'
  ],
  accessLevels: {
    'user': ['admin', 'member'],
    'admin': ['admin']
  },
  defaultRole: 'member',
  rolePath: 'role',
  roleStaticPath: 'roles',
  accessLevelStaticPath: 'accessLevels',
  hasHaccessMethod: 'hasAccess',
  roleHasAccessMethod: 'roleHasAccess'
});
UserSchema.plugin(mongooseCreatedAt, {
  path: 'createdAt'
});
UserSchema.plugin(mongooseUpdatedAt, {
  path: 'updatedAt'
});

/**
 * @function User#toJSON
 * @return {Object}
 */
const PUBLIC_FIELDS = [
  'id',
  'email',
  'role',
  'createdAt',
  'updatedAt'
];
UserSchema.method('toJSON', function () {
  let obj = this.toObject();
  obj.id = obj._id;
  return PUBLIC_FIELDS.reduce((user, field) => {
    user[field] = obj[field];
    return user;
  }, {});
});

/**
 * @function User.authenticate
 * @param {String} email
 * @param {String} password
 * @param {Promise}
 */
UserSchema.static('authenticate', function (email = '', password = '') {
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

let User = mongoose.model('User', UserSchema);
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

export default User;
