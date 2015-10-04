'use strict';

import User from '../models/user';
import {authorize} from '../middleware/auth';
import {ForbiddenError} from '../lib/errors';

export let route = {

  get: [
    authorize('admin'),
    (req, res, next) => {
      User
        .find()
        .then((users) => {
          res.status(200).json(users);
        }, next);
    }
  ],

  post: [
    (req, res, next) => {
      if ((!req.user || req.user.role !== 'admin') && req.body.role) {
        return next(
          new ForbiddenError('You don\'t have access to set a user\'s role')
        );
      }
      User
        .create(req.body)
        .then((user) => {
          res.status(201).json(user);
        }, next);
    }
  ]

};
