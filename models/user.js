'use strict';

import mongoose, {Schema} from 'mongoose';
import validate from 'mongoose-validator';
import CustomError from '../lib/custom-error';

export class NotFoundError extends CustomError {
  constructor(message) { super(message, 401); }
}

export class AccountLockedError extends CustomError {
  constructor(message) { super(message, 403); }
}

export class IncorrectPasswordError extends CustomError {
  constructor(message) { super(message, 401); }
}

// Plugins
import mongoosePassword from '../lib/mongoose-password';
import mongooseCreatedAt from '../lib/mongoose-created-at';
import mongooseUpdatedAt from '../lib/mongoose-updated-at';
import mongooseLock from '../lib/mongoose-lock';

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

User.plugin(mongoosePassword, {
  path: 'password',
  auth: 'authenticate',
  workFactor: 10
});
User.plugin(mongooseLock, {
  attemptsPath: 'attempts',
  lockUntilPath: 'lockUntil',
  isLockedPath: 'isLocked',
  incMethod: 'incAttempts',
  maxAttempts: 3,
  lockTime: 1 * 60 * 60 * 1000 // 1 hour
});
User.plugin(mongooseCreatedAt, {
  path: 'createdAt'
});
User.plugin(mongooseUpdatedAt, {
  path: 'updatedAt'
});

User.static('authenticate', (email, password) => {
  let user;
  return this.findOne({email})
    .then((foundUser) => {
      user = foundUser;
      if (!user) { throw new NotFoundError('User not found with given email'); }
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
