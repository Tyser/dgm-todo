'use strict';

import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import CustomError from '../lib/custom-error';
import User, {
  UserNotFoundError,
  IncorrectPasswordError
} from '../models/user';

export class IncorrectCredentialsError extends CustomError {
  constructor(message) { super(message, 401); }
}

export class UnauthorizedError extends CustomError {
  constructor(message) { super(message, 401); }
}

export class ForbiddenError extends CustomError {
  constructor(message) { super(message, 403); }
}

passport.use(new LocalStrategy((email, password, done) => {
  User
    .authenticate(email, password)
    // We catch these two so the user doesn't know if they entered their email
    // in wrong or their password in wrong.
    .catch(UserNotFoundError, IncorrectPasswordError, () => {
      throw new IncorrectCredentialsError('Incorrect Credentials');
    })
    .nodeify(done);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).nodeify(done);
});

export default () => ([
  passport.initialize(),
  passport.session()
]);

export function acl(accessLevel) {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new UnauthorizedError('You must be logged in to access this endpoint')
      );
    }
    if (!req.user.hasAccess(accessLevel)) {
      return next(
        new ForbiddenError('You do not have permission to access this endpoint')
      );
    }
    next();
  };
}
