'use strict';

import {expect} from 'chai';
import request from '../helpers/request';
import User from '../../models/user';

describe('Authentication', () => {

  before(() => User.create({
    email: 'test@email.com',
    password: '1234567890',
    role: 'admin'
  }));

  after(() => User.findOneAndRemove({
    email: 'test@email.com'
  }));

  it('POST /session - should be able to login', () => {
    return request
      .post('/session')
      .send({
        email: 'test@email.com',
        password: '1234567890'
      })
      .expect(201)
      .then(({body}) => {
        expect(body.email).to.be.equal('test@email.com');
        expect(body.password).to.be.equal(undefined);
        expect(body.role).to.be.equal('admin');
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
    return request
      .delete('/session')
      .expect(204);
  });

  it('GET /session - should get 404 if not logged in', () => {
    return request
      .get('/session')
      .expect(404);
  });

  it('POST /session - should get 401 if password was wrong', () => {
    return request
      .post('/session')
      .send({
        email: 'test@email.com',
        password: '123456789'
      })
      .expect(401);
  });

  it('POST /session - should get 401 is username was wrong', () => {
    return request
      .post('/session')
      .send({
        email: 'atest@email.com',
        password: '1234567890'
      })
      .expect(401);
  });

});

