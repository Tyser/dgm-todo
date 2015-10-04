'use strict';

import {expect} from 'chai';
import request from '../helpers/request';
import {user, login, logout, initUser} from '../helpers/auth';

describe('Authentication', () => {

  before(() => initUser());

  it('POST /session - should be able to login', () => {
    return login(user.email, user.password)
      .expect(201)
      .then(({body}) => {
        expect(body.email).to.be.equal(user.email);
        expect(body.password).to.be.equal(undefined);
        expect(body.role).to.be.equal(user.role);
      });
  });

  it('GET /session - should be able to get the current session', () => {
    return request
      .get('/session')
      .expect(200)
      .then(({body}) => {
        expect(body.email).to.be.equal('test@email.com');
        expect(body.password).to.be.equal(undefined);
        expect(body.role).to.be.equal('admin');
      });
  });

  it('DELETE /session - should be able to logout', () => {
    return logout(204);
  });

  it('GET /session - should get 404 if not logged in', () => {
    return request
      .get('/session')
      .expect(404);
  });

  it('POST /session - should get 401 if password was wrong', () => {
    return login(user.email, user.password + '1')
      .expect(401);
  });

  it('POST /session - should get 401 is username was wrong', () => {
    return login('a' + user.email, user.password)
      .expect(401);
  });

});

