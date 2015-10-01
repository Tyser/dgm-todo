'use strict';

import {expect} from 'chai';
import request from '../helpers/request';
import User from '../../models/user';

describe('/session', () => {

  before(() => User.create({
    email: 'test@email.com',
    password: '1234567890',
    role: 'admin'
  }));

  after(() => User.findOneAndRemove({
    email: 'test@email.com'
  }));

  it('should be able to login', () => {
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

});

