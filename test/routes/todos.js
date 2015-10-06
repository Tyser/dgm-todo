'use strict';

import assert from 'assert';
import {expect} from 'chai';
import request from '../helpers/request';
import {initUser, login, logout} from '../helpers/auth';

describe('Todos', () => {

  let userId;
  let todoId;

  before(() => initUser()
    .then((user) => {
      userId = user.id;
      return login();
    })
  );

  after(() => logout());

  describe('POST /users/:id/todos', () => {

    it('should be able to create a todo', () => {
      return request
        .post(`/users/${userId}/todos`)
        .send({
          name: 'Write Tests'
        })
        .expect(201)
        .then(({body}) => {
          expect(body.name).to.be.equal('Write Tests');
          expect(body.completed).to.be.equal(false);
          expect(body.owner).to.be.equal(userId);
          todoId = body.id;
        });
    });

    it('should fail if user id doesn\'t match the logged in user', () => {
      return request
        .post('/users/12345/todos')
        .send({
          name: 'This should fail'
        })
        .expect(403);
    });

  });

  describe('GET /users/:id/todos', () => {

    it('should be able to get a list of todos', () => {
      return request
        .get(`/users/${userId}/todos`)
        .expect(200)
        .then(({body}) => {
          expect(body.length).to.be.equal(1);
        });
    });

  });

  describe('PUT /users/:id/todos/:id', () => {

    it('should be able to update a todo', () => {
      assert(todoId);
      return request
        .put(`/users/${userId}/todos/${todoId}`)
        .send({
          completed: true
        })
        .expect(200)
        .then(({body}) => {
          expect(body.completed).to.be.equal(true);
        });
    });

  });

  describe('GET /users/:id/todos/:id', () => {

    it('should be able to get a todo item', () => {
      assert(todoId);
      return request
        .get(`/users/${userId}/todos/${todoId}`)
        .expect(200)
        .then(({body}) => {
          expect(body.id).to.be.equal(todoId);
          expect(body.owner).to.be.equal(userId);
          expect(body.completed).to.be.equal(true);
        });
    });

  });

  describe('DELETE /users/:id/todos/:id', () => {

    it('should be able to delete a todo item', () => {
      assert(todoId);
      return request
        .delete(`/users/${userId}/todos/${todoId}`)
        .expect(204)
        .then(() => request
          .get(`/users/${userId}/todos/${todoId}`)
          .expect(404)
        );
    });

  });

});
