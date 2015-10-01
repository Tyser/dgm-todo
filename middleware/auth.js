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

export class SessionNotFound extends CustomError {
  constructor(message) { super(message, 404); }
}

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    User
      .authenticate(email, password)
      // We catch these two so the user doesn't know if they entered their email
      // in wrong or their password in wrong.
      .catch(UserNotFoundError, IncorrectPasswordError, () => {
        throw new IncorrectCredentialsError('Incorrect Credentials');
      })
      .then(done.bind(null, null), done);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User
    .findById(id)
    .then(done.bind(null, null), done);
});

export default () => ([
  passport.initialize(),
  passport.session()
]);

export function authenticate(options) {
  return passport.authenticate('local', Object.assign({
    failWithError: true
  }, options));
}

export function authorize(accessLevel, checkCriteria = () => true) {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new UnauthorizedError('You must be logged in to access this endpoint')
      );
    }
    if (!req.user.hasAccess(accessLevel) || !checkCriteria(req)) {
      return next(
        new ForbiddenError('You do not have permission to access this endpoint')
      );
    }
    next();
  };
}
