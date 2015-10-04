'use strict';

import User from '../../models/user';
import request from './request';

export let user = {
  email: 'test@email.com',
  password: '1234567890',
  role: 'admin'
};

let getUser = User
  .remove({})
  .then(() => User.create(user));

export function initUser() { return getUser; }

export function login(email = user.email, password = user.password) {
  return request
    .post('/session')
    .send({email, password});
}

export function logout() {
  return request.delete('/session');
}
