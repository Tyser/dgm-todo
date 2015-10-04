'use strict';

import assert from 'assert';
import {expect} from 'chai';
import request from '../helpers/request';
import {initUser, login, logout} from '../helpers/auth';

describe('Users', () => {

  before(() => initUser());

  afterEach(() => logout());

  let userId;
  let secondUserId;

  describe('POST /users', () => {

    it('should be able to create a user', () => {
      return request
        .post('/users')
        .send({
          email: 'test1@email.com',
          password: '1234567890'
        })
        .expect(201)
        .then(({body}) => {
          expect(body.email).to.be.equal('test1@email.com');
          expect(body.password).to.be.equal(undefined);
          expect(body.role).to.be.equal('member');
          userId = body.id;
        });
    });

    it('should fail with duplicate email entry', () => {
      return request.post('/users')
        .send({
          email: 'test1@email.com',
          password: '1234567890'
        })
        .expect(400);
    });

    it('should fail to set user role unauthenticated', () => {
      return request.post('/users')
        .send({
          email: 'test2@email.com',
          password: '1234567890',
          role: 'admin'
        })
        .expect(403);
    });

    it('should be able to create user with role as admin', () => {
      return login()
        .then(() => request
          .post('/users')
          .send({
            email: 'test2@email.com',
            password: '1234567890',
            role: 'admin'
          })
          .expect(201)
        )
        .then(({body}) => {
          secondUserId = body.id;
        });
    });

  });

  describe('GET /users/:id', () => {

    it('should not be able to get a user\'s information unauthenticated', () => {
      assert(userId);
      return request
        .get(`/users/${userId}`)
        .expect(401);
    });

    it('should be able to get one\'s self', () => {
      assert(userId);
      return login('test1@email.com', '1234567890')
        .then(() => request
          .get(`/users/${userId}`)
          .expect(200)
        )
        .then(({body}) => {
          expect(body.id).to.be.equal(userId);
          expect(body.email).to.be.equal('test1@email.com');
          expect(body.password).to.be.equal(undefined);
          expect(body.role).to.be.equal('member');
        });
    });

    it('should not be able to get other users as non-admin', () => {
      assert(secondUserId);
      return login('test1@email.com', '1234567890')
        .then(() => request
          .get(`/users/${secondUserId}`, '1234567890')
          .expect(403)
        );
    });

    it('should be able to get others users a admin', () => {
      assert(secondUserId);
      return login()
        .then(() => request
          .get(`/users/${secondUserId}`)
          .expect(200)
        );
    });

  });

  describe('PUT /users/:id', () => {

    it('should not be able to edit a user unauthenticated', () => {
      assert(userId);
      return request
        .put(`/users/${userId}`)
        .send({
          email: 'test3@email.com'
        })
        .expect(401);
    });

    it('should be able to edit one\'s self', () => {
      assert(userId);
      return login('test1@email.com', '1234567890')
        .then(() => request
          .put(`/users/${userId}`)
          .send({
            email: 'test3@email.com'
          })
          .expect(200)
        )
        .then(({body}) => {
          expect(body.email).to.be.equal('test3@email.com');
        });
    });

    it('should not be able to edit self\'s role', () => {
      assert(userId);
      return login('test3@email.com', '1234567890')
        .then(() => request
          .put(`/users/${userId}`)
          .send({
            role: 'admin'
          })
          .expect(403)
        );
    });

    it('should not be able to edit other users', () => {
      assert(secondUserId);
      return login('test3@email.com', '1234567890')
        .then(() => request
          .put(`/users/${secondUserId}`)
          .send({
            email: 'test4@email.com'
          })
          .expect(403)
        );
    });

    it('should be able to edit other users as admin', () => {
      assert(secondUserId && userId);
      return login('test2@email.com', '1234567890')
        .then(() => request
          .put(`/users/${userId}`)
          .send({
            email: 'test1@email.com'
          })
          .expect(200)
        );
    });

  });

  describe('DELETE /users/:id', () => {

    it('should not be able to delete users unauthenticated', () => {
      assert(secondUserId);
      return request
        .delete(`/users/${secondUserId}`)
        .expect(401);
    });

    it('should not be able to delete users as a member', () => {
      assert(secondUserId);
      return login('test1@email.com', '1234567890')
        .then(() => request
          .delete(`/users/${secondUserId}`)
          .expect(403)
        );
    });

    it('should not be able to delete one\'s self', () => {
      assert(secondUserId);
      return login('test2@email.com', '1234567890')
        .then(() => request
          .delete(`/users/${secondUserId}`)
          .expect(403)
        );
    });

    it('should only be able to delete users as admin', () => {
      assert(secondUserId);
      return login()
        .then(() => request
          .delete(`/users/${secondUserId}`)
          .expect(204)
        )
        .then(() => request
          .get(`/users/${secondUserId}`)
          .expect(404)
        );
    });

  });

  describe('GET /users', () => {

    it('should not be able to get list of users unauthenticated', () => {
      return request
        .get('/users')
        .expect(401);
    });

    it('should be able to get list of users', () => {
      return login()
        .then(() => request
          .get('/users')
          .expect(200)
        )
        .then(({body}) => {
          expect(body).to.have.length(2);
        });
    })

  });

});
