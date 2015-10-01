'use strict';

import User from '../models/user';
import {authorize} from '../middleware/auth';

export let route = {

  get: [
    authorize('admin'),
    (req, res, next) => {
      User
        .find()
        .then((users) => {
          res.status(200).json(users);
        })
        .catch(next);
    }
  ],

  post: [
    (req, res, next) => {
      if (!req.user || req.user.role !== 'admin') {
        delete req.body.role;
      }
      User
        .create(req.body)
        .then((user) => {
          res.status(201).json(user);
        })
        .catch(next);
    }
  ]

};
