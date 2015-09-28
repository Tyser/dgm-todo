'use strict';
/* jshint maxlen: false */

import Promise from 'bluebird';
import User, {
  UserNotFoundError,
  AccountLockedError,
  IncorrectPasswordError
} from '../../models/user';
import {expect} from 'chai';

describe('models/user', () => {

  let user;

  before(() => User
    .create({
      email: 'test@email.com',
      password: '1234567890'
    })
    .then((newUser) => user = newUser)
  );

  after(() => User
    .findOneAndRemove({
      email: 'test@email.com'
    })
  );

  describe('User.authenticate(email, password)', () => {

    it('should authenticate user', () => {
      return User
        .authenticate(user.email, '1234567890')
        .then((authenticatedUser) => {
          expect(authenticatedUser).to.be.an('object');
          expect(authenticatedUser.email).to.be.equal(user.email);
        });
    });

    it('should throw error if user was not found', () => {
      let authenticate = User.authenticate(user.email + '.uk', '1234567890');
      return expect(authenticate).to.eventually.be.rejectedWith(UserNotFoundError);
    });

    it('should throw error if password was entered incorrectly', () => {
      let authenticate = User.authenticate(user.email, '123456789');
      return expect(authenticate).to.eventually.be.rejectedWith(IncorrectPasswordError);
    });

    it('should throw error if password was entered incorrectly too many times', () => {
      function enterWrongPassword() {
        return User.authenticate(user.email, '123456789').catch(IncorrectPasswordError, () => {});
      }
      let authenticate = enterWrongPassword()
        .then(enterWrongPassword)
        .then(enterWrongPassword);
      return expect(authenticate).to.eventually.be.rejectedWith(AccountLockedError);
    });

    it('should unlock after lock time has expired', () => {
      let authenticate = Promise.delay(1000).then(() => {
        return User.authenticate(user.email, '1234567890');
      });
      return expect(authenticate).to.eventually.be.an('object');
    });

  });

});
